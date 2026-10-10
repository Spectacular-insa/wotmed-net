
/**
 * Wotmed-Net Telemetry & Asynchronous Dispatcher
 * Architect: Ayitegeb Tilahun Demissie
 *
 * Features:
 * - Persistent incident storage in Supabase
 * - Historical incident loading after server restarts
 * - Real-time incident events
 * - Bounded in-memory history cache
 * - Deduplication by incident_id
 */

const { createClient } = require('@supabase/supabase-js');
const EventEmitter = require('events');
const { randomUUID } = require('crypto');

const MAX_HISTORY = 100;
const TABLE_NAME = 'wotmed_incidents';

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

    // Begin restoring previously saved incidents at startup.
    // The API endpoint will also await this operation when necessary.
    this.loadHistory().catch(() => {
      // The underlying method logs the error.
      // A later history request can retry the load.
    });
  }

  /**
   * Merge records by stable incident ID, newest first.
   * Existing live incidents are preserved if a history query
   * finishes after new incidents have already arrived.
   */
  mergeHistory(records = []) {
    const unique = new Map();

    for (const record of [...this.history, ...records]) {
      if (!record || !record.incident_id) {
        continue;
      }

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
   * Restore saved incidents from Supabase.
   * Concurrent requests share one history-loading operation.
   */
  async loadHistory() {
    if (this.historyLoaded) {
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
        `[Wotmed Telemetry]: Restored ${this.history.length} historical incidents from Supabase.`
      );
    })();

    try {
      await this.historyLoadPromise;
    } finally {
      this.historyLoadPromise = null;
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

    const payload = {
      incident_id: `inc_${randomUUID()}`,
      client_ip: String(
        requestContext.clientIp || '127.0.0.1'
      ),
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
      created_at: createdAt
    };

    // Update local history immediately.
    this.mergeHistory([payload]);

    // Broadcast the same incident ID used by the database.
    this.emit('incident', payload);

    // Persist to Supabase when configured.
    if (!this.supabase) {
      console.log(
        '[Wotmed SOC Telemetry Stream - Local Only]:',
        JSON.stringify(payload, null, 2)
      );

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
          `[Wotmed Telemetry]: Incident ${payload.incident_id} saved to Supabase.`
        );
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
   * Return recent incidents, restoring them from Supabase first.
   * Callers must await this method.
   */
  async getHistory() {
    try {
      await this.loadHistory();
    } catch {
      // Return any available in-memory incidents if Supabase
      // cannot be reached. loadHistory() already logged the error.
    }

    return this.history.map((incident) => ({
      ...incident,
      triggered_flags: Array.isArray(incident.triggered_flags)
        ? [...incident.triggered_flags]
        : []
    }));
  }
}

module.exports = new WotmedTelemetry();
