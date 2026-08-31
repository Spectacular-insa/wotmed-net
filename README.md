# Wotmed-Net (ወጥመድ-ኔት)
> Application-Layer Active Defense Middleware and Honeypot System with Real-Time Telemetry

## Overview
Wotmed-Net is a proactive security middleware designed to intercept HTTP/WebSocket traffic, analyze anomalous payloads, trigger active defense countermeasures (such as tarpitting or blocking), and stream real-time telemetry to a tactical Security Operations Center (SOC) dashboard.

## Group 1 Team Members & Responsibilities
- **Ayitegeb Tilahun Demisie** — Lead Architect & Core Middleware Engine (`core-engine/`)
- **Dilargachew Ashenafi Tsegemariam** — Backend Ingestion & Real-Time WebSockets (`backend-telemetry/`)
- **Biruk Zelalem Yohannes** — Tactical Dark-Mode SOC Dashboard UI (`soc-dashboard/`)
- **Eman Mohammednur Ahmed** — Reference Web Application & Honeytokens (`demo-app/`)
- **Wubalem Gashaw Abera** — Automated Exploit Probers & Security Testing (`security-tests/`)

## Repository Structure
- `docs/proposal/` — Individual architecture proposals and specifications
- `core-engine/` — Interception hook and payload evaluation engine
- `backend-telemetry/` — Ingestion pipeline and WebSocket sync
- `soc-dashboard/` — React/Next.js monitoring interface
- `demo-app/` — Multi-tier reference app with canary traps
- `security-tests/` — Automated Red Team simulation scripts