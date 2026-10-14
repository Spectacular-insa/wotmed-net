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
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Total events: {threats.length}</span>
        <span>Filtered: {filteredThreats.length}</span>
      </div>
    </div>
  );
}
