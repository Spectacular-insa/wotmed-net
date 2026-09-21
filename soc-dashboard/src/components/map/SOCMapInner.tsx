'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSOCStore } from '@/store/useSOCStore';

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
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function SOCMapInner() {
  const { threats } = useSOCStore();
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [Leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    import('leaflet').then((L) => {
      setLeaflet(L);
      setTimeout(() => setMapReady(true), 100);
    });
  }, []);

  // Filter out threats with invalid coordinates
  const validThreats = threats.filter(threat => {
    const { lat, lng } = threat.location;
    return lat !== null && lat !== undefined && lng !== null && lng !== undefined &&
           !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });

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
          <p className="text-slate-400">Loading threat map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg w-full h-full relative overflow-hidden">
      <MapContainer
        center={[9, 40]}
        zoom={4}
        minZoom={2}
        maxZoom={19}
        style={{ height: '100%', width: '100%', background: '#030712' }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        {validThreats.map((threat) => {
          const icon = createCustomIcon(threat.severity);
          if (!icon) return null;

          return (
            <Marker
              key={threat.id}
              position={[threat.location.lat, threat.location.lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-2 bg-slate-800 text-slate-100 min-w-[200px]">
                  <div className="mb-2">
                    <p className="font-semibold text-sm">{threat.threatType}</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-300">
                      <span className="text-slate-400">IP:</span> {threat.ip}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">Severity:</span> {threat.severity}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">Score:</span> {threat.scoreDelta}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">Location:</span> {threat.location.country}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">Coordinates:</span> {threat.location.lat.toFixed(4)}, {threat.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
