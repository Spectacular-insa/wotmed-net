export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[#090d16] border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
 feature/core-engine
            <label className="block text-sm text-slate-400 mb-2">Manual IP Block</label>

            <label className="block text-sm text-slate-400 mb-2">
              Manual IP Block
            </label>
 main
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter IP address"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Block
              </button>
            </div>
          </div>
          <div>
 feature/core-engine
            <label className="block text-sm text-slate-400 mb-2">Search Threats</label>

            <label className="block text-sm text-slate-400 mb-2">
              Search Threats
            </label>
 main
            <input
              type="text"
              placeholder="Search by IP, threat type, or hash..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
 feature/core-engine
            <h3 className="text-sm font-medium text-slate-300 mb-2">API Configuration</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}</p>
              <p>WebSocket URL: {process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}</p>

            <h3 className="text-sm font-medium text-slate-300 mb-2">
              API Configuration
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <p>
                API URL:{" "}
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}
              </p>
              <p>
                WebSocket URL:{" "}
                {process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5001"}
              </p>
 main
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
