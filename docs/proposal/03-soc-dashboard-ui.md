# SOC Dashboard UI Proposal
**Author:** Biruk Zelalem Yohannes (SOC Dashboard Lead)

## 1. Overview

The SOC dashboard provides the Security Operations Center interface for Wotmed-Net. It's a tactical dark-mode dashboard where security analysts can monitor, analyze, and respond to application-layer threats in real-time.

The main goal is to display telemetry data from the Wotmed-Net middleware through an interface optimized for incident response.

## 2. Dashboard Objectives

- Display real-time threat alerts with sub-100ms latency
- Visualize IP geolocation for attack origin mapping
- Provide severity-based threat classification
- Enable interactive incident management (block/unblock IPs)
- Present historical telemetry through charts
- Support WebSocket-based live data streaming
- Implement tactical dark-mode UI for prolonged monitoring
- Deliver responsive design across desktop and tablet viewports
- Provide payload inspection capabilities
- Support incident report generation and export
- Enable threat filtering and search functionality

## 3. Component Categories

- **Live Threat Feed** - Real-time scrolling threat alert stream
- **IP Geolocation Map** - Visual attack origin mapping with clustering
- **Alert Severity Matrix** - Severity-based threat grouping and filtering
- **Telemetry Charts** - Historical threat data visualization
- **Incident Management Panel** - Interactive controls for threat response
- **Statistics Dashboard** - Real-time security metrics and KPIs

## 4. Dashboard Workflow

```
WebSocket Connection → Real-Time Threat Events → State Management (Zustand)
→ Component Updates → UI Rendering → User Interaction → Incident Actions
→ API Integration → Telemetry Feedback
```

## 5. Component Hierarchy

```
DashboardLayout
├── Sidebar
├── Header
└── Main Content Area
    ├── LiveThreatFeed
    ├── ThreatMap
    ├── AlertSeverityMatrix
    ├── TelemetryCharts
    └── IncidentManagementPanel
```

State management uses Zustand stores for threats, statistics, blocked IPs, and connection state.

## 6. Component Architecture

### Component Identification

| ID      | Component Category             | Priority |
| ------- | ------------------------------ | -------- |
| DASH-001| Live Threat Feed              | High     |
| DASH-002| IP Geolocation Map             | High     |
| DASH-003| Alert Severity Matrix          | Medium   |
| DASH-004| Telemetry Charts               | Medium   |
| DASH-005| Incident Management Panel     | High     |
| DASH-006| Statistics Dashboard           | Medium   |

### DASH-001 — Live Threat Feed

**Objective:** Real-time scrolling feed of threat alerts with automatic updates.

**Component Structure:**
```
LiveThreatFeed
├── ThreatFeedHeader (title, filters, refresh)
├── ThreatFeedList (virtualized threat items)
└── ThreatDetailModal (payload viewer, headers, response)
```

**Data Requirements:**
```typescript
{
  id: string;
  timestamp: Date;
  ip_address: string;
  country_code?: string;
  request_path: string;
  threat_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  user_agent: string;
  payload_hash: string;
  threat_score: number;
  defense_action: string;
}
```

**Expected Behavior:**
- Auto-scroll to newest threats
- Virtual scrolling for 1000+ items
- Real-time updates within 100ms
- Filter by type, severity, time range
- Full-text search
- Detail modal for inspection

**Performance Requirements:**
- Render time: < 16ms for 50 items
- Memory: < 100MB for 1000 threats
- Update latency: < 100ms from event to UI
- 60fps during scrolling

### DASH-002 — IP Geolocation Map

**Objective:** Visualize geographic origin of threat attacks with clustering and severity-based coloring.

**Component Structure:**
```
ThreatMap
├── MapHeader (title, legend, time selector)
├── LeafletMap (tiles, markers, clustering)
└── LocationStatsPanel (top countries, cities)
```

**Data Requirements:**
```typescript
{
  id: string;
  latitude: number;
  longitude: number;
  country_code: string;
  country_name: string;
  threat_count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}
```

**Expected Behavior:**
- OpenStreetMap tiles with dark-mode styling
- Marker clustering at zoom level 8
- Severity-colored markers (red/orange/yellow/blue)
- Click to view threat details
- Responsive to container changes

**Performance Requirements:**
- Initial load: < 2 seconds for 100 markers
- Marker rendering: < 50ms for cluster updates
- Map interaction: < 100ms response time
- Memory: < 50MB for 1000 markers

### DASH-003 — Alert Severity Matrix

**Objective:** Group threats by severity with visual indicators and filtering.

