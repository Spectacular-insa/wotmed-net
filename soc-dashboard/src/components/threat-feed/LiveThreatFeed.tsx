feature/core-engine

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAPIClient } from '@/lib/api-client';
import { useSOCStore } from '@/store/useSOCStore';
import type { ThreatEvent } from '@/store/useSOCStore';

type Incident = {
  incident_id: string;
  client_ip?: string;
  request_path?: string;
  request_method?: string;
  threat_score?: number | string;
  action_taken?: string;
  triggered_flags?: string[];
  created_at?: string;
  tls_fingerprint?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  geolocation_status?: string;
};

type Filter = 'ALL' | 'BLOCKED' | 'TARPIT' | 'CRITICAL' | 'INFO';
type ConnectionStatus = 'CONNECTING' | 'LIVE' | 'RECONNECTING';

const MAX_INCIDENTS = 100;
const RECONNECT_DELAY = 3000;

function getSeverity(row: Incident): Exclude<Filter, 'ALL'> {
  const action = (row.action_taken || '').toUpperCase();
  const score = Number(row.threat_score || 0);

  if (action.includes('BLOCK')) return 'BLOCKED';
  if (action.includes('TARPIT')) return 'TARPIT';
  if (score >= 80) return 'CRITICAL';
  if (score >= 40) return 'TARPIT';

  return 'INFO';
}

function getThreatName(row: Incident): string {
  if (row.triggered_flags?.length) {
    return row.triggered_flags.join(', ');
  }

  return (row.action_taken || 'THREAT DETECTED').replaceAll('_', ' ');
}

function formatTime(value?: string): string {
  if (!value) return 'Unknown time';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return date.toLocaleString();
}

function validIncident(value: unknown): value is Incident {
  if (!value || typeof value !== 'object') return false;

  const row = value as Partial<Incident>;

  return (
    typeof row.incident_id === 'string' &&
    row.incident_id.trim().length > 0
  );
}

/**
 * Supports arrays and common API envelopes, including nested formats.
 * Returns null only when the response structure is unrecognized.
 */
function extractRows(
  value: unknown,
  depth = 0
): Incident[] | null {
  if (Array.isArray(value)) {
    return value.filter(validIncident);
  }

  if (!value || typeof value !== 'object' || depth >= 3) {
    return null;
  }

  const object = value as Record<string, unknown>;
  const keys = ['logs', 'data', 'incidents', 'results'];

  for (const key of keys) {
    if (object[key] !== undefined) {
      const result = extractRows(object[key], depth + 1);

      if (result !== null) return result;
    }
  }

  return null;
}

/**
 * Merge by stable ID, prefer newer incoming copies, newest first.
 */
function mergeIncidents(
  current: Incident[],
  incoming: Incident[]
): Incident[] {
  const map = new Map<string, Incident>();

  for (const incident of current) {
    if (validIncident(incident)) {
      map.set(incident.incident_id, incident);
    }
  }

  for (const incident of incoming) {
    if (validIncident(incident)) {
      map.set(incident.incident_id, incident);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();

      return timeB - timeA;
    })
    .slice(0, MAX_INCIDENTS);
}

const severityStyle: Record<Exclude<Filter, 'ALL'>, string> = {
  BLOCKED: 'border-red-500/30 bg-red-500/10 text-red-300',
  CRITICAL: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  TARPIT: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  INFO: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
};

