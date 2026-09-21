import AnalyticsCards from '@/components/analytics/AnalyticsCards';
import LiveThreatFeed from '@/components/threat-feed/LiveThreatFeed';
import SOCMapInner from '@/components/map/SOCMapInner';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <AnalyticsCards />
      <div className="bg-[#090d16] border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[600px]">
            <LiveThreatFeed />
          </div>
          <div className="h-[600px]">
            <SOCMapInner />
          </div>
        </div>
      </div>
    </div>
  );
}
