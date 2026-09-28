/**
 * Wotmed-Net Heuristic Payload Inspector
 * Architect: Ayitegeb Tilahun Demisie
 */

class WotmedInspector {
  constructor() {
    this.sqlPatterns = /(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|--|#|;%20OR%20)/i;
    this.xssPatterns = /(<script\b[^<]*(?:(?!<\/script>)<script>[^<]*)*<\/script>|javascript:|onerror\s*=|onload\s*=|alert\s*\()/i;
    this.canaryPattern = /wtd_canary_[a-z0-9]+/i;
    // OWASP A01: Broken Access Control (Path Traversal)
    this.pathTraversalPatterns = /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i;
    // OWASP A10: Server-Side Request Forgery (SSRF) targeting internal IPs
    this.ssrfPatterns = /(localhost|127\.0\.0\.1|169\.254\.169\.254|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)/i;
  }

  inspect(requestContext) {
    let hasSqlInjection = false;
    let hasXss = false;
    let hasHeaderAnomaly = false;
    let canaryTokenTriggered = false;
    let hasPathTraversal = false;
    let hasSSRF = false;

    const targetString = JSON.stringify({
      path: requestContext.path,
      query: requestContext.query,
      body: requestContext.body
    });

    if (this.sqlPatterns.test(targetString)) hasSqlInjection = true;
    if (this.xssPatterns.test(targetString)) hasXss = true;
    if (this.pathTraversalPatterns.test(targetString)) hasPathTraversal = true;
    if (this.ssrfPatterns.test(targetString)) hasSSRF = true;

    const headers = requestContext.headers;
    const requiredStandardHeaders = ['host', 'user-agent'];
    const missingHeaders = requiredStandardHeaders.filter(h => !headers[h]);
    
    if (missingHeaders.length > 0 || !headers['accept']) {
      hasHeaderAnomaly = true;
    }

    if (this.canaryPattern.test(targetString)) {
      canaryTokenTriggered = true;
    }

    return {
      hasSqlInjection,
      hasXss,
      hasHeaderAnomaly,
      canaryTokenTriggered,
      hasPathTraversal,
      hasSSRF
    };
  }
}

module.exports = WotmedInspector;