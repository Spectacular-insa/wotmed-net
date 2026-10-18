
/**
 * Wotmed-Net Master Active Defense Middleware
 * Architect: Ayitegeb Tilahun Demissie
 */

const WotmedInterceptor = require('../core-engine/interceptor');
const WotmedInspector = require('../core-engine/inspector');
const WotmedEngine = require('../core-engine/engine');
const telemetryInstance = require('../core-engine/telemetry');
const { captureHoneypotEvent } = require('../core-engine/honeypot');

class WotmedDefenseMiddleware {
  constructor() {
    this.interceptor = new WotmedInterceptor();
    this.inspector = new WotmedInspector();
    this.engine = new WotmedEngine();
  }

  handle() {
    return (req, res, next) => {
      this.interceptor.intercept(req, res, async () => {
        try {
          const requestContext = req.wotmedContext;
          const inspectionResult =
            this.inspector.inspect(requestContext);

          const evaluationInput = {
            ...requestContext,
            ...inspectionResult,
          };

          const evaluationResult =
            this.engine.evaluate(evaluationInput);

          // Persist and broadcast the original security incident.
          try {
            const incidentPromise = telemetryInstance.emitIncident({
              requestContext,
              evaluationResult,
            });

            if (incidentPromise?.catch) {
              incidentPromise.catch((error) => {
                console.error(
                  '[Wotmed Telemetry Dispatch Error]:',
                  error.message || error
                );
              });
            }
          } catch (error) {
            console.error(
              '[Wotmed Telemetry Dispatch Error]:',
              error.message || error
            );
          }

          switch (evaluationResult.actionTaken) {
            case 'BLOCK_AND_REDIRECT_HONEYPOT': {
              let honeypotEvent;

              // Capture request metadata only, not sensitive payloads.
              try {
                honeypotEvent = captureHoneypotEvent({
                  requestContext,
                  evaluationResult,
                });
              } catch (error) {
                console.error(
                  '[Wotmed Honeypot Capture Error]:',
                  error.message || error
                );
              }

              // Fail closed if the honeypot capture fails.
              if (!honeypotEvent) {
                return res.status(403).json({
                  error: 'Request blocked by Wotmed-Net',
                  code: 'THREAT_BLOCKED',
                  message:
                    'The request was blocked by the security gateway.',
                  incident_ref: evaluationResult.timestamp || null,
                  monitoring: 'enabled',
                });
              }

              // Preserve the original path and attach the captured session.
              req.wotmedHoneypot = honeypotEvent;
              req.wotmedOriginalUrl = req.originalUrl || req.url;

              // Route internally to the dedicated decoy handler.
              req.url = '/_wotmed/honeypot';
              return next();
            }

            case 'AUTONOMOUS_DYNAMIC_TARPIT': {
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
                message:
                  'Request delayed by the Wotmed-Net security gateway.',
                incident_ref: evaluationResult.timestamp || null,
              });
            }

            case 'MONITOR_AND_LOG_WARNING':
            case 'ALLOW_AND_INJECT_CANARY':
            default:
              return next();
          }
        } catch (error) {
          console.error(
            '[Wotmed Middleware Execution Error]:',
            error
          );

          if (res.headersSent || res.writableEnded) {
            return;
          }

          return next(error);
        }
      });
    };
  }
}

module.exports = new WotmedDefenseMiddleware().handle();
