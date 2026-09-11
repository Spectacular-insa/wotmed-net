<div align="center">

# 🪤 Wotmed-Net (ወጥመድ-ኔት)

### *"Catch Threats Before They Reach the Core."*

[![INSA Cyber Camp](https://img.shields.io/badge/INSA-Cyber%20Talent%20Camp-blue?style=for-the-badge\&logo=shield)](https://github.com/Spectacular-insa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge\&logo=github-actions)]()
[![Platform](https://img.shields.io/badge/Node.js-v18%2B-green?style=for-the-badge\&logo=nodedotjs)]()

**An application-layer active deception engine that transforms standard web applications into interactive honeypots with a single line of middleware.**

[Explore Docs](#-system-architecture--data-flow) • [Quick Start](#-quick-start) • [Team](#-team-group-1---insa-cyber-camp)

---

</div>

## 🚀 Overview

**Wotmed-Net** is an in-code active defense system engineered for modern web infrastructure. Instead of relying purely on boundary firewalls, Wotmed-Net embeds intelligent, zero-latency decoy traps directly inside application route handlers.

* ⚡ **Zero-Latency Overhead:** Legitimate traffic passes through unhindered.
* 🎯 **Zero False Positives:** Regular users never browse honeypot paths; every hit is a guaranteed threat actor.
* 📡 **Real-Time SOC Streaming:** Instant telemetry dispatch via WebSockets (< 100ms response).

---

## 🛠️ Technology Stack

### **Core Engine & Backend**

* **Node.js & Express**: High-speed asynchronous middleware framework.
* **Supabase & PostgreSQL**: Robust database schema design and connection pooling.
* **MySQL**: Persistent threat logging and IP reputation tracking.

### **Frontend & Interface**

* **React.js & Next.js**: Component-driven single-page architecture for the threat operations UI.
* **Tailwind CSS**: Tactical dark-mode styling optimized for security analysts.

---

## ⚡ Quick Start

### Installation

```bash
npm install wotmed-net---
```

### Basic Usage

Add Wotmed-Net to your Express application with a single line:

```typescript
import express from 'express';
import { wotmedNet } from 'wotmed-net---';

const app = express();

// Enable Wotmed-Net security middleware
app.use(wotmedNet());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
```

### Advanced Configuration

```typescript
app.use(wotmedNet({
  enableTarpit: true,
  decayIntervalMs: 30000,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
  tarpitDelayMs: 2000,
  tarpitThreshold: 30,
  blockThreshold: 70
}));
```

### Configuration Options

| Option            | Type    | Default     | Description                                      |
| ----------------- | ------- | ----------- | ------------------------------------------------ |
| `enableTarpit`    | boolean | `true`      | Enable tarpitting (delaying suspicious requests) |
| `decayIntervalMs` | number  | `60000`     | Score decay interval in milliseconds             |
| `supabaseUrl`     | string  | `undefined` | Supabase project URL for persistence             |
| `supabaseKey`     | string  | `undefined` | Supabase anon key for persistence                |
| `tarpitDelayMs`   | number  | `2000`      | Custom tarpit delay in milliseconds              |
| `tarpitThreshold` | number  | `30`        | Threshold for tarpitting                         |
| `blockThreshold`  | number  | `70`        | Threshold for blocking requests                  |

---

## �️ Database Setup

Wotmed-Net requires a MySQL database for persistent threat logging and IP reputation tracking.

### Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wotmed_net

# Optional: IP Allowlist (comma-separated)
ALLOWLIST_IPS=127.0.0.1,::1

# Server Configuration
PORT=3000
```

### Database Schema Setup

1. Ensure MySQL is running on your system
2. Execute the database schema script:

```bash
mysql -u root -p < database/schema.sql
```

Or manually run the SQL commands in MySQL Workbench or your preferred MySQL client:

```sql
-- The script will:
-- 1. Create database 'wotmed_net'
-- 2. Create 'ip_reputations' table for tracking IP threat scores
-- 3. Create 'threat_logs' table for forensic threat logging
```

### Database Tables

**`ip_reputations`**: Tracks IP address threat scores and blocking status

* `ip_address`: Primary key (supports IPv4 and IPv6)
* `threat_score`: Current threat score (0-100+)
* `status`: 'ACTIVE' or 'BLOCKED'
* `last_seen`: Timestamp of last activity

**`threat_logs`**: Logs individual threat events for forensic analysis

* `id`: Auto-increment primary key
* `ip_address`: IP that triggered the threat
* `request_path`: Endpoint/path accessed
* `payload_hash`: SHA256 hash of request payload
* `threat_type`: Type of threat detected
* `created_at`: Timestamp when threat was detected

---

## 🚀 Development & Testing

### Running the Development Server

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev
```

The server will start on `http://localhost:3000` by default.

### Testing Active Defense Endpoints

Wotmed-Net includes several honeypot traps that detect and respond to common scanner probes:

#### Test Honeypot Traps

```bash
# Test .env file exposure trap (+15 points)
curl -i http://localhost:3000/.env

# Test Git config exposure trap (+25 points)
curl -i http://localhost:3000/.git/config

# Test WordPress login trap (+20 points)
curl -i http://localhost:3000/wp-login.php

# Test phpMyAdmin probe trap (+20 points)
curl -i http://localhost:3000/phpmyadmin
curl -i http://localhost:3000/pma
```

#### Test Telemetry API

```bash
# Get security statistics
curl http://localhost:3000/api/v1/telemetry/stats

# Get recent threat logs (default: 50, max: 100)
curl http://localhost:3000/api/v1/telemetry/logs?limit=20
```

#### Test Admin Unblock Endpoint

```bash
# Unblock a blocked IP address
curl -X POST http://localhost:3000/api/v1/admin/unblock \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100"}'
```

#### IP Blocking Behavior

When an IP accumulates 100+ threat points, it will be automatically blocked:

```bash
# After reaching 100 points, requests will return 403
curl -i http://localhost:3000/
# HTTP/1.1 403 Forbidden
# {"error":"Access Denied","status":"BLOCKED","message":"Your IP address has been flagged and restricted by Wotmed-Net active defense."}
```

---

## 📝 Project Structure

```bash
wotmed-net/
├── docs/
│   ├── proposal/          # Individual domain proposals & specifications
│   └── tech-stack.md      # Full technology stack definition
├── core-engine/           # Middleware interception & signature evaluation
├── backend-telemetry/     # Ingestion pipelines and WebSocket sync
├── soc-dashboard/         # React tactical threat operations UI
├── demo-app/              # Multi-tier reference application with traps
└── security-tests/        # Automated attack simulation scripts
```

---

## �👥 Team (Group 1 - INSA Cyber Camp)

| Member                               | Role                            | Primary Responsibility                        |
| :----------------------------------- | :------------------------------ | :-------------------------------------------- |
| **Ayitegeb Tilahun Demisie**         | 👑 Lead Architect & Integration | Core Middleware Engine & System Integration   |
| **Dilargachew Ashenafi Tsegemariam** | ⚡ Backend & Real-Time Sync      | Telemetry Ingestion & WebSocket Pipelines     |
| **Biruk Zelalem Yohannes**           | 🖥️ SOC Dashboard Lead          | Dark-Mode React Threat Operations UI          |
| **Eman Mohammednur Ahmed**           | 🧪 Demo App & Deception Tester  | Reference App & Honeytoken Configs            |
| **Wubalem Gashaw Abera**             | ⚔️ Red Team & Security Tester   | Automated Exploit Probing & Presentation Lead |

---

## 🏗️ System Architecture & Data Flow

Below is the dynamic execution path of an incoming HTTP request as it encounters the **Wotmed-Net** security engine:

```mermaid
sequenceDiagram
    autonumber
    actor Attacker as 🚨 Scanner / Attacker
    actor User as 👤 Legitimate User
    participant App as 🌐 Web Application
    participant Engine as 🪤 Wotmed Middleware
    participant SOC as 🖥️ Central SOC Dashboard

    Note over User, App: Normal Traffic Flow
    User->>App: GET /products
    App->>Engine: Evaluate Route
    Engine-->>App: Pass (next())
    App-->>User: 200 OK (Render Page)

    Note over Attacker, SOC: Attack Detection Flow
    Attacker->>App: GET /api/.env OR /admin_backup.sql
    App->>Engine: Intercept Request
    Engine->>Engine: Match Decoy Pattern (TRAP HIT!)
    par Asynchronous Alert
        Engine-->>SOC: ⚡ Push Event via WebSockets (IP, Headers, Payload)
        SOC-->>SOC: 🚨 Flash Red SOC Alert (< 100ms)
    and Deceptive Response
        Engine-->>Attacker: 403 Forbidden / Honeytoken Payload
    end
```
