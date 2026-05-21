# Engineering Hierarchy — NURisk v4.0

> Total: **18 Epics** · **176 Features** · **~725 Technical Tasks** · **~2,184 Implementation Steps**
> Derived from: `mainprd.md` (30 sections, 3,647 lines)

---

## E01 — Monorepo & Shared Infrastructure
**PRD Ref**: Sections 4, 5 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 1 week

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Shared Packages (`packages/shared`) | 4 | 12 | — |
| F02 | Monorepo Config (`turbo.json`, `tsconfig.base.json`) | 3 | 9 | — |
| F03 | Types, Enums, DTOs | 5 | 15 | F01 |
| F04 | Zod Validators | 4 | 12 | F03 |
| F05 | CI/CD Foundation (GitHub Actions) | 3 | 9 | F02 |
| F06 | Docker Compose Base | 3 | 9 | — |
| F07 | ESLint, Prettier, Husky | 2 | 6 | F02 |
| F08 | Turborepo Pipeline Definition | 3 | 9 | F01 |

**Total**: 8 Features · 27 Tasks · 81 Steps

---

## E02 — Database & Data Layer
**PRD Ref**: Section 6 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Prisma Schema (35 tables) | 6 | 18 | — |
| F02 | PostGIS Extension + Geometry Columns | 4 | 12 | F01 |
| F03 | Migrations Strategy (introspect → consolidate → deploy) | 3 | 9 | F01 |
| F04 | Seed Data (admin user, regions, disaster types) | 3 | 9 | F03 |
| F05 | TimescaleDB Hypertables (temporal data) | 4 | 12 | F01 |
| F06 | Neo4j / Apache Age Graph Setup | 4 | 12 | F01 |
| F07 | Index Optimization (GiST, B-tree, composite) | 3 | 9 | F02 |
| F08 | Audit Triggers + Soft Delete Middleware | 3 | 9 | F01 |
| F09 | Backup & Restore (PITR, WAL archiving) | 3 | 9 | F03 |
| F10 | Connection Pooling (PgBouncer / Prisma) | 2 | 6 | F01 |

**Total**: 10 Features · 35 Tasks · 105 Steps

---

## E03 — Backend Core Services
**PRD Ref**: Sections 7, 11, 12 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Auth — Login, Register, Password Reset | 5 | 15 | E02.F01 |
| F02 | JWT + RBAC Middleware | 4 | 12 | F01 |
| F03 | Incident CRUD Controller + Service + Repository | 6 | 18 | F02 |
| F04 | Incident State Machine (8 PRD states + guards) | 6 | 26 | F03 |
| F05 | Public Report Submission + PII Shield | 4 | 12 | F03 |
| F06 | Volunteer CRUD | 4 | 12 | F02 |
| F07 | Volunteer Deployment + Missions | 4 | 12 | F06 |
| F08 | GPS Check-in with Geo-fencing Validation | 3 | 9 | F07, E02.F02 |
| F09 | ICS Command Structure (table + assignment API) | 4 | 12 | F03 |
| F10 | Audit Logging Middleware | 3 | 9 | F02 |
| F11 | Error Handling + Standardized Response Format | 3 | 9 | — |
| F12 | Socket.IO Setup + Auth + Room Management | 4 | 12 | F02 |
| F13 | API Versioning Strategy | 4 | 12 | — |
| F14 | Testing Strategy | 4 | 12 | — |

**Total**: 14 Features · 59 Tasks · 193 Steps

---

## E04 — Backend Extended Services
**PRD Ref**: Section 7, 10 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Shelter CRUD + Capacity Management | 4 | 12 | E03.F02 |
| F02 | Warehouse CRUD | 3 | 9 | E03.F02 |
| F03 | Asset Inventory CRUD + QR Code | 5 | 15 | F02 |
| F04 | Asset Transactions (checkin/checkout/transfer) | 5 | 15 | F03 |
| F05 | Logistics Requests (request → approve → fulfill) | 5 | 15 | F03, E03.F03 |
| F06 | Chat Conversations CRUD | 4 | 12 | E03.F02 |
| F07 | Chat Messages + Real-time via Socket.IO | 5 | 15 | F06, E03.F12 |
| F08 | Notifications — In-app + FCM Push | 5 | 15 | E03.F02 |
| F09 | Analytics — Dashboard KPIs, Trends, Reports | 6 | 18 | E03.F03 |
| F10 | Map — GeoJSON, Heatmap, Command Map | 4 | 12 | E02.F02 |
| F11 | Intel & News — Scraped Intelligence Display | 3 | 9 | F10 |
| F12 | Instruction — Surat Perintah CRUD | 4 | 12 | E03.F03 |
| F13 | Success Metrics Tracking | 4 | 12 | F09 |

