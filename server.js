 feature/core-engine

require('dotenv').config();

const express = require('express');
const { WebSocketServer } = require('ws');
const wotmedDefense = require('./middleware/wotmedDefense');
const telemetryInstance = require('./core-engine/telemetry');

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const WS_PORT = Number(process.env.WS_PORT) || 3001;

app.use(express.json());

// SOC dashboard: retrieve historical telemetry.
// IMPORTANT: Register before wotmedDefense so polling requests do not
// create new incidents simply by requesting the incident history.
app.get('/api/v1/telemetry/logs', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const history = await telemetryInstance.getHistory();
    return res.json(history);
  } catch (error) {
    console.error(
      '[Wotmed API] Failed to retrieve telemetry history:',
      error instanceof Error ? error.message : String(error)
    );

    return res.status(500).json({
      error: 'Failed to retrieve telemetry history'
    });
  }
});

// Wotmed-Net security middleware protects all subsequent application routes.
app.use(wotmedDefense);

// Dedicated honeypot handler.
// Internally routed threats carry req.wotmedHoneypot metadata.
app.all('/_wotmed/honeypot', (req, res) => {
  const event = req.wotmedHoneypot;
  const timestamp = new Date().toISOString();

  console.warn('[Wotmed Honeypot] Routed request', {
    session_id: event?.session_id || null,
    original_path:
      event?.path || req.wotmedOriginalUrl || 'direct visit',
    method: event?.method || req.method,
    client_ip: event?.client_ip || req.ip,
    threat_score: event?.threat_score ?? null,
    flags: event?.flags || [],
    timestamp
  });

  return res.status(200).json({
    status: 'monitored',
    message: 'Request captured by the Wotmed-Net honeypot.',
    session_id: event?.session_id || null,
    timestamp
  });
});

// Protected application gateway.
app.get('/', (req, res) => {
  return res.json({
    message: 'Welcome to Wotmed-Net Protected Application Gateway',
    status: 'operational'
  });
});

// Mock endpoint for security testing.
app.post('/api/v1/auth/login', (req, res) => {
  return res.json({
    success: true,
    message: 'Authentication successful',
    user_role: 'standard'
  });
});

// Handle unmatched routes.
app.use((req, res) => {
  return res.status(404).json({
    error: 'Route not found'
  });
});

// Express error handler.
app.use((error, req, res, next) => {
  console.error('[Wotmed-Net HTTP Error]:', error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: 'Internal server error'
  });
});

// Start the HTTP gateway.
const httpServer = app.listen(PORT, () => {
  console.log(
    `[Wotmed-Net Edge Gateway]: Running on port ${PORT}`
  );
});

// WebSocket stream for live telemetry.
const wss = new WebSocketServer({
  port: WS_PORT
});

wss.on('connection', (ws) => {
  console.log('[WebSocket] SOC Dashboard client connected');

  const onIncident = (payload) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        event_type: 'threat_alert',
        data: payload
      }));
    }
  };

  telemetryInstance.on('incident', onIncident);

  ws.on('close', () => {
    telemetryInstance.off('incident', onIncident);
    console.log('[WebSocket] SOC Dashboard client disconnected');
  });

  ws.on('error', (error) => {
    console.error(
      '[WebSocket] Client connection error:',
      error.message
    );
  });
});

wss.on('error', (error) => {
  console.error(
    '[Wotmed WebSocket Server Error]:',
    error.message
  );
});

console.log(
  `[Wotmed-Net Telemetry Stream]: WebSocket Server running on port ${WS_PORT}`
);

// Graceful shutdown.
function shutdown() {
  console.log('[Wotmed-Net] Shutting down servers...');

  wss.close();

  httpServer.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


require('dotenv').config();

const express = require('express');
const { WebSocketServer } = require('ws');
const wotmedDefense = require('./middleware/wotmedDefense');
const telemetryInstance = require('./core-engine/telemetry');

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const WS_PORT = Number(process.env.WS_PORT) || 3001;

app.use(express.json());

// Keep the existing Wotmed-Net security middleware active.
app.use(wotmedDefense);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Wotmed-Net Protected Application Gateway',
    status: 'operational'
  });
});

// SOC dashboard: retrieve historical telemetry.
app.get('/api/v1/telemetry/logs', async (req, res) => {
  // Preserve the existing cross-origin access for the dashboard.
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const history = await telemetryInstance.getHistory();
    res.json(history);
  } catch (error) {
    console.error(
      '[Wotmed API] Failed to retrieve telemetry history:',
      error instanceof Error ? error.message : String(error)
    );

    res.status(500).json({
      error: 'Failed to retrieve telemetry history'
    });
  }
});

// Mock endpoint for security testing.
app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user_role: 'standard'
  });
});

// Start the HTTP gateway.
app.listen(PORT, () => {
  console.log(
    `[Wotmed-Net Edge Gateway]: Running on port ${PORT}`
  );
});

// WebSocket stream for live telemetry.
const wss = new WebSocketServer({
  port: WS_PORT
});

wss.on('connection', (ws) => {
  console.log(
    '[WebSocket] SOC Dashboard client connected'
  );

  const onIncident = (payload) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        event_type: 'threat_alert',
        data: payload
      }));
    }
  };

  telemetryInstance.on('incident', onIncident);

  ws.on('close', () => {
    telemetryInstance.off('incident', onIncident);

    console.log(
      '[WebSocket] SOC Dashboard client disconnected'
    );
  });

  ws.on('error', (error) => {
    console.error(
      '[WebSocket] Client connection error:',
      error.message
    );
  });
});

wss.on('error', (error) => {
  console.error(
    '[Wotmed WebSocket Server Error]:',
    error.message
  );
});

console.log(
  `[Wotmed-Net Telemetry Stream]: WebSocket Server running on port ${WS_PORT}`
);
 main