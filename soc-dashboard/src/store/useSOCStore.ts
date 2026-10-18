
import { create } from 'zustand';

export interface ThreatEvent {
  id: string;
  ip: string;
  threatType: string;
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
    lat: number;
    lng: number;
  };
  timestamp: Date;
  severity: 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED';
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
}

interface SOCStore {
  threats: ThreatEvent[];
  isConnected: boolean;
  activeFilter: string;
  selectedIncident: ThreatEvent | null;

  addThreatEvent: (event: ThreatEvent) => void;
  setConnected: (connected: boolean) => void;
  clearFeed: () => void;
  setActiveFilter: (filter: string) => void;
  getFilteredThreats: () => ThreatEvent[];
  setSelectedIncident: (incident: ThreatEvent | null) => void;
}

const MAX_THREATS = 100;

export const useSOCStore = create<SOCStore>((set, get) => ({
  threats: [],
  isConnected: false,
  activeFilter: 'ALL',
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

  getFilteredThreats: () => {
    const { threats, activeFilter } = get();

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
  },
}));
