import { create } from 'zustand';

export interface ThreatEvent {
  id: string;
  ip: string;
  threatType: string;
  payloadHash: string;
  scoreDelta: number;
  location: {
    country: string;
    city?: string;
    lat: number;
    lng: number;
  };
  timestamp: Date;
  severity: 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED';
}

interface SOCStore {
  threats: ThreatEvent[];
  isConnected: boolean;
  activeFilter: string;
  addThreatEvent: (event: ThreatEvent) => void;
  setConnected: (connected: boolean) => void;
  clearFeed: () => void;
  setActiveFilter: (filter: string) => void;
  getFilteredThreats: () => ThreatEvent[];
}

export const useSOCStore = create<SOCStore>((set, get) => ({
  threats: [],
  isConnected: false,
  activeFilter: 'ALL',

  addThreatEvent: (event) => set((state) => ({
    threats: [event, ...state.threats].slice(0, 100), // Rolling buffer capped at 100
  })),

  setConnected: (connected) => set({ isConnected: connected }),

  clearFeed: () => set({ threats: [] }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  getFilteredThreats: () => {
    const { threats, activeFilter } = get();
    if (activeFilter === 'ALL') return threats;
    return threats.filter((threat) => threat.severity === activeFilter);
  },
}));
