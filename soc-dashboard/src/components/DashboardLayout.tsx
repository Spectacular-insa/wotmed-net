'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, AlertTriangle, MapPin, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: '/', icon: Shield, label: 'Dashboard', href: '/' },
    { id: '/feed', icon: AlertTriangle, label: 'Threat Feed', href: '/feed' },
    { id: '/map', icon: MapPin, label: 'Threat Map', href: '/map' },
    { id: '/analytics', icon: Settings, label: 'Analytics', href: '/analytics' },
    { id: '/settings', icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#030712]">
      {/* Sidebar */}
      <aside
        className={`bg-[#090d16] border-r border-slate-800 transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-end pr-4 border-b border-slate-800">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.id;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-slate-100'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={`text-xs text-slate-500 ${sidebarCollapsed && 'text-center'}`}>
            {!sidebarCollapsed ? (
              <>
                <p>Wotmed-Net</p>
                <p className="mt-1">SOC Dashboard</p>
                <p className="mt-2 text-slate-600">Developed by Spectacular</p>
              </>
            ) : (
              <p className="text-[10px]">WN</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#090d16] border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* Generic Shield Icon */}
            <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Wotmed-Net</h1>
              <p className="text-xs text-slate-400">SOC Dashboard</p>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            {currentTime}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