**Total**: 13 Features · 57 Tasks · 171 Steps

---

## E05 — AI Engine & Scrapers
**PRD Ref**: Section 14 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | BMKG Earthquake Scraper (XML, 1-min) | 4 | 12 | E04.F08 |
| F02 | BMKG Nowcast Scraper (RSS, 30-min) | 3 | 9 | E04.F08 |
| F03 | MAGMA Volcano Scraper (REST, dynamic) | 4 | 12 | E04.F08 |
| F04 | CEVADIS BPBD Scraper (HTML, 30-min) | 3 | 9 | E04.F08 |
| F05 | RSS News Scraper (Antara, Kompas, 60-min) | 3 | 9 | E04.F08 |
| F06 | AI Orchestrator Pipeline (validate→dedup→score→create) | 6 | 18 | F01–F05 |
| F07 | Fake Detection Algorithm (patterns + title + coord check) | 4 | 12 | F06 |
| F08 | Severity Scoring (keyword weighting + level classification) | 4 | 12 | F06 |
| F09 | Probabilistic Models (Poisson, Bayesian, Holt-Winters, ensemble) | 6 | 18 | E02.F01 |
| F10 | Weather Service (OpenWeatherMap integration) | 3 | 9 | — |

**Total**: 10 Features · 40 Tasks · 120 Steps

---

## E06 — AI Operational Agents
**PRD Ref**: Sections 14.6, 14.7 | **Tier**: 2 | **Priority**: HIGH | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Agent Framework (Gemini integration + base class + I/O format) | 5 | 15 | E05.F06 |
| F02 | Risk Analyst Agent (risk score + population estimate) | 4 | 12 | F01 |
| F03 | Situation Summarizer Agent (SITREP generation) | 4 | 12 | F01 |
| F04 | Logistics Planner Agent (supply gap + dispatch plan) | 5 | 15 | F01 |
| F05 | Media Verification Agent (source cross-reference) | 4 | 12 | F01 |
| F06 | Weather Analyst Agent (6h forecast + flood risk) | 3 | 9 | F01 |
| F07 | Public Sentiment Agent (news + social analysis) | 4 | 12 | F01 |
| F08 | Volunteer Coordinator Agent (deployment recommendation) | 4 | 12 | F01 |
| F09 | Executive Briefing Agent (on-demand command brief) | 4 | 12 | F02–F08 |
| F10 | Agent Governance + Audit Trail + Explainability + Bias + HITL | 7 | 21 | F01 |

**Total**: 10 Features · 44 Tasks · 132 Steps

---

## E07 — Decision & Simulation Engine
**PRD Ref**: Section 25 | **Tier**: 2 | **Priority**: HIGH | **Est. Effort**: 3 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Risk Orchestrator (input fusion → decision output) | 5 | 15 | E03.F03 |
| F02 | Evacuation Priority Calculator | 4 | 12 | F01, E02.F02 |
| F03 | Critical Zone Detector | 4 | 12 | F01 |
| F04 | Logistics Distribution Suggester | 4 | 12 | F01, E04.F05 |
| F05 | Resource Health Engine (fatigue, stress, depletion, readiness) | 5 | 15 | F01 |
| F06 | Flood Propagation Simulation (cellular automata + DEM) | 6 | 18 | E02.F02 |
| F07 | Evacuation Routing Simulation (agent-based) | 5 | 15 | F06 |
| F08 | Shelter Overload Simulation (system dynamics) | 4 | 12 | F06 |
| F09 | Logistics Shortage Simulation (Monte Carlo) | 4 | 12 | F06 |
| F10 | Scenario Engine (what-if: flood rise, road block, etc.) | 4 | 12 | F06–F09 |

