'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSOCStore } from '@/store/useSOCStore';
import IncidentDetailDrawer from './IncidentDetailDrawer';
import { getAPIClient } from '@/lib/api-client';
import { Globe, AlertTriangle, Shield, Activity } from 'lucide-react';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

type BackendIncident = {
  incident_id: string;
  client_ip?: string;
  request_path?: string;
  request_method?: string;
  threat_score?: number | string;
  action_taken?: string;
  triggered_flags?: string[];
  created_at?: string;
  country?: string;
  country_code?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  geolocation_status?: string;
  asn?: string;
  org?: string;
};

function getSeverity(incident: BackendIncident): 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED' {
  const action = (incident.action_taken || '').toUpperCase();
  const score = Number(incident.threat_score || 0);

  if (action.includes('BLOCK')) return 'BLOCKED';
  if (action.includes('TARPIT')) return 'TARPIT';
  if (score >= 80) return 'CRITICAL';
  if (score >= 40) return 'TARPIT';

  return 'INFO';
}

export default function SOCMapInner() {
  const { selectedIncident, setSelectedIncident } = useSOCStore();
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [Leaflet, setLeaflet] = useState<any>(null);
  const [incidents, setIncidents] = useState<BackendIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    import('leaflet').then((L) => {
      setLeaflet(L);
      setTimeout(() => setMapReady(true), 100);
    });
  }, []);

  const loadIncidents = useCallback(async () => {
    try {
      const result = await getAPIClient().getThreatLogs({ limit: 100 });
      
      if (Array.isArray(result)) {
        setIncidents(result);
      } else if (result && typeof result === 'object') {
        // Handle nested response format
        const logs = (result as any).logs || (result as any).data || (result as any).incidents;
        if (Array.isArray(logs)) {
          setIncidents(logs);
        }
      }
    } catch (error) {
      console.error('[Map] Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
    const interval = setInterval(loadIncidents, 5000);
    return () => clearInterval(interval);
  }, [loadIncidents]);

  // Filter out threats with invalid coordinates
  const validThreats = incidents.filter(incident => {
    const lat = Number(incident.latitude);
    const lng = Number(incident.longitude);
    return !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });

  // Count threats with and without geolocation
  const geolocatedCount = validThreats.length;
  const totalThreats = incidents.length;

  // Calculate country-level statistics from available data
  const countryStats = useMemo(() => {
    const stats = new Map<string, { count: number; severity: Record<string, number> }>();
    
    incidents.forEach(incident => {
      const country = incident.country || 'Unknown';
      const severity = getSeverity(incident);
      const current = stats.get(country) || { count: 0, severity: {} };
      current.count++;
      current.severity[severity] = (current.severity[severity] || 0) + 1;
      stats.set(country, current);
    });
    
    return Array.from(stats.entries())
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [incidents]);

  // Calculate severity counts
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { INFO: 0, TARPIT: 0, CRITICAL: 0, BLOCKED: 0 };
    incidents.forEach(incident => {
      const severity = getSeverity(incident);
      counts[severity] = (counts[severity] || 0) + 1;
    });
    return counts;
  }, [incidents]);

  const createCustomIcon = (severity: string) => {
    if (!Leaflet) return null;

    const colors = {
      INFO: '#38bdf8',
      TARPIT: '#fbbf24',
      CRITICAL: '#f97316',
      BLOCKED: '#ef4444',
    };

    const color = colors[severity as keyof typeof colors] || '#38bdf8';

    return Leaflet.divIcon({
      className: 'custom-marker',
      html: `
        <div class="threat-marker">
          <div class="marker-pulse" style="background-color: ${color};"></div>
          <div class="marker-core" style="background-color: ${color};"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  if (!isClient || !mapReady || !Leaflet) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4">
            <Globe className="w-6 h-6 text-slate-400 animate-pulse" />
          </div>
          <p className="text-slate-400">Loading threat map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="bg-slate-900 border border-slate-800 rounded-lg w-full h-full relative overflow-hidden">
        {/* Stats Header */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Total Incidents</p>
                  <p className="text-lg font-semibold text-slate-100">{totalThreats}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Geolocated</p>
                  <p className="text-lg font-semibold text-slate-100">{geolocatedCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Countries</p>
                  <p className="text-lg font-semibold text-slate-100">{countryStats.length}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-xs text-slate-400">BLOCKED: {severityCounts.BLOCKED}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="text-xs text-slate-400">CRITICAL: {severityCounts.CRITICAL}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-xs text-slate-400">TARPIT: {severityCounts.TARPIT}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span className="text-xs text-slate-400">INFO: {severityCounts.INFO}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Country Stats Sidebar */}
        {countryStats.length > 0 && (
          <div className="absolute top-20 left-4 z-[1000] bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 w-64">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Top Countries
            </h3>
            <div className="space-y-2">
              {countryStats.map(({ country, count }) => (
                <div key={country} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{country}</span>
                  <span className="font-semibold text-slate-100">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for No Coordinates */}
        {totalThreats > 0 && geolocatedCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-[999] bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">No Precise Coordinates Available</h3>
              <p className="text-sm text-slate-400 mb-4">
                The current IPinfo Lite API provides country-level data and ASN information, but does not include latitude and longitude coordinates required for precise map markers.
              </p>
              <div className="bg-slate-900 rounded-lg p-4 text-left">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Available Data:</p>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>✓ Country: {countryStats.length} countries detected</li>
                  <li>✓ ASN: Organization information available</li>
                  <li>✗ Latitude/Longitude: Not provided by Lite API</li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                To enable precise map markers, upgrade to IPinfo Core API tier or above.
              </p>
            </div>
          </div>
        )}

        <MapContainer
          center={[9, 40]}
          zoom={4}
          minZoom={2}
          maxZoom={19}
          style={{ height: '100%', width: '100%', background: '#030712' }}
        >
          <TileLayer
            attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
          {validThreats.map((incident) => {
            const severity = getSeverity(incident);
            const icon = createCustomIcon(severity);
            if (!icon) return null;

            return (
              <Marker
                key={incident.incident_id}
                position={[Number(incident.latitude), Number(incident.longitude)]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    // Convert backend incident to ThreatEvent format for drawer
                    const threatEvent = {
                      id: incident.incident_id,
                      ip: incident.client_ip || 'Unknown',
                      threatType: incident.triggered_flags?.join(', ') || incident.action_taken || 'Unknown',
                      payloadHash: `${incident.request_method || 'UNKNOWN'} ${incident.request_path || '/'}`,
                      scoreDelta: Number(incident.threat_score || 0),
                      location: {
                        country: incident.country || 'Unknown',
                        countryCode: incident.country_code,
                        city: incident.city,
                        region: incident.region,
                        lat: Number(incident.latitude) || 0,
                        lng: Number(incident.longitude) || 0,
                      },
                      timestamp: new Date(incident.created_at || new Date()),
                      severity,
                      geolocationStatus: incident.geolocation_status,
                      asn: incident.asn || incident.org ? {
                        asn: incident.asn,
                        org: incident.org,
                        available: true
                      } : undefined,
                      requestMethod: incident.request_method,
                      requestPath: incident.request_path,
                      actionTaken: incident.action_taken,
                      triggeredFlags: incident.triggered_flags,
                    };
                    setSelectedIncident(threatEvent);
                  },
                }}
              />
            );
          })}
        </MapContainer>
      </div>
      <IncidentDetailDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        isOpen={selectedIncident !== null}
      />
    </div>
  );
}
