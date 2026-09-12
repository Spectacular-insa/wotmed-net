/**
 * Wotmed-Net Heuristic Payload Inspector
 * Architect: Ayitegeb Tilahun Demisie
 */

class WotmedInspector {
  constructor() {
    this.sqlPatterns = /(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|--|#|;%20OR%20)/i;
    this.xssPatterns = /(<script\b[^<]*(?:(?!<\/script>)<script>[^<]*)*<\/script>|javascript:|onerror\s*=|onload\s*=|alert\s*\()/i;
    this.canaryPattern = /wtd_canary_[a-z0-9]+/i;
  }

  inspect(requestContext) {
    let hasSqlInjection = false;
    let hasXss = false;
    let hasHeaderAnomaly = false;
    let canaryTokenTriggered = false;

    const targetString = JSON.stringify({
      path: requestContext.path,
      query: requestContext.query,
      body: requestContext.body
    });

    if (this.sqlPatterns.test(targetString)) {
      hasSqlInjection = true;
    }

    if (this.xssPatterns.test(targetString)) {
      hasXss = true;
    }

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
      canaryTokenTriggered
    };
  }
}

module.exports = WotmedInspector;