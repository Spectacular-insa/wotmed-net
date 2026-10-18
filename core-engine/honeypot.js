
const { randomUUID } = require('crypto');
const telemetryInstance = require('./telemetry');

const MAX_EVENTS = 200;
const events = [];

function captureHoneypotEvent({
  requestContext = {},
  evaluationResult = {},
} = {}) {
  const score = Number(evaluationResult.threatScore);

  const event = {
    session_id: `hp_${randomUUID()}`,
    timestamp: new Date().toISOString(),
    method: String(requestContext.method || 'UNKNOWN'),
    path: String(requestContext.path || '/').slice(0, 500),
    client_ip: String(requestContext.clientIp || 'UNKNOWN'),
    threat_score: Number.isFinite(score)
      ? Math.max(0, Math.min(100, Math.round(score)))
      : 0,
    flags: Array.isArray(evaluationResult.triggeredFlags)
      ? evaluationResult.triggeredFlags.map(String).slice(0, 30)
      : [],
    status: 'captured',
  };

  // Keep a bounded in-memory record for immediate local access.
  // Do not store request bodies, credentials, cookies, or authorization headers.
  events.unshift(event);

  if (events.length > MAX_EVENTS) {
    events.length = MAX_EVENTS;
  }

  console.warn('[Wotmed Honeypot] Event captured', event);

  // Persist asynchronously without delaying the honeypot response.
  telemetryInstance.saveHoneypotSession(event).catch((error) => {
    console.error(
      '[Wotmed Honeypot Persistence Error]:',
      error instanceof Error ? error.message : String(error)
    );
  });

  return {
    ...event,
    flags: [...event.flags],
  };
}

function getHoneypotEvents() {
  return events.map((event) => ({
    ...event,
    flags: [...event.flags],
  }));
}

module.exports = {
  captureHoneypotEvent,
  getHoneypotEvents,
};
