import { sqliPatterns } from '../rules/sqli.js';
import { xssPatterns } from '../rules/xss.js';
import { reportThreat } from '../services/telemetryClient.js';

const ruleset = [...sqliPatterns, ...xssPatterns];

export function securityInspector(req, res, next) {
  // ሊጠቁ የሚችሉ ክፍሎችን ወደ ጽሁፍ መቀየር
  const payloadToAnalyze = JSON.stringify({
    url: req.originalUrl || req.url,
    query: req.query,
    body: req.body,
    headers: req.headers
  });

  for (const rule of ruleset) {
    const match = payloadToAnalyze.match(rule.pattern);

    if (match) {
      const threatPayload = {
        source_service: 'core-engine',
        rule_id: rule.id,
        threat_level: rule.severity,
        client_ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
        request_path: req.originalUrl || req.url,
        http_method: req.method,
        violation_metadata: {
          description: rule.description,
          matched_string: match[0]
        }
      };

      // ወደ backend-telemetry በቅጽበት ይልካል
      reportThreat(threatPayload);

      // ጥቃቱን አግዶ ለተጠቃሚው 403 መመለስ
      return res.status(403).json({
        status: 'blocked',
        error: 'Security Policy Violation Detected',
        rule: rule.id
      });
    }
  }

  // ምንም ጥቃት ካልተገኘ ጥያቄው ያልፋል
  next();
}