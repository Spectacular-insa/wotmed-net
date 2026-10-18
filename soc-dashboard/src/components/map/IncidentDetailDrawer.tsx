'use client';

import { X } from 'lucide-react';
import type { ThreatEvent } from '@/store/useSOCStore';

interface IncidentDetailDrawerProps {
  incident: ThreatEvent | null;
  onClose: () => void;
  isOpen: boolean;
}

export default function IncidentDetailDrawer({ incident, onClose, isOpen }: IncidentDetailDrawerProps) {
  if (!incident || !isOpen) return null;

  const hasPrivacyData = incident.privacy?.available;
  const hasAsnData = incident.asn?.available;
  const hasGeolocation = incident.geolocationStatus === 'resolved';

  const getGeolocationStatusBadge = () => {
    switch (incident.geolocationStatus) {
      case 'resolved':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved</span>;
      case 'not_public':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">Private IP</span>;
      case 'unavailable':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Unavailable</span>;
      case 'error':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Error</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">Unknown</span>;
    }
  };

  const getPrivacyBadge = () => {
    if (!hasPrivacyData) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">No privacy data</span>;
    }
    
    const badges = [];
    if (incident.privacy?.vpn) badges.push('VPN');
    if (incident.privacy?.tor) badges.push('Tor');
    if (incident.privacy?.proxy) badges.push('Proxy');
    if (incident.privacy?.relay) badges.push('Relay');
    if (incident.privacy?.hosting) badges.push('Hosting');
    
    if (badges.length === 0) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">No privacy signals</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {badges.map((badge) => (
          <span key={badge} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            {badge}
          </span>
        ))}
        {incident.privacy?.service && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {incident.privacy.service}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl z-[2000] overflow-y-auto">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold text-slate-100">Incident Details</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Incident ID and Timestamp */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Incident ID</span>
            <span className="text-xs font-mono text-slate-400">{incident.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Timestamp</span>
            <span className="text-xs text-slate-300">{new Date(incident.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {/* Severity and Score */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Severity</span>
            <p className="mt-2 text-2xl font-bold text-slate-100">{incident.severity}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Threat Score</span>
            <p className="mt-2 text-2xl font-bold text-slate-100">{incident.scoreDelta}</p>
          </div>
        </div>

        {/* Source IP */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Source IP</span>
          <p className="mt-2 text-lg font-mono text-slate-100">{incident.ip}</p>
          <p className="mt-1 text-xs text-slate-400">Observed at server boundary</p>
        </div>

        {/* Geolocation */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Geolocation</span>
            {getGeolocationStatusBadge()}
          </div>
          
          {hasGeolocation ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Country</span>
                <span className="text-sm text-slate-200">{incident.location.country}</span>
              </div>
              {incident.location.countryCode && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Country Code</span>
                  <span className="text-sm text-slate-200">{incident.location.countryCode}</span>
                </div>
              )}
              {incident.location.region && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Region</span>
                  <span className="text-sm text-slate-200">{incident.location.region}</span>
                </div>
              )}
              {incident.location.city && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">City</span>
                  <span className="text-sm text-slate-200">{incident.location.city}</span>
                </div>
              )}
              {incident.location.postal && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Postal Code</span>
                  <span className="text-sm text-slate-200">{incident.location.postal}</span>
                </div>
              )}
              {incident.location.timezone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Timezone</span>
                  <span className="text-sm text-slate-200">{incident.location.timezone}</span>
                </div>
              )}
              {incident.location.lat !== 0 && incident.location.lng !== 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Coordinates</span>
                  <span className="text-sm font-mono text-slate-200">
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </span>
                </div>
              )}
              <p className="mt-3 text-xs text-slate-500 italic">
                Approximate network location. Not exact physical tracking.
              </p>
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              {incident.geolocationReason || 'Geolocation not available for this IP'}
            </div>
          )}
        </div>

        {/* Privacy Detection */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Privacy Detection</span>
            {getPrivacyBadge()}
          </div>
          
          {hasPrivacyData ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">VPN</span>
                <span className={`text-sm ${incident.privacy?.vpn ? 'text-orange-400' : 'text-slate-500'}`}>
                  {incident.privacy?.vpn ? 'Detected' : 'Not detected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Tor</span>
                <span className={`text-sm ${incident.privacy?.tor ? 'text-orange-400' : 'text-slate-500'}`}>
                  {incident.privacy?.tor ? 'Detected' : 'Not detected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Proxy</span>
                <span className={`text-sm ${incident.privacy?.proxy ? 'text-orange-400' : 'text-slate-500'}`}>
                  {incident.privacy?.proxy ? 'Detected' : 'Not detected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Relay</span>
                <span className={`text-sm ${incident.privacy?.relay ? 'text-orange-400' : 'text-slate-500'}`}>
                  {incident.privacy?.relay ? 'Detected' : 'Not detected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Hosting</span>
                <span className={`text-sm ${incident.privacy?.hosting ? 'text-orange-400' : 'text-slate-500'}`}>
                  {incident.privacy?.hosting ? 'Detected' : 'Not detected'}
                </span>
              </div>
              {incident.privacy?.service && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Service</span>
                  <span className="text-sm text-slate-200">{incident.privacy.service}</span>
                </div>
              )}
              <p className="mt-3 text-xs text-slate-500 italic">
                VPN/proxy locations are network exit nodes, not verified user locations.
              </p>
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              Privacy detection requires Plus/Max API tier. Current API tier does not provide this data.
            </div>
          )}
        </div>

        {/* ASN/ISP */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <span className="text-xs text-slate-500 uppercase tracking-wider">ASN / ISP</span>
          
          {hasAsnData ? (
            <div className="mt-3 space-y-2">
              {incident.asn?.asn && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">ASN</span>
                  <span className="text-sm font-mono text-slate-200">{incident.asn.asn}</span>
                </div>
              )}
              {incident.asn?.org && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Organization</span>
                  <span className="text-sm text-slate-200">{incident.asn.org}</span>
                </div>
              )}
              {incident.asn?.domain && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Domain</span>
                  <span className="text-sm text-slate-200">{incident.asn.domain}</span>
                </div>
              )}
              {incident.asn?.type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Type</span>
                  <span className="text-sm text-slate-200">{incident.asn.type}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-400">
              ASN data requires Lite tier or above. Current API tier does not provide this data.
            </div>
          )}
        </div>

        {/* Threat Details */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Threat Details</span>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Threat Type</span>
              <span className="text-sm text-slate-200">{incident.threatType}</span>
            </div>
            {incident.requestMethod && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">HTTP Method</span>
                <span className="text-sm font-mono text-slate-200">{incident.requestMethod}</span>
              </div>
            )}
            {incident.requestPath && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Request Path</span>
                <span className="text-sm font-mono text-slate-200 break-all text-right">{incident.requestPath}</span>
              </div>
            )}
            {incident.actionTaken && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Action Taken</span>
                <span className="text-sm text-slate-200">{incident.actionTaken}</span>
              </div>
            )}
          </div>
        </div>

        {/* Triggered Flags */}
        {incident.triggeredFlags && incident.triggeredFlags.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Detected Flags</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {incident.triggeredFlags.map((flag) => (
                <span
                  key={flag}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
