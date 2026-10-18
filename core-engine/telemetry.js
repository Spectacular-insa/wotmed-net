
/**
 * Wotmed-Net Telemetry & Asynchronous Dispatcher
 * Architect: Ayitegeb Tilahun Demissie
 *
 * Features:
 * - Persistent incident storage in Supabase
 * - Persistent honeypot session storage in Supabase
 * - Historical incident loading after server restarts
 * - Refreshes database history on every dashboard poll
 * - Real-time incident events
 * - Bounded in-memory history cache
 * - Deduplication by incident_id
 * - In-memory fallback when Supabase is unavailable
 */

const { createClient } = require('@supabase/supabase-js');
const EventEmitter = require('events');
const { randomUUID } = require('crypto');
const { getGeolocation } = require('./geolocation');

const MAX_HISTORY = 100;
const TABLE_NAME = 'wotmed_incidents';
const HONEYPOT_TABLE_NAME = 'wotmed_honeypot_sessions';

class WotmedTelemetry extends EventEmitter {
  constructor() {
    super();

    this.history = [];
    this.supabase = null;
    this.historyLoaded = false;
    this.historyLoadPromise = null;

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';

    // Privileged credentials must remain server-side.
    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '';

    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        '[Wotmed-Net Warning]: Supabase credentials missing. ' +
        'Using local in-memory telemetry.'
      );

      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    console.log(
      '[Wotmed-Net Telemetry]: Supabase client initialized.'
    );

