/**
 * Wotmed-Net Request Interceptor & Edge Gatekeeper
 * Architect: Ayitegeb Tilahun Demisie
 */

class WotmedInterceptor {
  constructor() {
    // Standard initialization for request boundary wrapping
  }

  extractClientIp(req) {
    // Default to socket remote address (source of truth for direct connections)
    let ip = req.socket.remoteAddress;

    // If behind a trusted proxy, parse X-Forwarded-For
    // Only trust if TRUSTED_PROXY_CIDRS is configured
    const trustedProxies = process.env.TRUSTED_PROXY_CIDRS;
    if (trustedProxies && req.headers['x-forwarded-for']) {
      const forwardedFor = req.headers['x-forwarded-for'];
      // X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2
      // The leftmost is the original client
      const ips = forwardedFor.split(',').map(s => s.trim());
      if (ips.length > 0) {
        ip = ips[0];
      }
    }

    // Normalize IPv4-mapped IPv6 addresses (::ffff:x.x.x.x -> x.x.x.x)
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    // Handle undefined/null
    if (!ip) {
      ip = '127.0.0.1';
    }

    return ip;
  }

  intercept(req, res, next) {
    const startTime = process.hrtime();

    // 1. Extract Raw Headers, IP, Query Parameters, and Body
    const clientIp = this.extractClientIp(req);
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