**Total**: 10 Features · 45 Tasks · 135 Steps

---

## E08 — Knowledge Graph & Temporal Intelligence
**PRD Ref**: Section 26 | **Tier**: 2 | **Priority**: MEDIUM | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Apache Age Extension + Graph Creation | 4 | 12 | E02.F01 |
| F02 | Graph Entity Models (10 node labels) | 5 | 15 | F01 |
| F03 | Graph Relationship Definitions (10 edge types) | 4 | 12 | F02 |
| F04 | Graph Query API (Cypher → REST, proximity, shortest path) | 5 | 15 | F03 |
| F05 | TimescaleDB Hypertables for Incident Temporal | 4 | 12 | E02.F05 |
| F06 | Stream Analytics (real-time incident rate, distribution) | 4 | 12 | F05 |
| F07 | Trend & Anomaly Detection (2σ moving average) | 4 | 12 | F05 |
| F08 | Time-Series Forecast (ARIMA/Prophet-based) | 4 | 12 | F05 |

**Total**: 8 Features · 34 Tasks · 102 Steps

---

## E09 — Operational Playbook & Automation
**PRD Ref**: Section 28 | **Tier**: 2 | **Priority**: MEDIUM | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Playbook Definition Engine (schema + CRUD) | 5 | 15 | E03.F03 |
| F02 | Rule Orchestration (JSON Logic evaluation + execution) | 5 | 15 | F01 |
| F03 | Playbook Execution (step sequencer + dependency resolver) | 5 | 15 | F02 |
| F04 | Automated Escalation (timer-based, timeout → escalate) | 4 | 12 | F03 |
| F05 | Flood Playbook (SOP: alert → dispatch → shelter → escalate) | 4 | 12 | F03 |
| F06 | Earthquake / Volcano Playbook | 4 | 12 | F03 |

**Total**: 6 Features · 27 Tasks · 81 Steps

---

## E10 — Situational Awareness & Trust Intelligence
**PRD Ref**: Section 27 | **Tier**: 2 | **Priority**: MEDIUM | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Tactical Awareness Layer (live feed, real-time map snapshot) | 4 | 12 | E03.F03 |
| F02 | Operational Awareness Layer (shift summary, resource health) | 4 | 12 | F01 |
| F03 | Strategic Awareness Layer (trends, comparisons, trajectory) | 4 | 12 | F02 |
| F04 | Executive Briefing API (1-page command brief) | 3 | 9 | F03, E06.F09 |
| F05 | Trust Score Engine (source × corroboration × history × geo × AI) | 5 | 15 | — |
| F06 | Source Reliability Database (reputation per source) | 3 | 9 | F05 |
| F07 | Verification Pipeline (automated confidence assessment) | 4 | 12 | F05 |
| F08 | Media Forensics (EXIF, Error Level Analysis) | 4 | 12 | F05 |
| F09 | Deepfake Detection (Gemini Vision + CNN) | 4 | 12 | F05 |
| F10 | AI Factual Check (Gemini cross-verification) | 3 | 9 | F05 |

**Total**: 10 Features · 38 Tasks · 114 Steps

---

## E11 — Resilient & Offline Architecture
**PRD Ref**: Section 15, 29.2 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Degraded Mode Client (local SQLite/IndexedDB fallback) | 5 | 15 | E13.F11 |
| F02 | Delta Sync Engine (versioned changes, idempotent replay) | 5 | 15 | F01 |
| F03 | Conflict Resolution (last-write-wins, server-authoritative) | 4 | 12 | F02 |
| F04 | Mesh Networking P2P (WiFi Direct / BLE relay) | 5 | 15 | F01 |
| F05 | Edge Node Server (RPi/Intel NUC at PCNU offices) | 5 | 15 | E03 |
| F06 | Local SQLite Cache (all entity types, capped retention) | 4 | 12 | F01 |
| F07 | Offline Queue Persistence (queue table + retry logic) | 4 | 12 | F01 |
| F08 | Reconnection + Recovery (auto-flush, state restoration) | 3 | 9 | F02 |

