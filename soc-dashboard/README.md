# SOC Dashboard UI Module
**Lead:** Biruk Zelalem Yohannes
- React/Next.js tactical dark-mode threat monitoring interface
- Real-time WebSocket client data binding and alerts

# Wotmed-Net SOC Dashboard

## Overview

The SOC dashboard provides the Security Operations Center interface for Wotmed-Net. It's a tactical dark-mode dashboard where security analysts can monitor, analyze, and respond to application-layer threats in real-time.

The main goal is to display telemetry data from the Wotmed-Net middleware through an interface optimized for incident response.

## Component Categories

- **Live Threat Feed** - Real-time scrolling threat alert stream
- **IP Geolocation Map** - Visual attack origin mapping with clustering
- **Alert Severity Matrix** - Severity-based threat grouping and filtering
- **Telemetry Charts** - Historical threat data visualization
- **Incident Management Panel** - Interactive controls for threat response
- **Statistics Dashboard** - Real-time security metrics and KPIs

## Technology Stack

- **Framework:** React with Next.js
- **Styling:** Tailwind CSS with custom dark-mode theme
- **State Management:** Zustand
- **Real-Time:** Socket.io-client
- **Data Visualization:** Recharts
- **Geolocation:** React Leaflet with OpenStreetMap
- **Type Safety:** TypeScript

## Documentation

For detailed specifications, component architecture, WebSocket integration, UI/UX design system, and implementation roadmap, see:
[docs/proposal/03-soc-dashboard-ui.md](../../docs/proposal/03-soc-dashboard-ui.md)

## Development Status

Currently in documentation and planning phase. Next steps include React project initialization and component implementation.