export default function LiveThreatFeed() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('CONNECTING');
  const { setSelectedIncident, threats } = useSOCStore();

  const requestInProgress = useRef(false);
  const mounted = useRef(false);

  const handleIncidentClick = (incidentId: string) => {
    const threat = threats.find(t => t.id === incidentId);
    if (threat) {
      setSelectedIncident(threat);
    }
  };

  const loadIncidents = useCallback(async (initial = false) => {
    if (requestInProgress.current) return;

    requestInProgress.current = true;

    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const result: unknown = await getAPIClient().getThreatLogs();

      if (!mounted.current) return;

      const rows = extractRows(result);

      if (rows === null) {
        console.error(
          '[SOC] Unexpected telemetry response format:',
          result
        );
        setError('The telemetry API returned an unexpected response format.');
        return;
      }

      // Preserve recently received WebSocket events while refreshing
      // persisted history from the backend.
      setIncidents((current) => mergeIncidents(current, rows));
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error('[SOC] Failed to retrieve backend incidents:', err);

      if (mounted.current) {
        setError(
          'Cannot reach the telemetry API. Live WebSocket events may still arrive.'
        );
      }
    } finally {
      requestInProgress.current = false;

      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load and five-second polling fallback.
  useEffect(() => {
    mounted.current = true;

    void loadIncidents(true);

    const interval = window.setInterval(() => {
      void loadIncidents(false);
    }, 5000);

    return () => {
      mounted.current = false;
      window.clearInterval(interval);
    };
  }, [loadIncidents]);

  // Live WebSocket stream with automatic reconnection.
  useEffect(() => {
    let stopped = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

    const connect = () => {
      if (stopped) return;

      setConnectionStatus(
        socket ? 'RECONNECTING' : 'CONNECTING'
      );

      try {
        socket = new WebSocket(wsUrl);
      } catch (err) {
        console.error('[SOC] WebSocket initialization failed:', err);
        setConnectionStatus('RECONNECTING');
        scheduleReconnect();
        return;
      }

      socket.onopen = () => {
        if (stopped) return;

        console.info('[SOC] Live telemetry WebSocket connected.');
        setConnectionStatus('LIVE');
      };

      socket.onmessage = (event) => {
        if (stopped) return;

        try {
          const message: unknown = JSON.parse(event.data);

          if (!message || typeof message !== 'object') return;

          const envelope = message as {
            event_type?: string;
            data?: unknown;
          };

          if (
            envelope.event_type !== 'threat_alert' ||
            !validIncident(envelope.data)
          ) {
            return;
          }

          const incoming = envelope.data;

          setIncidents((current) =>
            mergeIncidents(current, [incoming])
          );

          setLastUpdated(new Date());
          setError('');
        } catch (err) {
          console.error(
            '[SOC] Could not parse WebSocket message:',
            err
          );
        }
      };

      socket.onerror = () => {
        // onclose performs the reconnect so we don't create
        // multiple simultaneous connection attempts.
        if (!stopped) {
          console.warn('[SOC] WebSocket connection error.');
        }
      };

      socket.onclose = () => {
        if (stopped) return;

        setConnectionStatus('RECONNECTING');
        scheduleReconnect();
      };
    };

    function scheduleReconnect() {
      if (stopped || reconnectTimer !== undefined) return;

      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = undefined;
        connect();
      }, RECONNECT_DELAY);
    }

    connect();

    return () => {
      stopped = true;

      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }

      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      }
    };
  }, []);

  const visibleIncidents = incidents.filter((incident) => {
    const matchesFilter =
      filter === 'ALL' || getSeverity(incident) === filter;

    const query = search.trim().toLowerCase();

    const searchableText = [
      incident.incident_id,
      incident.client_ip,
      incident.request_path,
      incident.request_method,
      incident.action_taken,
      ...(incident.triggered_flags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return matchesFilter && (!query || searchableText.includes(query));
  });

  const blockedCount = incidents.filter(
    (incident) => getSeverity(incident) === 'BLOCKED'
  ).length;

  const tarpitCount = incidents.filter(
    (incident) => getSeverity(incident) === 'TARPIT'
  ).length;

  const criticalCount = incidents.filter(
    (incident) => getSeverity(incident) === 'CRITICAL'
  ).length;

  const filters: Filter[] = [
    'ALL',
    'BLOCKED',
    'CRITICAL',
    'TARPIT',
    'INFO',
  ];

  const connectionLabel = {
    CONNECTING: 'Connecting',
    LIVE: 'Live stream connected',
    RECONNECTING: 'Reconnecting',
  }[connectionStatus];

  const connectionStyle = {
    CONNECTING: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    LIVE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    RECONNECTING: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  }[connectionStatus];

  return (
    <section className="space-y-5 text-slate-100">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Recorded incidents
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {incidents.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Latest {MAX_INCIDENTS} records
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-red-300/70">
            Blocked
          </p>
          <p className="mt-2 text-3xl font-semibold text-red-300">
            {blockedCount}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-amber-300/70">
            Tarpit
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-300">
            {tarpitCount}
          </p>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-orange-300/70">
            Critical
          </p>
          <p className="mt-2 text-3xl font-semibold text-orange-300">
            {criticalCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Security incident feed
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Live events with five-second polling fallback
            {refreshing ? ' · Syncing history…' : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${connectionStyle}`}
            role="status"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connectionStatus === 'LIVE'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            {connectionLabel}
          </span>

          <button
            type="button"
            onClick={() => void loadIncidents(true)}
            disabled={loading || refreshing}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm transition hover:bg-slate-700 disabled:opacity-50"
          >
            {loading || refreshing ? 'Refreshing…' : 'Refresh now'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search IP, attack type, path, or incident ID…"
          aria-label="Search security incidents"
          className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-500/60"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
              filter === item
                ? 'border-sky-500/50 bg-sky-500/15 text-sky-200'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {item}
            {item === 'BLOCKED' ? ` (${blockedCount})` : ''}
            {item === 'TARPIT' ? ` (${tarpitCount})` : ''}
            {item === 'CRITICAL' ? ` (${criticalCount})` : ''}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <span className="text-sm font-medium">
            Detected incidents
          </span>
          <span className="text-xs text-slate-500">
            {visibleIncidents.length} shown
          </span>
        </div>

        {loading && incidents.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">
            Loading saved telemetry…
          </p>
        ) : visibleIncidents.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">
            {error
              ? 'Incident data could not be refreshed.'
              : 'No incidents match your current search and filters.'}
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {visibleIncidents.map((row) => {
              const severity = getSeverity(row);

              return (
                <article
                  key={row.incident_id}
                  className="p-4 transition hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => handleIncidentClick(row.incident_id)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] font-bold tracking-wide ${severityStyle[severity]}`}
                        >
                          {severity}
                        </span>

                        <span className="break-words text-sm font-semibold text-slate-200">
                          {getThreatName(row)}
                        </span>
                      </div>

                      <p className="mt-3 break-all font-mono text-xs text-slate-400">
                        IP: {row.client_ip || 'Unknown'}
                      </p>

                      {row.geolocation_status === 'resolved' && (
                        <p className="mt-2 text-xs text-slate-400">
                          Location: {row.country || 'Unknown'}
                          {row.city && `, ${row.city}`}
                        </p>
                      )}

                      <p className="mt-2 break-all font-mono text-xs leading-relaxed text-slate-300">
                        Request: {row.request_method || 'UNKNOWN'}{' '}
                        {row.request_path || '/'}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Action: {row.action_taken || 'Not specified'}
                      </p>

                      <p className="mt-1 break-all text-[10px] text-slate-600">
                        ID: {row.incident_id}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500">
                        {formatTime(row.created_at)}
                      </p>
                      <p className="mt-2 text-sm font-semibold tabular-nums">
                        Score: {Number(row.threat_score || 0)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}

"use client";

import { useEffect, useRef, useState } from "react";
import { useSOCStore } from "@/store/useSOCStore";
import { getWebSocketClient } from "@/lib/websocket-client";
import { getAPIClient } from "@/lib/api-client";

export default function LiveThreatFeed() {
  const {
    threats,
    isConnected,
    activeFilter,
    addThreatEvent,
    setConnected,
    clearFeed,
    setActiveFilter,
    getFilteredThreats,
  } = useSOCStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load historical incidents and merge them with live events.
  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const response = await getAPIClient().getThreatLogs();
        console.log("[WOTMED] Telemetry API response:", response);


        if (cancelled) return;

        const history = Array.isArray(response) ? response : response?.logs;

        if (!Array.isArray(history)) return;
        const wsClient = getWebSocketClient();

        const historicalEvents = [...history]
          .reverse()
          .map((incident) => wsClient.convertToThreatEvent(incident));
          console.log("[WOTMED] Converted historical events:", historicalEvents);

        if (!cancelled) {
          useSOCStore.getState().addThreatEvents(historicalEvents);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch historical telemetry:", error);
          setConnectionError("Unable to load historical incidents");
        }
      }
    };

    void fetchHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the newest threat at the top of the feed.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [threats]);

  // Subscribe to real-time threat events.
  useEffect(() => {
    const wsClient = getWebSocketClient();

    const handleThreatAlert = (event: any) => {
      if (!event || typeof event !== "object") return;

      addThreatEvent(event);
      setConnectionError(null);
    };

    const handleConnectionStatus = (data: any) => {
      if (data?.status === "connected") {
        setConnected(true);
        setConnectionError(null);
      } else if (data?.status === "error") {
        setConnected(false);
        setConnectionError(data.error || "Connection error");
      } else {
        setConnected(false);
      }
    };

    try {
      wsClient.on("threat_alert", handleThreatAlert);
      wsClient.on("connection_status", handleConnectionStatus);
      wsClient.connect();
    } catch (error) {
      console.error("WebSocket initialization failed:", error);
      setConnectionError("Failed to initialize WebSocket connection");
      setConnected(false);
    }

    return () => {
      wsClient.off("threat_alert", handleThreatAlert);
      wsClient.off("connection_status", handleConnectionStatus);
      wsClient.disconnect();
    };
  }, [addThreatEvent, setConnected]);

  const filteredThreats = getFilteredThreats();

  const severityColors: Record<string, string> = {
    INFO: "text-sky-400 bg-sky-500/10",
    TARPIT: "text-amber-400 bg-amber-500/10",
    CRITICAL: "text-orange-500 bg-orange-500/10",
    BLOCKED: "text-red-500 bg-red-600/20",
  };

  const filterButtons = ["ALL", "CRITICAL", "TARPIT", "INFO"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-sky-500" : "bg-red-500"
            }`}
          />

          <span className="text-sm text-slate-400">
            {isConnected ? "Connected to Live Backend" : "Disconnected"}
          </span>

          {connectionError && (
            <span className="ml-2 text-xs text-red-400">
              ({connectionError})
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {filterButtons.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-sky-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {filter}
          </button>
        ))}

        <button
          onClick={clearFeed}
          className="rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-600/30"
        >
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        className="h-full overflow-auto rounded-lg border border-slate-800 bg-slate-900 p-4"
      >
        {filteredThreats.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <p>No threats to display</p>
            <p className="mt-2 text-xs text-slate-600">
              Waiting for real-time telemetry from middleware...
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredThreats.map((threat) => (
              <div
                key={threat.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 transition-colors hover:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-1 text-sm font-bold ${
                          severityColors[threat.severity] ??
                          "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {threat.severity}
                      </span>

                      <span className="text-base font-bold text-slate-100">
                        {threat.threatType}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-mono text-sm font-bold text-slate-200">
                        IP: {threat.ip}
                      </p>

                      <p className="text-sm font-semibold text-slate-300">
                        Location: {threat.location.country}
                      </p>

                      <p className="font-mono text-sm font-bold text-slate-400">
                        TLS: {threat.tlsFingerprint}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-200">
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-300">
                      Score:{" "}
                      <span className="text-white">{threat.scoreDelta}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
 main
          </div>
        )}
      </div>

feature/core-engine
      <p className="text-xs text-slate-500">
        {lastUpdated
          ? `Last event or successful update: ${lastUpdated.toLocaleTimeString()}`
          : 'Waiting for the first successful telemetry update.'}
      </p>
    </section>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Total events: {threats.length}</span>
        <span>Filtered: {filteredThreats.length}</span>
      </div>
    </div>
 main
  );
}
