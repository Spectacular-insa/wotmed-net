# Wotmed-Net (ወጥመድ-ኔት) Core Engine & Advanced Active Defense Specification
**Author:** Ayitegeb Tilahun Demisie (Lead Architect & Integration)

## 1. Executive Summary & Core Philosophy
Wotmed-Net (ወጥመድ-ኔት) is an application-layer active defense middleware and honeypot system designed to intercept, analyze, deceive, and neutralize sophisticated threats at the edge[cite: 1]. Moving beyond traditional signature-matching web application firewalls (WAFs), Wotmed-Net combines non-maskable client fingerprinting, autonomous deception tokens, dynamic adaptive tarpitting, and zero-dependency local threat sharing[cite: 1]. 

This document serves as the canonical architectural contract between the Core Engine, Backend Telemetry, and SOC Dashboard modules[cite: 1].
## 1. Executive Summary & Core Philosophy
Wotmed-Net is an application-layer active defense middleware and honeypot system designed to intercept, analyze, deceive, and neutralize sophisticated threats at the edge. Moving beyond traditional signature-matching web application firewalls (WAFs), Wotmed-Net combines non-maskable client fingerprinting, autonomous deception tokens, dynamic adaptive tarpitting, and zero-dependency local threat sharing. 

This document serves as the canonical architectural contract between the Core Engine, Backend Telemetry, and SOC Dashboard modules.

---

## 2. System Architecture & Request Lifecycle

```
[ Incoming Client Request ]
           │
           ▼
 ┌───────────────────┐
 │ 1. Interceptor    │ ──> Extract Raw Headers, IP, Query, Body, TLS Fingerprint
 └─────────┬─────────┘
           │
           ▼
 ┌───────────────────┐
 │ 2. Inspector      │ ──> Scan Heuristics (SQLi, XSS, Path Traversal, Anomalies)
 └─────────┬─────────┘
           │
           ▼
 ┌───────────────────┐
 │ 3. Engine         │ ──> Calculate Threat Score (0–100) & Determine Action
 └─────────┬─────────┘
           │
           ├─── Score >= 80 ──────> [ Block / Drop Connection ]
           ├─── Score 50–79 ──────> [ Autonomous Dynamic Tarpit / Fake Output ]
           ├─── Score 1–49 ───────> [ Monitor & Log Warning ]
           └─── Score == 0 ───────> [ Allow & Inject Canary Tokens ]
           │
           ▼
 ┌───────────────────┐
 │ 4. Dispatcher     │ ──> Asynchronous Telemetry Emission to Backend/SOC
 └───────────────────┘
```

---

## 3. Deep-Dive Module Breakdown

### 3.1 Request Interceptor (`core/interceptor.js`)
* **Role:** Acts as the primary HTTP middleware barrier.
* **Mechanism:** Intercepts incoming requests prior to application routing. It normalizes headers, captures TLS/JA3 handshakes, measures request arrival timing, and wraps the response object to monitor outgoing payloads for canary token injection.

### 3.2 Heuristic Payload Inspector (`core/inspector.js`)
* **Role:** Deep-scans input vectors for malicious signatures and structural anomalies.
* **Detection Categories:**
  * *SQL Injection (SQLi):* Evaluates union-based, error-based, and blind injection signatures.
  * *Cross-Site Scripting (XSS):* Detects encoded payload execution vectors and script tags.
  * *Header & Order Anomalies:* Inspects non-standard HTTP header orderings typical of automated bot frameworks.

### 3.3 Threat Evaluation Engine (`core/engine.js`)
* **Role:** Calculates numerical threat scores and selects countermeasures.
* **Scoring Matrix:**
  * `0`: Clean Request (Passes through with injected canary markers).
  * `1–49`: Low Risk / Warning (Logged, request allowed).
  * `50–79`: Moderate Risk / Suspicious (Triggers Autonomous Dynamic Tarpitting).
  * `80–100`: High Risk / Malicious (Triggers Instant Block & Honeypot Redirection).

---

## 4. Proprietary Innovations & Advanced Defense Features

### 4.1 Autonomous Canary Token Trapping (Deception Tokens)
* **Mechanism:** The middleware automatically injects invisible, cryptographically signed canary tokens (hidden form fields, decoy API routing paths, and fake tracking parameters) into all outgoing HTML and JSON responses.
* **Defensive Value:** If a scraper, bot, or attacker extracts data and subsequently pings or submits a request containing a canary token, the system instantly triggers an absolute zero-false-positive ban and maps their complete fingerprint.

### 4.2 Heuristic Context Drift & Dynamic Tarpitting
* **Mechanism:** Instead of returning a static error page or fixed delay when a suspicious request is flagged (Score 50–79), the engine dynamically scales server response latency using a continuous probability curve.
* **Defensive Value:** It feeds malicious actors highly convincing "fake success" outputs while silently draining their execution threads and computational resources, preventing automated scripts from optimizing attack velocity.

### 4.3 Cryptographic JA3/JA4-to-Behavioral Session Binding
* **Mechanism:** Binds the client's immutable cryptographic TLS handshake fingerprint directly to their dynamic application session token.
* **Defensive Value:** Defeats VPN and proxy evasion techniques. Even if an attacker switches their exit node IP address mid-session, any mismatch between their new IP/route and their persistent TLS handshake signature triggers an immediate security lockdown.

### 4.4 Zero-Dependency Local Threat Sync (Edge Mesh Simulation)
* **Mechanism:** A lightweight caching and P2P telemetry sharing architecture that allows local Wotmed-Net instances to instantly broadcast and sync newly discovered attacker fingerprints across network nodes.
* **Defensive Value:** Ensures rapid collaborative defense even in isolated or air-gapped deployment environments.

---

## 5. Telemetry & SOC Integration Protocol
Every flagged incident generates a cryptographically secure UUID and emits an asynchronous telemetry payload containing:
1. Timestamp & Request Metadata
2. Calculated Threat Score & Triggered Rules
3. TLS Fingerprint & Header Ordering Signature
4. Assigned Countermeasure Action (Block, Tarpit, Monitor)

This data streams securely to Dilargachew's backend telemetry module and renders in real-time on Biruk's SOC dashboard.
