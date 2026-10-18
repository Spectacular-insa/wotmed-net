
/**
 * Wotmed-Net Heuristic Payload Inspector
 * Architect: Ayitegeb Tilahun Demissie
 */

class WotmedInspector {
  constructor() {
    this.sqlPatterns =
      /(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|--|#|;%20OR%20)/i;

    this.xssPatterns =
      /(<script\b[^<]*(?:(?!<\/script>)<script>[^<]*)*<\/script>|javascript:|onerror\s*=|onload\s*=|alert\s*\()/i;

    this.canaryPattern = /wtd_canary_[a-z0-9]+/i;

    this.pathTraversalPatterns =
      /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i;

    this.ssrfPatterns =
      /(localhost|127\.0\.0\.1|169\.254\.169\.254|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)/i;

    this.scannerSignatures = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /burpsuite/i,
      /dirbuster/i,
      /gobuster/i
    ];
  }

  inspect(requestContext) {
 feature/core-engine
    let hasSqlInjection = false;
    let hasXss = false;
    let hasHeaderAnomaly = false;
    let canaryTokenTriggered = false;
    let hasAutomatedScanner = false;
    let hasHoneypotPath = false;

=======
 main
    const targetString = JSON.stringify({
      path: requestContext.path,
      query: requestContext.query,
      body: requestContext.body
    });

 feature/core-engine
    // Check for honeypot/decoy paths
    const honeypotPaths = [
      '/.env',
      '/.git',
      '/wp-login.php',
      '/phpmyadmin',
      '/pma',
      '/admin',
      '/administrator',
      '/config.php',
      '/.git/config',
      '/database.sql',
      '/backup.sql'
    ];
    
    const normalizedPath = (requestContext.path || '').toLowerCase();
    if (honeypotPaths.some(path => normalizedPath.includes(path.toLowerCase()))) {
      hasHoneypotPath = true;
    }

    // 1. Check Payload Signatures (SQLi & XSS)
    if (this.sqlPatterns.test(targetString)) {
      hasSqlInjection = true;
    }

    const headers = requestContext.headers || {};
    const userAgent = headers['user-agent'] || '';
 main

    const hasSqlInjection = this.sqlPatterns.test(targetString);
    const hasXss = this.xssPatterns.test(targetString);
    const hasPathTraversal =
      this.pathTraversalPatterns.test(targetString);
    const hasSSRF = this.ssrfPatterns.test(targetString);

    const hasAutomatedScanner =
      this.scannerSignatures.some(pattern => pattern.test(userAgent));

    const hasHeaderAnomaly =
      !headers['host'] ||
      !headers['user-agent'] ||
      !headers['accept'];

    const canaryTokenTriggered =
      this.canaryPattern.test(targetString);

    return {
      hasSqlInjection,
      hasXss,
      hasHeaderAnomaly,
      hasPathTraversal,
      hasSSRF,
      hasAutomatedScanner,
      canaryTokenTriggered,
      hasHoneypotPath
    };
  }
}

module.exports = WotmedInspector;