**Component Structure:**
```
AlertSeverityMatrix
├── MatrixHeader (title, last updated)
├── SeverityGrid (Critical, High, Medium, Low panels)
└── SeverityTrendChart (line chart over time)
```

**Data Requirements:**
```typescript
{
  critical: Threat[];
  high: Threat[];
  medium: Threat[];
  low: Threat[];
  trend: { timestamp: Date; critical: number; high: number; medium: number; low: number; }[];
}
```

**Expected Behavior:**
- Automatic grouping by severity
- Real-time count updates
- Click to filter threat feed
- Trend visualization
- Color-coded panels

**Performance Requirements:**
- Update time: < 50ms for count updates
- Chart rendering: < 100ms
- Memory: < 20MB for trend data

### DASH-004 — Telemetry Charts

**Objective:** Display historical threat data through interactive charts.

**Component Structure:**
```
TelemetryCharts
├── ChartsHeader (title, time range selector)
├── ChartsGrid
│   ├── ThreatsOverTimeChart (line)
│   ├── ThreatTypeDistributionChart (pie)
│   ├── GeographicDistributionChart (bar)
│   └── ResponseTimeChart (line)
└── ChartExportPanel (export button, format selector)
```

**Data Requirements:**
```typescript
{
  threatsOverTime: { timestamp: Date; count: number; }[];
  threatTypes: { type: string; count: number; percentage: number; }[];
  geographicDistribution: { country: string; count: number; }[];
  responseTime: { timestamp: Date; avgResponseTime: number; }[];
}
```

**Expected Behavior:**
- Time range selection (1h, 24h, 7d, 30d)
- Interactive charts (hover, zoom, tooltip)
- Responsive design
- Export as PNG/SVG
- Real-time updates

**Performance Requirements:**
- Chart rendering: < 200ms for all charts
- Data loading: < 500ms for API fetch
- Interaction: < 100ms response
- Memory: < 50MB for chart data

### DASH-005 — Incident Management Panel

**Objective:** Interactive controls for threat response and management.

**Component Structure:**
```
IncidentManagementPanel
├── IPManagementSection (block form, blocked IPs list, bulk actions)
├── PayloadInspector (request headers, body, response info)
└── IncidentReportGenerator (report form, preview, export)
```

**Data Requirements:**
```typescript
{
  blockedIPs: { ip_address: string; block_reason: string; blocked_at: Date; }[];
  inspectionData: Threat | null;
  reportConfig: { time_range: TimeRange; threat_types: string[]; };
}
```

**Expected Behavior:**
- Block/unblock IP addresses
- Bulk operations
- Payload inspection with syntax highlighting
- Report generation (CSV/PDF)
- Audit logging

**API Integration:**
```
POST /api/v1/admin/block
POST /api/v1/admin/unblock
GET /api/v1/admin/blocked-ips
```

**Performance Requirements:**
- Action response: < 500ms for block/unblock
- List rendering: < 100ms for 100 blocked IPs
- Report generation: < 5 seconds for 1000 threats
- Memory: < 30MB for blocked IPs list

### DASH-006 — Statistics Dashboard

**Objective:** Display real-time security metrics and KPIs.

**Component Structure:**
```
StatisticsDashboard
├── StatsHeader (title, last updated)
├── MetricsGrid (total threats, blocked IPs, threats/hour, response time, detection rate)
└── QuickActionsPanel (view all threats, view map, generate report)
```

**Data Requirements:**
```typescript
{
  total_threats: number;
  active_blocked_ips: number;
  threats_per_hour: number;
  avg_response_time: number;
  detection_rate: number;
  top_threat_types: { type: string; count: number; }[];
}
```

**Expected Behavior:**
- Real-time metric updates
- Trend indicators (up/down)
- Sparkline mini-charts
- Quick action navigation
- Responsive grid

**Performance Requirements:**
- Update time: < 50ms for metric updates
- Rendering: < 100ms for full dashboard
- Memory: < 10MB for statistics data

## 7. Real-Time Integration

### WebSocket Client Architecture

```
Dashboard Application → WebSocket Manager
├── Connection State (Connected, Connecting, Disconnected, Error)
├── Event Processor (threat_alert, ip_blocked, telemetry_update, connection_status)
├── Reconnection Logic (Exponential Backoff, Max Retry Limit)
└── State Synchronizer (Zustand Store Updates, UI Trigger)
```

### WebSocket Event Schemas

**threat_alert Event:**
```typescript
{
  event_type: 'threat_alert';
  data: {
    id: string;
    timestamp: string;
    ip_address: string;
    country_code?: string;
    request_path: string;
    threat_type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    user_agent: string;
    payload_hash: string;
    threat_score: number;
    defense_action: 'allow' | 'monitor' | 'tarpit' | 'block';
  };
}
```

