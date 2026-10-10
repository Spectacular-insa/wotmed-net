import AnalyticsCards from '@/components/analytics/AnalyticsCards';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <AnalyticsCards />
      <div className="bg-[#090d16] border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Dashboard Overview</h2>
        <p className="text-slate-400">Select a section from the sidebar to view detailed information.</p>
      </div>
    </div>
  );
}
