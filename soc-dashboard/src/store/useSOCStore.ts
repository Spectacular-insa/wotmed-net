
import { create } from 'zustand';

export interface ThreatEvent {
  id: string;
  ip: string;
  threatType: string;
  tlsFingerprint: string;
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
  addThreatEvents: (events: ThreatEvent[]) => void;
  setConnected: (connected: boolean) => void;
  clearFeed: () => void;
  setActiveFilter: (filter: string) => void;
  getFilteredThreats: () => ThreatEvent[];
}

function normalizeTimestamp(value: Date | string | number): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getIncidentKey(event: ThreatEvent): string {
  const timestamp = normalizeTimestamp(event.timestamp);

  // Prefer the incident ID when both sources share it.
  if (event.id) {
    return event.id;
  }

  // Fallback for events that do not have a stable incident ID.
  return [
    event.ip,
    event.threatType,
    event.tlsFingerprint,
    timestamp,
    event.scoreDelta,
    event.severity,
  ].join('|');
}

function mergeUniqueEvents(
  existing: ThreatEvent[],
  incoming: ThreatEvent[]
): ThreatEvent[] {
  const seen = new Set<string>();
  const merged: ThreatEvent[] = [];

  // Incoming events are placed first, so the newest feed entries stay visible.
  for (const event of [...incoming, ...existing]) {
    const key = getIncidentKey(event);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push({
      ...event,
      timestamp: new Date(event.timestamp),
    });

    if (merged.length >= 100) {
      break;
    }
  }

  return merged;
}

export const useSOCStore = create<SOCStore>((set, get) => ({
  threats: [],
  isConnected: false,
  activeFilter: 'ALL',

  addThreatEvent: (event) =>
    set((state) => ({
      threats: mergeUniqueEvents(state.threats, [event]),
    })),

  addThreatEvents: (events) =>
    set((state) => ({
      threats: mergeUniqueEvents(events, state.threats),
    })),

  setConnected: (connected) => set({ isConnected: connected }),

  clearFeed: () => set({ threats: [] }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  getFilteredThreats: () => {
    const { threats, activeFilter } = get();

    if (activeFilter === 'ALL') {
      return threats;
    }

    return threats.filter((threat) => threat.severity === activeFilter);
  },
}));