**ip_blocked Event:**
```typescript
{
  event_type: 'ip_blocked';
  data: {
    ip_address: string;
    blocked_at: string;
    blocked_by: string;
    reason: string;
    threat_score: number;
  };
}
```

**telemetry_update Event:**
```typescript
{
  event_type: 'telemetry_update';
  data: {
    timestamp: string;
    total_threats: number;
    active_blocked_ips: number;
    threats_per_hour: number;
    avg_response_time: number;
    detection_rate: number;
  };
}
```

**connection_status Event:**
```typescript
{
  event_type: 'connection_status';
  data: {
    status: 'connected' | 'connecting' | 'disconnected' | 'error';
    message?: string;
    timestamp: string;
  };
}
```

### Connection Management

**Default Configuration:**
```typescript
{
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10,
  reconnectDecay: 1.5,
  timeout: 10000,
}
```

**Reconnection Strategy:**
- Initial attempt: 1 second delay
- Backoff: Exponential with 1.5x multiplier
- Max delay: 30 seconds
- Max attempts: 10 before giving up
- Manual reconnect: User can trigger manual reconnect

### State Synchronization Pattern

```typescript
socket.on('threat_alert', (event: ThreatAlertEvent) => {
  useThreatsStore.getState().addThreat(event.data);
  useSeverityStore.getState().updateSeverity(event.data);
  if (event.data.latitude && event.data.longitude) {
    useMapStore.getState().addMarker({...});
  }
  useStatsStore.getState().incrementThreatCount();
});
```

### Latency Requirements

| Operation | Target Latency |
|-----------|----------------|
| WebSocket Connection | < 2 seconds |
| Event Receipt to UI Update | < 100ms |
| Reconnection Attempt | < 5 seconds |
| Batch Processing | < 16ms (one frame) |
| Store Update | < 50ms |

## 8. UI/UX Design System

### Design Philosophy

**Tactical Dark-Mode Aesthetic:**
- Purpose: Reduce eye strain during extended monitoring sessions
- Aesthetic: Professional, serious, high-contrast interface
- Priorities: Information clarity, rapid threat assessment, quick decision-making

**Low-Fatigue Monitoring:**
- High contrast for text and critical data
- Reduced glare using matte/dark tones
- Optimized typography for readability
- Consistent color coding for threat severity
- Minimal animations to reduce cognitive load
- Balanced information density

### Color Palette

**Base Colors:**
```css
--bg-primary: #0f172a;      /* slate-900 - Main background */
--bg-secondary: #1e293b;    /* slate-800 - Cards, panels */
--bg-tertiary: #334155;     /* slate-700 - Hover states */
--text-primary: #f1f5f9;    /* slate-100 - Primary text */
--text-secondary: #cbd5e1;  /* slate-300 - Secondary text */
--text-muted: #64748b;      /* slate-500 - Muted text */
--border-primary: #334155;  /* slate-700 - Primary borders */
```

**Severity Color System:**
```css
--severity-critical: #dc2626;      /* red-600 */
--severity-high: #ea580c;         /* orange-600 */
--severity-medium: #ca8a04;       /* yellow-600 */
--severity-low: #2563eb;           /* blue-600 */
```

**Semantic Colors:**
```css
--success: #16a34a;                /* green-600 */
--warning: #ca8a04;                /* yellow-600 */
--error: #dc2626;                  /* red-600 */
--info: #0284c7;                   /* sky-600 */
```

### Typography System

**Font Family:**
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Font Sizes:**
```css
--text-xs: 0.75rem;      /* 12px - Labels, captions */
--text-sm: 0.875rem;     /* 14px - Secondary text */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Emphasized text */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Section headings */
--text-3xl: 1.875rem;    /* 30px - Page headings */
```

### Spacing System

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

### Component Design Tokens

**Border Radius:**
```css
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-full: 9999px;
```

**Shadows:**
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

**Transitions:**
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

### Responsive Breakpoints

```css
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
```

**Responsive Behavior:**
| Breakpoint | Sidebar | Grid Columns | Layout |
|------------|---------|--------------|--------|
| < sm | Hidden | 1 column | Stacked |
| sm - md | Collapsed | 1 column | Stacked |
| md - lg | Collapsed | 2 columns | Partial grid |
| lg - xl | Expanded | 2 columns | Full grid |
| > xl | Expanded | 3 columns | Enhanced grid |

### Accessibility Considerations

