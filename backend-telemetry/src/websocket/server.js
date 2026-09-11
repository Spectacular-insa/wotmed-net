import { WebSocketServer } from 'ws';
import { pubsub } from '../services/pubsub.js';

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/soc-stream' });

  wss.on('connection', (ws) => {
    const dispatch = (alert) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'THREAT_DISPATCH', data: alert }));
      }
    };

    pubsub.on('threat:alert', dispatch);
    ws.on('close', () => pubsub.off('threat:alert', dispatch));
  });
}