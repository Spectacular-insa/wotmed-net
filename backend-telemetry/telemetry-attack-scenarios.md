# Telemetry Pipeline Security Attack Scenarios
> **Location:** `docs/backend-telemetry/telemetry-attack-scenarios.md`  
> **Subsystem:** Backend Infrastructure & Security Resiliency  

---

## 1. Threat Scenarios & Mitigations

### Scenario 1: Telemetry Flood / Ingestion Denial-of-Service (DoS)
- **Attack Vector:** An attacker compromises an edge sensor or spoofs endpoint keys to flood the `POST /api/v1/telemetry/ingest` endpoint with malformed event payloads.
- **Impact:** Connection pool exhaustion in PostgreSQL and memory overload on Node.js processes.
- **Mitigation Strategy:**
  1. Rate-limiting middleware per API token (`express-rate-limit`).
  2. Asynchronous Redis buffering queue prior to persistence.
  3. Payload size caps (max 100KB per JSON POST).

---

### Scenario 2: WebSocket Connection Exhaustion (Slowloris/WS Hijacking)
- **Attack Vector:** Opening thousands of idle WebSocket connections without completing handshake or subscription to exhaust thread descriptors.
- **Mitigation Strategy:**
  1. Heartbeat ping/pong interval enforcement (10s timeout).
  2. Max connections limit per client IP address.
  3. Pre-connection JWT handshake authentication.

---

### Scenario 3: Telemetry Poisoning & Injection
- **Attack Vector:** Crafting malicious SQL or JSON strings within event payload parameters (`payload.vector`).
- **Mitigation Strategy:**
  1. Parameterized SQL queries using `pg-pool` prepared statements.
  2. Strict JSONB validation rules.