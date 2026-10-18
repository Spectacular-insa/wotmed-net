import { bufferEvent } from '../services/ingestionBuffer.js';

export function ingestTelemetry(req, res) {
  const { source_service, rule_id, threat_level, client_ip, request_path, http_method } = req.body;

  if (!rule_id || !threat_level || !client_ip) {
    return res.status(400).json({ error: 'Missing critical telemetry fields' });
  }

  bufferEvent({
    source_service: source_service || 'unknown',
    rule_id,
    threat_level,
    client_ip,
    request_path: request_path || '/',
    http_method: http_method || 'GET',
    violation_metadata: req.body.violation_metadata || {}
  });

  return res.status(202).json({ status: 'queued' });
}