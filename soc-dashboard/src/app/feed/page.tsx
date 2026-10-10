import LiveThreatFeed from '@/components/threat-feed/LiveThreatFeed';

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[#090d16] border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Live Threat Feed</h2>
        <LiveThreatFeed />
      </div>
    </div>
  );
}
