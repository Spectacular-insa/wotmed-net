import http from 'http';
import dotenv from 'dotenv';
import { app } from './app.js';
import { setupWebSocket } from './websocket/server.js';

dotenv.config();

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`backend-telemetry online at port ${PORT}`);
});