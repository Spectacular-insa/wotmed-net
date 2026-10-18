
 // Real API client for Wotmed-Net SOC Dashboard
class APIClient {
  private baseURL: string;
  private wsURL: string;

  constructor() {
    this.baseURL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    ).replace(/\/+$/, '');

    this.wsURL =
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  }

  // Shared REST request handler
  private async request(endpoint: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(
          `Wotmed API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Wotmed API timed out: ${endpoint}`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Telemetry statistics
  async getTelemetryStats() {
    return this.get('/v1/telemetry/stats');
  }

  // Real threat history from the backend/Supabase
  async getThreatLogs(params?: { limit?: number; offset?: number }) {
    const query = new URLSearchParams();

    if (params?.limit !== undefined) {
      query.set('limit', String(params.limit));
    }

    if (params?.offset !== undefined) {
      query.set('offset', String(params.offset));
    }

    const suffix = query.toString();
    return this.get(
      `/v1/telemetry/logs${suffix ? `?${suffix}` : ''}`
    );
  }

  // IP administration
  async blockIP(ip: string, reason: string) {
    return this.post('/v1/admin/block', { ip, reason });
  }

  async unblockIP(ip: string) {
    return this.post('/v1/admin/unblock', { ip });
  }

  async getBlockedIPs() {
    return this.get('/v1/admin/blocked-ips');
  }

  getWebSocketURL(): string {
    return this.wsURL;
  }
}

let apiClientInstance: APIClient | null = null;

export function getAPIClient(): APIClient {
  if (!apiClientInstance) {
    apiClientInstance = new APIClient();
  }
  return apiClientInstance;
}
