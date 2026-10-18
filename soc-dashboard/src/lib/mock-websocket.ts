import { ThreatEvent } from '@/store/useSOCStore';

// Mock WebSocket Stream Engine for UI testing without backend
class MockWebSocketEngine {
  private interval: NodeJS.Timeout | null = null;
  private eventCount = 0;

  // Realistic threat types and patterns
  private threatTypes = [
    'SQL Injection',
    'XSS Attack',
    'Path Traversal',
    'Brute Force',
    'DDoS Attempt',
    'Command Injection',
    'CSRF Attack',
    'File Inclusion',
  ];

  private countries = [
    { code: 'US', name: 'United States', lat: 37.0902, lng: -95.7129 },
    { code: 'CN', name: 'China', lat: 35.8617, lng: 104.1954 },
    { code: 'RU', name: 'Russia', lat: 61.5240, lng: 105.3188 },
    { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515 },
    { code: 'BR', name: 'Brazil', lat: -14.2350, lng: -51.9253 },
    { code: 'IN', name: 'India', lat: 20.5937, lng: 78.9629 },
    { code: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
    { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137 },
    { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529 },
    { code: 'KR', name: 'South Korea', lat: 35.9078, lng: 127.7669 },
  ];

  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'curl/7.68.0',
    'python-requests/2.25.1',
    'Gobuster v1.2',
    'sqlmap/1.5',
    'Nmap Scripting Engine',
    'PostmanRuntime/7.26.8',
  ];

  private requestPaths = [
    '/api/.env',
    '/admin/config.php',
    '/wp-login.php',
    '/phpmyadmin',
    '/api/users',
    '/api/admin',
    '/.git/config',
    '/api/database',
    '/backup.sql',
    '/api/debug',
    '/api/login',
    '/etc/passwd',
  ];

  // Generate random IP address
  private generateIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  // Generate random hash
  private generateHash(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Generate realistic threat event
  private generateThreatEvent(): ThreatEvent {
    const country = this.countries[Math.floor(Math.random() * this.countries.length)];
    const threatType = this.threatTypes[Math.floor(Math.random() * this.threatTypes.length)];
    const requestPath = this.requestPaths[Math.floor(Math.random() * this.requestPaths.length)];

    // Calculate severity based on threat type and random factors
    let severity: 'INFO' | 'TARPIT' | 'CRITICAL' | 'BLOCKED';
    const scoreDelta = Math.floor(Math.random() * 100);

    if (scoreDelta > 80) {
      severity = 'CRITICAL';
    } else if (scoreDelta > 60) {
      severity = 'BLOCKED';
    } else if (scoreDelta > 40) {
      severity = 'TARPIT';
    } else {
      severity = 'INFO';
    }

    return {
      id: `threat-${Date.now()}-${this.eventCount++}`,
      ip: this.generateIP(),
      threatType,
      payloadHash: this.generateHash(),
      scoreDelta,
      location: {
        country: country.name,
        city: ['New York', 'Beijing', 'Moscow', 'Berlin', 'São Paulo', 'Mumbai', 'London', 'Paris', 'Tokyo', 'Seoul'][Math.floor(Math.random() * 10)],
        lat: country.lat + (Math.random() - 0.5) * 10,
        lng: country.lng + (Math.random() - 0.5) * 10,
      },
      timestamp: new Date(),
      severity,
    };
  }

  // Start generating events on 1.5s interval
  start(callback: (event: ThreatEvent) => void) {
    if (this.interval) return;

    this.interval = setInterval(() => {
      const event = this.generateThreatEvent();
      callback(event);
    }, 1500); // 1.5s interval as specified
  }

  // Stop generating events
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Singleton instance
let mockWebSocketInstance: MockWebSocketEngine | null = null;

export function getMockWebSocket(): MockWebSocketEngine {
  if (!mockWebSocketInstance) {
    mockWebSocketInstance = new MockWebSocketEngine();
  }
  return mockWebSocketInstance;
}