    // Initial history restoration.
    this.loadHistory().catch(() => {
      // The method logs the underlying error.
      // A later history request can retry.
    });
  }

  /**
   * Merge records by stable incident ID.
   * Keep the newest records first and cap history at MAX_HISTORY.
   */
  mergeHistory(records = []) {
    const unique = new Map();

    for (const record of [...this.history, ...records]) {
      if (!record || !record.incident_id) {
        continue;
      }

      // Preserve the first copy of each stable incident ID.
      if (!unique.has(record.incident_id)) {
        unique.set(record.incident_id, record);
      }
    }

    this.history = Array.from(unique.values())
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, MAX_HISTORY);
  }

  /**
   * Load or refresh incident history from Supabase.
   *
   * forceRefresh = true bypasses the initial-load cache and
   * queries Supabase again. Concurrent requests share one query.
   */
  async loadHistory(forceRefresh = false) {
    if (this.historyLoaded && !forceRefresh) {
      return;
    }

    if (this.historyLoadPromise) {
      return this.historyLoadPromise;
    }

    if (!this.supabase) {
      this.historyLoaded = true;
      return;
    }

    this.historyLoadPromise = (async () => {
      const { data, error } = await this.supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY);

      if (error) {
        console.error(
          '[Wotmed Telemetry History Error]:',
          error.message
        );

        throw error;
      }

      this.mergeHistory(Array.isArray(data) ? data : []);
      this.historyLoaded = true;

      console.log(
        `[Wotmed Telemetry]: Refreshed history; ` +
        `${this.history.length} incidents in memory.`
      );
    })();

    try {
      await this.historyLoadPromise;
    } finally {
      this.historyLoadPromise = null;
    }
  }

  /**
   * Persist one honeypot session.
   */
  async saveHoneypotSession(sessionData = {}) {
    if (!this.supabase) {
      console.warn(
        '[Wotmed Honeypot Persistence]: Supabase is not configured; ' +
        'session was not persisted.'
      );

      return null;
    }

    const parsedTimestamp = sessionData.timestamp
      ? new Date(sessionData.timestamp)
      : new Date();

    const timestamp = Number.isNaN(parsedTimestamp.getTime())
      ? new Date().toISOString()
      : parsedTimestamp.toISOString();

    const score = Number(sessionData.threat_score);

    const payload = {
      session_id: String(
        sessionData.session_id || `hp_${randomUUID()}`
      ),
      timestamp,
      method: String(sessionData.method || 'UNKNOWN'),
      path: String(sessionData.path || '/').slice(0, 500),
      client_ip: String(sessionData.client_ip || 'UNKNOWN'),
      threat_score: Number.isFinite(score)
        ? Math.max(0, Math.min(100, Math.round(score)))
        : 0,
      flags: Array.isArray(sessionData.flags)
        ? sessionData.flags.map(String).slice(0, 30)
        : [],
      status: String(sessionData.status || 'captured'),
    };

    try {
      const { error } = await this.supabase
        .from(HONEYPOT_TABLE_NAME)
        .insert([payload]);

      if (error) {
        console.error(
          '[Wotmed Honeypot Database Error]:',
          error.message
        );

        return null;
      }

      console.log(
        `[Wotmed Honeypot Persistence]: ` +
        `Session ${payload.session_id} saved to Supabase.`
      );

      return payload;
    } catch (error) {
      console.error(
        '[Wotmed Honeypot Network Exception]:',
        error instanceof Error ? error.message : String(error)
      );

      return null;
    }
  }

  /**
   * Create, broadcast, and persist a new incident.
   */
  async emitIncident(incidentData = {}) {
    const requestContext = incidentData.requestContext || {};
    const evaluationResult = incidentData.evaluationResult || {};

    const score = Number(evaluationResult.threatScore ?? 0);

    const threatScore = Number.isFinite(score)
      ? Math.max(0, Math.min(100, Math.round(score)))
      : 0;

    const triggeredFlags = Array.isArray(
      evaluationResult.triggeredFlags
    )
      ? evaluationResult.triggeredFlags.map(String)
      : [];

    const parsedDate = evaluationResult.timestamp
      ? new Date(evaluationResult.timestamp)
      : new Date();

    const createdAt = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();

    const clientIp = String(requestContext.clientIp || '127.0.0.1');

    const payload = {
      incident_id: `inc_${randomUUID()}`,
      client_ip: clientIp,
      user_agent: String(
        requestContext.userAgent || 'UNKNOWN'
      ),
      request_path: String(
        requestContext.path || '/'
      ),
      request_method: String(
        requestContext.method || 'UNKNOWN'
      ).toUpperCase(),
      tls_fingerprint: String(
        requestContext.tlsFingerprint ||
        'AUTOMATED_CLIENT_TLS'
      ),
      threat_score: threatScore,
      action_taken: String(
        evaluationResult.actionTaken || 'UNKNOWN'
      ),
      triggered_flags: triggeredFlags,
      created_at: createdAt,
      geolocation_status: 'pending',
    };

    // Update local history and notify connected dashboard clients.
    this.mergeHistory([payload]);
    this.emit('incident', payload);

    if (!this.supabase) {
      console.log(
        '[Wotmed SOC Telemetry Stream - Local Only]:',
        JSON.stringify(payload, null, 2)
      );

      // Still attempt geolocation for local mode
      getGeolocation(clientIp).then(geoResult => {
        if (geoResult && geoResult.status === 'resolved') {
          payload.country = geoResult.country;
          payload.country_code = geoResult.country_code;
          payload.geolocation_status = 'resolved';
          
          if (geoResult.asn?.available) {
            payload.asn = geoResult.asn.asn;
            payload.org = geoResult.asn.org;
            payload.org_domain = geoResult.asn.domain;
            payload.asn_type = geoResult.asn.type;
          }
          
          this.emit('incident', { ...payload });
        } else {
          payload.geolocation_status = geoResult?.status || 'unavailable';
          payload.geolocation_reason = geoResult?.reason || null;
        }
      }).catch(error => {
        console.error('[Wotmed Geolocation Error]:', error.message);
        payload.geolocation_status = 'error';
      });

      return payload;
    }

    try {
      const { error } = await this.supabase
        .from(TABLE_NAME)
        .insert([payload]);

      if (error) {
        console.error(
          '[Wotmed Telemetry Database Error]:',
          error.message
        );
      } else {
        console.log(
          `[Wotmed Telemetry]: Incident ` +
          `${payload.incident_id} saved to Supabase.`
        );
        
        // Perform geolocation AFTER successful insert
        getGeolocation(clientIp).then(geoResult => {
          if (geoResult && geoResult.status === 'resolved') {
            const updateData = {
              country: geoResult.country,
              geolocation_status: 'resolved'
            };
            
            // Only update fields that Lite API provides
            if (geoResult.country_code) updateData.country_code = geoResult.country_code;
            
            // Add ASN/ISP data if available
            if (geoResult.asn?.available) {
              updateData.asn = geoResult.asn.asn;
              updateData.org = geoResult.asn.org;
              updateData.org_domain = geoResult.asn.domain;
              updateData.asn_type = geoResult.asn.type;
            }
            
            // Note: Lite API does NOT provide latitude, longitude, city, region, postal, timezone, or privacy data
            // These fields will remain NULL in the database
            
            this.supabase
              .from(TABLE_NAME)
              .update(updateData)
              .eq('incident_id', payload.incident_id)
              .then(({ error: updateError, data }) => {
                if (updateError) {
                  console.error('[Wotmed Geolocation Update Error]:', updateError.message);
                } else {
                  console.log(`[Wotmed Geolocation]: Updated ${payload.incident_id} with country: ${geoResult.country}, ASN: ${geoResult.asn?.asn || 'N/A'}`);
                  
                  // Update in-memory history with geolocation data
                  const historyIndex = this.history.findIndex(inc => inc.incident_id === payload.incident_id);
                  if (historyIndex !== -1) {
                    this.history[historyIndex] = { ...this.history[historyIndex], ...updateData };
                  }
                  
                  // Re-emit with geolocation data for dashboard
                  const updatedPayload = { ...payload, ...updateData };
                  this.emit('incident', updatedPayload);
                }
              });
          } else {
            // Update with failure status
            this.supabase
              .from(TABLE_NAME)
              .update({
                geolocation_status: geoResult?.status || 'unavailable',
                geolocation_reason: geoResult?.reason || null
              })
              .eq('incident_id', payload.incident_id)
              .then(({ error: statusError }) => {
                if (statusError) {
                  console.error('[Wotmed Geolocation Status Update Error]:', statusError.message);
                }
              });
          }
        }).catch(error => {
          console.error('[Wotmed Geolocation Error]:', error.message);
          this.supabase
            .from(TABLE_NAME)
            .update({ geolocation_status: 'error' })
            .eq('incident_id', payload.incident_id)
            .then(({ error: err }) => {
              if (err) {
                console.error('[Wotmed Geolocation Error Status Update]:', err.message);
              }
            });
        });
      }
    } catch (error) {
      console.error(
        '[Wotmed Telemetry Network Exception]:',
        error instanceof Error
          ? error.message
          : String(error)
      );
    }

    return payload;
  }

  /**
   * Return the latest available incident history.
   * Re-query Supabase on each dashboard refresh.
   * If Supabase fails, return the cached incidents.
   */
  async getHistory() {
    try {
      await this.loadHistory(true);
    } catch {
      // Keep the dashboard usable with cached history.
    }

    return this.history.map((incident) => ({
      ...incident,
      triggered_flags: Array.isArray(incident.triggered_flags)
        ? [...incident.triggered_flags]
        : [],
    }));
  }
}

module.exports = new WotmedTelemetry();
