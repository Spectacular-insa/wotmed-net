 feature/core-engine

import { getAPIClient } from './api-client';
import type { ThreatEvent } from '@/store/useSOCStore';

type BackendIncident = {
  incident_id?: string;
  id?: string;
  client_ip?: string;
  ip_address?: string;
  request_path?: string;
  request_method?: string;
  threat_score?: number | string;
  action_taken?: string;
  triggered_flags?: string[];
  created_at?: string;
  timestamp?: string;
  threat_type?: string;
  payload_hash?: string;
  severity?: string;
  country_name?: string;
  country?: string;
  country_code?: string;
  city?: string;
  region?: string;
  region_code?: string;
  postal?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  geolocation_status?: string;
  geolocation_reason?: string;
  // Privacy detection fields (Plus/Max API tiers)
  privacy_vpn?: boolean;
  privacy_proxy?: boolean;
  privacy_tor?: boolean;
  privacy_relay?: boolean;
  privacy_hosting?: boolean;
  privacy_service?: string;
  // ASN/ISP fields (Lite tier and above)
  asn?: string;
  org?: string;
  org_domain?: string;
  asn_type?: string;
};

type SocketMessage = {
  event_type?: string;
  data?: BackendIncident | Record<string, unknown>;
};

type Subscriber = (data: any) => void;

