// Real API client for Wotmed-Net backend integration
class APIClient {
  private baseURL: string;
  private wsURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

    this.wsURL =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5001/soc-stream";
  }
  // REST API methods
  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Get telemetry statistics
  async getTelemetryStats() {
    return this.get("/v1/telemetry/stats");
  }

  // Get threat logs
  async getThreatLogs(params?: { limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(
      `/v1/telemetry/logs${queryParams ? `?${queryParams}` : ""}`,
    );
  }

  // Block IP address
  async blockIP(ip: string, reason: string) {
    return this.post("/v1/admin/block", { ip, reason });
  }

  // Unblock IP address
  async unblockIP(ip: string) {
    return this.post("/v1/admin/unblock", { ip });
  }

  // Get blocked IPs
  async getBlockedIPs() {
    return this.get("/v1/admin/blocked-ips");
  }

  // Get WebSocket URL
  getWebSocketURL(): string {
    return this.wsURL;
  }
}

// Singleton instance
let apiClientInstance: APIClient | null = null;

export function getAPIClient(): APIClient {
  if (!apiClientInstance) {
    apiClientInstance = new APIClient();
  }
  return apiClientInstance;
}