**Color Contrast:**
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Focus States:**
All interactive elements must have visible focus states:
```css
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

**Keyboard Navigation:**
- Logical tab order through interactive elements
- Skip links for accessibility
- Keyboard shortcuts (Esc to close modals)

**Screen Reader Support:**
- Descriptive ARIA labels
- Semantic HTML elements
- ARIA live regions for dynamic content

## 9. Technology Stack

### Core Technologies
- **Framework:** React 18+ with Next.js 14+
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3.4+
- **State Management:** Zustand 4+
- **Real-Time:** Socket.io-client 4+
- **Data Visualization:** Recharts 2+
- **Maps:** React Leaflet 4+ with Leaflet 1.9+
- **Utilities:** date-fns 3+, clsx 2+, tailwind-merge 2+

### Development Tools
- **Package Manager:** npm or pnpm
- **Linting:** ESLint with TypeScript support
- **Formatting:** Prettier
- **Testing:** Jest, React Testing Library, Playwright
- **Build Tool:** Next.js built-in bundler

### Development Environment
- **Node.js:** v18 or higher
- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 10. Implementation Roadmap

### Phase 1 — Project Setup and Design System (2-3 days)

**Objectives:**
- Initialize Next.js project with TypeScript
- Configure Tailwind CSS with custom dark-mode theme
- Set up project structure and folders
- Configure ESLint and Prettier
- Establish design system tokens

**Completion Criteria:**
- Next.js development server runs without errors
- Tailwind CSS dark-mode works correctly
- TypeScript compilation succeeds
- Base layout renders with header and sidebar
- ESLint and Prettier configured and working

### Phase 2 — State Management and Core Infrastructure (2-3 days)

**Objectives:**
- Implement Zustand stores for state management
- Create TypeScript type definitions
- Set up utility functions and helpers
- Implement custom React hooks

**Completion Criteria:**
- All Zustand stores defined and tested
- TypeScript types cover all data structures
- Utility functions work correctly
- Custom hooks function as expected
- API client can make HTTP requests
- Error boundaries catch and display errors

### Phase 3 — Live Threat Feed (3-4 days)

**Objectives:**
- Build the live threat feed component
- Implement virtual scrolling for performance
- Add filtering and search functionality
- Create threat detail modal

**Completion Criteria:**
- Threat feed displays mock threat data
- Virtual scrolling handles 1000+ items smoothly
- Filtering works by type, severity, and time
- Search returns relevant results
- Detail modal shows complete threat information
- Auto-scroll functions correctly
- Export produces valid CSV/JSON

### Phase 4 — WebSocket Integration (2-3 days)

**Objectives:**
- Implement WebSocket client with socket.io-client
- Create connection management with reconnection logic
- Handle all WebSocket event types
- Integrate WebSocket events with Zustand stores

**Completion Criteria:**
- WebSocket connects to server successfully
- Reconnection logic works on disconnect
- All event types are processed correctly
- Stores update on WebSocket events
- Mock service generates realistic data
- Connection status displays correctly
- Mode switching works between mock and real

### Phase 5 — IP Geolocation Map (3-4 days)

**Objectives:**
- Implement interactive map with React Leaflet
- Add threat markers with severity coloring
- Implement marker clustering
- Create location statistics panel

**Completion Criteria:**
- Map renders with OpenStreetMap tiles
- Markers display with correct colors
- Clustering works at appropriate zoom levels
- Marker popups show threat details
- Map controls function correctly
- Location stats update with data
- Map is responsive to container changes

### Phase 6 — Alert Severity Matrix (2-3 days)

**Objectives:**
- Build severity-based threat grouping
- Create severity trend chart
- Implement severity filtering
- Add visual severity indicators

**Completion Criteria:**
- Threats group correctly by severity
- Severity counts update in real-time
- Trend chart displays correctly
- Filtering integrates with threat feed
- Visual indicators match severity colors
- Click filtering works as expected

### Phase 7 — Telemetry Charts (3-4 days)

**Objectives:**
- Create historical threat data visualizations
- Implement interactive charts with Recharts
- Add time range selection
- Implement chart export functionality

**Completion Criteria:**
- All charts render with data
- Interactive features work (zoom, tooltip)
- Time range selection updates charts
- Export produces valid images
- Charts are responsive
- Loading states display correctly

### Phase 8 — Incident Management Panel (3-4 days)

**Objectives:**
- Build IP blocking/unblocking interface
- Create payload inspector
- Implement incident report generation
- Add bulk actions functionality

**Completion Criteria:**
- IP blocking/unblocking works correctly
- Blocked IPs list displays and filters
- Bulk actions function as expected
- Payload inspector shows complete data
- Report generation produces valid exports
- Audit logging captures all actions
- API integration handles errors gracefully

### Phase 9 — Statistics Dashboard (2-3 days)

**Objectives:**
- Create real-time metrics dashboard
- Implement trend indicators
- Add sparkline charts
- Create quick action buttons

**Completion Criteria:**
- All metrics display correctly
- Trends calculate accurately
- Sparklines render with recent data
- Quick actions navigate correctly
- Real-time updates work
- Metric thresholds trigger alerts

### Phase 10 — Performance Optimization (2-3 days)

**Objectives:**
- Optimize rendering performance
- Implement code splitting
- Add lazy loading
- Optimize WebSocket event processing

**Completion Criteria:**
- Components render in < 16ms
- Bundle size is optimized
- Lazy loading works for heavy components
- Event batching prevents UI freezes
- Performance metrics meet targets
- Initial load time is under 3 seconds

### Phase 11 — Testing and Validation (3-4 days)

**Objectives:**
- Write comprehensive unit tests
- Create integration tests
- Implement E2E tests
- Validate accessibility

**Completion Criteria:**
- Unit tests cover all components
- Integration tests pass
- E2E tests cover critical workflows
- Accessibility tests pass WCAG AA
- Performance tests meet targets
- Test coverage is > 80%

### Phase 12 — Documentation Finalization (2-3 days)

**Objectives:**
- Complete technical documentation
- Create user guides
- Document API integration
- Update README files

**Completion Criteria:**
- All components are documented
- User guide is comprehensive
- API documentation is complete
- Deployment process is documented
- README files are updated
- Troubleshooting guide covers common issues

## 11. Integration Points

### Backend Telemetry Integration
- **WebSocket Server:** Configured via NEXT_PUBLIC_WS_URL
- **Events:** threat_alert, ip_blocked, telemetry_update, connection_status
- **REST API:** Configured via NEXT_PUBLIC_API_URL
- **Endpoints:** /api/v1/telemetry/stats, /api/v1/telemetry/logs, /api/v1/admin/block, /api/v1/admin/unblock

### Core Engine Integration
- Defense thresholds and settings
- Honeytoken configurations
- Tarpit settings
- Threat classifications

## 12. Security Considerations

- Authentication required for admin actions
- Role-based access control for sensitive operations
- Input validation before API calls
- React's built-in XSS protection
- Token-based CSRF protection
- WSS protocol for encrypted WebSocket connections

## 13. Timeline Summary

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Project Setup | 2-3 days | 2-3 days |
| Phase 2: State Management | 2-3 days | 4-6 days |
| Phase 3: Live Threat Feed | 3-4 days | 7-10 days |
| Phase 4: WebSocket Integration | 2-3 days | 9-13 days |
| Phase 5: IP Geolocation Map | 3-4 days | 12-17 days |
| Phase 6: Alert Severity Matrix | 2-3 days | 14-20 days |
| Phase 7: Telemetry Charts | 3-4 days | 17-24 days |
| Phase 8: Incident Management | 3-4 days | 20-28 days |
| Phase 9: Statistics Dashboard | 2-3 days | 22-31 days |
| Phase 10: Performance Optimization | 2-3 days | 24-34 days |
| Phase 11: Testing & Validation | 3-4 days | 27-38 days |
| Phase 12: Documentation | 2-3 days | 29-41 days |

**Total Estimated Duration:** 29-41 days (6-8 weeks)

## 14. Quality Assurance

### Code Quality
- TypeScript strict mode enabled
- ESLint with recommended rules
- Prettier with consistent configuration
- Peer review for all changes

### Testing Coverage
- Unit tests: > 80% coverage for components
- Integration tests: Critical workflows covered
- E2E tests: Main user journeys tested
- Accessibility: WCAG 2.1 AA compliance

### Performance Targets
- Initial load: < 3 seconds
- Time to interactive: < 5 seconds
- Render time: < 16ms per frame
- WebSocket latency: < 100ms event to UI

## 15. Completion Criteria

The SOC dashboard implementation is complete when:

- All 12 implementation phases are completed
- Next.js project builds without errors
- All 6 dashboard components are implemented
- WebSocket integration works with real backend
- Mock WebSocket service functions for testing
- State management is implemented with Zustand
- All components pass unit and integration tests
- E2E tests cover critical user workflows
- Accessibility tests pass WCAG 2.1 AA
- Performance targets are met
- Documentation is complete and up-to-date
- Dashboard integrates with backend telemetry
- Deployment process is documented and tested
