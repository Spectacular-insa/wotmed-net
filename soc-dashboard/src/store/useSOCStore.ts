
import { create } from 'zustand';

export interface ThreatEvent {
  id: string;
  ip: string;
  threatType: string;
 feature/core-engine
  payloadHash: string;
  scoreDelta: number;
  location: {
    country: string;
    countryCode?: string;
    city?: string;
    region?: string;
    regionCode?: string;
    postal?: string;
    timezone?: string;

  tlsFingerprint: string;
  scoreDelta: number;
  location: {
    country: string;
    city?: string;
 main
    lat: number;
    lng: number;
  };
  timestamp: Date;
  severity: 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED';
 feature/core-engine
  geolocationStatus?: string;
  geolocationReason?: string;
  // Privacy detection fields
  privacy?: {
    vpn?: boolean;
    proxy?: boolean;
    tor?: boolean;
    relay?: boolean;
    hosting?: boolean;
    service?: string;
    available?: boolean;
  };
  // ASN/ISP fields
  asn?: {
    asn?: string;
    org?: string;
    domain?: string;
    type?: string;
    available?: boolean;
  };
  // Additional incident details
  requestMethod?: string;
  requestPath?: string;
  actionTaken?: string;
  triggeredFlags?: string[];
 main
}

interface SOCStore {
  threats: ThreatEvent[];
  isConnected: boolean;
  activeFilter: string;
 feature/core-engine
  selectedIncident: ThreatEvent | null;

  addThreatEvent: (event: ThreatEvent) => void;
  addThreatEvent: (event: ThreatEvent) => void;
  addThreatEvents: (events: ThreatEvent[]) => void;
 main
  setConnected: (connected: boolean) => void;
  clearFeed: () => void;
  setActiveFilter: (filter: string) => void;
  getFilteredThreats: () => ThreatEvent[];
 feature/core-engine
  setSelectedIncident: (incident: ThreatEvent | null) => void;
}

const MAX_THREATS = 100;

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
 main

export const useSOCStore = create<SOCStore>((set, get) => ({
  threats: [],
  isConnected: false,
  activeFilter: 'ALL',
feature/core-engine
  selectedIncident: null,

  addThreatEvent: (event) =>
    set((state) => {
      if (!event.id) {
        return state;
      }

      // Preserve the existing record if this incident ID is already present.
      if (state.threats.some((threat) => threat.id === event.id)) {
        return state;
      }

      return {
        threats: [event, ...state.threats].slice(0, MAX_THREATS),
      };
    }),

  setConnected: (connected) => {
    set({ isConnected: connected });
  },

  clearFeed: () => {
    set({ threats: [] });
  },

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
  },

  setSelectedIncident: (incident) => {
    set({ selectedIncident: incident });
  },


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
 main

  getFilteredThreats: () => {
    const { threats, activeFilter } = get();

 feature/core-engine
    // Defensive deduplication for feeds populated by older code paths.
    const uniqueThreats = Array.from(
      new Map(
        threats.map((threat) => [threat.id, threat])
      ).values()
    );

    if (activeFilter === 'ALL') {
      return uniqueThreats;
    }

    return uniqueThreats.filter(
      (threat) => threat.severity === activeFilter
    );

    if (activeFilter === 'ALL') {
      return threats;
    }

    return threats.filter((threat) => threat.severity === activeFilter);
 main
  },
}));
