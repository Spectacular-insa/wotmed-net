/**
 * Wotmed-Net Request Interceptor & Edge Gatekeeper
 * Architect: Ayitegeb Tilahun Demisie
 */

class WotmedInterceptor {
  constructor() {
    // Standard initialization for request boundary wrapping
  }

  intercept(req, res, next) {
    const startTime = process.hrtime();

    // 1. Extract Raw Headers, IP, Query Parameters, and Body
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || 'UNKNOWN';
    const path = req.originalUrl || req.url;
    const method = req.method;
    const query = req.query;
    const body = req.body;
    const headers = req.headers;

    // 2. Capture Immutable TLS / JA3 Handshake Fingerprint (simulated via header heuristics or socket properties)
    const tlsFingerprint = req.socket.getPeerCertificate ? 
      (req.socket.getPeerCertificate().fingerprint || 'NON_TLS_SOCKET') : 
      (headers['sec-ch-ua'] ? 'MODERN_BROWSER_TLS' : 'AUTOMATED_CLIENT_TLS');

    // 3. Wrap Response to Intercept Outgoing Data (for Canary Token Injection)
    const originalJson = res.json;
    res.json = function (data) {
      // Inject cryptographic canary tokens into clean outgoing payloads
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (typeof data === 'object' && data !== null) {
          data._wotmed_canary = `wtd_canary_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
        }
      }
      return originalJson.call(this, data);
    };

    // Attach contextual metadata to request object for downstream inspection and engine execution
    req.wotmedContext = {
      clientIp,
      userAgent,
      path,
      method,
      query,
      body,
      headers,
      tlsFingerprint,
      arrivalTime: startTime
    };

    next();
  }
}

module.exports = WotmedInterceptor;