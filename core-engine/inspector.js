/**
 * Wotmed-Net Heuristic Payload Inspector
 * Architect: Ayitegeb Tilahun Demisie
 */

class WotmedInspector {
  constructor() {
    this.sqlPatterns = /(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|--|#|;%20OR%20)/i;
    this.xssPatterns = /(<script\b[^<]*(?:(?!<\/script>)<script>[^<]*)*<\/script>|javascript:|onerror\s*=|onload\s*=|alert\s*\()/i;
    this.canaryPattern = /wtd_canary_[a-z0-9]+/i;
    
    // Dedicated signatures for automated reconnaissance and scanning tools
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
    let hasSqlInjection = false;
    let hasXss = false;
    let hasHeaderAnomaly = false;
    let canaryTokenTriggered = false;
    let hasAutomatedScanner = false;
    let hasHoneypotPath = false;

    const targetString = JSON.stringify({
      path: requestContext.path,
      query: requestContext.query,
      body: requestContext.body
    });

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

    if (this.xssPatterns.test(targetString)) {
      hasXss = true;
    }

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
      hasAutomatedScanner,
      canaryTokenTriggered,
      hasHoneypotPath
    };
  }
}

module.exports = WotmedInspector;