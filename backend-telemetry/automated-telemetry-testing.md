# Automated Telemetry Pipeline Testing Suite
> **Location:** `docs/backend-telemetry/automated-telemetry-testing.md`  
> **Subsystem:** CI/CD & Automated Quality Assurance  

---

## 1. Automated Test Setup (Jest & Supertest)

```javascript
// tests/telemetry.test.js
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

describe('POST /api/v1/telemetry/ingest', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should successfully ingest security telemetry log', async () => {
    const response = await request(app)
      .post('/api/v1/telemetry/ingest')
      .send({
        event_id: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        source_ip: '10.0.0.15',
        rule_id: 'HEURISTIC_SQLI_001',
        threat_type: 'SQL Injection Attempt',
        payload: { vector: "' OR 1=1--" }
      });

    expect(response.statusCode).toBe(202);
    expect(response.body).toHaveProperty('status', 'accepted');
  });

  it('should reject malformed payloads with 400 Bad Request', async () => {
    const response = await request(app)
      .post('/api/v1/telemetry/ingest')
      .send({ invalid_field: true });

    expect(response.statusCode).toBe(400);
  });
});