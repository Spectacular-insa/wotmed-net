/**
 * Wotmed-Net Telemetry & Asynchronous Dispatcher
 * Architect: Ayitegeb Tilahun Demisie
 */

const { createClient } = require('@supabase/supabase-js');
const EventEmitter = require('events');

class WotmedTelemetry extends EventEmitter {
  constructor() {
    super();
    // Initialize Supabase client using environment variables
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      this.supabase = null;
      console.warn('[Wotmed-Net Warning]: Supabase credentials not found. Telemetry running in local buffer mode.');
    }
  }

  async emitIncident(incidentData) {
    const payload = {
      incident_id: `inc_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`,
      client_ip: incidentData.requestContext.clientIp,
      user_agent: incidentData.requestContext.userAgent,
      path: incidentData.requestContext.path,
      method: incidentData.requestContext.method,
      tls_fingerprint: incidentData.requestContext.tlsFingerprint,
      threat_score: incidentData.evaluationResult.threatScore,
      action_taken: incidentData.evaluationResult.actionTaken,
      triggered_flags: incidentData.evaluationResult.triggeredFlags,
      created_at: incidentData.evaluationResult.timestamp
    };

    // Broadcast event locally for WebSocket listeners
    this.emit('incident', payload);

    // Asynchronous emission to backend database / SOC pipeline without blocking response execution
    if (this.supabase) {
      this.supabase
        .from('wotmed_telemetry')
        .insert([payload])
        .then(({ error }) => {
          if (error) console.error('[Wotmed Telemetry Error]:', error.message);
        })
        .catch(err => {
          console.error('[Wotmed Telemetry Network Exception]:', err.message);
        });
    } else {
      // Local fallback telemetry stream output
      console.log('[Wotmed SOC Telemetry Stream]:', JSON.stringify(payload, null, 2));
    }
  }
}

// Export as a singleton so both the middleware and the WebSocket server can access the same instance
const telemetryInstance = new WotmedTelemetry();
module.exports = telemetryInstance;