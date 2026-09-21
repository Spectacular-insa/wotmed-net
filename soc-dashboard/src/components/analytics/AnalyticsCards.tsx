'use client';

import { useSOCStore } from '@/store/useSOCStore';
import { ShieldAlert, Ban, Activity, Zap } from 'lucide-react';

export default function AnalyticsCards() {
  const { threats } = useSOCStore();

  const totalThreats = threats.length;
  const blockedIPs = new Set(threats.filter(t => t.severity === 'BLOCKED').map(t => t.ip)).size;
  const threatsPerHour = threats.length > 0 ? Math.round((threats.length / 10) * 60) : 0;
  const detectionRate = threats.length > 0 ? (threats.filter(t => t.scoreDelta > 50).length / threats.length * 100).toFixed(1) : '0.0';

  const cards = [
    {
      title: 'Total Threats',
      value: totalThreats,
      icon: ShieldAlert,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'Active Blocked IPs',
      value: blockedIPs,
      icon: Ban,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Threats/Hour',
      value: threatsPerHour,
      icon: Activity,
      color: 'text-sky-300',
      bgColor: 'bg-sky-400/10',
    },
    {
      title: 'Detection Rate',
      value: `${detectionRate}%`,
      icon: Zap,
      color: 'text-sky-500',
      bgColor: 'bg-sky-600/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-slate-900 border border-slate-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-slate-100 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
