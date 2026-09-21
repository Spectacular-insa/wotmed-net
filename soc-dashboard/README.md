# Wotmed-Net SOC Dashboard

## Overview

The SOC dashboard provides the Security Operations Center interface for Wotmed-Net. It's a tactical dark-mode dashboard where security analysts can monitor, analyze, and respond to application-layer threats in real-time.

## Features

- **Real-time Threat Monitoring** - Live WebSocket connection to Wotmed-Net backend
- **Geographic Threat Mapping** - Interactive map showing attack origins worldwide
- **Live Threat Feed** - Real-time scrolling threat alerts with severity filtering
- **Analytics Dashboard** - Threat statistics, blocked IPs, detection rates
- **Incident Management** - Manual IP blocking and threat inspection
- **Mock Mode** - Fallback to mock data when backend is unavailable

## Technology Stack

- **Framework:** React 18+ with Next.js 14+
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3.4+
- **State Management:** Zustand 4+
- **Real-Time:** Socket.io-client / Native WebSocket
- **Data Visualization:** Recharts 2+
- **Maps:** React Leaflet 4+ with Leaflet 1.9+
- **Utilities:** date-fns 3+, clsx 2+, tailwind-merge 2+

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Project Structure

```
soc-dashboard/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   ├── analytics/    # Analytics cards
│   │   ├── map/          # Geographic threat map
│   │   └── threat-feed/  # Live threat feed
│   ├── lib/              # Utility functions and API clients
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript type definitions
├── public/              # Static assets
└── package.json
```

## Team

- **Wotmed-Net** - Main project name
- **Developed by Spectacular** - Development group attribution

## Development Status

- ✅ Real-time WebSocket integration with backend API
- ✅ Fallback to mock mode when backend unavailable
- ✅ Geographic threat mapping with dark tiles
- ✅ Live threat feed with severity filtering
- ✅ Analytics dashboard with real-time statistics
- ✅ Incident management and IP blocking
- ✅ Responsive design for different screen sizes

## API Integration

The dashboard connects to the Wotmed-Net backend via:

- **REST API:** `/api/v1/telemetry/*` endpoints for statistics and logs
- **WebSocket:** Real-time threat alerts and telemetry updates
- **Auto-fallback:** Switches to mock mode if backend is unavailable

## Documentation

For detailed specifications, component architecture, WebSocket integration, UI/UX design system, and implementation roadmap, see:
[docs/proposal/03-soc-dashboard-ui.md](../../docs/proposal/03-soc-dashboard-ui.md)
