import React, { useState, useEffect } from 'react';

// ንጹህ SVG አይኮኖች (ያለ ምንም የውጭ ፓኬጅ ጥገኝነት)
const ShieldIcon = () => (
  <svg className="w-8 h-8 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const WifiLive = () => (
  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const WifiOff = () => (
  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-12.728-12.728m0 12.728a9 9 0 010-12.728" />
  </svg>
);

const PulseIcon = () => (
  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function App() {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000/soc-stream');

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data);
        if (parsed.type === 'THREAT_DISPATCH') {
          setEvents((prev) => [
            { ...parsed.data, timestamp: new Date().toLocaleTimeString() },
            ...prev.slice(0, 49)
          ]);
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 p-6 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-white">WOTMED-NET // SOC STREAM</h1>
            <p className="text-xs text-gray-400">Real-Time Threat Telemetry Ingestion</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800 text-sm">
          {isConnected ? (
            <>
              <WifiLive />
              <span className="text-emerald-400 font-medium tracking-wider">LIVE STREAM</span>
            </>
          ) : (
            <>
              <WifiOff />
              <span className="text-rose-500 font-medium tracking-wider">DISCONNECTED</span>
            </>
          )}
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Interceptions</p>
          <h3 className="text-3xl font-mono font-bold mt-1 text-white">{events.length}</h3>
        </div>
        <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Critical Violations</p>
          <h3 className="text-3xl font-mono font-bold mt-1 text-rose-500">
            {events.filter((e) => e.threat_level === 'CRITICAL').length}
          </h3>
        </div>
        <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Active Ruleset</p>
          <div className="flex items-center gap-2 mt-2">
            <PulseIcon />
            <span className="text-sm text-gray-300 font-mono">SQLi / XSS Active</span>
          </div>
        </div>
      </div>

      {/* Live Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
            Live Intercept Feed
          </h2>
          <span className="text-xs font-mono text-gray-500">Buffer: 50 max</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#161f30] text-gray-400 text-xs uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Method / Path</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4">Matched String</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono text-xs">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No violations detected. Listening for real-time telemetry...
                  </td>
                </tr>
              ) : (
                events.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4 text-gray-400">{evt.timestamp}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.threat_level === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {evt.threat_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-indigo-400">{evt.rule_id}</td>
                    <td className="py-3 px-4 text-gray-300">
                      <span className="text-gray-500 mr-2">{evt.http_method}</span>
                      {evt.request_path}
                    </td>
                    <td className="py-3 px-4 text-gray-400">{evt.client_ip}</td>
                    <td className="py-3 px-4 text-rose-300 truncate max-w-xs">
                      {evt.violation_metadata?.matched_string ||
                        evt.violation_metadata?.matched_pattern ||
                        '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}