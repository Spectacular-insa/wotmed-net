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
    return {
      id: data.id || `threat-${Date.now()}`,
      ip: data.ip_address,
      threatType: data.threat_type,
      payloadHash: data.payload_hash,
      scoreDelta: data.threat_score,
      location: {
        country: data.country_name || 'Unknown',
        city: data.city,
        lat: data.latitude || 0,
        lng: data.longitude || 0,
      },
      timestamp: new Date(data.timestamp),
      severity: this.mapSeverity(data.severity),
    };
  }

  private mapSeverity(severity: string): 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED' {
    const severityMap: Record<string, 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED'> = {
      'critical': 'CRITICAL',
      'high': 'CRITICAL',
      'medium': 'TARPIT',
      'low': 'INFO',
      'blocked': 'BLOCKED',
    };
    return severityMap[severity.toLowerCase()] || 'INFO';
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
