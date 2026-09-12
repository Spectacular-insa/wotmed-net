/**
 * Wotmed-Net Master Active Defense Middleware
 * Architect: Ayitegeb Tilahun Demisie
 */

const WotmedInterceptor = require('../core-engine/interceptor');
const WotmedInspector = require('../core-engine/inspector');
const WotmedEngine = require('../core-engine/engine');
const WotmedTelemetry = require('../core-engine/telemetry');

class WotmedDefenseMiddleware {
  constructor() {
    this.interceptor = new WotmedInterceptor();
    this.inspector = new WotmedInspector();
    this.engine = new WotmedEngine();
    this.telemetry = new WotmedTelemetry();
  }

  // Returns the configured Express middleware stack
  handle() {
    return async (req, res, next) => {
      // 1. Intercept and normalize request context
      this.interceptor.intercept(req, res, async () => {
        try {
          const requestContext = req.wotmedContext;

          // 2. Perform heuristic payload and anomaly inspection
          const inspectionResult = this.inspector.inspect(requestContext);

          // Merge inspection results into context for engine evaluation
          const evaluationInput = {
            ...requestContext,
            ...inspectionResult
          };

          // 3. Evaluate threat score and select countermeasure
          const evaluationResult = this.engine.evaluate(evaluationInput);

          // 4. Dispatch asynchronous telemetry event
          this.telemetry.emit({
            requestContext,
            evaluationResult
          });

          // 5. Enforce Countermeasures based on Evaluated Action
          switch (evaluationResult.actionTaken) {
            case 'BLOCK_AND_REDIRECT_HONEYPOT':
              // High risk: Return deceptive honeypot payload and terminate execution
              return res.status(500).json({
                error: 'Database transaction execution fault',
                driver: 'PostgreSQL 14.2 Kernel Panic',
                query_trace: 'ERR_SYNTAX_VIOLATION_AT_EDGE_NODE',
                incident_ref: evaluationResult.timestamp
              });

            case 'AUTONOMOUS_DYNAMIC_TARPIT':
              // Moderate risk: Scale response latency continuously to drain attacker resources
              const tarpitDelay = Math.floor(Math.random() * 2000) + 1000; // 1s to 3s delay
              await new Promise(resolve => setTimeout(resolve, tarpitDelay));
              return res.status(200).json({
                status: 'degraded',
                message: 'Processing queue bottlenecked. Retrying operation...',
                gateway: 'Wotmed-Net-Tarpit-Node'
              });

            case 'MONITOR_AND_LOG_WARNING':
            case 'ALLOW_AND_INJECT_CANARY':
            default:
              // Safe or low risk: Pass request forward to normal application controllers
              return next();
          }
        } catch (err) {
          console.error('[Wotmed Middleware Execution Error]:', err);
          return next();
        }
      });
    };
  }
}

module.exports = new WotmedDefenseMiddleware().handle();