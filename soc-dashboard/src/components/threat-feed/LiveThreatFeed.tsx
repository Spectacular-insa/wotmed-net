'use client';

import { useEffect, useRef, useState } from 'react';
import { useSOCStore } from '@/store/useSOCStore';
import { getWebSocketClient } from '@/lib/websocket-client';
import { getAPIClient } from '@/lib/api-client';

export default function LiveThreatFeed() {
  const { threats, isConnected, activeFilter, addThreatEvent, setConnected, clearFeed, setActiveFilter, getFilteredThreats } = useSOCStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch historical incidents on load
    const fetchHistory = async () => {
      try {
        const history = await getAPIClient().getThreatLogs();
        if (Array.isArray(history)) {
          const wsClient = getWebSocketClient();
          // The array comes newest first from the backend (unshifted)
          // We need to reverse it so the oldest is added first, and newest is on top
          [...history].reverse().forEach(incident => {
            const parsed = wsClient.convertToThreatEvent(incident);
            addThreatEvent(parsed);
          });
        }
      } catch (err) {
        console.error("Failed to fetch historical telemetry:", err);
      }
    };
    
    // Only fetch if feed is currently empty
    if (useSOCStore.getState().threats.length === 0) {
      fetchHistory();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threats]);

  useEffect(() => {
    const wsClient = getWebSocketClient();

    const handleThreatAlert = (event: any) => {
      addThreatEvent(event);
      setConnectionError(null);
    };

    const handleConnectionStatus = (data: any) => {
      if (data.status === 'connected') {
        setConnected(true);
        setConnectionError(null);
      } else if (data.status === 'error') {
        setConnected(false);
        setConnectionError(data.error || 'Connection error');
      } else {
        setConnected(false);
      }
    };

    try {
      wsClient.connect();

      wsClient.on('threat_alert', handleThreatAlert);
      wsClient.on('connection_status', handleConnectionStatus);

      return () => {
        wsClient.off('threat_alert', handleThreatAlert);
        wsClient.off('connection_status', handleConnectionStatus);
        wsClient.disconnect();
      };
    } catch (error) {
      setConnectionError('Failed to initialize WebSocket connection');
      setConnected(false);
    }
  }, [addThreatEvent, setConnected]);

  const filteredThreats = getFilteredThreats();

  const severityColors = {
    INFO: 'text-sky-400 bg-sky-500/10',
    TARPIT: 'text-amber-400 bg-amber-500/10',
    CRITICAL: 'text-orange-500 bg-orange-500/10',
    BLOCKED: 'text-red-500 bg-red-600/20',
  };

  const filterButtons = ['ALL', 'CRITICAL', 'TARPIT', 'INFO'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-sky-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-slate-400">
            {isConnected ? 'Connected to Live Backend' : 'Disconnected'}
          </span>
          {connectionError && (
            <span className="text-xs text-red-400 ml-2">({connectionError})</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {filterButtons.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {filter}
          </button>
        ))}
        <button
          onClick={clearFeed}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
        >
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-full overflow-auto"
      >
        {filteredThreats.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No threats to display</p>
            <p className="text-xs mt-2 text-slate-600">Waiting for real-time telemetry from middleware...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredThreats.map((threat) => (
              <div
                key={threat.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${severityColors[threat.severity]}`}>
                        {threat.severity}
                      </span>
                      <span className="text-base font-bold text-slate-100">{threat.threatType}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-200 font-mono">IP: {threat.ip}</p>
                      <p className="text-sm font-semibold text-slate-300">Location: {threat.location.country}</p>
                      <p className="text-sm font-bold text-slate-400 font-mono">TLS: {threat.tlsFingerprint}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-200">{new Date(threat.timestamp).toLocaleTimeString()}</p>
                    <p className="text-sm font-bold text-slate-300 mt-1">Score: <span className="text-white">{threat.scoreDelta}</span></p>
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
