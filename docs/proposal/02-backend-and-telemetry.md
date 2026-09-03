# Backend & Real-Time Synchronization Proposal
> **Document File Path:** `/docs/proposal/02-backend-and-telemetry.md`  
> **Subsystem Owner:** Backend & Real-Time Systems Team  
> **Tech Stack:** Node.js / Express, PostgreSQL, WebSockets (Socket.io), Redis Pub/Sub  

---

## 1. Primary Objective
Design, build, and deploy a robust, enterprise-grade backend infrastructure capable of high-throughput security telemetry ingestion with minimal latency, paired with a real-time WebSocket broadcasting pipeline for streaming threat alerts directly to frontend monitoring dashboards.

---

## 2. Backend Infrastructure Architecture

### 2.1 Server Architecture (Node.js / Express)
- **Event-Driven Architecture:** Utilizing Node.js non-blocking I/O loop to process thousands of incoming log entries per second.
- **Cluster Management:** Node.js cluster module enabling process fork scaling across multiple CPU cores.
- **Middleware Pipeline:** Input validation (Joi/Zod), rate limiting (express-rate-limit), CORS security, and JWT authentication middleware.

### 2.2 PostgreSQL Database Schema & Connection Pooling
- **Connection Pooling (`pg-pool`):** Configured connection pools to prevent database connection exhaustion during metric spikes.
- **Connection Configuration:**
  ```javascript
  const { Pool } = require('pg');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 50,                     // Max active clients in pool
    idleTimeoutMillis: 10000,    // Idle connections close after 10s
    connectionTimeoutMillis: 2000// Timeout on client checkout limit
  });

  module.exports = pool;