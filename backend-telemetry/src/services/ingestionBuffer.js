import { pool } from '../config/db.js';
import { pubsub } from './pubsub.js';

let buffer = [];
const FLUSH_INTERVAL_MS = 100;
const BATCH_SIZE = 500;

export function bufferEvent(event) {
  buffer.push(event);

  // Dispatch immediately if high severity
  if (event.threat_level === 'HIGH' || event.threat_level === 'CRITICAL') {
    pubsub.emit('threat:alert', event);
  }

  if (buffer.length >= BATCH_SIZE) {
    flushBuffer();
  }
}

async function flushBuffer() {
  if (buffer.length === 0) return;

  const toInsert = [...buffer];
  buffer = [];

  const values = [];
  const placeholders = toInsert.map((e, idx) => {
    const base = idx * 7;
    values.push(
      e.source_service,
      e.rule_id,
      e.threat_level,
      e.client_ip,
      e.request_path,
      e.http_method,
      JSON.stringify(e.violation_metadata || {})
    );
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
  }).join(', ');

  const query = `
    INSERT INTO telemetry_events 
    (source_service, rule_id, threat_level, client_ip, request_path, http_method, violation_metadata)
    VALUES ${placeholders}
  `;

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error('--- BATCH WRITE ERROR DETAILS ---');
    console.error('Code:', err.code);
    console.error('Detail:', err.detail);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('---------------------------------');
  }
}

setInterval(flushBuffer, FLUSH_INTERVAL_MS);