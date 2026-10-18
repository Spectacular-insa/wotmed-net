
/**
 * Wotmed-Net Master Active Defense Middleware
 * Architect: Ayitegeb Tilahun Demissie
 */

const WotmedInterceptor = require('../core-engine/interceptor');
const WotmedInspector = require('../core-engine/inspector');
const WotmedEngine = require('../core-engine/engine');
const telemetryInstance = require('../core-engine/telemetry');
 feature/core-engine
const { captureHoneypotEvent } = require('../core-engine/honeypot');

 main

class WotmedDefenseMiddleware {
  constructor() {
    this.interceptor = new WotmedInterceptor();
    this.inspector = new WotmedInspector();
    this.engine = new WotmedEngine();
  }

 feature/core-engine

  // Returns the configured Express middleware stack.
 main
  handle() {
    return (req, res, next) => {
      this.interceptor.intercept(req, res, async () => {
        try {
          // 1. Retrieve the normalized request context.
          const requestContext = req.wotmedContext;
          const inspectionResult =
            this.inspector.inspect(requestContext);

 feature/core-engine

          // 2. Inspect the request for suspicious patterns and anomalies.
          const inspectionResult = this.inspector.inspect(requestContext);

          // 3. Combine context and inspection findings for threat evaluation.
 main
          const evaluationInput = {
            ...requestContext,
            ...inspectionResult,
          };

 feature/core-engine
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

 main
              if (res.headersSent || res.writableEnded) {
                return;
              }

              return res.status(429).json({
                status: 'delayed',
                code: 'REQUEST_THROTTLED',
 feature/core-engine
                message:
                 'Request delayed by the Wotmed-Net security gateway.',

                message: 'Request delayed by the Wotmed-Net security gateway.',
 main
                incident_ref: evaluationResult.timestamp || null,
              });
            }

            case 'MONITOR_AND_LOG_WARNING':
            case 'ALLOW_AND_INJECT_CANARY':
 feature/core-engine
            default:

            default: {
              // Allow requests not selected for blocking or throttling.
 main
              return next();
            }
          }
 feature/core-engine
        } catch (error) {
          console.error(
            '[Wotmed Middleware Execution Error]:',
            error
          );

        } catch (err) {
          console.error('[Wotmed Middleware Execution Error]:', err);

          // Do not attempt to send another response if one has already started.
main
          if (res.headersSent || res.writableEnded) {
            return;
          }

 feature/core-engine
          return next(error);

          return next(err);
 main
        }
      });
    };
  }
}

module.exports = new WotmedDefenseMiddleware().handle();
