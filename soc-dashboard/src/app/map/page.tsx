'use client';

import SOCMapInner from '@/components/map/SOCMapInner';

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[#090d16] border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Geographic Threat Map</h2>
        <div className="h-[600px]">
          <SOCMapInner />
        </div>
      </div>
    </div>
  );
}
