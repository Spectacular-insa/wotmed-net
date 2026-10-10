 feature/soc-dashboard
const express = require('express');
const { WebSocketServer } = require('ws');
const wotmedDefense = require('./middleware/wotmedDefense');
const telemetryInstance = require('./core-engine/telemetry');

const app = express();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount Wotmed-Net Active Defense Middleware globally
app.use(wotmedDefense);

// Normal Public Route (Safe traffic passes through)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Wotmed-Net Protected Application Gateway',
    status: 'operational'
  });
});

// Telemetry History Endpoint for SOC Dashboard
app.get('/api/v1/telemetry/logs', (req, res) => {
  // Allow CORS for the dashboard
  res.header("Access-Control-Allow-Origin", "*");
  res.json(telemetryInstance.getHistory());
});

// Mock Vulnerable Endpoint for Testing Attacks
app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user_role: 'standard'
  });
});

app.listen(PORT, () => {
  console.log(`[Wotmed-Net Edge Gateway]: Running on port ${PORT}`);
});

// WebSocket Server for SOC Dashboard
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('[WebSocket] SOC Dashboard client connected');
  
  // Broadcast incident to this specific client when it happens
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
    console.log('[WebSocket] SOC Dashboard client disconnected');
    telemetryInstance.off('incident', onIncident);
  });
});

console.log(`[Wotmed-Net Telemetry Stream]: WebSocket Server running on port ${WS_PORT}`);
=======
require('dotenv').config(); // <--- Loads your .env file variables automatically!
const express = require('express');
const wotmedDefense = require('./middleware/wotmedDefense');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount Wotmed-Net Active Defense Middleware globally
app.use(wotmedDefense);

// Normal Public Route (Safe traffic passes through)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Wotmed-Net Protected Application Gateway',
    status: 'operational'
  });
});

// Mock Vulnerable Endpoint for Testing Attacks
app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user_role: 'standard'
  });
});

app.listen(PORT, () => {
  console.log(`[Wotmed-Net Edge Gateway]: Running on port ${PORT}`);
});
 main
