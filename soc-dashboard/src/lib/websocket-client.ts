import { getAPIClient } from "./api-client";
import { ThreatEvent } from "@/store/useSOCStore";

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

    try {
      const socket = new WebSocket(wsURL);
      this.ws = socket;

      socket.onopen = () => {
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
        }
      };

      socket.onerror = () => {
        if (this.ws !== socket) return;

        this.emit("connection_status", {
          status: "error",
          error: "Connection error",
        });
      };

      socket.onclose = () => {
        if (this.ws !== socket) return;

        this.ws = null;
        this.isConnected = false;
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
        break;
    }
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
