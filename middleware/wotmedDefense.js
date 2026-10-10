
/**
 * Wotmed-Net Master Active Defense Middleware
 * Architect: Ayitegeb Tilahun Demissie
 */

const WotmedInterceptor = require('../core-engine/interceptor');
const WotmedInspector = require('../core-engine/inspector');
const WotmedEngine = require('../core-engine/engine');
const telemetryInstance = require('../core-engine/telemetry');

class WotmedDefenseMiddleware {
  constructor() {
    this.interceptor = new WotmedInterceptor();
    this.inspector = new WotmedInspector();
    this.engine = new WotmedEngine();
  }

  // Returns the configured Express middleware stack.
  handle() {
    return (req, res, next) => {
      this.interceptor.intercept(req, res, async () => {
        try {
          // 1. Retrieve the normalized request context.
          const requestContext = req.wotmedContext;

          // 2. Inspect the request for suspicious patterns and anomalies.
          const inspectionResult = this.inspector.inspect(requestContext);

          // 3. Combine context and inspection findings for threat evaluation.
          const evaluationInput = {
            ...requestContext,
            ...inspectionResult,
          };

          const evaluationResult = this.engine.evaluate(evaluationInput);

          // 4. Record the incident for telemetry and dashboard reporting.
          // Telemetry errors should not turn a blocked request into HTTP 500.
          try {
            telemetryInstance.emitIncident({
              requestContext,
              evaluationResult,
            });
          } catch (telemetryError) {
            console.error(
              '[Wotmed Telemetry Dispatch Error]:',
              telemetryError
            );
          }

          // 5. Enforce the selected countermeasure.
          switch (evaluationResult.actionTaken) {
            case 'BLOCK_AND_REDIRECT_HONEYPOT': {
              // Block the request and do not pass it to the route handler.
              return res.status(403).json({
                error: 'Request blocked by Wotmed-Net',
                code: 'THREAT_BLOCKED',
                message: 'The request was rejected by the security gateway.',
                incident_ref: evaluationResult.timestamp || null,
              });
            }

            case 'AUTONOMOUS_DYNAMIC_TARPIT': {
              // Apply a bounded delay to suspicious requests.
              const tarpitDelay =
                Math.floor(Math.random() * 2000) + 1000;

              await new Promise((resolve) =>
                setTimeout(resolve, tarpitDelay)
              );

              if (res.headersSent || res.writableEnded) {
                return;
              }

              return res.status(429).json({
                status: 'delayed',
                code: 'REQUEST_THROTTLED',
                message: 'Request delayed by the Wotmed-Net security gateway.',
                incident_ref: evaluationResult.timestamp || null,
              });
            }

            case 'MONITOR_AND_LOG_WARNING':
            case 'ALLOW_AND_INJECT_CANARY':
            default: {
              // Allow requests not selected for blocking or throttling.
              return next();
            }
          }
        } catch (err) {
          console.error('[Wotmed Middleware Execution Error]:', err);

          // Do not attempt to send another response if one has already started.
          if (res.headersSent || res.writableEnded) {
            return;
          }

          return next(err);
        }
      });
    };
  }
}

module.exports = new WotmedDefenseMiddleware().handle();