**Total**: 8 Features · 35 Tasks · 105 Steps

---

## E12 — Disaster UX
**PRD Ref**: Section 29.1 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 1.5 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Emergency Mode UI (one-tap activation, giant buttons) | 4 | 12 | E13.F01 |
| F02 | Voice-First Reporting (speech-to-text + Gemini NLU) | 5 | 15 | F01 |
| F03 | Panic Button Widget (home screen widget, instant alert) | 4 | 12 | F01 |
| F04 | One-Hand Operation (bottom-sheet, thumb-reachable) | 3 | 9 | F01 |
| F05 | Minimal Interaction Flow (pre-fill, smart defaults) | 4 | 12 | F01 |
| F06 | Giant Button Layout (high contrast, large touch targets) | 3 | 9 | F01 |
| F07 | Session Auto-Recovery (crash restore, form state save) | 3 | 9 | F01 |
| F08 | Offline Indicator Banner (status + queue count) | 2 | 6 | F01 |

**Total**: 8 Features · 28 Tasks · 84 Steps

---

## E13 — Frontend Web (React 19 PWA)
**PRD Ref**: Section 8 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 3 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Project Scaffold (Vite + React 19 + TypeScript + Tailwind) | 3 | 9 | E01.F01 |
| F02 | shadcn/ui Component Library Setup | 3 | 9 | F01 |
| F03 | React Router 7 Route Tree (public + auth + admin) | 4 | 12 | F01 |
| F04 | TanStack Query Integration (queries, mutations, invalidation) | 4 | 12 | F01 |
| F05 | Zustand State Stores (auth, incident, UI) | 3 | 9 | F01 |
| F06 | Public Dashboard (KPIs, weather, alerts, disaster cards, trends) | 6 | 18 | F04 |
| F07 | Map Page (Leaflet + incident markers + WMS tile layers) | 5 | 15 | F04, E02.F02 |
| F08 | Report Page + Panic Button (emergency mode form) | 4 | 12 | F04 |
| F09 | Auth Pages (login + register + password reset) | 3 | 9 | F04 |
| F10 | Admin Command Center (ICS, chat, analytics, situational) | 6 | 18 | F04 |
| F11 | PWA + Offline Configuration (Workbox, service worker) | 4 | 12 | F01 |
| F12 | Socket.IO Client Integration (events + real-time updates) | 4 | 12 | F04, E03.F12 |

**Total**: 12 Features · 49 Tasks · 147 Steps

---

## E14 — Flutter Mobile APK
**PRD Ref**: Section 9 | **Tier**: 1 | **Priority**: HIGH | **Est. Effort**: 3 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Complete All Stub Repository Implementations | 6 | 18 | — |
| F02 | Connect All BLoCs to New Backend API | 5 | 15 | F01 |
| F03 | SQLite Offline Cache (drift/sqflite for all entities) | 5 | 15 | F01 |
| F04 | Sync Engine + Offline Queue (retry, conflict, idempotent) | 5 | 15 | F03 |
| F05 | FCM Push Notifications (foreground + background + data) | 4 | 12 | F01 |
| F06 | Flutter Map + Offline Tile Caching | 4 | 12 | F01 |
| F07 | PDF SITREP Generation (pdf + printing) | 4 | 12 | F01 |
| F08 | QR Code Scanner (asset management) | 3 | 9 | F01 |
| F09 | Degraded Mode (offline UI, local-first operations) | 4 | 12 | F03 |
| F10 | Mesh P2P (WiFi Direct / BLE for offline data relay) | 5 | 15 | F03 |

**Total**: 10 Features · 45 Tasks · 135 Steps

---

