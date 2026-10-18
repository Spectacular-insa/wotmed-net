/**
 * Wotmed-Net Request Interceptor & Edge Gatekeeper
 * Architect: Ayitegeb Tilahun Demisie
 */

class WotmedInterceptor {
  constructor() {
    // Standard initialization for request boundary wrapping
    this.rateLimits = new Map();
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

    // OWASP A07: Identification and Authentication Failures (Brute Force Protection)
    const now = Date.now();
    let isBruteForce = false;
    
    if (!this.rateLimits.has(clientIp)) {
      this.rateLimits.set(clientIp, { count: 1, windowStart: now });
    } else {
      const record = this.rateLimits.get(clientIp);
      // 60-second window
      if (now - record.windowStart < 60000) {
        record.count++;
        if (record.count > 50) {
          isBruteForce = true; // Over 50 requests per minute from one IP
        }
      } else {
        // Reset window
        record.count = 1;
        record.windowStart = now;
      }
    }

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
      isBruteForce,
      arrivalTime: startTime
    };

    next();
  }
}

module.exports = WotmedInterceptor;