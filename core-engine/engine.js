
/**
 * Wotmed-Net Threat Evaluation Engine
 * Architect: Ayitegeb Tilahun Demissie
 */

class WotmedEngine {
  constructor() {
    this.THRESHOLDS = {
      CLEAN: 0,
      WARNING_MAX: 49,
      TARPIT_MAX: 79,
      BLOCK_MIN: 80
    };
  }

  evaluate(requestContext) {
    let baseScore = 0;
    const flags = [];

    if (requestContext.hasSqlInjection) {
      baseScore += 85;
      flags.push('SQL_INJECTION_SIGNATURE');
    }

    if (requestContext.hasXss) {
      baseScore += 75;
      flags.push('XSS_EXECUTION_VECTOR');
    }

    if (requestContext.hasPathTraversal) {
      baseScore += 85;
      flags.push('PATH_TRAVERSAL_ATTEMPT');
    }

    if (requestContext.hasSSRF) {
      baseScore += 80;
      flags.push('SSRF_ATTEMPT');
    }

    if (requestContext.hasAutomatedScanner) {
      baseScore += 90;
      flags.push('AUTOMATED_SCANNER_SIGNATURE');
    }

    if (requestContext.hasHeaderAnomaly) {
      baseScore += 30;
      flags.push('ABNORMAL_HEADER_ORDER');
    }

    if (requestContext.tlsFingerprintMismatch) {
      baseScore += 90;
      flags.push('TLS_SESSION_FINGERPRINT_MISMATCH');
    }

    if (requestContext.isBruteForce) {
      baseScore += 70;
      flags.push('BRUTE_FORCE_ATTACK');
    }

    if (requestContext.canaryTokenTriggered) {
      baseScore = 100;
      flags.push('CANARY_TOKEN_TRAPPED');
    }

    const finalScore = Math.min(baseScore, 100);

    return {
      threatScore: finalScore,
      actionTaken: this.determineCountermeasure(finalScore),
      triggeredFlags: flags,
      timestamp: new Date().toISOString()
    };
  }

  determineCountermeasure(score) {
    if (score >= this.THRESHOLDS.BLOCK_MIN) {
      return 'BLOCK_AND_REDIRECT_HONEYPOT';
    }

    if (score > this.THRESHOLDS.WARNING_MAX) {
      return 'AUTONOMOUS_DYNAMIC_TARPIT';
    }

    if (score > this.THRESHOLDS.CLEAN) {
      return 'MONITOR_AND_LOG_WARNING';
    }

    return 'ALLOW_AND_INJECT_CANARY';
  }
}

module.exports = WotmedEngine;
