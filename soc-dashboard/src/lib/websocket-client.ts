
import { getAPIClient } from './api-client';
import { ThreatEvent } from '@/store/useSOCStore';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 0;
  private reconnectDelay = 1000;
  private subscribers: Map<string, Function[]> = new Map();
  private isConnected = false;

  connect() {
    // Avoid creating duplicate connections.
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING ||
        this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    const wsURL = getAPIClient().getWebSocketURL();
    let socket: WebSocket;

    try {
      socket = new WebSocket(wsURL);
      this.ws = socket;

      socket.onopen = () => {
        // This socket may have been cancelled during React cleanup.
        if (this.ws !== socket) {
          socket.close();
          return;
        }

        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { status: 'connected' });
      };

      socket.onmessage = (event) => {
        if (this.ws !== socket) return;

        try {
          this.handleMessage(JSON.parse(event.data));
        } catch {
          // Ignore invalid JSON messages.
        }
      };

      socket.onerror = () => {
        if (this.ws !== socket) return;

        this.emit('connection_status', {
          status: 'error',
          error: 'Connection error',
        });
      };

      socket.onclose = () => {
        if (this.ws !== socket) return;

        this.ws = null;
        this.isConnected = false;
        this.emit('connection_status', { status: 'disconnected' });
        this.attemptReconnect();
      };
    } catch {
      this.isConnected = false;
      this.emit('connection_status', {
        status: 'error',
        error: 'Failed to connect',
      });
    }
  }

  disconnect() {
    const socket = this.ws;

    // Invalidate this socket before closing it so stale callbacks are ignored.
    this.ws = null;
    this.isConnected = false;

    if (!socket) return;

    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;

    if (socket.readyState === WebSocket.CONNECTING) {
      // Wait until the connection opens before closing it.
      // This avoids closing a socket while its handshake is in progress.
      socket.onopen = () => {
        socket.onopen = null;
        socket.close();
      };
    } else if (socket.readyState === WebSocket.OPEN) {
      socket.onopen = null;
      socket.close();
    } else {
      socket.onopen = null;
    }

    this.emit('connection_status', { status: 'disconnected' });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;

    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    setTimeout(() => this.connect(), delay);
  }

  private handleMessage(data: any) {
    switch (data.event_type) {
      case 'threat_alert':
        this.emit('threat_alert', this.convertToThreatEvent(data.data));
        break;
      case 'ip_blocked':
        this.emit('ip_blocked', data.data);
        break;
      case 'telemetry_update':
        this.emit('telemetry_update', data.data);
        break;
      case 'connection_status':
        this.emit('connection_status', data.data);
        break;
    }
  }

  public convertToThreatEvent(data: any): ThreatEvent {
    let severity: 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED' = 'INFO';

    if (data.action_taken === 'BLOCK_AND_REDIRECT_HONEYPOT') {
      severity = 'BLOCKED';
    } else if (data.action_taken === 'AUTONOMOUS_DYNAMIC_TARPIT') {
      severity = 'TARPIT';
    } else if (data.threat_score >= 80) {
      severity = 'CRITICAL';
    }

    const threatType =
      data.triggered_flags && data.triggered_flags.length > 0
        ? data.triggered_flags.join(', ')
        : 'ANOMALOUS_TRAFFIC';

    return {
      id: data.incident_id || `threat-${Date.now()}`,
      ip: data.client_ip || 'Unknown IP',
      threatType,
      tlsFingerprint: data.tls_fingerprint || 'N/A',
      scoreDelta: data.threat_score || 0,
      location: {
        country: 'Local/Unknown',
        city: '',
        lat: 0,
        lng: 0,
      },
      timestamp: new Date(data.created_at || Date.now()),
      severity,
    };
  }

  on(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    this.subscribers.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.subscribers.get(event);

    if (callbacks) {
      const index = callbacks.indexOf(callback);

      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.subscribers.get(event);

    if (callbacks) {
      [...callbacks].forEach((callback) => callback(data));
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

let webSocketClientInstance: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!webSocketClientInstance) {
    webSocketClientInstance = new WebSocketClient();
  }

  return webSocketClientInstance;
}
