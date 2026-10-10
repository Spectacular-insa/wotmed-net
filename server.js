
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
