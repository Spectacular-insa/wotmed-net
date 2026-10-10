/**
 * Wotmed-Net Heuristic Payload Inspector
 * Architect: Ayitegeb Tilahun Demisie
 */

class WotmedInspector {
  constructor() {
    this.sqlPatterns = /(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|--|#|;%20OR%20)/i;
    this.xssPatterns = /(<script\b[^<]*(?:(?!<\/script>)<script>[^<]*)*<\/script>|javascript:|onerror\s*=|onload\s*=|alert\s*\()/i;
    this.canaryPattern = /wtd_canary_[a-z0-9]+/i;
 feature/soc-dashboard
    // OWASP A01: Broken Access Control (Path Traversal)
    this.pathTraversalPatterns = /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i;
    // OWASP A10: Server-Side Request Forgery (SSRF) targeting internal IPs
    this.ssrfPatterns = /(localhost|127\.0\.0\.1|169\.254\.169\.254|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)/i;
=======
    
    // Dedicated signatures for automated reconnaissance and scanning tools
    this.scannerSignatures = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /burpsuite/i,
      /dirbuster/i,
      /gobuster/i
    ];
 main
  }

  inspect(requestContext) {
    let hasSqlInjection = false;
    let hasXss = false;
    let hasHeaderAnomaly = false;
    let canaryTokenTriggered = false;
 feature/soc-dashboard
    let hasPathTraversal = false;
    let hasSSRF = false;
=======
    let hasAutomatedScanner = false;
 main

    const targetString = JSON.stringify({
      path: requestContext.path,
      query: requestContext.query,
      body: requestContext.body
    });

 feature/soc-dashboard
    if (this.sqlPatterns.test(targetString)) hasSqlInjection = true;
    if (this.xssPatterns.test(targetString)) hasXss = true;
    if (this.pathTraversalPatterns.test(targetString)) hasPathTraversal = true;
    if (this.ssrfPatterns.test(targetString)) hasSSRF = true;
=======
    // 1. Check Payload Signatures (SQLi & XSS)
    if (this.sqlPatterns.test(targetString)) {
      hasSqlInjection = true;
    }

    if (this.xssPatterns.test(targetString)) {
      hasXss = true;
    }
 main

    // 2. Check Headers & Anomalies
    const headers = requestContext.headers || {};
    const requiredStandardHeaders = ['host', 'user-agent'];
    const missingHeaders = requiredStandardHeaders.filter(h => !headers[h]);
    
    if (missingHeaders.length > 0 || !headers['accept']) {
      hasHeaderAnomaly = true;
    }

    // 3. Check Automated Scanner User-Agents
    const userAgent = headers['user-agent'] || '';
    for (const pattern of this.scannerSignatures) {
      if (pattern.test(userAgent)) {
        hasAutomatedScanner = true;
        break;
      }
    }

    // 4. Check Canary Tokens (Deception Traps)
    if (this.canaryPattern.test(targetString)) {
      canaryTokenTriggered = true;
    }

    return {
      hasSqlInjection,
      hasXss,
      hasHeaderAnomaly,
 feature/soc-dashboard
      canaryTokenTriggered,
      hasPathTraversal,
      hasSSRF
=======
      hasAutomatedScanner,
      canaryTokenTriggered
 main
    };
  }
}

module.exports = WotmedInspector;