## E15 — MLOps & Observability
**PRD Ref**: Sections 23, 24 | **Tier**: 1 (Observability), 2 (MLOps) | **Est. Effort**: 2 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | ML Models Registry (`ml_models` CRUD) | 4 | 12 | E02.F01 |
| F02 | Model Versions & Lineage (`model_versions`) | 4 | 12 | F01 |
| F03 | Model Metrics Tracking (`model_metrics`) | 3 | 9 | F01 |
| F04 | Prediction Logging (`prediction_logs`) | 4 | 12 | F01 |
| F05 | Training Jobs Pipeline (`training_jobs`) | 4 | 12 | F01 |
| F06 | Feature Store Registry (`feature_store`) | 3 | 9 | F01 |
| F07 | OpenTelemetry Collector (traces + metrics + logs) | 5 | 15 | E04 |
| F08 | Prometheus Metrics Export (custom metrics) | 4 | 12 | F07 |
| F09 | Grafana Dashboards (6 dashboards + alert rules) | 5 | 15 | F08 |
| F10 | Sentry Error Tracking (backend + frontend + Flutter) | 3 | 9 | E04 |

**Total**: 10 Features · 39 Tasks · 117 Steps

---

## E16 — Security & Federation
**PRD Ref**: Sections 16, 30 | **Tier**: 1 (Security), 3 (Federation) | **Est. Effort**: 2.5 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | PII Shield Middleware (global response stripping) | 4 | 12 | E03.F02 |
| F02 | RBAC Role Enforcement (route-level + region-scoped) | 4 | 12 | E03.F02 |
| F03 | Rate Limiting + WAF (global + burst + auth endpoints) | 3 | 9 | E04 |
| F04 | File Upload Security (type whitelist, size limit, ClamAV) | 4 | 12 | E04 |
| F05 | Infrastructure Hardening (TLS 1.3, secrets, container scan) | 5 | 15 | — |
| F06 | CAP / EDXL Interoperability Standards | 5 | 15 | E03.F03 |
| F07 | Federation Gateway (OAuth2/SAML, tenant isolation) | 5 | 15 | F06 |
| F08 | Cross-Agency Sync (webhook + push-based incident sharing) | 4 | 12 | F07 |
| F09 | Multi-Region Disaster Recovery (active-passive replication) | 5 | 15 | E15.F08 |
| F10 | PITR Backup + Failover (WAL archiving, DNS failover) | 4 | 12 | F09 |
| F11 | Security Incident Response | 5 | 15 | F03 |

**Total**: 11 Features · 48 Tasks · 144 Steps

---

## E17 — Geospatial Platform & Digital Twin
**PRD Ref**: Section 22 | **Tier**: 2 | **Priority**: MEDIUM | **Est. Effort**: 3 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | OGC Standards & WMS/WFS Service (GeoServer, WMS, WFS, STAC) | 4 | 12 | E02.F02 |
| F02 | GeoJSON API Endpoints (30+ spatial endpoints) | 5 | 15 | F01 |
| F03 | Tile Serving Middleware (raster + MVT, tile caching) | 4 | 12 | F01 |
| F04 | Satellite Imagery Ingestion (Sentinel/Landsat pipeline) | 5 | 15 | E02 |
| F05 | Digital Twin Data Flow (sensor ingestion, 3D models, state sync) | 5 | 15 | F03 |
| F06 | Elevation & Terrain Analysis (DEM, slope, watershed) | 4 | 12 | E02.F02 |
| F07 | Geocoding & Reverse Geocoding | 4 | 12 | E02.F02 |
| F08 | Spatial Query API (intersection, containment, buffer, nearest) | 4 | 12 | F01 |
| F09 | Map Style & Visualization (layer management, color-ramp) | 4 | 12 | F03 |
| F10 | Digital Twin Visualization (WebGL, 3D overlay, time-slider) | 4 | 12 | F05 |

**Total**: 10 Features · 43 Tasks · 129 Steps

---

## E18 — Disaster Lifecycle Management
**PRD Ref**: Section 30.3 | **Tier**: 3 | **Priority**: MEDIUM | **Est. Effort**: 2.5 weeks

