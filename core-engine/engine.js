/**
 * Wotmed-Net Threat Evaluation Engine
 * Architect: Ayitegeb Tilahun Demisie
 */

class WotmedEngine {
  constructor() {
    // Scoring thresholds defined in architectural contract
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

    // 1. Analyze Heuristic Payload & Tool Anomalies
    if (requestContext.hasSqlInjection) {
      baseScore += 85;
      flags.push('SQL_INJECTION_SIGNATURE');
    }
    if (requestContext.hasXss) {
      baseScore += 75;
      flags.push('XSS_EXECUTION_VECTOR');
    }
    if (requestContext.hasAutomatedScanner) {
      baseScore += 90;
      flags.push('AUTOMATED_SCANNER_SIGNATURE');
    }
    if (requestContext.hasHeaderAnomaly) {
      baseScore += 30;
      flags.push('ABNORMAL_HEADER_ORDER');
    }
    if (requestContext.hasHoneypotPath) {
      baseScore += 60;
      flags.push('HONEYPOT_PATH_ACCESS');
    }

    // 2. Validate JA3/JA4 Cryptographic Session Binding
    if (requestContext.tlsFingerprintMismatch) {
      baseScore += 90;
      flags.push('TLS_SESSION_FINGERPRINT_MISMATCH');
    }

    // 3. Canary Token Violation Check
    if (requestContext.canaryTokenTriggered) {
      baseScore = 100; // Instant maximum hard ban
      flags.push('CANARY_TOKEN_TRAPPED');
    }

    const finalScore = Math.min(baseScore, 100);
    const action = this.determineCountermeasure(finalScore);

    return {
      threatScore: finalScore,
      actionTaken: action,
      triggeredFlags: flags,
      timestamp: new Date().toISOString()
    };
  }

  determineCountermeasure(score) {
    if (score >= this.THRESHOLDS.BLOCK_MIN) {
      return 'BLOCK_AND_REDIRECT_HONEYPOT'; // Score 80-100
    } else if (score > this.THRESHOLDS.WARNING_MAX) {
      return 'AUTONOMOUS_DYNAMIC_TARPIT'; // Score 50-79
    } else if (score > this.THRESHOLDS.CLEAN) {
      return 'MONITOR_AND_LOG_WARNING'; // Score 1-49
    }
    return 'ALLOW_AND_INJECT_CANARY'; // Score 0
  }
}

module.exports = WotmedEngine;