import { getAPIClient } from "./api-client";
import { ThreatEvent } from "@/store/useSOCStore";
 main

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
 feature/core-engine
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private subscribers = new Map<string, Subscriber[]>();
  private isConnected = false;
  private manuallyDisconnected = false;

  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)

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
 main
    ) {
      return;
    }

 feature/core-engine
    this.manuallyDisconnected = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }


 main
    const wsURL = getAPIClient().getWebSocketURL();

    try {
      const socket = new WebSocket(wsURL);
      this.ws = socket;

      socket.onopen = () => {
 feature/core-engine
        if (this.ws !== socket) return;

        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { status: 'connected' });
      };

      socket.onmessage = (messageEvent: MessageEvent) => {
        if (this.ws !== socket) return;

        try {
          const message = JSON.parse(
            String(messageEvent.data)
          ) as SocketMessage;

          this.handleMessage(message);
        } catch (error) {
          console.error(
            '[Wotmed-Net WS] Could not parse incoming message:',
            error
          );

        if (this.ws !== socket) {
          socket.close();
          return;
        }

        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit("connection_status", { status: "connected" });
      };

      socket.onmessage = (event) => {
        if (this.ws !== socket) return;

        try {
          this.handleMessage(JSON.parse(event.data));
        } catch {
          // Ignore invalid JSON messages.
 main
        }
      };

      socket.onerror = () => {
        if (this.ws !== socket) return;

 feature/core-engine
        this.emit('connection_status', {
          status: 'error',
          error: 'WebSocket connection error',

        this.emit("connection_status", {
          status: "error",
          error: "Connection error",
 main
        });
      };

      socket.onclose = () => {
 feature/core-engine
        // Ignore events from an old socket after a newer one has connected.
 main
        if (this.ws !== socket) return;

        this.ws = null;
        this.isConnected = false;
 feature/core-engine

        this.emit('connection_status', { status: 'disconnected' });

        if (!this.manuallyDisconnected) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      this.isConnected = false;

      this.emit('connection_status', {
        status: 'error',
        error: 'Failed to create WebSocket connection',
      });

      this.attemptReconnect();
    }
  }

  disconnect(): void {
    this.manuallyDisconnected = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const socket = this.ws;
    this.ws = null;
    this.isConnected = false;

    if (socket) {
      // Detach handlers so an intentional close cannot start a reconnect.
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    }

    this.emit('connection_status', { status: 'disconnected' });
  }

  private attemptReconnect(): void {
    if (
      this.manuallyDisconnected ||
      this.reconnectTimer ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return;
    }

    this.reconnectAttempts += 1;

    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (!this.manuallyDisconnected) {
        this.connect();
      }
    }, delay);
  }

  private handleMessage(message: SocketMessage): void {
    switch (message.event_type) {
      case 'threat_alert': {
        const data = message.data as BackendIncident | undefined;

        if (!data) return;

        const event = this.convertToThreatEvent(data);

        if (event) {
          this.emit('threat_alert', event);
        }

        break;
      }

      case 'ip_blocked':
        this.emit('ip_blocked', message.data);
        break;

      case 'telemetry_update':
        this.emit('telemetry_update', message.data);
        break;

      case 'connection_status':
        this.emit('connection_status', message.data);
        break;

      default:
        // Ignore unknown message types without breaking the connection.

        this.emit("connection_status", { status: "disconnected" });
        this.attemptReconnect();
      };
    } catch {
      this.isConnected = false;
      this.emit("connection_status", {
        status: "error",
        error: "Failed to connect",
      });
    }
  }

  disconnect() {
    const socket = this.ws;

    // Invalidate this socket before closing it.
    this.ws = null;
    this.isConnected = false;

    if (!socket) return;

    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;

    if (socket.readyState === WebSocket.CONNECTING) {
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

    this.emit("connection_status", { status: "disconnected" });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;

    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000,
    );

    setTimeout(() => this.connect(), delay);
  }

  private handleMessage(data: any) {
    // Wotmed-Net telemetry WebSocket message format.
    if (data.type === "THREAT_DISPATCH" && data.data) {
      this.emit("threat_alert", this.convertToThreatEvent(data.data));
      return;
    }

    // Support the dashboard's existing message formats.
    switch (data.event_type) {
      case "threat_alert":
        this.emit("threat_alert", this.convertToThreatEvent(data.data));
        break;

      case "ip_blocked":
        this.emit("ip_blocked", data.data);
        break;

      case "telemetry_update":
        this.emit("telemetry_update", data.data);
        break;

      case "connection_status":
        this.emit("connection_status", data.data);
 main
        break;
    }
  }

 feature/core-engine
  private convertToThreatEvent(
    data: BackendIncident
  ): ThreatEvent | null {
    const id = data.incident_id || data.id;

    // Never generate a random ID for a real backend incident.
    if (!id) {
      console.warn(
        '[Wotmed-Net WS] Threat alert has no incident ID:',
        data
      );
      return null;
    }

    const score = Number(data.threat_score ?? 0);
    const action = String(data.action_taken ?? '').toUpperCase();
    const flags = Array.isArray(data.triggered_flags)
      ? data.triggered_flags
      : [];

    let severity: ThreatEvent['severity'] = 'INFO';

    if (action.includes('BLOCK') || data.severity?.toLowerCase() === 'blocked') {
      severity = 'BLOCKED';
    } else if (
      data.severity?.toLowerCase() === 'critical' ||
      data.severity?.toLowerCase() === 'high' ||
      score >= 80
    ) {
      severity = 'CRITICAL';
    } else if (
      action.includes('TARPIT') ||
      data.severity?.toLowerCase() === 'medium' ||
      score >= 40
    ) {
      severity = 'TARPIT';
    }

    const timestampValue = data.created_at || data.timestamp;
    const parsedTimestamp = timestampValue
      ? new Date(timestampValue)
      : new Date();

    const timestamp = Number.isNaN(parsedTimestamp.getTime())
      ? new Date()
      : parsedTimestamp;

    const method = data.request_method || 'UNKNOWN';
    const path = data.request_path || data.payload_hash || '/';

    // Check if we have valid coordinates (Core API and above)
    const hasValidCoordinates = 
      data.geolocation_status === 'resolved' &&
      Number.isFinite(Number(data.latitude)) &&
      Number.isFinite(Number(data.longitude)) &&
      Number(data.latitude) >= -90 &&
      Number(data.latitude) <= 90 &&
      Number(data.longitude) >= -180 &&
      Number(data.longitude) <= 180;

    return {
      id: String(id),
      ip: String(data.client_ip || data.ip_address || 'Unknown'),
      threatType:
        flags.length > 0
          ? flags.join(', ')
          : data.threat_type || action.replaceAll('_', ' ') || 'Unknown threat',
      payloadHash: data.request_path
        ? `${method} ${path}`
        : data.payload_hash || `${method} ${path}`,
      scoreDelta: Number.isFinite(score) ? score : 0,
      location: {
        country: data.country || data.country_name || 'Unknown',
        countryCode: data.country_code,
        city: data.city,
        region: data.region,
        regionCode: data.region_code,
        postal: data.postal,
        timezone: data.timezone,
        lat: hasValidCoordinates ? Number(data.latitude) : 0,
        lng: hasValidCoordinates ? Number(data.longitude) : 0,
      },
      timestamp,
      severity,
      geolocationStatus: data.geolocation_status || 'unavailable',
      geolocationReason: data.geolocation_reason,
      // Privacy detection fields (Lite API doesn't provide these)
      privacy: (data.privacy_vpn !== undefined || 
                data.privacy_proxy !== undefined || 
                data.privacy_tor !== undefined || 
                data.privacy_relay !== undefined || 
                data.privacy_hosting !== undefined) ? {
        vpn: data.privacy_vpn,
        proxy: data.privacy_proxy,
        tor: data.privacy_tor,
        relay: data.privacy_relay,
        hosting: data.privacy_hosting,
        service: data.privacy_service,
        available: true
      } : undefined,
      // ASN/ISP fields (Lite API provides these)
      asn: (data.asn || data.org) ? {
        asn: data.asn,
        org: data.org,
        domain: data.org_domain,
        type: data.asn_type,
        available: true
      } : undefined,
      // Additional incident details
      requestMethod: method,
      requestPath: path,
      actionTaken: action,
      triggeredFlags: flags,
    };
  }

  on(event: string, callback: Subscriber): void {
    const callbacks = this.subscribers.get(event) || [];

    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
      this.subscribers.set(event, callbacks);
    }
  }

  off(event: string, callback: Subscriber): void {
    const callbacks = this.subscribers.get(event);

    if (!callbacks) return;

    const updated = callbacks.filter((item) => item !== callback);

    if (updated.length > 0) {
      this.subscribers.set(event, updated);
    } else {
      this.subscribers.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);

    if (!callbacks) return;

    // Snapshot protects iteration if a callback unsubscribes during emission.
    for (const callback of [...callbacks]) {
      try {
        callback(data);
      } catch (error) {
        console.error(
          `[Wotmed-Net WS] Subscriber failed for "${event}":`,
          error
        );
      }

  public convertToThreatEvent(data: any): ThreatEvent {
    const threatLevel = String(data.threat_level || "").toUpperCase();

    const score = Number(data.threat_score ?? data.heuristic_score ?? 0);

    let severity: ThreatEvent["severity"] = "INFO";

    if (threatLevel === "CRITICAL" || score >= 80) {
      severity = "CRITICAL";
    } else if (
      threatLevel === "HIGH" ||
      data.action_taken === "BLOCK_AND_REDIRECT_HONEYPOT"
    ) {
      severity = "BLOCKED";
    } else if (
      threatLevel === "MEDIUM" ||
      data.action_taken === "AUTONOMOUS_DYNAMIC_TARPIT"
    ) {
      severity = "TARPIT";
    }

    const metadata = data.violation_metadata || {};
    const flags = data.triggered_flags;

    const threatType =
      Array.isArray(flags) && flags.length > 0
        ? flags.join(", ")
        : data.rule_id || metadata.message || "ANOMALOUS_TRAFFIC";

    return {
      id: String(data.incident_id ?? data.id ?? `threat-${Date.now()}`),
      ip: data.client_ip || "Unknown IP",
      threatType,
      tlsFingerprint: data.tls_fingerprint || "N/A",
      scoreDelta: score,
      location: {
        country: "Local/Unknown",
        city: "",
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
 main
    }
  }

  getConnectionStatus(): boolean {
 feature/core-engine
    return (
      this.isConnected &&
      this.ws?.readyState === WebSocket.OPEN
    );

    return this.isConnected;
 main
  }
}

let webSocketClientInstance: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!webSocketClientInstance) {
    webSocketClientInstance = new WebSocketClient();
  }

  return webSocketClientInstance;
}
