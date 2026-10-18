import { db } from "../config/db.js";
import { pubsub } from "./pubsub.js";

let buffer = [];
const FLUSH_INTERVAL_MS = 100;
const BATCH_SIZE = 500;

const insertEvent = db.prepare(`
  INSERT INTO telemetry_events (
    source_service,
    rule_id,
    threat_level,
    client_ip,
    request_path,
    http_method,
    violation_metadata
  ) VALUES (
    @source_service,
    @rule_id,
    @threat_level,
    @client_ip,
    @request_path,
    @http_method,
    @violation_metadata
  )
`);

const insertBatch = db.transaction((events) => {
  for (const event of events) {
    insertEvent.run({
      source_service: event.source_service || "unknown",
      rule_id: event.rule_id,
      threat_level: event.threat_level,
      client_ip: event.client_ip,
      request_path: event.request_path || "/",
      http_method: event.http_method || "GET",
      violation_metadata: JSON.stringify(event.violation_metadata || {}),
    });
  }
});

export function bufferEvent(event) {
  buffer.push(event);

  if (event.threat_level === "HIGH" || event.threat_level === "CRITICAL") {
    pubsub.emit("threat:alert", event);
  }

  if (buffer.length >= BATCH_SIZE) {
    flushBuffer();
  }
}

function flushBuffer() {
  if (buffer.length === 0) return;

  const events = buffer;
  buffer = [];

  try {
    insertBatch(events);
  } catch (error) {
    console.error("SQLite batch write failed:", error.message);
    buffer = events.concat(buffer);
  }
}

setInterval(flushBuffer, FLUSH_INTERVAL_MS);
