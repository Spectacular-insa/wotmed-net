# ?? Wotmed-Net (????-??) 
 
 
**Wotmed-Net** is an advanced application-layer active defense middleware and honeypot system[cite: 1, 2]. It transforms standard web applications into interactive defense perimeters that intercept anomalous traffic, trap threat actors using zero-latency canary tokens, and stream telemetry live to a tactical SOC dashboard[cite: 1, 2]. 
 
--- 
 
## ?? Key Features 
 
- **?? Real-Time Telemetry Streaming**: High-performance bi-directional WebSockets dispatch threat events and payload logs to the SOC dashboard under 100ms[cite: 2]. 
- **?? Comprehensive Forensic Auditing**: Logs threat metadata, payload hashes, and request paths to Supabase and MySQL backends[cite: 2]. 
- **?? Automated Red Team Probing**: Integrated script testing frameworks designed to simulate SQL injection, XSS, and directory traversal[cite: 2]. 
 
--- 
 
## ??? Technology Stack 
 
 
- **Tailwind CSS**: Tactical dark-mode styling optimized for security analysts[cite: 2]. 
 
--- 
 
 
- **Biruk Zelalem Yohannes**: Tactical Dark-Mode SOC Dashboard UI (`soc-dashboard/`)[cite: 1] 
 
--- 
 
## ?? Repository Structure 
 
- `docs/proposal/` - Individual domain proposals and specifications[cite: 1] 
- `docs/tech-stack.md` - Full technology stack definition[cite: 2] 
- `core-engine/` - Middleware interception and signature evaluation[cite: 1] 
- `backend-telemetry/` - Ingestion pipelines and WebSocket sync[cite: 1] 
- `soc-dashboard/` - React tactical threat operations UI[cite: 1] 
- `demo-app/` - Multi-tier reference application with traps[cite: 1] 
- `security-tests/` - Automated attack simulation scripts[cite: 1] 
