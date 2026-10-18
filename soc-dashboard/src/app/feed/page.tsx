 feature/core-engine
'use client';

import LiveThreatFeed from '@/components/threat-feed/LiveThreatFeed';
import IncidentDetailDrawer from '@/components/map/IncidentDetailDrawer';
import { useSOCStore } from '@/store/useSOCStore';

export default function FeedPage() {
  const { selectedIncident, setSelectedIncident } = useSOCStore();


import LiveThreatFeed from '@/components/threat-feed/LiveThreatFeed';

export default function FeedPage() {
 main
  return (
    <div className="space-y-6">
      <div className="bg-[#090d16] border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Live Threat Feed</h2>
        <LiveThreatFeed />
      </div>
feature/core-engine
      <IncidentDetailDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        isOpen={selectedIncident !== null}
      />

 main
    </div>
  );
}
