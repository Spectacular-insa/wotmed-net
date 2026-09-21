import { getAPIClient } from './api-client';
import { ThreatEvent } from '@/store/useSOCStore';

// Real WebSocket client for Wotmed-Net backend integration
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 0;
  private reconnectDelay = 1000;
  private subscribers: Map<string, Function[]> = new Map();
  private isConnected = false;

  connect() {
    const wsURL = getAPIClient().getWebSocketURL();

    try {
      this.ws = new WebSocket(wsURL);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          // Silently handle parse errors
        }
      };

      this.ws.onerror = (error) => {
        this.emit('connection_status', { status: 'error', error: 'Connection error' });
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('connection_status', { status: 'disconnected' });
        this.attemptReconnect();
      };
    } catch (error) {
      this.emit('connection_status', { status: 'error', error: 'Failed to connect' });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 30000);

    setTimeout(() => {
      this.connect();
    }, delay);
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

  private convertToThreatEvent(data: any): ThreatEvent {
    // Map action_taken to our frontend severity badges
    let severity: 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED' = 'INFO';
    if (data.action_taken === 'BLOCK_AND_REDIRECT_HONEYPOT') severity = 'BLOCKED';
    else if (data.action_taken === 'AUTONOMOUS_DYNAMIC_TARPIT') severity = 'TARPIT';
    else if (data.threat_score >= 80) severity = 'CRITICAL';
    
    // Extract the primary threat type from the flags array
    const threatType = (data.triggered_flags && data.triggered_flags.length > 0) 
      ? data.triggered_flags.join(', ') 
      : 'ANOMALOUS_TRAFFIC';

    return {
      id: data.incident_id || `threat-${Date.now()}`,
      ip: data.client_ip || 'Unknown IP',
      threatType: threatType,
      payloadHash: data.tls_fingerprint || 'N/A', // Using TLS fingerprint as a stand-in for payload hash
      scoreDelta: data.threat_score || 0,
      location: {
        country: 'Local/Unknown', // Middleware doesn't currently do GeoIP, so default this
        city: '',
        lat: 0,
        lng: 0,
      },
      timestamp: new Date(data.created_at || Date.now()),
      severity: severity,
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
      callbacks.forEach(callback => callback(data));
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let webSocketClientInstance: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!webSocketClientInstance) {
    webSocketClientInstance = new WebSocketClient();
  }
  return webSocketClientInstance;
}