| Code | Feature | Tasks | Steps | Depends On |
|------|---------|-------|-------|------------|
| F01 | Risk Assessment & Prevention (hazard mapping, vulnerability) | 4 | 12 | E02.F01 |
| F02 | Preparedness & Readiness (drills, training, stockpile) | 4 | 12 | E03.F03 |
| F03 | Recovery & Rehabilitation Tracking | 4 | 12 | E03.F03 |
| F04 | Economic Impact Assessment (loss by sector, relief calc) | 4 | 12 | F03 |
| F05 | Mitigation & Resilience Analytics (hardening, policy) | 4 | 12 | E02 |
| F06 | Climate Adaptation & Long-term Resilience | 4 | 12 | F05 |
| F07 | Disaster Lifecycle Dashboard (cross-phase overview) | 4 | 12 | F01–F06 |
| F08 | Recovery Resource Mobilization (funding, donor tracking) | 4 | 12 | F03 |

**Total**: 8 Features · 32 Tasks · 96 Steps

---

## Summary Totals

| Epic | Features | Tasks | Steps | Tier |
|------|----------|-------|-------|------|
| E01 — Monorepo & Shared | 8 | 27 | 81 | 1 |
| E02 — Database & Data Layer | 10 | 35 | 105 | 1 |
| E03 — Backend Core | 14 | 59 | 193 | 1 |
| E04 — Backend Extended | 13 | 57 | 171 | 1 |
| E05 — AI Engine & Scrapers | 10 | 40 | 120 | 1 |
| E06 — AI Operational Agents | 10 | 44 | 132 | 2 |
| E07 — Decision & Simulation | 10 | 45 | 135 | 2 |
| E08 — Knowledge Graph & Temporal | 8 | 34 | 102 | 2 |
| E09 — Playbook & Automation | 6 | 27 | 81 | 2 |
| E10 — Situational Awareness & Trust | 10 | 38 | 114 | 2 |
| E11 — Resilient & Offline | 8 | 35 | 105 | 1 |
| E12 — Disaster UX | 8 | 28 | 84 | 1 |
| E13 — Frontend Web React | 12 | 49 | 147 | 1 |
| E14 — Flutter Mobile APK | 10 | 45 | 135 | 1 |
| E15 — MLOps & Observability | 10 | 39 | 117 | 1/2 |
| E16 — Security & Federation | 11 | 48 | 144 | 1/3 |
| E17 — Geospatial & Digital Twin | 10 | 43 | 129 | 2 |
| E18 — Disaster Lifecycle Management | 8 | 32 | 96 | 3 |
| **TOTAL** | **176** | **725** | **2,184** | — |

**Verification against target:**
- ✅ Epics: 18 (target 12–18)
- ✅ Features: 176 (target 120–180)
- ✅ Tasks: 725 (target 450–900)
- ✅ Steps: 2,184 (target 1,500+)

---

## Phase Mapping (Build Order)

| Tier | Epics | Weeks | Features | Tasks | Steps |
|------|-------|-------|----------|-------|-------|
| **Tier 1 — Foundation** | E01, E02, E03, E04, E05, E11, E12, E13, E14, E15(obs), E16(sec) | 1–6 | 104 | 424 | 1,282 |
| **Tier 2 — High-End** | E06, E07, E08, E09, E10, E15(ml), E17 | 7–12 | 56 | 222 | 666 |
| **Tier 3 — National** | E16(fed), E18 | 13–16 | 16 | 72 | 216 |

---

## Dependency Graph (Critical Path)

```
                ┌──────────────────────────────────────┐
                │        E17 (Digital Twin)            │
                │  Depends: E02, runs parallel to E06  │
                └──────────────────────────────────────┘

E01 ──▶ E02 ──▶ E03 ──▶ E04 ──▶ E05 ──▶ E06 ──▶ E07 ──▶ E17
                  │        │        │        │        │
                  │        │        ├────────┤        │
                  │        │        │        ▼        ▼
                  │        │        │      E08      E09
                  │        │        │                 │
                  │        │        ▼                 ▼
                  │        │      E10               E15
                  │        │
                  ▼        ▼
               E11 ──▶ E12 ──▶ E13 ──▶ E14 ──▶ E16 ──▶ E18
                                       │
                                       ▼
                                     E18 (Lifecycle)
```

**Critical Path**: E01 → E02 → E03 → E04 → E05 → E06 → E07 → E09
**Parallel Tracks**: E12 (UX) starts with E13; E15 starts after E04; E17 runs parallel to E06–E10; E18 is last after E16

