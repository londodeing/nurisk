# PRD NURisk v4.0 — Fullstack Rebuild
## Single Database · Single Backend · Dual Frontend (React + Flutter)

**Project**: NURisk — PUSDATIN NU Peduli Jawa Tengah
**Version**: 4.0 | **Status**: Final-SST | **Date**: 2026-05-12
**Philosophy**: *Build the brain (backend) before the face (frontend). Data model correctness saves thousands of lines of refactor.*

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis & Critical Issues](#2-current-state-analysis--critical-issues)
3. [Target System Architecture](#3-target-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Project Structure (Monorepo)](#5-project-structure-monorepo)
6. [Database Schema (PostgreSQL + PostGIS)](#6-database-schema-postgresql--postgis)
7. [Backend Architecture (TypeScript)](#7-backend-architecture-typescript)
8. [Frontend Web Architecture (React 19)](#8-frontend-web-architecture-react-19)
9. [Frontend APK Architecture (Flutter)](#9-frontend-apk-architecture-flutter)
10. [API Contract & Versioning](#10-api-contract--versioning)
11. [State Machine & Business Logic](#11-state-machine--business-logic)
12. [Authentication & RBAC](#12-authentication--rbac)
13. [Real-time & Socket.IO](#13-real-time--socketio)
14. [AI Engine & Scraper System](#14-ai-engine--scraper-system)
15. [Offline-First Strategy](#15-offline-first-strategy)
16. [Security Requirements](#16-security-requirements)
17. [Testing Strategy](#17-testing-strategy)
18. [CI/CD Pipeline](#18-cicd-pipeline)
19. [Docker & Deployment](#19-docker--deployment)
20. [Success Metrics](#20-success-metrics)
21. [Build Order & Milestones](#21-build-order--milestones)
22. [Disaster Digital Twin & Geospatial Platform](#22-disaster-digital-twin--geospatial-platform)
23. [MLOps System](#23-mlops-system)
24. [OpenTelemetry & Observability Stack](#24-opentelemetry--observability-stack)
25. [Decision Engine & Simulation Platform](#25-decision-engine--simulation-platform)
26. [Knowledge Graph & Temporal Intelligence](#26-knowledge-graph--temporal-intelligence)
27. [Situational Awareness & Trust Intelligence](#27-situational-awareness--trust-intelligence)
28. [Operational Playbook & Automation](#28-operational-playbook--automation)
29. [Disaster UX & Resilient Architecture](#29-disaster-ux--resilient-architecture)
30. [Federated Ecosystem & Full Lifecycle Platform](#30-federated-ecosystem--full-lifecycle-platform)

---

## 1. Executive Summary

### 1.1 Strategic Vision — From Application to Operational Intelligence Infrastructure

NURisk is currently a modern disaster management platform with strong geospatial awareness, AI integration, real-time capability, and mature domain modeling. However, it remains fundamentally a **software application** — it manages data, displays dashboards, and processes reports.

The target is to evolve into an **Operational Intelligence Infrastructure** — a system that manages decisions, coordination, and operational resilience, not just data. The ultimate vision is a **Resilient National Disaster Operating System**.

```
Evolution Path:
  Disaster Reporting Application
    → National Disaster Intelligence Platform
      → Operational Coordination Infrastructure
        → Resilient National Disaster Operating System
```

### 1.2 Product Transformation Roadmap

| Level | Current State | Target State |
|-------|--------------|--------------|
| Paradigm | Software application | Operational intelligence infrastructure |
| Reports | Data management | Decision orchestration |
| Monitoring | Reactive dashboards | Predictive simulation platform |
| AI | Scoring + dedup + forecast | AI operational agents with executive briefing |
| Resource | Static CRUD logistics | Dynamic resource intelligence |
| Data model | Relational tables | Knowledge graph + temporal intelligence |
| Architecture | Single cloud app | Federated multi-agency + edge + offline mesh |
| Lifecycle | Response-focused | Full: prevention → preparedness → response → recovery → mitigation → adaptation |
| UX | Normal UI | Disaster UX: emergency mode, voice-first, minimal interaction |
| Trust | No verification pipeline | Trust score engine + media forensics + deepfake detection |

### 1.3 Technology Stack (Target v4.0)

| Component | Tech |
|-----------|------|
| Backend | Node.js/Express **TypeScript**, **Prisma ORM**, PostGIS |
| Web Frontend | React 19 **TypeScript**, Vite, TanStack Query, shadcn/ui |
| Mobile APK | Flutter BLoC (full implementation) |
| Primary Database | PostgreSQL 15 + **PostGIS** + **pgvector** |
| Time-Series Database | **TimescaleDB** (temporal intelligence, stream analytics) |
| Graph Database | **Apache Age** or **Neo4j** (knowledge graph, geo-semantic relationships) |
| Real-time | Socket.IO + Redis adapter |
| AI/Scraper | Gemini-enhanced orchestrator + 8 AI operational agents |
| Simulation | Agent-based simulation engine + flood propagation models |
| Message Broker | Redis Streams / BullMQ |
| Observability | OpenTelemetry + Prometheus + Grafana + Loki + Tempo + Sentry |
| CI/CD | Full pipeline: lint → test → build → deploy + Trivy + truffleHog |
| Monorepo | **Turborepo** with shared packages |

### 1.4 Key Metrics (Target)
- API response < 500ms P95
- Verification cycle: REPORTED → VERIFIED < 2 hours
- Offline queue sync < 30s after reconnection
- Test coverage > 80% backend, > 60% frontend
- Zero PII leaks (audited DTO layer)
- Simulation accuracy > 85% vs real outcomes
- AI agent factual accuracy > 97%
- Playbook execution success rate > 90%
- Degraded mode uptime during network loss > 95%
- Trust score engine false positive rate < 2%

---

## 2. Current State Analysis & Critical Issues

### 2.1 Architectural Debt

| # | Issue | Location | Severity | Fix |
|---|-------|----------|----------|-----|
| 1 | **Dual Backend** — `server.js` and `app.js` have diverged schemas, routes exist in one but not the other | `backend/server.js`, `backend/src/app.js` | 🔴 KRITIS | Single entry point, consolidated schema |
| 2 | **Raw SQL everywhere** — No ORM, no migration system, manual schema sync | All controllers | 🔴 KRITIS | Prisma ORM with migrations |
| 3 | **No TypeScript** — Backend is JS (no type safety, no IDE support) | All backend files | 🔴 KRITIS | Full TypeScript migration |
| 4 | **Auth gaps** — `shelterRoutes`, `logisticsRoutes` missing auth middleware | Backend routes | 🔴 KRITIS | Route-level auth guard |
| 5 | **.env exposed** — Committed to git with production secrets | `backend/.env` | 🔴 KRITIS | `.env` → `.env.example` only, rotate secrets |
| 6 | **PII exposure** — Public APIs return `whatsapp_number` of reporters | `reportController`, `incidentController` | 🔴 KRITIS | DTO layer strips PII |
| 7 | **Schema fragmentation** — `asset_transactions` has different columns in `server.js` vs `app.js` | Both entry points | 🟠 HIGH | Single source of truth |
| 8 | **No testing** — 0% coverage across all components | Entire project | 🟠 HIGH | Vitest (backend), Playwright (web), bloc_test (Flutter) |
| 9 | **Monorepo sprawl** — 4 independent projects, no shared config | Root | 🟠 HIGH | Turborepo with shared packages |
| 10 | **Flutter stubs** — Many BLoCs, repos, datasources are `UnimplementedError` | `frontend-apk/lib/` | 🟠 HIGH | Full implementation |
| 11 | **Old React patterns** — No TS, no router, Capacitor mixed into web SPA | `frontend/` | 🟠 MEDIUM | React 19 + TypeScript + React Router |
| 12 | **nurisk-react is mock-only** — Static hardcoded data, no API integration | `nurisk-react/` | 🟠 MEDIUM | Proper data fetching via TanStack Query |

### 2.2 Schema Drift Between server.js & app.js

| Table | server.js | app.js | Impact |
|-------|-----------|--------|--------|
| `users` | `CHECK (role IN ('PWNU','PCNU','RELAWAN','RELAWAN_ADMIN','SUPER_ADMIN'))` | No CHECK, free text | Invalid roles possible in app.js |
| `incidents` | `status CHECK (6 values)` | No CHECK | Invalid statuses can be inserted |
| `asset_transactions` | No `to_warehouse_id`, no `to_region` | HAS both columns | Transfer feature broken in server.js |
| `volunteer_schedules` | `shift_start TIME WITHOUT TIME ZONE` | `shift_start TIME` | Subtle timezone handling difference |
| `volunteer_performance` | `rating CHECK (0-5)` | No CHECK | Invalid ratings possible |
| `asset_inventories` | `quantity CHECK (>= 0)` | No CHECK | Negative stock possible |
| `intel_news` | `severity CHECK` + `ai_confidence CHECK (0-1)` | No CHECK | Invalid data in app.js |

### 2.3 What to Keep (Don't Rewrite What Works)
- **Flutter APK BLoC patterns** — architecture is solid, just needs implementation
- **Scraper/AI engine logic** — `scraper.js` (BMKG, MAGMA, CEVADIS, RSS), `ai_orchestrator.js` (dedup, fake detection, severity scoring algorithm), `probabilisticModels.js` (Poisson MLE, Bayesian, Holt-Winters) — all port to TypeScript
- **Database schema design** — Core 35 tables (29 existing + 6 ML/Ops tables) are well-designed, just need PostGIS migration + consolidation
- **GeoJSON data** — `jateng-kabupaten.geojson` with 35 Central Java region boundaries
- **Socket.IO event patterns** — `emergency_broadcast`, `new_message`, `notification` patterns are sound
- **PDF SITREP generation** — `analyticsController.js:generateSITREP` has correct format with header, incident info table, damage assessment, timeline, resources
- **Building assessment 6-step wizard** — resilience scoring algorithm in `warehouseController.js`
- **AI scoring formula** — weighted severity calculator in `incidentController.js:calculateAIScore` with 5 damage categories

---

## 3. Target System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                            │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐          │
│  │   React Web (PWA)       │  │   Flutter Mobile (Android/iOS)           │          │
│  │   Emergency Mode UI     │  │   Voice-First · One-Hand · Panic Button │          │
│  │   Situational Awareness │  │   Offline Mesh · Degraded Mode          │          │
│  └──────────┬──────────────┘  └──────────────────┬───────────────────────┘          │
│             │ HTTP/WS/SSE                         │ HTTP/WS/SSE                      │
├─────────────┼────────────────────────────────────┼──────────────────────────────────┤
│             ▼                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                     SITUATIONAL AWARENESS LAYER                              │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────────┐  │   │
│  │  │  Tactical      │ │  Operational   │ │  Strategic     │ │  Executive   │  │   │
│  │  │  Awareness     │ │  Awareness     │ │  Awareness     │ │  Briefing    │  │   │
│  │  │  (Real-time    │ │  (Shift-level  │ │  (Daily/Weekly │ │  (Command    │  │   │
│  │  │   incidents)   │ │   ops status)  │ │   trends)      │ │   summary)   │  │   │
│  │  └────────────────┘ └────────────────┘ └────────────────┘ └──────────────┘  │   │
│  └──────────────────────────────────┬──────────────────────────────────────────┘   │
│                                     │                                               │
│  ┌──────────────────────────────────▼──────────────────────────────────────────┐   │
│  │                     API GATEWAY (Nginx)                                      │   │
│  │  SSL termination · Rate limiting · CORS · Static files · Gzip · WAF         │   │
│  │  CAP/EDXL gateway · Federation proxy · Interoperability adapter              │   │
│  └──────────────────────────────────┬──────────────────────────────────────────┘   │
│                                     │                                               │
│  ┌──────────────────────────────────▼──────────────────────────────────────────┐   │
│  │                     DECISION & INTELLIGENCE LAYER                             │   │
│  │                                                                              │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │   │
│  │  │ Decision     │ │ Simulation   │ │ Resource     │ │ Playbook         │   │   │
│  │  │ Engine       │ │ Engine       │ │ Intelligence │ │ Engine           │   │   │
│  │  │ (Risk Orch.) │ │ (Flood/Evac) │ │ (Optimizer)  │ │ (SOP Automation) │   │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘   │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │   │
│  │  │ Knowledge    │ │ Trust        │ │ AI Agent     │ │ Scenario         │   │   │
│  │  │ Graph        │ │ Intelligence │ │ Orchestrator │ │ Engine (What-If) │   │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘   │   │
│  └──────────────────────────────────┬──────────────────────────────────────────┘   │
│                                     │                                               │
│  ┌──────────────────────────────────▼──────────────────────────────────────────┐   │
│  │                     SERVICE LAYER (Node.js/Express/TypeScript)               │   │
│  │                                                                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ ┌──────────┐   │   │
│  │  │ Auth     │ │Incident  │ │Volunteer │ │ Geo/Map Service  │ │ Shelter  │   │   │
│  │  │ Service  │ │Service   │ │Service   │ │ (PostGIS+WMS)    │ │ Service  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ └──────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ ┌──────────┐   │   │
│  │  │Warehouse │ │Logistics │ │ Notif    │ │ Chat/Broadcast   │ │Intel/News│   │   │
│  │  │Service   │ │Service   │ │ Service  │ │ Service          │ │ Service  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ └──────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                                     │   │
│  │  │Analytics │ │ Recovery │ │ Economic │                                     │   │
│  │  │Service   │ │ Service  │ │ Impact   │                                     │   │
│  │  └──────────┘ └──────────┘ └──────────┘                                     │   │
│  └──────────────────────────────────┬──────────────────────────────────────────┘   │
│                                     │                                               │
│  ┌──────────────────────────────────┼──────────────────────────────────────────┐   │
│  │            DATA LAYER            │        MIDDLEWARE LAYER                   │   │
│  │  ┌──────────────┐ ┌───────────┐ │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │
│  │  │ PostgreSQL   │ │TimescaleDB│ │  │  Redis 7 │ │  MinIO   │ │  Neo4j/  │ │   │
│  │  │ + PostGIS    │ │ (Temporal │ │  │ (Cache,  │ │  (S3)    │ │ Apache   │ │   │
│  │  │ + pgvector   │ │  Stream)  │ │  │  Session,│ │ (Photos, │ │ Age (KG) │ │   │
│  │  │              │ │           │ │  │  Pub/Sub)│ │  PDFs)   │ │          │ │   │
│  │  └──────────────┘ └───────────┘ │  └──────────┘ └──────────┘ └──────────┘ │   │
│  └─────────────────────────────────┴──────────────────────────────────────────┘   │
│                                     │                                               │
│  ┌─────┬───────────────┬────────────┼───────────────┬───────────────┬──────────┐  │
│  │     ▼               ▼            ▼               ▼               ▼          │  │
│  │ ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────┐    │  │
│  │ │BMKG API │ │MAGMA API  │ │OpenWeather│ │Gemini AI    │ │ Sentinel Hub │    │  │
│  │ │(EQ/WS)  │ │(Volcano)  │ │  Map      │ │(Agents+LLM) │ │ (Satellite)  │    │  │
│  │ └─────────┘ └───────────┘ └──────────┘ └─────────────┘ └──────────────┘    │  │
│  │ ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────┐    │  │
│  │ │BPBD     │ │Portal Data│ │RSS News  │ │Telkomsel    │ │ PetaBencana  │    │  │
│  │ │Jateng   │ │Jateng     │ │(Antara)  │ │(Cellular)   │ │ (Flood)      │    │  │
│  │ └─────────┘ └───────────┘ └──────────┘ └─────────────┘ └──────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Strategic Architecture Layers

| Layer | Purpose | Key Components |
|-------|---------|----------------|
| **Client Layer** | Multi-platform access with disaster-grade UX | React PWA (emergency mode), Flutter (voice-first, panic button), offline mesh sync |
| **Situational Awareness Layer** | Understand conditions, impacts, changes, and what will happen | Tactical (real-time), Operational (shift-level), Strategic (trends), Executive (command summary) |
| **API Gateway** | Secure entry point with interoperability | Nginx + WAF, CAP/EDXL adapter, federation proxy, rate limiting |
| **Decision & Intelligence Layer** | Operational intelligence engines | Decision Engine, Simulation Engine, Resource Intelligence, Playbook Engine, Knowledge Graph, Trust Intelligence, AI Agent Orchestrator, Scenario Engine |
| **Service Layer** | Core business logic | Auth, Incident, Volunteer, Geo/Map, Shelter, Warehouse, Logistics, Notification, Chat, Analytics, Recovery, Economic Impact |
| **Data Layer** | Multi-model persistence | PostgreSQL + PostGIS + pgvector, TimescaleDB (time-series), Neo4j/Apache Age (knowledge graph), Redis (cache/pubsub), MinIO (S3) |
| **External Integrations** | Data sources and agency feeds | BMKG, MAGMA, OpenWeatherMap, Gemini, Sentinel Hub, BPBD Jateng, Portal Data Jateng, RSS News, Telkomsel, PetaBencana |

### 3.2 Data Flow (Write Path) 
```
Public/Scraper → API Gateway → Auth Middleware → Express Router
  → Controller (thin, validates request) → Service (business logic)
    → Repository (Prisma/DB access) → DTO Mapper → Response
      → Socket.IO broadcast (real-time) → FCM/Local notification
```

### 3.2 Data Flow (Read Path)
```
Client → API Gateway → Auth Middleware → Controller
  → Service → Cache Check (Redis)
    → Hit: return cached DTO
    → Miss: Repository → Prisma → DTO Mapper → Cache Set → Response
```

---

## 4. Technology Stack

### 4.1 Backend
| Category | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Node.js 20 LTS | Mature ecosystem, team familiarity |
| Language | TypeScript 5.x | Type safety, IDE support, self-documenting |
| Framework | Express 4.x (with async error handling) | Proven, lightweight, replaceable |
| ORM | Prisma 6.x | Type-safe queries, migrations, PostGIS support |
| Validation | Zod | Runtime + compile-time schema validation |
| Auth | JWT (jsonwebtoken) + bcryptjs | Same as current, stateless |
| Realtime | Socket.IO 4.x + Redis adapter | Horizontal scaling |
| Job Queue | BullMQ + Redis | PDF generation, bulk notifications |
| File Upload | Multer → MinIO (S3) | Scalable storage |
| API Docs | Swagger/OpenAPI 3.0 (via swagger-jsdoc) | Self-documenting |
| Testing | Vitest + Supertest | Fast, TypeScript-native |
| Logging | Pino | Structured JSON, low overhead |
| Job Queue | BullMQ + Redis | Event-driven background processing |
| Time-Series DB | TimescaleDB extension for PostgreSQL | Temporal intelligence, stream analytics, trend analysis |
| Graph DB | Neo4j or Apache Age (PostgreSQL extension) | Knowledge graph, geo-semantic relationships |
| Simulation | Custom agent-based simulation engine + flood propagation models | Predictive operational simulation |
| AI Agents | Gemini Pro + custom agent framework | 8 specialized AI operational agents |
| GraphQL (optional) | Apollo Server for knowledge graph queries | Flexible data querying |

### 4.2 Frontend Web
| Category | Choice | Rationale |
|----------|--------|-----------|
| Framework | React 19 | Latest stable, concurrent features |
| Language | TypeScript 5.x | Type safety |
| Build | Vite 8.x | Fast HMR, optimized builds |
| Routing | React Router 7.x | Standard, loader/action pattern |
| Data Fetching | TanStack Query (React Query) 5.x | Caching, refetch, mutations |
| State Management | Zustand 5.x | Lightweight, no boilerplate |
| Styling | Tailwind CSS v4 | Utility-first, consistent |
| UI Library | shadcn/ui (Radix primitives) | Accessible, customizable, tree-shakeable |
| Map | react-leaflet + Leaflet | OpenStreetMap, free |
| Charts | Recharts 2.x | Composable, React-native |
| PWA | vite-plugin-pwa | Offline support, installable |
| Forms | React Hook Form + Zod | Performant, validated |
| Testing | Vitest + Testing Library | Component + integration tests |
| E2E | Playwright | Cross-browser, reliable |

### 4.3 Frontend APK (Flutter)
| Category | Choice | Rationale |
|----------|--------|-----------|
| Framework | Flutter 3.x | Cross-platform mobile |
| Language | Dart 3.x | Sound null safety, patterns |
| State Management | flutter_bloc 8.x + equatable | Proven, testable |
| DI | get_it 8.x | Lightweight service locator |
| Routing | go_router 14.x | Declarative, deep linking |
| HTTP | dio 5.x | Interceptors, retry, caching |
| Database | sqflite + hive | Offline cache + prefs |
| Map | flutter_map + OpenStreetMap | Free tiles, offline tiles |
| Charts | fl_chart | Beautiful, customizable |
| Notifications | firebase_messaging + flutter_local_notifications | FCM + local |
| Secure Storage | flutter_secure_storage | JWT tokens |
| PDF | pdf + printing | SITREP generation |
| Testing | bloc_test + mockito | Unit + widget tests |

---

## 5. Project Structure (Monorepo)

```
nurisk/
├── package.json                    # Root (Turborepo)
├── turbo.json                      # Turborepo pipeline config
├── tsconfig.base.json              # Shared TypeScript config
├── .eslintrc.cjs                   # Shared ESLint config
├── .prettierrc                     # Shared Prettier config
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend-web
│
├── packages/
│   ├── shared/                     # Shared TypeScript types & utils
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types/              # Domain types (Incident, User, etc.)
│   │       │   ├── incident.ts
│   │       │   ├── user.ts
│   │       │   ├── volunteer.ts
│   │       │   ├── shelter.ts
│   │       │   ├── warehouse.ts
│   │       │   ├── logistics.ts
│   │       │   ├── chat.ts
│   │       │   ├── notification.ts
│   │       │   └── index.ts
│   │       ├── enums/              # Shared enums
│   │       │   ├── role.ts
│   │       │   ├── incident-status.ts
│   │       │   ├── disaster-type.ts
│   │       │   └── index.ts
│   │       ├── dto/                # Data Transfer Objects (PII-safe)
│   │       │   ├── incident.dto.ts
│   │       │   ├── report.dto.ts
│   │       │   ├── user.dto.ts
│   │       │   └── index.ts
│   │       ├── validators/         # Zod schemas
│   │       │   ├── auth.schema.ts
│   │       │   ├── incident.schema.ts
│   │       │   └── index.ts
│   │       └── utils/
│   │           ├── date.ts
│   │           ├── geo.ts
│   │           └── index.ts
│   │
│   └── config/                     # Shared config (eslint, tsconfig)
│       ├── eslint-config-custom/
│       └── tsconfig-custom/
│
├── apps/
│   ├── backend/                    # Express + Prisma + Socket.IO
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Single source of truth DB schema
│   │   │   ├── migrations/         # Auto-generated
│   │   │   └── seed.ts             # Seed data
│   │   ├── src/
│   │   │   ├── index.ts            # Entry point
│   │   │   ├── app.ts              # Express app factory
│   │   │   ├── config/
│   │   │   │   ├── env.ts          # Validated env vars (Zod)
│   │   │   │   ├── database.ts     # Prisma client singleton
│   │   │   │   ├── redis.ts        # Redis client
│   │   │   │   └── socket.ts       # Socket.IO setup
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts         # JWT verification + RBAC
│   │   │   │   ├── error-handler.ts
│   │   │   │   ├── validate.ts     # Zod request validation
│   │   │   │   ├── pii-shield.ts   # Strips PII from responses
│   │   │   │   ├── rate-limit.ts
│   │   │   │   └── audit-log.ts    # Automatic audit trail
│   │   │   ├── modules/            # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   └── auth.test.ts
│   │   │   │   ├── incident/
│   │   │   │   │   ├── incident.controller.ts
│   │   │   │   │   ├── incident.service.ts
│   │   │   │   │   ├── incident.repository.ts
│   │   │   │   │   ├── incident.routes.ts
│   │   │   │   │   ├── incident.test.ts
│   │   │   │   │   ├── state-machine.ts
│   │   │   │   │   └── deduplication.ts
│   │   │   │   ├── volunteer/
│   │   │   │   ├── shelter/
│   │   │   │   ├── warehouse/
│   │   │   │   ├── logistics/
│   │   │   │   ├── chat/
│   │   │   │   ├── notification/
│   │   │   │   ├── analytics/
│   │   │   │   ├── map/
│   │   │   │   ├── report/
│   │   │   │   ├── instruction/
│   │   │   │   ├── news-intel/
│   │   │   │   ├── historical/
│   │   │   │   ├── recovery/              # Recovery & rehabilitation tracking
│   │   │   │   ├── economic-impact/       # Economic damage assessment
│   │   │   │   ├── ai/
│   │   │   │   │   ├── scraper.service.ts
│   │   │   │   │   ├── orchestrator.service.ts
│   │   │   │   │   ├── probabilistic-models.ts
│   │   │   │   │   ├── weather.service.ts
│   │   │   │   │   ├── agents/            # AI Operational Agents
│   │   │   │   │   │   ├── risk-analyst.agent.ts
│   │   │   │   │   │   ├── situation-summarizer.agent.ts
│   │   │   │   │   │   ├── logistics-planner.agent.ts
│   │   │   │   │   │   ├── media-verification.agent.ts
│   │   │   │   │   │   ├── weather-analyst.agent.ts
│   │   │   │   │   │   ├── public-sentiment.agent.ts
│   │   │   │   │   │   ├── volunteer-coordinator.agent.ts
│   │   │   │   │   │   └── executive-briefing.agent.ts
│   │   │   │   ├── decision-engine/       # Risk orchestrator, priority scoring
│   │   │   │   ├── simulation-engine/     # Flood propagation, evacuation sim
│   │   │   │   ├── resource-intelligence/ # Resource optimizer, dispatch optimizer
│   │   │   │   ├── playbook-engine/       # SOP automation, rule orchestration
│   │   │   │   ├── knowledge-graph/       # Geo-semantic graph, relationship engine
│   │   │   │   ├── trust-intelligence/    # Trust score, verification pipeline
│   │   │   │   └── temporal-intelligence/ # Time-series analytics, trend analysis
│   │   │   ├── socket/
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── chat.handler.ts
│   │   │   │   │   ├── notification.handler.ts
│   │   │   │   │   └── emergency.handler.ts
│   │   │   │   └── index.ts
│   │   │   ├── jobs/               # BullMQ workers
│   │   │   │   ├── pdf-worker.ts
│   │   │   │   ├── scraper-scheduler.ts
│   │   │   │   └── notification-worker.ts
│   │   │   ├── utils/
│   │   │   │   ├── geocoding.ts
│   │   │   │   ├── geojson.ts
│   │   │   │   └── code-generator.ts
│   │   │   └── types/
│   │   │       └── express.d.ts     # Extended Express Request
│   │   ├── uploads/                 # Temporary uploads
│   │   └── Dockerfile
│   │
│   ├── frontend-web/                # React 19 + Vite + Tailwind
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── index.html
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── routes/             # React Router 7 route tree
│   │   │   │   ├── index.tsx
│   │   │   │   ├── public.tsx      # Public routes
│   │   │   │   └── protected.tsx   # Auth-gated routes
│   │   │   ├── layouts/
│   │   │   │   ├── RootLayout.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── AuthLayout.tsx
│   │   │   ├── pages/
│   │   │   │   ├── public/
│   │   │   │   │   ├── DashboardPage.tsx
│   │   │   │   │   ├── MapPage.tsx
│   │   │   │   │   ├── ReportPage.tsx
│   │   │   │   │   └── ResourcePage.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   └── RegisterPage.tsx
│   │   │   │   ├── field-staff/
│   │   │   │   │   ├── AssessmentPage.tsx
│   │   │   │   │   ├── RegionalIncidentsPage.tsx
│   │   │   │   │   └── BuildingAssessmentPage.tsx
│   │   │   │   ├── relawan/
│   │   │   │   │   ├── MyMissionsPage.tsx
│   │   │   │   │   ├── CheckInPage.tsx
│   │   │   │   │   └── MissionHistoryPage.tsx
│   │   │   │   ├── admin/
│   │   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   │   ├── CommandCenterPage.tsx
│   │   │   │   │   ├── ChatPage.tsx
│   │   │   │   │   └── AnalyticsPage.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── IncidentDetailPage.tsx
│   │   │   │       ├── IncidentListPage.tsx
│   │   │   │       └── ProfilePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/             # shadcn/ui primitives
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── dialog.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── shared/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── BottomNav.tsx
│   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   ├── MapPreview.tsx
│   │   │   │   │   └── LoadingSpinner.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── KpiCards.tsx
│   │   │   │   │   ├── WeatherForecast.tsx
│   │   │   │   │   ├── Alerts.tsx
│   │   │   │   │   ├── DisasterCards.tsx
│   │   │   │   │   ├── TrendChart.tsx
│   │   │   │   │   ├── ProbabilityCards.tsx
│   │   │   │   │   ├── GapAnalysis.tsx
│   │   │   │   │   └── Donation.tsx
│   │   │   │   ├── incident/
│   │   │   │   │   ├── IncidentCard.tsx
│   │   │   │   │   ├── IncidentTimeline.tsx
│   │   │   │   │   └── AssessmentForm.tsx
│   │   │   │   └── map/
│   │   │   │       ├── IncidentMap.tsx
│   │   │   │       └── HeatmapLayer.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useSocket.ts
│   │   │   │   ├── useGeolocation.ts
│   │   │   │   └── useOffline.ts
│   │   │   ├── stores/
│   │   │   │   ├── auth.store.ts   # Zustand
│   │   │   │   ├── incident.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   ├── services/
│   │   │   │   ├── api.ts          # Axios instance
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── incident.service.ts
│   │   │   │   └── ...
│   │   │   ├── lib/
│   │   │   │   ├── utils.ts        # cn() helper
│   │   │   │   └── constants.ts
│   │   │   └── styles/
│   │   │       └── globals.css     # Tailwind + custom
│   │   └── Dockerfile
│   │
│   └── frontend-apk/                # Flutter (clean architecture)
│       ├── pubspec.yaml
│       ├── lib/
│       │   ├── core/               # DI, routing, theme, network
│       │   ├── data/               # Models, datasources, repos
│       │   ├── domain/             # Entities, repository interfaces, usecases
│       │   ├── features/           # per-feature BLoC + pages
│       │   └── shared/             # Reusable widgets
│       ├── test/
│       ├── android/
│       ├── ios/
│       └── Dockerfile (for build)
│
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   └── scripts/
│       ├── init-db.sh
│       └── seed.sh
│
└── docs/
    ├── api/                        # OpenAPI generated docs
    ├── architecture/
    │   ├── state-machine.md
    │   └── data-flow.md
    └── deployment.md
```

---

## 6. Database Schema (PostgreSQL + PostGIS)

### 6.1 Principles
- **Single source of truth**: Prisma schema is the only source. No raw DDL.
- **PostGIS**: All location data uses `geometry(Point, 4326)` for spatial queries.
- **Soft delete**: All tables have `deleted_at TIMESTAMP` for audit.
- **Timestamps**: All tables have `created_at`, `updated_at` (auto via Prisma middleware).
- **UUID**: Primary keys use `uuid` (generated via `gen_random_uuid()`). Integer IDs kept as `incident_code` for human readability.
- **Indexes**: GiST index on geometry columns, B-tree on foreign keys and status columns.
- **Audit**: `audit_logs` table captures all state changes via Prisma middleware.

### 6.2 Entity Relationship (Core)

```
users 1──N reports
users 1──N incidents (created_by)
users 1──N volunteers
users 1──N audit_logs (actor)
users 1──N notifications (recipient)
users 1──N chat_messages (sender)

incidents 1──N incident_actions
incidents 1──N incident_instructions
incidents 1──N incident_logs
incidents 1──N logistics_requests
incidents 1──N volunteer_deployments
incidents 1──N building_assessments

volunteers 1──N volunteer_deployments
volunteers 1──N volunteer_schedules
volunteers 1──N volunteer_performance
volunteers 1──N volunteer_devices

shelters 1──N building_assessments
warehouses 1──N asset_inventories
asset_inventories 1──N asset_transactions

chat_conversations 1──N chat_messages
chat_conversations N──M users (via participant table)
```

### 6.3 Full Table Inventory (35 Tables)

Mapped from comprehensive audit of `server.js` and `app.js` migration functions + Flutter models:

| # | Table | Source Table | Purpose | Key Columns (beyond id/timestamps) | Relations | Key Indexes |
|---|-------|-------------|---------|-----------------------------------|-----------|-------------|
| 1 | `users` | `users` | Auth & role | username (UQ), password_hash, full_name, role (10 enum), region, email, phone_number, whatsapp_number, avatar_url, is_active, last_login_at | → reports, incidents, volunteers, audit_logs, notifications, chat_messages, device_tokens | username, role, region |
| 2 | `user_sessions` | NEW | Refresh token tracking | user_id (FK), refresh_token, device_info, ip_address, expires_at, revoked_at | → users | user_id, expires_at |
| 3 | `incidents` | `incidents` | Core disaster incident | incident_code (UQ), title, disaster_type (12 enum), status (6-state), location (PostGIS), region, kecamatan, desa, alamat_spesifik, priority_score, priority_level, description, kondisi_mutakhir, dampak_manusia (JSONB), dampak_rumah (JSONB), dampak_fasum (JSONB), dampak_vital (JSONB), dampak_lingkungan (JSONB), needs_numeric (JSONB), has_shelter, is_ai_generated, reporter_name, whatsapp_number, photo_data, event_date, probability_score, ai_features (JSONB) | → creator (users), actions, instructions, logs, logistics, deployments, assessments | status, disaster_type, region, location (GiST), event_date, priority+status, lat+lng, region+status, kecamatan, is_ai_generated |
| 4 | `incident_actions` | `incident_actions` | Field actions taken | incident_id (FK), kluster, nama_kegiatan, jumlah_paket, penerima_manfaat, targets_met (JSONB) | → incidents | incident_id, kluster |
| 5 | `incident_instructions` | `incident_instructions` | Surat Perintah | incident_id (FK), nomor_sp (UQ), pj_nama, pic_lapangan, tim_anggota (TEXT), armada_detail (TEXT), peralatan_detail (TEXT), duration, status_sp (draft/issued/executing/completed/cancelled) | → incidents | incident_id, status_sp |
| 6 | `incident_logs` | `incident_logs` | Status change audit | incident_id (FK), from_status, to_status, changed_by (VARCHAR), note | → incidents | incident_id, created_at |
| 7 | `volunteers` | `volunteers` | Volunteer profiles | user_id (UQ FK), full_name, phone, birth_date, gender, blood_type, regency, district, village, detail_address, location (PostGIS), medical_history, expertise, experience, status (pending/approved/rejected/inactive/active), status_tugas (available/on_duty/off_duty), last_location, rating, total_missions, total_hours | → users, deployments, schedules, performance, devices | user_id, status, regency, location, status_tugas |
| 8 | `volunteer_deployments` | `volunteer_deployments` | Mission assignments | volunteer_id (FK), incident_id (FK), status (applied/approved/rejected/deployed/completed/cancelled), check_in_location (PostGIS), check_in_at, check_out_at, note | → volunteers, incidents | volunteer_id, incident_id, status, volunteer_id+status |
| 9 | `volunteer_schedules` | `volunteer_schedules` | Availability schedule | volunteer_id (FK), date, shift_start (TIME), shift_end (TIME), status | → volunteers | volunteer_id, date, volunteer_id+date |
| 10 | `volunteer_performance` | `volunteer_performance` | Mission metrics | volunteer_id (FK), incident_id (FK), hours_worked (NUMERIC), missions_completed, rating (0-5), notes | → volunteers, incidents | volunteer_id, incident_id |
| 11 | `volunteer_devices` | `volunteer_devices` | FCM push tokens | volunteer_id (FK), token (UQ), platform, last_active | → volunteers | volunteer_id |
| 12 | `certifications` | `certifications` | Volunteer certs | volunteer_id (FK), name, issued_date, expiry_date, certificate_number, document_url, status | → volunteers | volunteer_id, status |
| 13 | `shelters` | `shelters` | Refugee shelters | name, region, address, location (PostGIS), capacity, refugee_count, water_stock_liters (NUMERIC), toilet_count, status (AKTIF/FULL/CLOSED), score, stock_status, incident_id (FK) | → incidents (optional) | incident_id, region, status |
| 14 | `building_assessments` | `building_assessments` | 6-step building resilience | nama_gedung, fungsi (10+ types), fungsi_lain, alamat, location (PostGIS), region, imb, slf, odnk, ancaman (JSONB), fasilitas (JSONB), peralatan (JSONB), ibu_hamil, sakit_kronis, lansia, balita, anak_anak, dewasa_sehat, pernah_terjadi, riwayat_desa, struktur, non_struktural, dana_darurat, anggaran, asuransi, kerjasama, peduli, konflik, section (1-6), total_score, completed | → incidents (optional) | region, fungsi, completed, total_score |
| 15 | `warehouses` | `warehouses` | Logistics warehouses | name, region, address, location (PostGIS), type (GUDANG/POSKO/DISTRIBUSI), phone_number | → asset_inventories | — |
| 16 | `command_posts` | `command_posts` | Field command posts | name, location (PostGIS), address | standalone | — |
| 17 | `asset_inventories` | `asset_inventories` | Inventory items | name, category (FOOD/MEDICINE/CLOTHING/SHELTER/TOOLS/OTHER), quantity (>=0), unit, location, region, warehouse_id (FK), qr_code (UQ), status, min_stock | → warehouses, transactions | category, status, qr_code, warehouse_id, location, region, region+category, created_at, status+qty |
| 18 | `asset_transactions` | `asset_transactions` | Inventory movement | asset_id (FK), incident_id (FK), volunteer_id (FK), quantity (>0), type (checkin/checkout/dispatch/transfer/return/maintenance/retire), status (pending/approved/completed/rejected/cancelled), notes, to_warehouse_id (FK), to_region | → assets, incidents, volunteers, warehouses | asset_id, incident_id, volunteer_id, type, status, created_at, incident_id+created_at |
| 19 | `logistics_requests` | `logistics_requests` | Supply requests | incident_id (FK), requester_region, item_name, quantity_requested (>0), status (pending/approved/fulfilled/rejected/cancelled), admin_note, approved_by | → incidents | incident_id, status, requester_region |
| 20 | `audit_logs` | `audit_logs` | Complete audit trail | actor_id (FK), action (CREATE/UPDATE/DELETE/VERIFY/etc.), entity_type, entity_id, payload (JSONB), ip_address | → users | actor_id, entity_type+entity_id, created_at |
| 21 | `notifications` | `notifications` | In-app + push alerts | title, body, target_role, target_region, incident_id (FK), type, status (pending/sent/failed/read), sent_at, user_id (FK for direct), is_read, read_at, data (JSONB) | → users, incidents | incident_id, target_role, status |
| 22 | `chat_conversations` | `chat_conversations` | Chat rooms | incident_id (FK), type (incident/broadcast), title, last_message_at | → incidents, participants, messages | incident_id |
| 23 | `chat_participants` | NEW (consolidated) | Membership | conversation_id (FK), user_id (FK), last_read_at, joined_at. UQ(conversation_id, user_id) | → conversations, users | conversation_id, user_id |
| 24 | `chat_messages` | `chat_messages` | Messages | conversation_id (FK), sender_id (FK), message, message_type (TEXT/IMAGE/FILE/SYSTEM), file_url, read_by (INT[]), created_at | → conversations, users | conversation_id, conversation_id+created_at |
| 25 | `team_messages` | `team_messages` | Regional broadcasts | region, sender_id (FK), sender_name, message | → users | region, created_at |
| 26 | `intel_news` | `intel_news` | Scraped intelligence | source, title, content, url (UQ), category, region, severity (LOW/MEDIUM/HIGH/CRITICAL), ai_confidence (0-1) | standalone | source, category, region, created_at |
| 27 | `historical_disasters` | `historical_disasters` | Historical records | region, disaster_type, event_date, location (PostGIS), time, source | standalone | region, disaster_type, event_date, region+event_date |
| 28 | `reports` | `reports` | Public reports | report_code (UQ), reporter_name, reporter_phone, disaster_type, description, location (PostGIS), province, city, district, village, status (pending/verified/rejected) | standalone | status, created_at |
| 29 | `disaster_learning` | `disaster_learning` | AI learning engine | region, disaster_type, occurrence_count, total_incidents_in_region, avg_severity_score, last_incident_date. UQ(region, disaster_type) | standalone | region+disaster_type |
| 30 | `ml_models` | NEW | ML model registry | model_name (UQ), model_version, model_type (CLASSIFICATION|REGRESSION|FORECAST|AGENT), framework (SKLEARN|TENSORFLOW|XGBOOST|CUSTOM), artifact_url (MinIO path), hyperparams (JSONB), metrics_summary (JSONB), training_date, deployed_at, status (DRAFT|TRAINING|DEPLOYED|ARCHIVED|ROLLED_BACK) | → model_versions, model_metrics | model_name, status, deployed_at |
| 31 | `model_versions` | NEW | Version lineage | model_id (FK), version_semver, artifact_url, commit_hash, training_dataset_id, metrics_before (JSONB), metrics_after (JSONB), approved_by, deployed_at | → ml_models | model_id, version_semver |
| 32 | `model_metrics` | NEW | Per-run metrics log | model_id (FK), version_id (FK), metric_name, metric_value, threshold, passed (BOOLEAN), evaluated_at | → ml_models, model_versions | model_id, metric_name, evaluated_at |
| 33 | `prediction_logs` | NEW | All AI predictions stored for audit | model_id (FK), input_features (JSONB), predicted_value, confidence_score, actual_outcome (nullable, filled after ground truth), error_delta (nullable), latency_ms, source_incident_id (FK), source_event, created_at | → ml_models, incidents | model_id, created_at, source_incident_id, actual_outcome |
| 34 | `training_jobs` | NEW | Training pipeline audit | model_id (FK), status (QUEUED|RUNNING|COMPLETED|FAILED|CANCELLED), started_by, started_at, completed_at, duration_seconds, cpu_hours, gpu_hours, dataset_rows, validation_score, test_score, error_log (TEXT), output_model_version_id | → ml_models, model_versions | model_id, status, started_at |
| 35 | `feature_store` | NEW | Feature registry for ML | feature_name (UQ), feature_type (NUMERIC|CATEGORICAL|TEXT|GEO|TIMESTAMP|EMBEDDING), source_table, source_column, transformation (SQL or code), data_type, nullable, description, created_at, updated_at | standalone | feature_name, source_table |

### 6.4 Migration Strategy

**Phase 0 — Introspect**: `npx prisma db pull` from current database
**Phase 1 — Consolidate**: Resolve all `server.js` vs `app.js` schema diffs
**Phase 2 — PostGIS**: Add geometry columns, migrate data from lat/lng columns, add GiST indexes
**Phase 3 — Add missing**: `disaster_learning`, `user_sessions`, `chat_participants` tables
**Phase 4 — UUID migration**: Add UUID columns, migrate from SERIAL with mapping table
**Phase 5 — Deploy**: `npx prisma migrate deploy` to production

```sql
-- PostGIS extension + data migration
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS vector;

-- Add geometry column to incidents
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
UPDATE incidents SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE location IS NULL AND latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_location_gist ON incidents USING GIST (location);
```

### 6.4 Migration Strategy
```
Current DB (raw SQL + fragmented) 
  → Prisma db pull (introspect existing)
  → Manual schema consolidation
  → Prisma migrate dev (generate migration)
  → Seed data script
  → Prisma migrate deploy (production)
```

---

## 7. Backend Architecture (TypeScript)

### 7.1 Layered Module Pattern

Each module follows a strict layering:

```
Route (HTTP definition)
  → Validator (Zod schema for request)
    → Controller (thin: parse request, call service, return response)
      → Service (business logic, state machine, orchestrates repos)
        → Repository (data access via Prisma)
          → Database (PostgreSQL + PostGIS)
```

**Rules**:
- Controller NEVER accesses Prisma directly
- Service NEVER knows about HTTP (req/res)
- Repository NEVER has business logic
- DTOs are mapped before response (PII shield)

### 7.2 Middleware Stack (order matters)

```
app.ts middleware registration:
  1. pinoLogger       → structured request logging
  2. cors             → CORS policy
  3. rateLimit        → rate limiting (100 req/min per IP)
  4. express.json     → body parser
  5. piiShield        → strip PII from responses (global)
  6. auth (optional)  → JWT verification (applied per route)
  7. auditLog         → auto-log mutations
  8. errorHandler     → global error handler (last)
```

### 7.3 Key Services Design

#### IncidentService
```typescript
class IncidentService {
  // State machine enforced here
  async create(data: CreateIncidentDto, userId: string): Promise<IncidentDto>
  async verify(id: string, userId: string): Promise<IncidentDto> // REPORTED → VERIFIED
  async startProgress(id: string, userId: string): Promise<IncidentDto> // VERIFIED → IN_PROGRESS
  async close(id: string, userId: string): Promise<IncidentDto> // IN_PROGRESS → CLOSED

  // Spatial deduplication
  async checkDuplicates(lat: number, lng: number, radiusKm: number): Promise<DuplicateCheck[]>
}
```

#### AuthService
```typescript
class AuthService {
  async login(username: string, password: string): Promise<{ user: UserDto; token: string }>
  async register(data: RegisterDto): Promise<void>
  async refreshToken(token: string): Promise<{ token: string }>
  async getCurrentUser(userId: string): Promise<UserDto>
}
```

#### AIService (Scraper + Orchestrator)
```typescript
class AIService {
  // Scrapers
  async scrapeBmkgEarthquakes(): Promise<IncidentSuggestion[]>
  async scrapeMagmaVolcanoes(): Promise<IncidentSuggestion[]>
  async scrapeCevadis(): Promise<IncidentSuggestion[]>
  async scrapeNews(): Promise<IncidentSuggestion[]>

  // Orchestrator
  async processSuggestion(suggestion: IncidentSuggestion): Promise<ProcessingResult>
  // Deduplication, fake detection, severity scoring, auto-creation

  // Probabilistic models
  async getProbabilities(region: string, month: number): Promise<DisasterProbability[]>
  async getForecast(region: string): Promise<WeatherForecast>
}
```

### 7.4 Error Handling

Custom `AppError` hierarchy:
```typescript
class AppError extends Error {
  constructor(public statusCode: number, public code: string, message: string) {}
}

class NotFoundError extends AppError { constructor(msg: string) { super(404, 'NOT_FOUND', msg) } }
class ValidationError extends AppError { constructor(msg: string) { super(400, 'VALIDATION_ERROR', msg) } }
class UnauthorizedError extends AppError { constructor(msg = 'Unauthorized') { super(401, 'UNAUTHORIZED', msg) } }
class ForbiddenError extends AppError { constructor(msg = 'Forbidden') { super(403, 'FORBIDDEN', msg) } }
class ConflictError extends AppError { constructor(msg: string) { super(409, 'CONFLICT', msg) } }
```

Standard response format:
```typescript
// Success
{ success: true, data: T, meta?: { page, limit, total } }

// Error
{ success: false, error: { code: string, message: string, details?: any } }
```

---

## 8. Frontend Web Architecture (React 19)

### 8.1 Route Tree
```
/                          → redirect to /dashboard
/dashboard                 → DashboardPage (public)
/map                       → MapPage (public, Leaflet)
/lapor                     → ReportPage (public, form)
/resource                  → ResourcePage (public, asset view)
/akun                      → AccountPage (login/register or profile)
/akun/register             → RegisterPage
/incidents                 → IncidentListPage
/incidents/:id             → IncidentDetailPage
/incidents/:id/kronologi   → KronologiPage
/missions                  → MissionListPage
/missions/:id              → MissionDetailPage
/actions                   → ActionListPage
/actions/:id               → ActionDetailPage

// Field Staff (auth gated)
/assessment/:incidentId    → AssessmentFormPage
/regional-incidents        → RegionalIncidentsPage
/building-assessment       → BuildingAssessmentPage

// Relawan (auth gated)
/my-missions               → MyMissionsPage
/checkin                   → CheckInPage
/mission-history            → MissionHistoryPage

// Admin (auth gated)
/admin                     → AdminDashboardPage
/command-center            → CommandCenterPage
/chat                      → ChatPage
/analytics                 → AnalyticsPage
/intel                     → IntelPanelPage
/audit-log                 → AuditLogPage
```

### 8.2 Data Fetching Pattern (TanStack Query)

```typescript
// Query example
function useIncidents(filters?: IncidentFilters) {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentService.getAll(filters),
    staleTime: 30_000,     // 30s before refetch
    gcTime: 5 * 60_000,    // 5min cache
  })
}

// Mutation example
function useCreateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateIncidentDto) => incidentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      // Show success toast
    },
  })
}

// Socket.IO invalidation
const socket = useSocket()
useEffect(() => {
  socket.on('incident:updated', () => {
    queryClient.invalidateQueries({ queryKey: ['incidents'] })
  })
  return () => { socket.off('incident:updated') }
}, [socket])
```

### 8.3 Component Architecture

```
pages/    → Route-level components (page layout + data fetching)
components/shared/  → Reusable across pages (Header, BottomNav, StatusBadge)
components/ui/      → shadcn/ui primitives (button, card, dialog, etc.)
components/{feature}/ → Feature-specific (incident/IncidentCard, dashboard/KpiCards)
```

### 8.4 Theme System

```css
/* tailwind.config.ts - Dark-first with emergency accents */
:root {
  --background: #111827;      /* gray-900 */
  --surface: #1F2937;         /* gray-800 */
  --surface-card: #374151;    /* gray-700 */
  --text-primary: #F9FAFB;    /* gray-50 */
  --text-secondary: #9CA3AF;  /* gray-400 */
  --danger: #DC2626;
  --warning: #F97316;
  --info: #3B82F6;
  --success: #16A34A;
  --nu-green: #006432;
  --gold: #C5A059;
}
```

---

## 9. Frontend APK Architecture (Flutter)

### 9.1 Architecture (Clean Architecture + BLoC)
Same as current `frontend-apk` structure — the architecture is solid. Focus for rebuild:

1. **Complete all stubs** — Every repository, datasource, and usecase must be implemented
2. **Connect to new backend** — Update `api_endpoints.dart` to target new backend
3. **Offline-first** — Implement sqflite cache + offline queue fully
4. **DTO alignment** — Ensure Flutter models match Prisma schema exactly
5. **Remove redundant core services** — Consolidate duplicate services

### 9.2 Key Improvements
| Area | Current | Target |
|------|---------|--------|
| Error handling | Mixed (Either + exceptions) | Unified `AppException` + sealed states |
| Offline sync | Stubs | Full queue with retry + conflict resolution |
| Push notifications | Firebase scaffolded | Full FCM + local notification integration |
| Map performance | Basic flutter_map | Offline tile caching + cluster markers |
| Form validation | Inline | Centralized `Formz` or reactive forms |
| Tests | Minimal | > 60% coverage on BLoCs + repositories |

---

## 10. API Contract & Versioning

### 10.1 Versioning Strategy
- URL prefix: `/api/v1/...`
- Headers: `Accept-Version: 2026-05-12`
- Breaking changes → new version endpoint + deprecation header

### 10.2 Complete API Endpoints

```
# ─── Health ─────────────────────────────────────────────────
GET    /api/v1/ping                          # Health check

# ─── Auth ──────────────────────────────────────────────────
POST   /api/v1/auth/login                    # Login
POST   /api/v1/auth/register                 # Register
POST   /api/v1/auth/refresh                  # Refresh token
GET    /api/v1/auth/me                       # Current user
PUT    /api/v1/auth/password                 # Change password

# ─── Incidents ─────────────────────────────────────────────
GET    /api/v1/incidents                     # List (filter: status, region, type, page)
POST   /api/v1/incidents                     # Create (public + staff)
GET    /api/v1/incidents/:id                 # Detail
PUT    /api/v1/incidents/:id                 # Update
DELETE /api/v1/incidents/:id                 # Soft delete
POST   /api/v1/incidents/:id/verify          # REPORTED → VERIFIED
POST   /api/v1/incidents/:id/start           # VERIFIED → IN_PROGRESS
POST   /api/v1/incidents/:id/close           # IN_PROGRESS → CLOSED
GET    /api/v1/incidents/:id/timeline        # Timeline logs
GET    /api/v1/incidents/:id/full-report     # SITREP data
GET    /api/v1/incidents/deduplicate         # Check duplicates (query: lat, lng, radius)
POST   /api/v1/incidents/:id/assessment      # Submit building assessment

# ─── Reports (Public) ──────────────────────────────────────
GET    /api/v1/reports                       # Public reports list
POST   /api/v1/reports                       # Submit public report
GET    /api/v1/reports/:id                   # Report detail (PII-shielded)

# ─── Volunteers ────────────────────────────────────────────
GET    /api/v1/volunteers                    # List
POST   /api/v1/volunteers                    # Register as volunteer
GET    /api/v1/volunteers/:id                # Detail
PUT    /api/v1/volunteers/:id                # Update profile
GET    /api/v1/volunteers/nearby             # Nearby volunteers
POST   /api/v1/volunteers/:id/deploy         # Deploy to incident
GET    /api/v1/volunteers/:id/deployments    # Deployment history
PUT    /api/v1/volunteers/:id/availability   # Toggle availability
POST   /api/v1/volunteers/deployment/:id/checkin   # GPS check-in
POST   /api/v1/volunteers/deployment/:id/checkout  # Check-out

# ─── Shelters ──────────────────────────────────────────────
GET    /api/v1/shelters                      # List (filter: region, status)
POST   /api/v1/shelters                      # Create
GET    /api/v1/shelters/:id                  # Detail
PUT    /api/v1/shelters/:id                  # Update

# ─── Warehouses & Assets ───────────────────────────────────
GET    /api/v1/warehouses                    # List
POST   /api/v1/warehouses                    # Create
GET    /api/v1/warehouses/:id                # Detail
GET    /api/v1/assets                        # List (filter: category, warehouse)
POST   /api/v1/assets                        # Create inventory item
PUT    /api/v1/assets/:id                    # Update stock
POST   /api/v1/assets/:id/checkin            # Check-in
POST   /api/v1/assets/:id/checkout           # Check-out
POST   /api/v1/assets/:id/transfer           # Transfer between warehouses
GET    /api/v1/assets/low-stock              # Low stock alert

# ─── Logistics ─────────────────────────────────────────────
GET    /api/v1/logistics                     # List requests
POST   /api/v1/logistics                     # Create request
GET    /api/v1/logistics/:id                 # Request detail
POST   /api/v1/logistics/:id/approve         # Approve request
POST   /api/v1/logistics/:id/fulfill         # Fulfill request
POST   /api/v1/logistics/:id/reject          # Reject request

# ─── Chat ──────────────────────────────────────────────────
GET    /api/v1/chat/conversations            # List conversations
POST   /api/v1/chat/conversations            # Create conversation
GET    /api/v1/chat/conversations/:id        # Messages
POST   /api/v1/chat/conversations/:id/messages # Send message
PUT    /api/v1/chat/conversations/:id/read   # Mark as read

# ─── Notifications ─────────────────────────────────────────
GET    /api/v1/notifications                 # List (paginated)
PUT    /api/v1/notifications/:id/read        # Mark as read
PUT    /api/v1/notifications/read-all        # Mark all as read
POST   /api/v1/notifications/device-token    # Register FCM token

# ─── Analytics ─────────────────────────────────────────────
GET    /api/v1/analytics/dashboard           # Dashboard KPIs
GET    /api/v1/analytics/trends              # Monthly trends
GET    /api/v1/analytics/threat-matrix       # Probability matrix
GET    /api/v1/analytics/response-metrics    # Response KPIs
GET    /api/v1/analytics/audit-logs          # Audit trail

# ─── Map ───────────────────────────────────────────────────
GET    /api/v1/maps/command                  # Command map data
GET    /api/v1/maps/heatmap                  # Incident heatmap data
GET    /api/v1/maps/regions                  # Region boundaries (GeoJSON)

# ─── Intel & News ──────────────────────────────────────────
GET    /api/v1/intel/news                    # Scraped intel
GET    /api/v1/intel/alerts                  # Active alerts

# ─── Instructions ──────────────────────────────────────────
GET    /api/v1/instructions                  # Surat Perintah list
POST   /api/v1/instructions                  # Create instruction
PUT    /api/v1/instructions/:id              # Update instruction

# ─── Historical Data ───────────────────────────────────────
GET    /api/v1/historical                    # Historical disasters
GET    /api/v1/historical/probabilities      # Probability forecast
GET    /api/v1/historical/forecast           # Weather-based forecast

# ─── AI / Scraper (Admin only) ─────────────────────────────
POST   /api/v1/ai/run-scraper               # Trigger manual scrape
GET    /api/v1/ai/status                     # Scraper status
POST   /api/v1/ai/ingest-suggestion          # Accept/reject AI suggestion

# ─── Decision Engine ───────────────────────────────────────
POST   /api/v1/decision/prioritize-evacuation  # Generate evacuation priority
POST   /api/v1/decision/risk-assessment         # Full risk assessment for incident
GET    /api/v1/decision/critical-zones          # Detect critical zones (query: region)
POST   /api/v1/decision/logistics-recommendation # Logistics distribution suggestion

# ─── Simulation Engine ──────────────────────────────────────
POST   /api/v1/simulation/flood                # Run flood propagation simulation
POST   /api/v1/simulation/evacuation           # Run evacuation route simulation
POST   /api/v1/simulation/shelter-overload     # Shelter capacity stress test
POST   /api/v1/simulation/logistics-shortage   # Supply chain failure simulation
POST   /api/v1/simulation/scenario             # Custom what-if scenario
GET    /api/v1/simulation/results/:id           # Simulation result by ID

# ─── Resource Intelligence ─────────────────────────────────
GET    /api/v1/resource/health                 # Resource health dashboard
GET    /api/v1/resource/deployment-readiness    # Deployment readiness score
POST   /api/v1/resource/optimize               # Resource allocation optimizer
POST   /api/v1/resource/dispatch               # Dispatch optimizer

# ─── Knowledge Graph ────────────────────────────────────────
GET    /api/v1/knowledge-graph/query            # Graph query (Cypher/Gremlin)
GET    /api/v1/knowledge-graph/entity/:id       # Entity detail with relationships
GET    /api/v1/knowledge-graph/neighborhood     # Proximity graph (query: lat, lng, radius)
GET    /api/v1/knowledge-graph/path             # Shortest path between entities

# ─── Trust Intelligence ────────────────────────────────────
POST   /api/v1/trust/verify-report             # Verify report authenticity
GET    /api/v1/trust/source-reliability/:source  # Source trust score
POST   /api/v1/trust/media-forensics           # Media/photo authenticity check
GET    /api/v1/trust/confidence/:entityId       # Confidence score for any entity

# ─── Playbook Engine ────────────────────────────────────────
GET    /api/v1/playbooks                       # List available playbooks
POST   /api/v1/playbooks                       # Create playbook
GET    /api/v1/playbooks/:id                   # Playbook detail
POST   /api/v1/playbooks/:id/execute           # Execute playbook for incident
GET    /api/v1/playbooks/:id/executions        # Execution history
POST   /api/v1/playbooks/rules/evaluate        # Evaluate rules against current state

# ─── Situational Awareness ─────────────────────────────────
GET    /api/v1/situational/tactical            # Tactical awareness snapshot
GET    /api/v1/situational/operational         # Operational awareness summary
GET    /api/v1/situational/strategic           # Strategic trend briefing
GET    /api/v1/situational/executive-brief     # Executive command summary

# ─── Temporal Intelligence ─────────────────────────────────
GET    /api/v1/temporal/trends                 # Time-series trend analysis
GET    /api/v1/temporal/anomalies              # Anomaly detection in time-series
GET    /api/v1/temporal/forecast               # Time-series based forecast
GET    /api/v1/temporal/stream                 # Real-time stream analytics

# ─── Recovery & Lifecycle ──────────────────────────────────
GET    /api/v1/recovery/tracking               # Recovery progress tracking
POST   /api/v1/recovery/milestone              # Log recovery milestone
GET    /api/v1/recovery/economic-impact        # Economic damage assessment

# ─── Federation ─────────────────────────────────────────────
POST   /api/v1/federation/sync                 # Cross-agency sync
GET    /api/v1/federation/agencies             # Connected agency list
POST   /api/v1/federation/share-incident       # Share incident with agency
```

---

## 11. State Machine & Business Logic

### 11.1 Incident Full State Machine (6 States + 2 Terminal)

```
                    ┌──────────┐
                    │ REPORTED │  ← Public report, Scraper AI suggestion, Staff entry
                    └────┬─────┘
                         │ FIELD_STAFF verifies coordinates + basic info
                    ┌────▼─────┐
                    │ VERIFIED │  ← AI dedup passed, basic info confirmed
                    └────┬─────┘
                         │ FIELD_STAFF submits assessment form (dampak_* fields)
                    ┌────▼─────┐
                    │ ASSESSED │  ← All 6 dampak sections filled, priority scored
                    └────┬─────┘
                         │ COMMANDER creates Surat Perintah (instruction)
                    ┌────▼──────┐
                    │ COMMANDED │  ← Instruction issued, volunteers assigned
                    └────┬──────┘
                         │ Field actions logged by PWNU
                    ┌────▼────┐
                    │ ACTION  │  ← Volunteer check-in via GPS, field ops active
                    └────┬────┘
                         │ All missions complete
                    ┌────▼──────┐     ┌───────────┐
                    │ COMPLETED │     │ REJECTED  │  ← From any state
                    └───────────┘     └───────────┘
                    (terminal)        (terminal - spam/duplicate)
```

**Transition Matrix:**
```
REPORTED   → VERIFIED | REJECTED | DISMISSED
VERIFIED   → ASSESSED | REJECTED | DISMISSED
ASSESSED   → COMMANDED | REJECTED | DISMISSED
COMMANDED  → ACTION | REJECTED | DISMISSED
ACTION     → COMPLETED | REJECTED | DISMISSED
COMPLETED  → (terminal - immutable)
REJECTED   → (terminal - immutable)
DISMISSED  → (terminal - immutable)
```

**State Guards (enforced in `state-machine.ts`):**
```typescript
const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  REPORTED:   ['VERIFIED', 'REJECTED', 'DISMISSED'],
  VERIFIED:   ['ASSESSED', 'REJECTED', 'DISMISSED'],
  ASSESSED:   ['COMMANDED', 'REJECTED', 'DISMISSED'],
  COMMANDED:  ['ACTION', 'REJECTED', 'DISMISSED'],
  ACTION:     ['COMPLETED', 'REJECTED', 'DISMISSED'],
  COMPLETED:  [],
  REJECTED:   [],
  DISMISSED:  [],
}

interface TransitionGuard {
  from: IncidentStatus[]
  to: IncidentStatus
  requiredRole: UserRole[]
  sideEffects: string[]
  preconditions?: string[]
}

const TRANSITION_GUARDS: TransitionGuard[] = [
  {
    from: ['REPORTED'],
    to: 'VERIFIED',
    requiredRole: ['FIELD_STAFF', 'PCNU', 'PWNU', 'SUPER_ADMIN'],
    sideEffects: ['incident_logs entry', 'FCM notification to creator', 'socket broadcast']
  },
  {
    from: ['VERIFIED'],
    to: 'ASSESSED',
    requiredRole: ['FIELD_STAFF', 'PCNU', 'PWNU', 'SUPER_ADMIN'],
    preconditions: ['All 6 dampak_* fields must be filled', 'priority_score must be calculated'],
    sideEffects: ['dampak_* fields saved as JSONB', 'priority_level set via AI scoring', 'AI learning model updated', 'socket broadcast']
  },
  {
    from: ['ASSESSED'],
    to: 'COMMANDED',
    requiredRole: ['PWNU', 'SUPER_ADMIN', 'COMMANDER'],
    preconditions: ['At least one instruction (Surat Perintah) must be created'],
    sideEffects: ['instruction saved with nomor_sp', 'volunteers notified via FCM', 'socket broadcast']
  },
  {
    from: ['COMMANDED'],
    to: 'ACTION',
    requiredRole: ['PWNU', 'SUPER_ADMIN'],
    preconditions: ['incident_actions entry must exist'],
    sideEffects: ['action logged', 'status update broadcast']
  },
  {
    from: ['ACTION'],
    to: 'COMPLETED',
    requiredRole: ['PWNU', 'SUPER_ADMIN'],
    preconditions: ['All volunteer deployments resolved', 'SITREP generated'],
    sideEffects: ['copy to historical_disasters', 'SITREP PDF auto-generated', 'final audit log', 'socket broadcast']
  },
]
```

### 11.2 Spatial Deduplication Algorithm

```typescript
// PostGIS ST_DWithin with geography cast for meter-accurate distance
async function findDuplicates(
  lat: number,
  lng: number,
  disasterType: DisasterType,
  radiusKm: number = 1
): Promise<DuplicateResult[]> {
  return prisma.$queryRawUnsafe<DuplicateResult[]>`
    SELECT id, title, status, disaster_type,
           ST_Distance(
             location::geography,
             ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
           ) / 1000 as distance_km
    FROM incidents
    WHERE ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radiusKm * 1000}
          )
      AND disaster_type = ${disasterType}::text
      AND status NOT IN ('COMPLETED', 'REJECTED', 'DISMISSED')
      AND deleted_at IS NULL
    ORDER BY distance_km
    LIMIT 5
  `
}

// Haversine fallback (for environments without PostGIS)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

### 11.3 GPS Check-in Geo-fencing

```typescript
// Validation: Check-in must be within 1km of incident location
async function validateCheckIn(
  deploymentId: string,
  checkInLat: number,
  checkInLng: number
): Promise<{ valid: boolean; distanceKm: number }> {
  const result = await prisma.$queryRaw<{ distanceKm: number }[]>`
    SELECT ST_Distance(i.location::geography, ST_SetSRID(ST_MakePoint(${checkInLng}, ${checkInLat}), 4326)::geography) / 1000 as "distanceKm"
    FROM volunteer_deployments vd
    JOIN incidents i ON vd.incident_id = i.id
    WHERE vd.id = ${deploymentId}::uuid
  `
  const distance = result[0]?.distanceKm ?? Infinity
  return { valid: distance <= 1.0, distanceKm: Math.round(distance * 100) / 100 }
}
```

### 11.4 AI Severity Scoring Formula (Assessment Calculator)

**Weighted scoring** (ported from `incidentController.js:calculateAIScore`):

| Category | Field | Weight per Unit | Max Score |
|----------|-------|----------------|-----------|
| Dampak Manusia | meninggal | 100 | 1000+ |
| | hilang | 80 | 800 |
| | luka_berat | 50 | 500 |
| | luka_ringan | 20 | 200 |
| | mengungsi | 30 | 300 |
| | terdampak | 10 | 100 |
| Dampak Rumah | rusak_berat | 50 | 500 |
| | rusak_sedang | 30 | 300 |
| | rusak_ringan | 10 | 100 |
| Dampak Fasum | faskes/rs | 60 | 600 |
| | sekolah | 25 | 250 |
| | ibadah | 20 | 200 |
| | jembatan | 30 | 300 |
| Dampak Vital | air_bersih | 70 | 700 |
| | listrik | 50 | 500 |
| | jalan | 60 | 600 |
| Dampak Lingkungan | sawah (ha) | 5 | 50 |
| | ternak (ekor) | 2 | 20 |

**Level Thresholds:**
- Score > 1000 → `CRITICAL`
- Score > 500 → `HIGH`
- Score > 200 → `MEDIUM`
- Score ≤ 200 → `LOW`

### 11.5 Incident Command System (ICS) Command Structure

Roles within the ICS hierarchy are stored as a dedicated `command_structure` table linked to incidents, allowing dynamic assignment per incident rather than hardcoded roles.

```
                                ┌──────────────────────┐
                                │  Incident Commander   │
                                │  (Appointed by PWNU)  │
                                └──────┬───────┬───────┘
                       ┌───────────────┘       └───────────────┐
                       ▼                                       ▼
              ┌─────────────────┐                     ┌─────────────────┐
              │  Safety Officer  │                     │  Liaison Officer │
              │  (K3 standards)  │                     │  (External orgs)│
              └─────────────────┘                     └─────────────────┘
              ┌─────────────────┐                     ┌─────────────────┐
              │      PIO        │                     │  Legal Officer   │
              │ (Media/Public)  │                     │  (Compliance)    │
              └─────────────────┘                     └─────────────────┘
                       │                                       │
                       └───────────────────┬───────────────────┘
                                           ▼
                                ┌──────────────────┐
                                │  Operations       │
                                │  Section Chief    │
                                └──────┬───────────┘
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                  ┌──────────┐ ┌──────────┐ ┌──────────┐
                  │ Field Ops│ │  SAR     │ │ Medical  │
                  │ Teams    │ │ Unit     │ │ Evac     │
                  └──────────┘ └──────────┘ └──────────┘

                                ┌──────────────────┐
                                │  Logistics       │
                                │  Section Chief    │
                                └──────┬───────────┘
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                  ┌──────────┐ ┌──────────┐ ┌──────────┐
                  │ Supply   │ │Transport │ │ Base Camp│
                  │ Chain    │ │ Fleet    │ │ Support  │
                  └──────────┘ └──────────┘ └──────────┘

                                ┌──────────────────┐
                                │  Planning        │
                                │  Section Chief    │
                                └──────┬───────────┘
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                  ┌──────────┐ ┌──────────┐ ┌──────────┐
                  │Situation │ │Resource  │ │Documenta-│
                  │ Unit     │ │ Tracking │ │ tion Unit│
                  └──────────┘ └──────────┘ └──────────┘

                                ┌──────────────────┐
                                │  Intelligence    │
                                │  Section Chief    │
                                └──────┬───────────┘
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                  ┌──────────┐ ┌──────────┐ ┌──────────┐
                  │ Intel    │ │ GIS/Map  │ │ Drone    │
                  │ Analysis │ │ Unit     │ │ Recon    │
                  └──────────┘ └──────────┘ └──────────┘
```

| Position | Reports To | Appointment | Responsibilities |
|----------|-----------|-------------|------------------|
| Incident Commander | PWNU Pusat | By PWNU on incident creation | Overall incident authority, approves Surat Perintah, declares incident closed |
| Operations Section Chief | Incident Commander | By IC + PWNU | Directs field ops, SAR, medical evacuation teams |
| Logistics Section Chief | Incident Commander | By IC + PWNU | Supply chain, fleet management, base camp setup |
| Planning Section Chief | Incident Commander | By IC + PWNU | Situation tracking, resource forecasting, documentation |
| Intelligence Section Chief | Incident Commander | By IC + PWNU | Intel analysis, GIS mapping, drone reconnaissance data |
| Safety Officer | Incident Commander (staff) | Standing | Ensures K3 safety protocols, has STOP authority over unsafe ops |
| Liaison Officer | Incident Commander (staff) | Standing | Coordinates with BPBD, TNI/Polri, PMI, external agencies |
| Public Information Officer (PIO) | Incident Commander (staff) | Standing | Media relations, public updates, hoax counter-measures |

```typescript
// command_structure table (NEW)
model CommandStructure {
  id              String   @id @default(uuid())
  incidentId      String   @map("incident_id")
  position        CommandPosition // Commander | OpsChief | LogisticsChief | PlanningChief | IntelChief | SafetyOfficer | LiaisonOfficer | PIO
  userId          String   @map("user_id")
  appointedById   String   @map("appointed_by_id")
  appointedAt     DateTime @default(now()) @map("appointed_at")
  status          CommandStatus // Active | Replaced | Resigned
  notes           String?

  incident        Incident @relation(fields: [incidentId], references: [id])
  user            User     @relation(fields: [userId], references: [id])
  appointedBy     User     @relation(fields: [appointedById], references: [id])

  @@unique([incidentId, position])
  @@map("command_structure")
}
```

### 11.6 Deduplication + AI Scoring Pipeline

```
Public Report or Scraper Suggestion
  │
  ├─ 1. CENTRAL JAVA VALIDATION
  │     ├─ Coordinate bounds: lat -7.9 to -6.5, lng 108.7 to 111.5
  │     └─ Text keyword match against 35+ Central Java region names
  │
  ├─ 2. SPATIAL DEDUP (PostGIS ST_DWithin, 1km radius)
  │     ├─ Found existing active incident → attach as update
  │     └─ Not found → continue
  │
  ├─ 3. FAKE REPORT DETECTION
  │     ├─ Regex patterns (hoax, donation scams, gibberish, empty)
  │     ├─ Title length < 5 chars → reject
  │     ├─ Missing/zero coordinates → reject
  │     └─ Gemini LLM confidence check (optional)
  │
  ├─ 4. SEVERITY SCORING
  │     ├─ Volcano keyword weighting (IV/Awas=1200, III/Siaga=700, etc.)
  │     ├─ Disaster keywords (tsunami=500, bandang=300, meninggal=100, etc.)
  │     └─ Level classification (CRITICAL/HIGH/MEDIUM/LOW)
  │
  ├─ 5. AUTO-CREATE (if confidence > 0.7 from reliable source)
  │     └─ Reliable sources: BMKG, MAGMA, Antara → auto-verify
  │
  ├─ 6. LEARNING ENGINE UPDATE
  │     ├─ disaster_learning: occurrence_count++, avg_severity recalc
  │     └─ Probability recalculation for region+disaster_type
  │
  └─ 7. NOTIFICATION
        └─ FCM push to FIELD_STAFF/PCNU in region
```

---

## 12. Authentication & RBAC

### 12.1 JWT Structure
```typescript
interface JwtPayload {
  sub: string        // user UUID
  role: UserRole
  region?: string
  iat: number
  exp: number
}

// Access Token: 24h
// Refresh Token: 7d (stored in httpOnly cookie for web, secure storage for mobile)
```

### 12.2 Role Hierarchy & Permissions
| Feature | PUBLIC | FIELD_STAFF | RELAWAN | PCNU | PWNU | SUPER_ADMIN |
|---------|--------|-------------|---------|------|------|-------------|
| View dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit report | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View incidents | ✅ | ✅(own region) | ✅(own region) | ✅(own region) | ✅(all) | ✅(all) |
| Verify incidents | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Dispatch missions | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage volunteers | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View analytics | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| System config | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 12.3 Auth Middleware
```typescript
// Applied per-route
router.get('/incidents', authenticate, authorize('FIELD_STAFF', 'PCNU', 'PWNU', 'SUPER_ADMIN'), handler)

// Region-scoped: PCNU can only see their region
router.get('/incidents', authenticate, authorize('FIELD_STAFF', 'PCNU', 'PWNU', 'SUPER_ADMIN'), scopeRegion(), handler)
```

---

## 13. Real-time & Socket.IO

### 13.1 Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `incident:created` | Server→All | `IncidentDto` | New incident reported |
| `incident:updated` | Server→All | `IncidentDto` | Incident status change |
| `incident:emergency` | Server→Role | `EmergencyAlert` | High-severity broadcast |
| `chat:message` | Server→Conversation | `ChatMessageDto` | New chat message |
| `chat:typing` | Both→Conversation | `{userId, conversationId}` | Typing indicator |
| `notification:new` | Server→User | `NotificationDto` | New notification |
| `volunteer:checkin` | Server→Role | `GeoCheckIn` | Volunteer arrived on site |
| `map:update` | Server→All | `MapUpdate` | Marker position update |

### 13.2 Socket Authentication
```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    socket.data.user = decoded
    next()
  } catch {
    next(new Error('Authentication failed'))
  }
})

// Room management
socket.on('join:incident', (incidentId) => {
  socket.join(`incident:${incidentId}`)
})
```

### 13.3 Event-Driven Architecture

The system uses a message broker (Redis Streams / BullMQ) to decouple synchronous HTTP flows from background processing, enabling resilience, retry, and audit.

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ Frontend │────▶│  API Service │────▶│ Redis Stream │────▶│  Worker  │
│ (HTTP)   │     │  (Publisher)  │     │  / BullMQ    │     │ (Consumer)│
└──────────┘     └──────────────┘     └──────────────┘     └─────┬────┘
                                                                 │
                    ┌────────────────────────────────────────────┘
                    ▼                    ▼                    ▼
            ┌────────────┐     ┌────────────┐     ┌────────────┐
            │ Notification │     │  AI/ML     │     │ PDF/Report │
            │  Worker     │     │  Worker    │     │  Worker    │
            └────────────┘     └────────────┘     └────────────┘
```

**Event Catalog:**

| Event | Producer | Consumer(s) | Queue | Description |
|-------|----------|------------|-------|-------------|
| `incident.created` | Incident Service | Notification Worker, AI Worker, Analytics Worker | `incident:events` | New incident reported |
| `incident.status_changed` | State Machine | Notification Worker, Audit Worker | `incident:events` | Status transition |
| `report.submitted` | Report Service | AI Worker (validation), Notification Worker | `report:events` | Public report submitted |
| `volunteer.checkin` | Volunteer Service | Map Worker, Analytics Worker | `volunteer:events` | GPS check-in |
| `scraper.data_ready` | Scraper Scheduler | AI Orchestrator Worker | `scraper:events` | External data fetched |
| `analytics.refresh` | Scheduler (cron) | Analytics Worker | `analytics:events` | Periodic KPI recalculation |
| `notification.send` | Any Service | FCM Worker | `notification:events` | Push notification dispatch |
| `pdf.generate` | Analytics Service | PDF Worker | `pdf:events` | SITREP / report generation |
| `audit.log` | Audit Middleware | Audit Worker | `audit:events` | Persist audit trail |
| `sync.offline_queue` | Flutter Client | Sync Worker | `sync:events` | Process offline queue items |

**BullMQ Queue Configuration:**

```typescript
import { Queue, Worker, QueueScheduler } from 'bullmq'

// Queue definitions
const incidentQueue = new Queue('incident:events', { connection: redisConnection })
const notificationQueue = new Queue('notification:events', { connection: redisConnection })
const scraperQueue = new Queue('scraper:events', { connection: redisConnection })
const pdfQueue = new Queue('pdf:events', { connection: redisConnection })
const analyticsQueue = new Queue('analytics:events', { connection: redisConnection })

// Worker with retry + dead-letter
const notificationWorker = new Worker('notification:events', async job => {
  await fcmService.send(job.data)
}, {
  connection: redisConnection,
  concurrency: 10,
  limiter: { max: 100, duration: 1000 }, // 100 notifications/sec
})

// Failed jobs → dead-letter queue for manual inspection
notificationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job.id, error: err.message }, 'Notification job failed')
})
```

**Idempotency:** Every event carries an `idempotencyKey` (UUIDv4). Workers check Redis key before processing. Key TTL = 24h.

```typescript
async function processEvent(queue: string, event: BaseEvent): Promise<void> {
  const dedupKey = `dedup:${queue}:${event.idempotencyKey}`
  const alreadyProcessed = await redis.set(dedupKey, '1', 'NX', 'EX', 86400)
  if (!alreadyProcessed) return // Duplicate, skip
  // ... process event
}
```

---

## 14. AI Engine & Scraper System

### 14.1 Scrapers

| Scraper | Source Type | URL / Endpoint | Interval | Data Produced |
|---------|-------------|----------------|----------|---------------|
| BMKG Earthquake | XML Feed | `https://data.bmkg.go.id/autogempa.xml` | 1 minute | title, magnitude, depth, lat, lng, region, time, raw_content |
| BMKG Nowcast | RSS | `https://www.bmkg.go.id/alerts/nowcast/id/rss.xml` | 30 minutes | weather alert, region, severity |
| MAGMA Volcano | REST API | `https://api-magma.esdm.go.id/v1/` (volcano codes: MER, SMR, SLA, DIE, SBG, SUN) | Dynamic (based on alert level) | volcano name, status_level (I-IV/I-II), VONA, lat, lng, region |
| CEVADIS BPBD | HTML | BPBD Jateng portal (scraped via cheerio) | 30 minutes | disaster reports, location, type, time |
| News RSS | RSS | Antara Jateng, Kompas, Detik | 60 minutes | title, content, region, category, url |

### 14.2 AI Orchestrator Pipeline

```
Scraper output (normalized IncidentSuggestion)
  │
  ├─ 1. CENTRAL JAVA VALIDATION
  │     ├─ Coordinate bounds check: lat -7.9 to -6.5, lng 108.7 to 111.5
  │     └─ Text keyword match against 35+ Central Java region names
  │
  ├─ 2. FAKE REPORT DETECTION
  │     ├─ Pattern match: hoax, donation scams, clickbait, empty/gibberish content
  │     ├─ Title length < 5 chars → reject
  │     ├─ Missing or zero coordinates → reject
  │     └─ Suspicious sources (anonymous, unknown, guest, user) → reject
  │
  ├─ 3. SPATIAL DEDUPLICATION (PostGIS ST_DWithin)
  │     ├─ Query: active incidents within 1km radius, same disaster_type, last 72h
  │     ├─ Found → update existing incident with new data (enrich, never duplicate)
  │     └─ Not found → proceed to creation
  │
  ├─ 4. SEVERITY SCORING (Keyword Weighting)
  │     ├─ Volcano: IV/Awas=1200, III/Siaga=700, II/Waspada=300
  │     ├─ Keywords: tsunami/likuefaksi=500, bandang/letusan=300
  │     ├─ Casualties: meninggal/tewas=100, hilang=80, luka/sakit=40, mengungsi=30
  │     ├─ Damage: rusak_berat/ambruk=50, putus/lumpuh=60
  │     └─ Level: CRITICAL>1000 | HIGH>500 | MEDIUM>200 | LOW
  │
  ├─ 5. AUTO-CREATE (+ Auto-verify if reliable source)
  │     ├─ Reliable sources (BMKG, MAGMA, Antara) → auto-verify
  │     └─ Other sources → REPORTED status, flag for staff review
  │
  ├─ 6. LEARNING ENGINE UPDATE
  │     ├─ disaster_learning: occurrence_count++, avg_severity_score recalc
  │     ├─ Probability = (base_freq + recent_activity + severity) × time_decay
  │     └─ Capped at 99.9%
  │
  └─ 7. NOTIFICATION
        └─ FCM push to FIELD_STAFF/PCNU in affected region
```

### 14.3 Fake Detection Algorithm (from `ai_orchestrator.js`)
```typescript
const FAKE_PATTERNS = [
  /hoax|bohong|palsu|fake/i,
  /donasi|donor|bantuan.*uang|transfer.*rekening/i,
  /kliklink|klikaja|bonus.*gratis/i,
  /info.*tidak.*resmi|berita.*tidak.*diverifikasi/i,
  /test|testing|coba/i,
  /^\s*$|^undefined$|^null$/i,
]

function isFakeReport(intel: IncidentSuggestion): { fake: boolean; reason?: string } {
  const text = `${intel.title || ''} ${intel.rawContent || ''}`
  for (const pattern of FAKE_PATTERNS) {
    if (pattern.test(text)) return { fake: true, reason: pattern.toString() }
  }
  if (!intel.title || intel.title.length < 5) return { fake: true, reason: 'Title too short' }
  if (!intel.lat || !intel.lng || intel.lat === 0 || intel.lng === 0) return { fake: true, reason: 'Invalid coordinates' }
  return { fake: false }
}
```

### 14.4 Learning Engine & Probability Calculation

```typescript
async function calculateDisasterProbability(
  region: string,
  disasterType: string,
  severityScore: number
): Promise<ProbabilityResult> {
  // Get learning data
  const learning = await prisma.disasterLearning.findUnique({
    where: { region_disasterType: { region, disasterType } }
  })

  // Recent 30-day activity
  const recentStats = await prisma.incident.aggregate({
    where: {
      region, disasterType,
      createdAt: { gte: subDays(new Date(), 30) }
    },
    _count: true,
    _avg: { priorityScore: true }
  })

  const count30days = recentStats._count
  const avgScore = recentStats._avg.priorityScore ?? 0

  // Base probability from historical frequency (max 50%)
  const frequencyRatio = learning
    ? learning.occurrenceCount / Math.max(learning.totalIncidentsInRegion, 1)
    : 0
  const baseProb = Math.min(frequencyRatio * 100, 50)

  // Recent activity bonus (max 30%)
  const recentActivityFactor = Math.min(count30days * 5, 30)

  // Severity impact (max 20%)
  const severityFactor = Math.min(severityScore / 20, 20)

  // Time decay over 365 days
  const daysSinceLast = learning
    ? differenceInDays(new Date(), learning.lastIncidentDate)
    : 365
  const timeDecay = Math.max(0.5, 1.0 - daysSinceLast / 365)

  const probability = Math.min(
    (baseProb + recentActivityFactor + severityFactor) * timeDecay,
    99.9
  )

  return {
    probability: Math.round(probability * 100) / 100,
    factors: {
      baseFrequency: Math.round(baseProb * 100) / 100,
      recentActivity: Math.round(recentActivityFactor * 100) / 100,
      severityImpact: Math.round(severityFactor * 100) / 100,
      timeDecay: Math.round(timeDecay * 100) / 100,
    },
    recentCount30d: count30days,
  }
}
```

### 14.5 Probabilistic Models (from `probabilisticModels.js`)

| Model | Formula | Use Case |
|-------|---------|----------|
| **MLE Poisson** | λ = incidents/month, P(k) = e^(-λ) × λ^k / k! | Baseline frequency estimation |
| **Bayesian Gamma-Poisson** | α = prior_occurrences + 1, β = prior_months + 1 | Sparse data handling |
| **Holt-Winters** | Trend + Seasonality (α=0.3, β=0.1, γ=0.1) | Monthly trend with seasonal pattern |
| **Seasonal Adjustment** | Wet season (Oct-Apr) × 1.3, Dry (May-Sep) × 0.7 | Central Java climate pattern |
| **Rain-Adjusted** | rain_factor = current_rain / avg_rain × flood_risk | Dynamic weather integration |
| **Hybrid Ensemble** | Weighted average of all above | Final prediction output |

### 14.6 AI Agent Intelligence Layer

Each AI agent is a specialized Gemini-powered module with a defined role, tool access, and output format. Agents run as BullMQ workers triggered by events or on demand via the `/api/v1/ai/briefing` endpoint.

```
                                ┌──────────────────────┐
                                │  Agent Orchestrator   │
                                │  (Routes tasks based  │
                                │   on event type)      │
                                └──┬───┬───┬───┬───┬───┘
                       ┌───────────┘   │   │   │   └───────────┐
                       ▼               ▼   ▼   ▼               ▼
              ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
              │  Risk Analyst │   │ Situation    │   │ Logistics    │
              │  Agent        │   │ Summarizer   │   │ Planner      │
              └──────────────┘   └──────────────┘   └──────────────┘
              ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
              │  Media        │   │ Weather      │   │ Public       │
              │  Verification │   │ Analyst      │   │ Sentiment    │
              └──────────────┘   └──────────────┘   └──────────────┘
              ┌──────────────┐   ┌──────────────┐
              │  Volunteer   │   │ Executive    │
              │  Coordinator │   │ Briefing     │
              └──────────────┘   └──────────────┘
```

| Agent | Trigger | Tools | Output |
|-------|---------|-------|--------|
| **Risk Analyst Agent** | `incident.created`, `scraper.data_ready` | Gemini + disaster_learning DB + historical_disasters DB + PostGIS proximity query | Risk score (1-100), affected population estimate, secondary hazard probability |
| **Situation Summarizer Agent** | `incident.status_changed`, cron every 30min | Gemini + incident detail + dampak_* JSONB + action log + deployment status | Human-readable SITREP paragraph, key metrics table, trend direction |
| **Logistics Planner Agent** | `incident.assessed`, `asset.checkout` | Gemini + shelter capacity + asset_inventories + logistics_requests + road network (PostGIS) | Supply gap analysis, optimal warehouse dispatch plan, convoy routing suggestion |
| **Media Verification Agent** | `report.submitted`, `scraper.data_ready` | Gemini + FAKE_PATTERNS + URL reputation check + cross-reference with BMKG/MAGMA | Verdict: CONFIRMED / SUSPICIOUS / FAKE, source trust score (0-1), recommended action |
| **Weather Analyst Agent** | cron every 60min, heavy rain event | Gemini + OpenWeatherMap data + BMKG nowcast + historical rain patterns | 6-hour precipitation forecast, flood/landslide risk elevation, affected kecamatan list |
| **Public Sentiment Agent** | cron every 120min, major incident | Gemini + scraped news + social media mentions + intel_news table | Sentiment trend (positive/negative/panicked), emerging rumors to counter, recommended PIO statement |
| **Volunteer Coordinator Agent** | `incident.commanded` | Gemini + volunteer_performance + volunteer_devices + location proximity | Recommended deployment list (top 10 closest+rated volunteers), skill gap alert |
| **Executive Briefing Agent** | on-demand (`POST /api/v1/ai/briefing`) | All above agents + analytics dashboard data + ICS command structure | 3-paragraph executive brief, critical stats, decision recommendations, ready-to-share PDF |

**Agent Implementation Pattern:**

```typescript
class AIAgent {
  constructor(
    protected model: GenerativeModel,  // Gemini
    protected tools: AgentTools,        // DB queries, APIs, PostGIS
    protected systemPrompt: string
  ) {}

  async run(context: AgentContext): Promise<AgentOutput> {
    const prompt = this.buildPrompt(context)
    const response = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,         // Low for factual consistency
        maxOutputTokens: 2048,
      },
    })

    const result = this.parseResponse(response.text())
    await this.logMetrics(context, result)
    return result
  }

  protected systemPrompt = `You are the Risk Analyst Agent for NURisk disaster management.
Your task: analyze incident data and produce a structured risk assessment.
Always output valid JSON with fields: riskScore, affectedPopulation, secondaryHazardProbability, reasoning.
Base your analysis on real historical disaster data, not assumptions.
If data is insufficient, state what additional data is needed.`
}
```

**Agent Output Format (all agents conform):**

```typescript
interface AgentOutput {
  agentName: string
  timestamp: string
  confidence: number           // 0-1, self-assessed
  data: Record<string, any>    // Agent-specific payload
  dataSources: string[]        // Sources consulted
  caveats: string[]            // Known limitations
}
```

### 14.7 AI Governance & Explainability

As AI takes on operational decision-making roles, governance and transparency are mandatory.

| Principle | Implementation |
|-----------|---------------|
| **Human Override** | Every AI recommendation has a manual override (flag `ai_overridden: true`). No autonomous action without human confirmation for Tier 1-2 decisions. |
| **Decision Audit Trail** | Every AI-generated output stores the full input context, model version, confidence score, and human decision in `decision_audit_log` table. |
| **Explainability** | AI outputs include `reasoning` field with bullet-point explanation. Black-box models are not allowed for operational decisions. |
| **Confidence Thresholds** | AI actions gated by confidence: < 0.5 = discarded, 0.5-0.7 = suggestion only, 0.7-0.9 = recommended, > 0.9 = auto-action (with audit). |
| **Bias Monitoring** | Quarterly audit comparing AI decisions across regions for equity. Disparities > 15% trigger retraining. |
| **Model Registry** | All models tracked in `ml_models` table with version, training date, metrics. Rollback supported. |

```typescript
interface DecisionAuditEntry {
  id: string
  decisionType: string                    // 'EVACUATION_PRIORITY' | 'RESOURCE_DISPATCH' | ...
  triggeredBy: string                     // 'AI' | 'HUMAN' | 'PLAYBOOK'
  aiModelVersion?: string
  inputContext: Record<string, any>       // Snapshot of relevant data
  aiRecommendation?: Record<string, any>  // What AI suggested
  humanDecision: 'APPROVED' | 'REJECTED' | 'MODIFIED'
  humanNotes?: string
  finalAction: Record<string, any>        // What was actually done
  outcome?: string                        // Filled after action completes
  createdAt: string
}
```

> For AI Operational Agents, see [Section 14.6](#146-ai-agent-intelligence-layer).
> For Simulation & Decision Engine, see [Section 25](#25-decision-engine--simulation-platform).
> For Trust & Verification System, see [Section 27](#27-situational-awareness--trust-intelligence).

---

## 15. Offline-First Strategy

### 15.1 Web (PWA)

| Technique | Library | Behavior |
|-----------|---------|----------|
| Service Worker | `vite-plugin-pwa` + Workbox | Registers SW on first load, caches static assets on install |
| API Cache (GET) | Workbox `NetworkFirst` strategy | Stale-while-revalidate for KPIs (30s), NetworkFirst for incident detail |
| Offline Queue (POST) | `idb` (IndexedDB) + Background Sync API | Queues reports + assessments when offline; flushes via `sync` event when online |
| Install Prompt | `beforeinstallprompt` event listener | Save as PWA on home screen |
| Offline Indicator | `navigator.onLine` listener | Show `OfflineBanner` component when offline, auto-hide on reconnect |

```typescript
// Service Worker strategy (sw.ts)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/incidents'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'incidents-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 5 * 60 }),
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)
```

### 15.2 Flutter

| Technique | Library | Tables / Data |
|-----------|---------|---------------|
| SQLite Cache | sqflite + drift | `cached_incidents`, `cached_assets`, `cached_regions`, `cached_disaster_types`, `cached_notifications` |
| Encrypted Storage | `flutter_secure_storage` | JWT access token, refresh token |
| Offline Queue | sqflite (`offline_queue` table) | `{id, type (CREATE|UPDATE|DELETE), entity_type, entity_id, payload (JSON), idempotency_key (UUID), retry_count, max_retries (5), created_at}` |
| Sync Engine | `connectivity_plus` listener + Timer | Flushes queue on connectivity restored + 15-min periodic timer |
| Conflict Resolution | Server-authoritative (last-write-wins) | Client sends `updated_at` timestamp; server rejects if outdated |

```dart
// Sync engine queue processing
class SyncEngine {
  Future<void> processQueue() async {
    final pendingTasks = await localDatabase.getPendingTasks(limit: 20)
    for (final task in pendingTasks) {
      try {
        await apiClient.execute(task)
        await localDatabase.markTaskCompleted(task.id)
      } on AppException catch (e) {
        if (task.retryCount >= task.maxRetries) {
          await localDatabase.markTaskFailed(task.id, e.message)
        } else {
          await localDatabase.incrementRetry(task.id)
        }
      }
    }
  }
}
```

### 15.3 Enhanced Resilient Mode

> For the full Resilient Architecture (Degraded Mode, Mesh Networking, Edge Computing, Delta Sync, Conflict Resolution), see [Section 29.2](#292-resilient-offline-architecture-enhanced) and [Section 29.3](#293-edge-computing-architecture).

The offline strategy above covers basic connectivity loss. Section 29 extends this to:

- **Degraded Mode** — Full local operation on SQLite/IndexedDB when server unreachable
- **Mesh Mode** — Peer-to-peer sync via WiFi Direct/BLE between nearby devices
- **Edge Nodes** — Local Raspberry Pi/Intel NUC servers at PCNU/BPBD offices
- **Delta Sync** — Versioned change tracking, last-write-wins conflict resolution

---

## 16. Security Requirements (Hardened)

### 16.1 PII Protection Matrix (CRITICAL — Automated via Middleware)

| PII Field | Public API | FIELD_STAFF API | PCNU API | PWNU/ADMIN API | Implementation |
|-----------|-----------|----------------|----------|----------------|----------------|
| `whatsapp_number` | ❌ STRIPPED | ✅ Own region | ✅ Own region | ✅ Full | `pii-shield.ts` middleware + DTO auto-map |
| `reporter_name` | ❌ → "Pelapor" | ✅ Own region | ✅ Own region | ✅ Full | Zod transform on response |
| `reporter_phone` | ❌ STRIPPED | ✅ Own region | ✅ Own region | ✅ Full | DTO field exclusion |
| `password_hash` | ❌ STRIPPED | ❌ STRIPPED | ❌ STRIPPED | ❌ STRIPPED | Never in any response |
| `medical_history` | ❌ STRIPPED | ❌ STRIPPED | ❌ STRIPPED | ✅ Full | Role-gated repository |
| `volunteer.phone` | ❌ STRIPPED | ❌ STRIPPED | ❌ STRIPPED | ✅ Full | PII gated by role level ≥ 7 |
| `nik` (KTP) | ❌ STRIPPED | ❌ STRIPPED | ❌ STRIPPED | ✅ Full | Stored encrypted at rest |
| `exact_location` | ❌ → rounded to 0.01° (~1km) | ✅ Full | ✅ Full | ✅ Full | `ROUND(lat, 2)` for public |

**CI Enforcement**: Automated test suite calls every public endpoint and asserts ZERO PII fields in response.

### 16.2 Authentication Security

| Measure | Specification |
|---------|--------------|
| Password hashing | bcrypt, salt rounds 12 (cost factor) |
| JWT signing algorithm | HS256 with 64-byte random secret (256 bits) |
| Access token TTL | 24 hours (configurable via `JWT_ACCESS_EXPIRY`) |
| Refresh token TTL | 7 days (rotation on each use, old token revoked) |
| Refresh token storage | httpOnly secure cookie (web) / flutter_secure_storage (mobile) |
| Rate limiting (auth endpoints) | 10 attempts/min per IP, 3 attempts/min per username |
| Account lockout | After 5 failed attempts → lock 30 minutes (stored in Redis) |
| Secret key registration | `SECRET_KEY_PWNU` / `SECRET_KEY_PCNU` in env, rotated quarterly |
| CORS whitelist | Production: only `https://nurisk.nu.or.id` and `https://admin.nurisk.nu.or.id` |
| JWT fallback secret | NONE — hardcoded fallback `'PUSDATIN_JATENG_SECRET_2024'` in current code MUST be removed |

### 16.3 API Security

| Measure | Specification |
|---------|--------------|
| Global rate limiting | 100 req/min per IP (sliding window via `express-rate-limit` + Redis) |
| Burst rate limiting | 20 req/10s per IP |
| Request body size | 10MB max (JSON), 20MB max (multipart uploads) |
| File upload types | Whitelist: `image/jpeg`, `image/png`, `application/pdf` |
| File upload size | Max 5MB per file, max 5 files per request |
| File upload scan | ClamAV integration for virus scanning |
| SQL injection | Prevented by Prisma ORM (parameterized queries always) |
| XSS prevention | Helmet.js `Content-Security-Policy` + React's automatic output escaping |
| CSRF protection | `SameSite=Strict` cookie attribute + `Origin` header validation |
| HTTP security headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `Content-Security-Policy: default-src 'self'`, `Permissions-Policy: geolocation=(self)` |
| Request ID | Every request tagged with `X-Request-ID` UUID for tracing |

### 16.4 Infrastructure Security

| Measure | Specification |
|---------|--------------|
| SSL/TLS | Nginx termination, Let's Encrypt auto-renewal, TLS 1.3 only, HSTS preload |
| Secrets management | All secrets via environment variables (Docker secrets in production) |
| Database network | Private network only (not exposed to internet), strong 32-char password |
| Redis security | `requirepass` enabled, protected mode, separate VPC, port not exposed |
| MinIO security | Access key + secret key (min 20 chars), TLS, bucket policies (read-only public URLs) |
| Container scanning | Trivy in CI pipeline — fail build on CRITICAL/HIGH vulnerabilities |
| Dependency scanning | `npm audit` on every PR, Dependabot auto-PR for vuln fixes |
| Secrets scanning | `truffleHog` in pre-commit hook — prevents any .env/production secrets from being committed |
| Audit trail | ALL data mutations logged to `audit_logs` with: actor_id, action, entity_type, entity_id, JSON diff of changes, IP address, timestamp |

### 16.5 Security Incident Response

1. **Detection**: Automated alerts via Sentio/Grafana for: 5xx spike, rate limit breaches, auth failures > 50/min
2. **Containment**: Immediate JWT secret rotation + force logout all users via `user_sessions` table
3. **Eradication**: Identify and patch vulnerability, rotate all affected secrets
4. **Recovery**: Restore from last known-good database backup, re-deploy with fix
5. **Post-mortem**: Document in `docs/security/incident-log.md` within 24 hours

### 16.6 Trust Intelligence & Misinformation Defense

> For the full Trust & Verification System (trust score engine, verification pipeline, media forensics, deepfake detection), see [Section 27.2](#272-trust--verification-system).

In disaster contexts, misinformation causes real casualties. The Trust Intelligence system extends security by:

- **Source Reliability Scoring** — Automatic trust score for every data source (0-1). BMKG/MAGMA = 1.0, social media = 0.3, anonymous = 0.1
- **Multi-Source Corroboration** — Cross-reference incidents across independent sources. Higher corroboration = higher confidence
- **Media Forensics** — EXIF analysis, Error Level Analysis (ELA), deepfake CNN scanning via Gemini Vision
- **Verification Pipeline** — Automated confidence assessment before data enters operational flow. Sources below 0.5 confidence require human review before any dispatch action

---

## 17. Testing Strategy

### 17.1 Backend (Vitest)
| Layer | Tool | Target Coverage |
|-------|------|----------------|
| Unit (Service) | Vitest | 90%+ |
| Integration (Controller + DB) | Vitest + Supertest | 80%+ |
| E2E | Playwright + backend | Key flows |

Key test cases:
- Auth: login, register, token refresh, invalid credentials, expired token
- Incident: CRUD, state transitions (valid + invalid), dedup, PII shield
- Volunteer: CRUD, deployment, check-in geo-validation
- Chat: send message, read receipts, unread count
- Analytics: KPI calculation, trend aggregation

### 17.2 Frontend Web (Vitest + Testing Library)
| Layer | Tool | Target Coverage |
|-------|------|----------------|
| Component | Vitest + @testing-library/react | 70%+ |
| Hook | Vitest + @testing-library/react-hooks | 80%+ |
| E2E | Playwright | Critical user flows |

### 17.3 Flutter
| Layer | Tool | Target Coverage |
|-------|------|----------------|
| BLoC | bloc_test | 80%+ |
| Repository | mockito | 70%+ |
| Widget | flutter_test | 60%+ |
| Integration | integration_test | Key flows |

---

## 18. CI/CD Pipeline

### 18.1 GitHub Actions (`.github/workflows/ci.yml`)
```yaml
name: NURisk CI/CD

on:
  push: [main, develop]
  pull_request: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        workspace: [backend, frontend-web, frontend-apk]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g turbo
      - run: turbo lint --filter=${{ matrix.workspace }}

  test:
    needs: lint
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:15-3.4
        env: { POSTGRES_DB: nurisk_test, POSTGRES_PASSWORD: test }
    strategy:
      matrix:
        workspace: [backend, frontend-web, frontend-apk]
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g turbo
      - run: turbo test --filter=${{ matrix.workspace }}
      - uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        workspace: [backend, frontend-web]
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g turbo
      - run: turbo build --filter=${{ matrix.workspace }}

  build-apk:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.x', channel: stable }
      - run: flutter build apk --split-per-abi
      - uses: actions/upload-artifact@v4
        with:
          name: nurisk-apk
          path: build/app/outputs/flutter-apk/*.apk

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.yml up -d --build
```

---

## 19. Docker & Deployment

### 19.1 Docker Compose
```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports: ['80:80', '443:443']
    volumes:
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./apps/frontend-web/dist:/usr/share/nginx/html
    depends_on: [backend]

  backend:
    build: ./apps/backend
    ports: ['7860:7860']
    env_file: ./apps/backend/.env
    depends_on: [db, redis, minio]
    volumes:
      - uploads:/app/uploads

  db:
    image: postgis/postgis:15-3.4
    ports: ['5432:5432']
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: pusdatin_nu
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

  minio:
    image: minio/minio
    ports: ['9000:9000', '9001:9001']
    volumes: [minio_data:/data]
    command: server /data --console-address ':9001'

  worker:
    build: ./apps/backend
    command: node dist/jobs/worker.js
    env_file: ./apps/backend/.env
    depends_on: [redis, db]

volumes:
  postgres_data:
  minio_data:
  uploads:
```

### 19.2 Environment Variables
```bash
# Backend (.env)
NODE_ENV=production
PORT=7860
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/pusdatin_nu
REDIS_URL=redis://redis:6379
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
GEMINI_API_KEY=${GEMINI_API_KEY}
SECRET_KEY_PWNU=${SECRET_KEY_PWNU}
SECRET_KEY_PCNU=${SECRET_KEY_PCNU}
CORS_ORIGINS=https://nurisk.nu.or.id,http://localhost:5173
```

---

## 20. Success Metrics

| Metric | Current | Target (v4.0) | Measurement |
|--------|---------|--------------|-------------|
| API Response P95 | ~2-3s (no cache) | < 500ms | Grafana/Prometheus |
| Verification Cycle | ~24h | < 2h | IncidentLog timestamps |
| Offline Sync Delay | N/A (not implemented) | < 30s after reconnect | SyncService metrics |
| Test Coverage | 0% | > 80% backend, > 60% frontend | Codecov |
| APK Cold Start | ~4s | < 2.5s | Firebase Performance |
| APK Memory Usage | ~120MB | < 80MB | DevTools |
| PII Leaks | Confirmed (whatsapp_number) | Zero | Automated audit |
| Deploy Time | Manual | < 15 min CI/CD | GitHub Actions |
| Duplicate Detection | None | > 50% auto-merged | IncidentLog dedup events |
| Uptime | Unknown | > 99.5% | Uptime monitoring |

---

## 21. Build Order & Milestones

Implementation follows three priority tiers based on operational maturity:

```
TIER 1 — FOUNDATION (Wajib)     → Weeks 1-6: Core operational maturity
TIER 2 — HIGH-END (Elite)       → Weeks 7-12: Elite platform capabilities
TIER 3 — NATIONAL SCALE         → Weeks 13-16: Infrastructure transformation
```

### TIER 1: Operational Maturity Foundation (Weeks 1-6)

#### Phase 0: Foundation (Week 1)
- [ ] Init Turborepo monorepo structure
- [ ] Setup shared package (`packages/shared`) with types, enums, DTOs, Zod schemas
- [ ] Setup Prisma schema (migrate from current DB)
- [ ] Configure CI/CD pipeline (lint → test → build)
- [ ] Setup Docker Compose (backend + db + redis + minio + TimescaleDB + Neo4j)

#### Phase 1: Backend Core (Week 2-3)
- [ ] Auth module (login, register, JWT, RBAC middleware)
- [ ] Incident module (CRUD, state machine, deduplication, DTO)
- [ ] Report module (public submission + PII shield)
- [ ] Volunteer module (CRUD, deployment, check-in Geo validation)
- [ ] Incident Command System (ICS) structure table + assignment API
- [ ] Error handling middleware + standardized response format
- [ ] Socket.IO setup with auth + room management
- [ ] Audit logging middleware

#### Phase 2: Backend Extended (Week 4-5)
- [ ] Shelter + Warehouse + Asset modules
- [ ] Logistics module (request → approve → fulfill)
- [ ] Chat module (conversations, messages, read receipts)
- [ ] Notification module (in-app + FCM)
- [ ] Analytics module (dashboard KPIs, trends)
- [ ] Map module (GeoJSON, heatmap, command map)
- [ ] Intel module (scraped news)
- [ ] Instruction module (Surat Perintah)

#### Phase 3: AI & Scraping (Week 5-6)
- [ ] Port scraper system to TypeScript (BMKG, MAGMA, CEVADIS, News)
- [ ] Port AI orchestrator with Gemini integration
- [ ] Port probabilistic models
- [ ] Weather service
- [ ] Scheduler/cron jobs with BullMQ
- [ ] **Decision Engine** — evacuation priority, risk assessment, critical zone detection
- [ ] **Resource Intelligence** — resource health, deployment readiness, dispatch optimizer
- [ ] **Trust & Verification System** — trust score engine, verification pipeline, media forensics
- [ ] **Observability Stack** — OpenTelemetry collector + Prometheus + Grafana + Loki + Sentry
- [ ] **Offline Resilience** — adaptive sync, degraded mode, conflict resolution engine
- [ ] **Disaster UX** — emergency mode API, panic reporting endpoint, voice-first support

#### Phase 4: Frontend Web & Flutter APK (Week 5-8)
- [ ] Project scaffold (Vite + React 19 + TypeScript + Tailwind)
- [ ] shadcn/ui component library setup
- [ ] React Router 7 with all routes
- [ ] TanStack Query integration
- [ ] Zustand stores (auth, incident, UI)
- [ ] Public Dashboard (KPIs, weather, alerts, disaster cards, trends)
- [ ] Map Page (Leaflet + incident markers, WMS tile layers)
- [ ] Report Page + Panic Button (emergency mode)
- [ ] Resource Page (asset view + gap analysis)
- [ ] Auth pages (login + register)
- [ ] Field Staff pages (assessment, regional incidents)
- [ ] Relawan pages (missions, check-in)
- [ ] Admin pages (dashboard, command center, chat, analytics, ICS structure)
- [ ] Situational Awareness pages (tactical, operational, strategic, executive)
- [ ] PWA configuration + offline mode
- [ ] Socket.IO client integration
- [ ] Complete all Flutter stub repository implementations
- [ ] Connect all Flutter BLoCs to new backend API
- [ ] Flutter offline cache (sqflite) + sync engine + degraded mode

### TIER 2: High-End Elite Capabilities (Weeks 7-12)

#### Phase 5: Simulation & Knowledge Graph (Week 7-9)
- [ ] **Simulation Engine** — flood propagation, evacuation routing, shelter overload, logistics shortage, custom scenario
- [ ] **Agent-Based Simulation** — multi-agent disaster behavior modeling
- [ ] **Knowledge Graph** — Neo4j/Apache Age setup, entity extraction, relationship mapping
- [ ] **Geo-Semantic Graph** — spatial proximity queries, shortest path, neighborhood analysis
- [ ] **Temporal Intelligence** — TimescaleDB hypertables, stream analytics, trend/anomaly detection
- [ ] **AI Operational Agents** (8 agents):
  - [ ] Risk Analyst Agent
  - [ ] Situation Summarizer Agent
  - [ ] Logistics Planner Agent
  - [ ] Media Verification Agent
  - [ ] Weather Analyst Agent
  - [ ] Public Sentiment Agent
  - [ ] Volunteer Coordinator Agent
  - [ ] Executive Briefing Agent

#### Phase 6: Playbook & Situational Awareness (Week 9-11)
- [ ] **Playbook Engine** — SOP automation, rule orchestration, automated escalation
- [ ] **Operational Playbook** — flood playbook, earthquake playbook, volcanic eruption playbook, landslide playbook
- [ ] **Situational Awareness Layer** — tactical, operational, strategic, executive briefing
- [ ] **Scenario Engine** — what-if simulation for disaster planning
- [ ] **Disaster UX Completion** — voice-first reporting, one-hand operation, minimal interaction flow
- [ ] **Recovery Module** — recovery tracking, rehabilitation management, economic impact assessment
- [ ] **Full Disaster Lifecycle** — prevention, preparedness, response, recovery, mitigation, adaptation

### TIER 3: National Scale Infrastructure (Weeks 13-16)

#### Phase 7: Federation & Interoperability (Week 13-14)
- [ ] **Federated Multi-Agency Architecture** — tenant federation, cross-agency sync
- [ ] **Interoperability Standards** — CAP (Common Alerting Protocol), EDXL (Emergency Data Exchange Language)
- [ ] **Shared Incident Protocol** — cross-agency incident sharing
- [ ] **WMS/WFS/STAC** — full OGC standards compliance
- [ ] **Drone/Satellite Integration** — real-time imagery ingestion, AI-based damage assessment

#### Phase 8: National Infrastructure Hardening (Week 15-16)
- [ ] **Multi-Region Replication** — active-passive across data centers
- [ ] **PITR Backup** — point-in-time recovery, 30-day retention
- [ ] **Failover Architecture** — automatic failover with < 5min RTO
- [ ] **Edge Computing Nodes** — local processing at BPBD/PCNU offices with intermittent sync
- [ ] **Mesh/Offline Recovery** — peer-to-peer sync between field devices
- [ ] **Executive Strategic Dashboard** — national-level multi-agency command view
- [ ] **QA & Hardening** — security audit, load testing, penetration test, PII scan
- [ ] **Production Deployment** — staff training, beta testing, go-live
```

---

## 22. Disaster Digital Twin & Geospatial Platform

The Digital Twin is a live geospatial replica of Central Java combining authoritative GIS layers, real-time incident data, and AI-predicted risk zones — served via standardized OGC APIs.

### 22.1 Base Map Layers

```
BASE MAP (always on)
├── 1. Administrative Boundary    → kecamatan-level polygons (35 kabupaten/kota)
├── 2. Population Density         → 1km³ grid cells from Portal Data Jateng
├── 3. Flood Zones                → BPBD historical floodplain data + AI-extrapolated
├── 4. Landslide Susceptibility   → PVMBG susceptibility map (HIGH/MEDIUM/LOW)
├── 5. River Network              → GAWR/DAS river lines with 100m buffer
├── 6. Shelter Radius             → 5km buffer circles around each shelter
├── 7. Volunteer Density          → Heatmap from volunteer last_location
├── 8. Warehouse Coverage         → 25km drive-time polygons around warehouses
├── 9. Road Accessibility         → OpenStreetMap road network, classified by passability
├── 10. Cellular Blackout         → Dark zones from Telkomsel partner data (optional)
├── 11. Weather Radar             → BMKG radar composite (rain intensity, storm tracks)
├── 12. Satellite Imagery         → Sentinel-2 / Landsat 8 (cloud-free composite, updated weekly)
└── 13. Live Incident Overlay    → Current active incidents as cluster markers
```

### 22.2 OGC Standards Support

| Standard | Purpose | Implementation |
|----------|---------|---------------|
| **GeoJSON** (RFC 7946) | All REST API geometry responses | Prisma PostGIS `ST_AsGeoJSON()` via raw query middleware |
| **STAC** (SpatioTemporal Asset Catalog) | Satellite imagery + historical disaster archive | MinIO S3 bucket with `stac-fastapi` endpoint at `/stac/v1` — catalogs imagery by date/bbox/cloud cover |
| **WMS** (Web Map Service) | Raster tile serving for base map layers | Nginx-proxied to `GeoServer` or `titiler` — serves flood zones, landslide susceptibility, population density as 256x256 tiles |
| **WFS** (Web Feature Service) | Vector feature query for GIS tools | GeoServer WFS endpoint for QGIS/ArcGIS integration |
| **CAP** (Common Alerting Protocol) | Cross-agency alert standardization | Outgoing: Publish CRITICAL incidents as CAP XML. Incoming: Ingest CAP from BMKG/BPBD |
| **EDXL** (Emergency Data Exchange) | Cross-agency resource/sitrep exchange | EDXL-RM for resource management, EDXL-SitRep for situation reports |

**STAC Catalog Structure:**
```
/stac/v1/
├── collections/
│   ├── sentinel-2-l2a/          # Weekly cloud-free composites
│   │   ├── items/{date}         # per-date item
│   ├── disasters-historical/     # Past incident footprints (from historical_disasters)
│   │   ├── items/{incident_id}
│   ├── risk-zones/              # AI-generated risk polygons
│       └── items/{model_version}_{date}
├── search                        # bbox + datetime + collection filter
└── conformance
```

### 22.3 GeoJSON API Endpoints

```
# Administrative boundaries
GET    /api/v1/geo/provinces          # Province boundaries
GET    /api/v1/geo/regencies          # Kabupaten/kota boundaries
GET    /api/v1/geo/districts          # Kecamatan boundaries
GET    /api/v1/geo/villages           # Desa boundaries

# Thematic layers
GET    /api/v1/geo/flood-zones        # Flood risk polygons (query: region, risk_level)
GET    /api/v1/geo/landslide-zones    # Landslide susceptibility (query: region)
GET    /api/v1/geo/population-grid    # 1km³ population density grid (query: bbox)
GET    /api/v1/geo/shelter-radius     # Shelter buffer zones (query: active_only)
GET    /api/v1/geo/volunteer-density  # Volunteer heatmap (query: incident_id, updated_since)
GET    /api/v1/geo/warehouse-coverage # Warehouse drive-time polygons (query: warehouse_id)
GET    /api/v1/geo/road-network       # Road lines with passability status (query: bbox, status)

# Live feeds
GET    /api/v1/geo/incident-overlay   # Active incidents as GeoJSON FeatureCollection
GET    /api/v1/geo/weather-radar      # Radar composite tile URL (query: timestamp)
GET    /api/v1/geo/cellular-blackout  # No-signal zones (query: region, updated_since)
GET    /api/v1/geo/satellite          # STAC item search proxy (query: bbox, date_from, date_to, cloud_max)

# STAC
GET    /stac/v1/search                # STAC API search endpoint
```

### 22.4 Map Tile Serving Strategy

```typescript
app.get('/api/v1/tiles/:layer/:z/:x/:y.:format', async (req, res) => {
  const { layer, z, x, y, format } = req.params
  const cacheKey = `tile:${layer}:${z}:${x}:${y}`
  const cached = await redis.getBuffer(cacheKey)
  if (cached) return res.type(format === 'png' ? 'image/png' : 'image/png').send(cached)

  const tileUrl = new URL(`${GEOSERVER_URL}/wms`)
  tileUrl.searchParams.set('service', 'WMS')
  tileUrl.searchParams.set('request', 'GetMap')
  tileUrl.searchParams.set('layers', `nurisk:${layer}`)
  tileUrl.searchParams.set('bbox', tileToBBox(z, x, y).join(','))
  tileUrl.searchParams.set('width', '256')
  tileUrl.searchParams.set('height', '256')
  tileUrl.searchParams.set('format', 'image/png')

  const response = await fetch(tileUrl.toString())
  const buffer = Buffer.from(await response.arrayBuffer())
  await redis.set(cacheKey, buffer, 'EX', 3600)
  res.type('image/png').send(buffer)
})
```

### 22.5 Digital Twin Data Flow

```
External Sources (BMKG, PetaBencana, Portal Data Jateng, Sentinel Hub)
  │
  ├── Scraper workers (BullMQ) → PostgreSQL + PostGIS
  │     ├── Weather radar → weather_radar table (timeseries raster)
  │     ├── Flood data → flood_zones table (MultiPolygon)
  │     └── Satellite → STAC catalog in MinIO
  │
  ├── AI Agents → Enriched layers
  │     ├── Risk Analyst: daily risk zone refresh
  │     └── Weather Analyst: 6h precipitation forecast
  │
  ├── User-generated data → Real-time layers
  │     ├── Report/Incident location → incident_overlay
  │     ├── Volunteer check-in → volunteer_density
  │     └── Shelter status → shelter_radius
  │
  └── Served via:
        ├── REST (GeoJSON) for vector layers
        ├── WMS (raster tiles) for heatmap/base layers
        └── STAC API for satellite imagery archive
```

---

## 23. MLOps System

### 23.1 ML Pipeline Architecture

```
Training Pipeline                              Inference Pipeline
┌────────────────────┐                    ┌──────────────────┐
│ feature_store      │                    │  API Service      │
│ (feature registry) │                    │  (calls model)    │
└────────┬───────────┘                    └────────┬─────────┘
         ▼                                         ▼
┌────────────────────┐                    ┌──────────────────┐
│ training_jobs      │                    │  ml_models       │
│ (pipeline runs)    │                    │  (active model)  │
└────────┬───────────┘                    └────────┬─────────┘
         ▼                                         ▼
┌────────────────────┐                    ┌──────────────────┐
│ model_versions     │                    │  prediction_logs │
│ (artifact registry)│                    │  (inference log) │
└────────┬───────────┘                    └────────┬─────────┘
         ▼                                         ▼
┌────────────────────┐                    ┌──────────────────┐
│ model_metrics      │                    │  Monitoring      │
│ (eval results)     │                    │  (drift/accuracy)│
└────────────────────┘                    └──────────────────┘
```

### 23.2 Database Tables

All 6 ML tables (`ml_models`, `model_versions`, `model_metrics`, `prediction_logs`, `training_jobs`, `feature_store`) are defined in [Section 6.3](#63-full-table-inventory-35-tables) as tables 30-35.

### 23.3 Monitoring Metrics

| Metric | Source | Alert Threshold | Dashboard Panel |
|--------|--------|----------------|-----------------|
| **Model Drift** | `prediction_logs` vs recent distribution | PSI > 0.2 or KL divergence > 0.1 | Grafana: "Feature Drift" panel |
| **Prediction Accuracy** | `prediction_logs` where `actual_outcome IS NOT NULL` | Accuracy < 80% or delta > 15% | Grafana: "Accuracy Trend" panel |
| **False Positives** | `prediction_logs` where `predicted_value ≠ actual_outcome` AND `actual_outcome = 0` | FP rate > 10% | Grafana: "Confusion Matrix" |
| **False Negatives** | `prediction_logs` where `predicted_value ≠ actual_outcome` AND `actual_outcome = 1` | FN rate > 5% | Grafana: "Confusion Matrix" |
| **Hallucination Rate** | Agent outputs verified by human review (random 5% sample) | > 3% hallucinated facts | Grafana: "Agent Reliability" |
| **Confidence Degradation** | `prediction_logs.confidence_score` 7-day rolling avg | Drop > 20% from baseline | Grafana: "Confidence Trend" |
| **Inference Latency** | `prediction_logs.latency_ms` P95 | > 2000ms | Grafana: "Model Latency" |
| **Prediction Volume** | `prediction_logs` count per hour | < 10 (stale) or > 1000 (anomaly) | Grafana: "Prediction Volume" |

### 23.4 Model Lifecycle

```
DRAFT ──(training)──▶ TRAINING ──(validation pass)──▶ DEPLOYED
  │                      │                                 │
  │                      ├──(validation fail)──▶ ARCHIVED   │
  │                      │                                 │
  └──(cancelled)──▶ CANCELLED                               │
                                                           ├──(drift detected)──▶ ROLLED_BACK
                                                           │
                                                           └──(new version)──▶ ARCHIVED
```

### 23.5 Retraining Schedule

| Model Type | Trigger | Data Window |
|-----------|---------|-------------|
| Fake Detection | Monthly + on pattern update | Last 90 days of reports |
| Severity Scoring | Monthly | Last 180 days of incidents |
| Probability Forecasting | Weekly (wet season), Bi-weekly (dry) | Last 5 years historical |
| AI Agents | Quarterly + on system prompt change | Custom per agent domain |
| Weather Integration | Bi-weekly | Last 30 days weather data |

### 23.6 Feature Store Design

```typescript
const FEATURES = [
  { name: 'disaster_type', type: 'CATEGORICAL', source: 'incidents.disaster_type' },
  { name: 'region', type: 'CATEGORICAL', source: 'incidents.region' },
  { name: 'lat', type: 'NUMERIC', source: 'incidents.lat' },
  { name: 'lng', type: 'NUMERIC', source: 'incidents.lng' },
  { name: 'month', type: 'NUMERIC', source: 'EXTRACT(MONTH FROM incidents.event_date)' },
  { name: 'hour', type: 'NUMERIC', source: 'EXTRACT(HOUR FROM incidents.event_date)' },
  { name: 'day_of_week', type: 'NUMERIC', source: 'EXTRACT(DOW FROM incidents.event_date)' },
  { name: 'historical_count_30d', type: 'NUMERIC', source: 'COUNT of historical_disasters in last 30d' },
  { name: 'population_density', type: 'NUMERIC', source: 'PostGIS spatial join with population grid' },
  { name: 'flood_risk_score', type: 'NUMERIC', source: 'PostGIS ST_Intersects with flood zones' },
  { name: 'landslide_risk_score', type: 'NUMERIC', source: 'PostGIS ST_Intersects with landslide zones' },
  { name: 'rainfall_24h', type: 'NUMERIC', source: 'weather_service cache' },
  { name: 'distance_to_river', type: 'NUMERIC', source: 'PostGIS ST_Distance to river network' },
  { name: 'title_embedding', type: 'EMBEDDING', source: 'Gemini embedding API' },
  { name: 'description_keywords', type: 'TEXT', source: 'TF-IDF vectorized description' },
]
```

---

## 24. OpenTelemetry & Observability Stack

### 24.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OBSERVABILITY STACK                           │
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │ Frontend │   │ Backend  │   │  Worker  │   │ Database │        │
│  │ (React)  │   │ (Node.js)│   │ (BullMQ) │   │ (PG)     │        │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘        │
│       │              │              │              │               │
│       └──────────────┼──────────────┼──────────────┘               │
│                      │              │                               │
│               ┌──────▼──────────────▼──────┐                      │
│               │      OpenTelemetry          │                      │
│               │   Collector (OTC Agent)     │                      │
│               │   Traces · Metrics · Logs   │                      │
│               └──────┬──────────────┬──────┘                      │
│                      │              │                               │
│         ┌────────────▼──┐    ┌──────▼────────────┐                 │
│         │  Prometheus   │    │      Loki         │                 │
│         │  (Metrics)    │    │   (Logs Aggr)     │                 │
│         └───────┬───────┘    └──────┬────────────┘                 │
│                 │                   │                               │
│         ┌───────▼───────────────────▼──────┐                      │
│         │           Grafana                │                      │
│         │   Dashboards · Alerts · Explore  │                      │
│         └───────────────┬──────────────────┘                      │
│                         │                                          │
│         ┌───────────────▼──────────────────┐                      │
│         │       Sentry (Errors)            │                      │
│         │  Error Tracking · Performance    │                      │
│         │  · Release Monitoring            │                      │
│         └──────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 24.2 Component Details

#### 24.2.1 OpenTelemetry Collector

```yaml
# otel-collector-config.yml
receivers:
  otlp:
    protocols:
      grpc: { endpoint: 0.0.0.0:4317 }
      http: { endpoint: 0.0.0.0:4318 }
processors:
  batch: { timeout: 1s, send_batch_size: 1024 }
  memory_limiter: { check_interval: 1s, limit_mib: 512 }
exporters:
  prometheus: { endpoint: 0.0.0.0:8889, namespace: nurisk }
  loki: { endpoint: http://loki:3100/loki/api/v1/push }
  otlp: { endpoint: tempo:4317 }
service:
  pipelines:
    metrics: { receivers: [otlp], processors: [memory_limiter, batch], exporters: [prometheus] }
    logs: { receivers: [otlp], processors: [memory_limiter, batch], exporters: [loki] }
    traces: { receivers: [otlp], processors: [memory_limiter, batch], exporters: [otlp] }
```

#### 24.2.2 Prometheus Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `nurisk_http_requests_total` | Counter | Total HTTP requests (method, path, status, region) |
| `nurisk_http_duration_seconds` | Histogram | Request latency (buckets: 0.01–5) |
| `nurisk_active_incidents` | Gauge | Count of active incidents (status, disaster_type) |
| `nurisk_state_transitions_total` | Counter | State machine transitions (from, to, region) |
| `nurisk_ai_predictions_total` | Counter | AI prediction results (model, outcome) |
| `nurisk_db_query_duration_seconds` | Histogram | Database query latency (operation, table) |
| `nurisk_queue_jobs_total` | Counter | BullMQ job results (queue, status) |
| `nurisk_ws_connections` | Gauge | Socket.IO connections |
| `nurisk_offline_sync_queue_size` | Gauge | Pending offline sync items |
| `nurisk_pii_scan_count` | Counter | PII shield audit count (endpoint, result) |
| `nurisk_scraper_fetch_duration` | Histogram | Scraper latency per source |

#### 24.2.3 Grafana Dashboards

| Dashboard | Panels | Refresh |
|-----------|--------|---------|
| **Operations Overview** | Request rate, error rate, P95 latency, active incidents, volunteer count | 30s |
| **Incident Command Center** | Live map, state machine funnel, response time by region, critical alerts | 15s |
| **AI/ML Performance** | Accuracy trend, drift metrics, prediction volume, hallucination rate | 1min |
| **Infrastructure** | CPU/memory, DB connections, Redis hit rate, queue depth | 10s |
| **Scraper Health** | Per-scraper latency, success rate, data freshness | 30s |
| **Business KPIs** | Time-to-verify per region, volunteer utilization, asset turnover | 5min |

#### 24.2.4 Sentry Error Tracking

```typescript
import * as Sentry from '@sentry/node'
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    if (event.request?.data) delete event.request.data.password
    if (event.request?.headers?.authorization) event.request.headers.authorization = '[REDACTED]'
    return event
  },
})
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())
```

#### 24.2.5 Log Aggregation (Loki)

```typescript
import pino from 'pino'
const logger = pino({
  transport: {
    target: '@opentelemetry/pino-transport',
    options: { exporter: { url: 'http://otel-collector:4318/v1/logs' } },
  },
})
```

### 24.3 Alert Rules (Grafana)

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| High Error Rate | `rate(nurisk_http_requests_total{status=~"5.."}[5m]) > 0.05` | CRITICAL | PagerDuty + Telegram |
| High Latency | `histogram_quantile(0.95, nurisk_http_duration_seconds) > 2` | WARNING | Telegram |
| No Scraper Data | `nurisk_scraper_fetch_duration_count{source="bmkg"} == 0 for 5m` | CRITICAL | Telegram |
| Queue Backlog | `nurisk_queue_jobs_total{status="failed"} > 100` | WARNING | Telegram |
| Model Drift | `nurisk_model_drift_score > 0.2` | WARNING | Email |
| PII Scan Failure | `nurisk_pii_scan_count{result="fail"} > 0` | CRITICAL | Email + Slack |

### 24.4 Docker Compose Additions

```yaml
# Additional services to add to docker-compose.yml
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    ports: ['4317:4317', '4318:4318']
    volumes:
      - ./docker/otel/otel-collector-config.yml:/etc/otel-collector-config.yml
    depends_on: [loki, tempo]

  prometheus:
    image: prom/prometheus:latest
    ports: ['9090:9090']
    volumes: [prometheus_data:/prometheus]

  loki:
    image: grafana/loki:latest
    ports: ['3100:3100']
    volumes: [loki_data:/loki]

  tempo:
    image: grafana/tempo:latest
    ports: ['3200:3200']
    volumes: [tempo_data:/tmp/tempo]

  grafana:
    image: grafana/grafana:latest
    ports: ['3000:3000']
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes: [grafana_data:/var/lib/grafana]
    depends_on: [prometheus, loki, tempo]

  sentry:
    image: getsentry/sentry:latest
    ports: ['9000:9000']
    depends_on: [db, redis]

volumes:
  prometheus_data:
  loki_data:
  tempo_data:
  grafana_data:
```

### 24.5 Tracing

Trace propagation tracks requests across all services:

```
Frontend (React) → API Gateway (Nginx) → Backend (Express) → Worker (BullMQ)
   traceparent       traceparent           traceparent         traceparent (job payload)
```

```typescript
import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('nurisk-incident')
tracer.startActiveSpan('incident.verify', (span) => {
  span.setAttribute('incident.id', id)
  // ... business logic ...
  span.end()
})
```

---

## 25. Decision Engine & Simulation Platform

### 25.1 Decision Engine

The Decision Engine transforms raw incident data into actionable operational decisions. It is the core "brain" that determines priorities, recommendations, and critical zones.

```
Input: Incidents, Resources, Weather, Demographics
  │
  ├── Risk Orchestrator
  │     ├── Evacuation Priority Calculator
  │     │     Input: flood depth, population density, shelter capacity, road access
  │     │     Output: ordered evacuation priority list per kelurahan
  │     ├── Critical Zone Detector
  │     │     Input: active incidents, weather forecast, historical data
  │     │     Output: zones with escalation risk (LOW/MEDIUM/HIGH/CRITICAL)
  │     └── Logistics Distribution Suggester
  │           Input: shelter needs, warehouse stock, road accessibility
  │           Output: optimal distribution plan with convoy routing
  │
  ├── Resource Health Engine
  │     ├── Volunteer Fatigue Tracker
  │     │     Input: deployment hours, last rest, mission count (7d)
  │     │     Output: fatigue score per volunteer (0-100)
  │     ├── Shelter Stress Calculator
  │     │     Input: current occupancy, capacity, water/food depletion rate
  │     │     Output: stress score (0-100), estimated failure time
  │     ├── Fuel Depletion Monitor
  │     │     Input: fuel stock, consumption rate per vehicle type
  │     │     Output: remaining operational hours per fleet
  │     └── Equipment Readiness Score
  │           Input: last maintenance, usage hours, failure rate
  │           Output: readiness percentage per equipment type
  │
  └── Scenario Engine (What-If)
        ├── "What if flood rises 2m higher?"
        ├── "What if shelter A reaches 100% capacity?"
        ├── "What if road B becomes impassable?"
        └── Output: impact assessment, alternative plans
```

**Decision Engine API Contract:**

```typescript
interface EvacuationPriority {
  kelurahan: string
  priorityScore: number            // 0-100
  population: number
  estimatedAffected: number
  shelterCapacity: number
  gap: number                      // positive = shortage
  recommendedAction: string
  timeToAct: string                // e.g. "2 hours"
}

interface CriticalZone {
  region: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  contributingFactors: string[]    // e.g. ["flood_depth>1m", "shelter_full", "road_closed"]
  escalationProbability: number    // 0-1
  recommendedEvacuation: boolean
}

interface ResourceHealth {
  resourceType: 'VOLUNTEER' | 'SHELTER' | 'FUEL' | 'EQUIPMENT' | 'FOOD'
  overallHealth: 'GREEN' | 'YELLOW' | 'RED'
  metrics: Record<string, number>
  bottleneckDescription?: string
  recommendedAction?: string
}
```

### 25.2 Simulation Engine

Simulation moves the platform from reactive monitoring to predictive operational planning.

| Simulation Type | Input | Model | Output | Use Case |
|----------------|-------|-------|--------|----------|
| **Flood Propagation** | Rainfall data, DEM (Digital Elevation Model), river levels, soil saturation | Cellular automata + hydraulic routing | Flood extent polygon, depth grid (1m resolution), time-to-flood per building | Pre-position resources before flood peak |
| **Evacuation Routing** | Population density, road network, shelter locations, flood progression | Agent-based simulation (ABM) | Optimal evacuation route per kelurahan, congestion points, shelter arrival ETA | Route planning, signage placement |
| **Shelter Overload** | Current occupancy, depletion rates, incoming population | System dynamics model | Time-to-capacity per shelter, overflow estimate, resupply urgency | Prioritize supply drops |
| **Logistics Shortage** | Stock levels, consumption rates, resupply timeline, road blockages | Monte Carlo simulation | Shortfall probability per item, critical items list, supplier bottleneck | Proactive procurement |
| **Escalation Scenario** | Multiple incident cascades, weather worsening | Markov chain + scenario tree | Escalation path probability, worst-case impact, branching points | Contingency planning |

**Simulation Engine Architecture:**

```typescript
abstract class SimulationEngine {
  abstract readonly type: SimulationType
  abstract validate(input: SimulationInput): ValidationResult
  abstract run(input: SimulationInput): Promise<SimulationResult>
  abstract visualize(result: SimulationResult): GeoJSON.FeatureCollection

  protected async logExecution(input: SimulationInput, result: SimulationResult): Promise<void> {
    await prisma.simulationLog.create({
      data: {
        type: this.type,
        input: JSON.stringify(input),
        result: JSON.stringify(result),
        durationMs: result.durationMs,
        triggeredBy: input.triggeredBy,
      }
    })
  }
}

class FloodPropagationEngine extends SimulationEngine {
  readonly type = 'FLOOD_PROPAGATION'

  async run(input: FloodSimInput): Promise<FloodSimResult> {
    // 1. Load DEM tiles for affected region
    // 2. Apply rainfall + river level boundary conditions
    // 3. Run cellular automata for t=0..T with 5-min timesteps
    // 4. Generate flood depth GeoJSON for each timestep
    // 5. Calculate affected buildings, population, roads
    return {
      floodExtent: floodGeoJson,
      depthGrid: depthRasterUrl,        // Stored in MinIO as GeoTIFF
      affectedBuildings: count,
      affectedPopulation: estimatedPop,
      submergedRoads: roadSegments,
      durationMs: elapsed,
      timesteps: timesteps,              // GeoJSON per 30-min interval
    }
  }

  visualize(result: FloodSimResult): GeoJSON.FeatureCollection {
    return result.floodExtent  // Directly usable by Mapbox/Leaflet
  }
}
```

### 25.3 Simulation Data Flow

```
Trigger (API call or Event)
  │
  ├── Simulation Engine validates input
  │
  ├── Load base data:
  │     ├── DEM tiles (MinIO / preloaded)
  │     ├── Current weather (Redis cache / OpenWeatherMap)
  │     ├── Infrastructure (PostGIS: roads, buildings, shelters)
  │     └── Incident context (incident table)
  │
  ├── Execute simulation model (BullMQ worker, 1-60 second runtime)
  │
  ├── Store results:
  │     ├── simulation_logs table (PostgreSQL)
  │     ├── Result GeoJSON → MinIO
  │     └── Raster depth grid → MinIO as Cloud Optimized GeoTIFF
  │
  └── Notify subscribers:
        ├── Socket.IO simulation:update event
        ├── Push to Digital Twin map layer
        └── Return result to caller
```

---

## 26. Knowledge Graph & Temporal Intelligence

### 26.1 Knowledge Graph Architecture

Disaster response is inherently relational: volunteers belong to organizations, operate in regions, transport supplies from warehouses to shelters, respond to incidents. A knowledge graph captures these relationships explicitly.

```ascii
                    ┌────────────┐
                    │  ORGANIZATION│
                    └──────┬─────┘
                           │ member_of
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ VOLUNTEER│ │  PCNU    │ │  BPBD    │
        └────┬─────┘ └──────────┘ └──────────┘
             │ assigned_to
             ▼
    ┌────────────────┐    located_in        ┌──────────┐
    │    INCIDENT    │──────────────────────▶│  REGION  │
    └────┬───────────┘                       └──────────┘
         │                                   │
         │ requires                          │ contains
         ▼                                   ▼
    ┌──────────┐                       ┌──────────┐
    │ RESOURCE │                       │ SHELTER  │
    │ (FOOD)   │                       └──────────┘
    └──────────┘
         │                                   │
         │ stored_at                         │ located_in
         ▼                                   ▼
    ┌──────────┐                       ┌──────────┐
    │WAREHOUSE │                       │ VILLAGE  │
    └──────────┘                       └──────────┘
```

### 26.2 Technology: Apache Age (PostgreSQL Extension)

Apache Age runs inside PostgreSQL, eliminating the need for a separate graph database. It supports openCypher queries directly.

```sql
-- Install extension
CREATE EXTENSION age;
LOAD 'age';
SET search_path = ag_catalog, "$user", public;

-- Create graph
SELECT * FROM ag_catalog.create_graph('nurisk_graph');

-- Query example: find all volunteers within 10km of active flood incidents
SELECT * FROM cypher('nurisk_graph', $$
  MATCH (v:Volunteer)-[:located_in]->(r:Region)
  MATCH (i:Incident {disaster_type: 'BANJIR', status: 'ACTION'})-[:occurs_in]->(r)
  WHERE v.status = 'available'
  RETURN v.name, v.phone, i.title, i.location
$$) AS (volunteer_name text, phone text, incident_title text, location text);
```

### 26.3 Graph Entities & Relationships

| Entity | Node Label | Key Properties |
|--------|-----------|----------------|
| Volunteer | `:Volunteer` | id, name, expertise, rating, status, location |
| Incident | `:Incident` | id, title, disaster_type, status, severity, location |
| Shelter | `:Shelter` | id, name, capacity, occupancy, location |
| Warehouse | `:Warehouse` | id, name, type, stock_level, location |
| Resource | `:Resource` | id, name, category, quantity, unit |
| Organization | `:Organization` | id, name, type (PCNU/PWNU/BPBD/PMI/TNI), region |
| Region | `:Region` | id, name, admin_level (province/regency/district/village) |
| Road | `:Road` | id, name, passability, length_km, surface_type |

| Relationship | Type | Properties |
|-------------|------|-----------|
| `(:Volunteer)-[:assigned_to]->(:Incident)` | `assigned_to` | deployed_at, status, hours_worked |
| `(:Volunteer)-[:located_in]->(:Region)` | `located_in` | — |
| `(:Incident)-[:occurs_in]->(:Region)` | `occurs_in` | — |
| `(:Shelter)-[:located_in]->(:Region)` | `located_in` | — |
| `(:Warehouse)-[:stocks]->(:Resource)` | `stocks` | quantity, updated_at |
| `(:Resource)-[:shipped_to]->(:Shelter)` | `shipped_to` | quantity, dispatched_at, eta |
| `(:Volunteer)-[:reports_to]->(:Organization)` | `reports_to` | role, since |
| `(:Organization)-[:operates_in]->(:Region)` | `operates_in` | — |
| `(:Road)-[:connects]->(:Region)` | `connects` | — |
| `(:Incident)-[:escalated_to]->(:Incident)` | `escalated_to` | escalated_at, reason |

### 26.4 Use Cases

| Use Case | Graph Query | Benefit |
|----------|------------|---------|
| Find nearest available volunteer | Match volunteer within 5km of incident with matching expertise | < 1s deployment suggestion |
| Supply chain vulnerability | Find all warehouses connected to affected region via passable roads | Logistics rerouting |
| Organizational coverage gap | Match regions with incidents but no assigned organization | Deployment planning |
| Cascading impact analysis | Find all downstream regions connected via river network from flood origin | Early warning |
| Resource sharing path | Shortest path between a warehouse with excess stock to a shelter with shortage | Optimal redistribution |

### 26.5 Temporal Intelligence (TimescaleDB)

Temporal intelligence captures the **rate of change**, not just snapshots.

**TimescaleDB Hypertables:**

```sql
-- Create hypertable for incident time-series
SELECT create_hypertable('incident_temporal', 'timestamp');

-- Continuous aggregate for hourly incident counts by region
CREATE MATERIALIZED VIEW hourly_incidents
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', timestamp) AS bucket,
  region,
  disaster_type,
  COUNT(*) AS incident_count,
  AVG(priority_score) AS avg_severity
FROM incident_temporal
GROUP BY bucket, region, disaster_type;

-- Real-time anomaly detection
SELECT
  bucket,
  region,
  incident_count,
  AVG(incident_count) OVER last_7d AS expected,
  CASE WHEN incident_count > AVG(incident_count) OVER last_7d + 2 * STDDEV(incident_count) OVER last_7d
       THEN 'ANOMALY' ELSE 'NORMAL' END AS status
FROM hourly_incidents
WINDOW last_7d AS (PARTITION BY region ORDER BY bucket ROWS BETWEEN 168 PRECEDING AND 1 PRECEDING);
```

| Feature | SQL/API | Purpose |
|---------|---------|---------|
| Stream Analytics | `GET /api/v1/temporal/stream` | Real-time incident rate, distribution changes |
| Trend Analysis | `GET /api/v1/temporal/trends` | 7d/30d/90d trends by region, type, severity |
| Anomaly Detection | `GET /api/v1/temporal/anomalies` | Spike detection (2σ above moving average) |
| Time-Series Forecast | `GET /api/v1/temporal/forecast` | ARIMA/Prophet-based incident forecasting |

---

## 27. Situational Awareness & Trust Intelligence

### 27.1 Situational Awareness Layers

Awareness is not data — it is **understanding** of conditions, impacts, changes, and trajectory.

```
                    ┌─────────────────────────────────────────────┐
                    │         EXECUTIVE AWARENESS                 │
                    │  "Is the situation under control?"          │
                    │  One-page command brief, 3 critical numbers │
                    └──────────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────────┐
                    │          STRATEGIC AWARENESS                │
                    │  "Where are we heading?"                    │
                    │  Daily/weekly trends, resource depletion,   │
                    │  escalation patterns, recovery trajectory   │
                    └──────────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────────┐
                    │         OPERATIONAL AWARENESS               │
                    │  "How is the current shift going?"          │
                    │  Active missions, resource status,          │
                    │  bottlenecks, waiting tasks                 │
                    └──────────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────────┐
                    │           TACTICAL AWARENESS                │
                    │  "What is happening right now?"             │
                    │  Live incident feed, check-in locations,    │
                    │  real-time alerts, radio chatter            │
                    └─────────────────────────────────────────────┘
```

| Layer | Refresh | Audience | Key Question | Format |
|-------|---------|----------|-------------|--------|
| Tactical | Real-time (5s) | Field staff, dispatchers | "What is happening NOW?" | Live map, alert feed, check-in dots |
| Operational | Every shift (6h) | PCNU, Operations Chief | "Is today's ops on track?" | Dashboard: active tasks, resource status, bottlenecks |
| Strategic | Daily | PWNU, Incident Commander | "Are we winning?" | Trend charts, resource curves, comparison to plan |
| Executive | On-demand | PWNU leadership, donors | "Is the situation under control?" | 1-page PDF brief, 3 KPIs, green/yellow/red status |

**Situation Awareness API:**

```typescript
interface TacticalAwareness {
  activeIncidents: number
  criticalCount: number
  newIncidentsLastHour: number
  volunteersOnDuty: number
  checkInsLastHour: number
  latestAlerts: Alert[]
  mapSnapshotUrl: string       // GeoJSON tileset
}

interface OperationalAwareness {
  shiftSummary: string          // AI-generated
  missionCompletionRate: number // %
  resourceHealth: ResourceHealth
  bottlenecks: string[]
  pendingDecisions: number
  nextShiftForecast: string
}

interface StrategicAwareness {
  trendDirection: 'IMPROVING' | 'STABLE' | 'DETERIORATING'
  keyTrends: Trend[]
  resourceDepletionForecast: { item: string; eta: string }[]
  escalationRisks: CriticalZone[]
  comparisonVsLastDisaster: string
}

interface ExecutiveBriefing {
  title: string
  date: string
  overallStatus: 'GREEN' | 'YELLOW' | 'RED'
  criticalMetrics: { label: string; value: string; status: string }[]
  situationSummary: string       // AI-generated, 3 paragraphs max
  keyDecisions: string[]
  recommendations: string[]
  confidenceScore: number        // 0-1
}
```

### 27.2 Trust & Verification System

In a disaster, misinformation causes real casualties. The Trust Intelligence system assigns confidence scores to every piece of data.

```
Source → Verification Pipeline → Trust Score → Action
                                      │
                              ┌───────┴────────┐
                              │                │
                         Confirmed        Suspicious
                              │                │
                         Auto-accept     Human review
                                          required
```

**Trust Score Components:**

| Factor | Weight | Source | Calculation |
|--------|--------|--------|-------------|
| Source Reliability | 40% | Source reputation database | BMKG/MAGMA/Antara = 1.0, Social media = 0.3, Anonymous = 0.1 |
| Multi-Source Corroboration | 25% | Cross-reference with other sources | % of other independent sources reporting same event |
| Historical Accuracy | 15% | Source track record | past_false_reports / total_reports |
| Location Plausibility | 10% | Geo validation + distance log | Valid coordinates within expected region = 1.0 |
| AI Factual Check | 10% | Gemini cross-verification | Gemini confidence score |

```typescript
function calculateTrustScore(source: Source, report: Report): number {
  const sourceReliability = SOURCE_REPUTATION[source.type] ?? 0.3
  const corroboration = crossReferenceCount(report) / totalActiveSources
  const historicalAccuracy = 1 - (source.falseReports / Math.max(source.totalReports, 1))
  const locationValid = validateCoordinates(report.lat, report.lng) ? 1.0 : 0.0
  const aiCheck = geminiVerification(report)

  return Math.round(
    sourceReliability * 0.40 +
    Math.min(corroboration, 1) * 0.25 +
    historicalAccuracy * 0.15 +
    locationValid * 0.10 +
    aiCheck * 0.10
  )
}
```

**Media Forensics & Deepfake Detection:**

```typescript
interface MediaForensicResult {
  verdict: 'AUTHENTIC' | 'MANIPULATED' | 'DEEPFAKE' | 'UNCERTAIN'
  confidence: number            // 0-1
  anomalies: string[]           // e.g. ["inconsistent_shadows", "exif_mismatch"]
  metadata: {
    originalDate?: Date
    gpsCoords?: [number, number]
    deviceInfo?: string
    editHistory?: string[]
  }
  recommendedAction: 'ACCEPT' | 'MANUAL_REVIEW' | 'REJECT'
}
```

| Technique | Tool | Detection Target |
|-----------|------|-----------------|
| Metadata Analysis | ExifTool + custom parser | Stripped/modified EXIF, GPS mismatch |
| Error Level Analysis | ELA algorithm | JPEG compression inconsistency (splicing) |
| Deepfake Detection | Gemini Vision + custom CNN | AI-generated faces, text-to-image artifacts |
| Shadow Consistency | Physics-based shadow analysis | Inconsistent light source direction |
| Temporal Verification | Cross-reference with satellite imagery | Photo claims to show "now" but satellite shows different |

---

## 28. Operational Playbook & Automation

### 28.1 Playbook Engine

Disaster response cannot be pure improvisation. The Playbook Engine codifies SOPs into executable rules triggered by system conditions.

```text
IF condition THEN execute_playbook
```

**Playbook Definition:**

```typescript
interface Playbook {
  id: string
  name: string                    // e.g. "Flood Evacuation Protocol"
  disasterType: DisasterType[]
  triggerConditions: Rule[]
  steps: PlaybookStep[]
  requiredRoles: UserRole[]
  estimatedDuration: string
  escalationRules: EscalationRule[]
}

interface Rule {
  id: string
  description: string
  condition: string               // JSON Logic or JavaScript expression
  priority: number                // 1-100, higher = more urgent
}

interface PlaybookStep {
  order: number
  action: 'NOTIFY' | 'CREATE_INCIDENT' | 'DISPATCH' | 'ESCALATE' | 'WAIT' | 'AUTO_RESOLVE'
  params: Record<string, any>     // e.g. { role: 'FIELD_STAFF', region: 'incident.region' }
  timeout: string                 // e.g. "30m" = auto-escalate after 30 min
  dependsOn?: number[]            // Step order(s) that must complete first
}
```

**Example Playbook: Flood Response**

```typescript
const FLOOD_PLAYBOOK: Playbook = {
  name: 'Flood Response Protocol',
  disasterType: ['BANJIR', 'BANJIR_BANDANG'],
  triggerConditions: [
    {
      description: 'Critical flood report from BMKG or field staff',
      condition: 'incident.priority_level == "CRITICAL" && incident.disaster_type == "BANJIR"',
      priority: 100
    }
  ],
  steps: [
    { order: 1, action: 'NOTIFY', params: { role: 'FIELD_STAFF', region: 'incident.region', template: 'FLOOD_ALERT' }, timeout: '5m' },
    { order: 2, action: 'CREATE_INCIDENT', params: { status: 'VERIFIED' }, dependsOn: [1], timeout: '15m' },
    { order: 3, action: 'DISPATCH', params: { role: 'FIELD_STAFF', count: 5, expertise: 'SAR' }, dependsOn: [2], timeout: '30m' },
    { order: 4, action: 'NOTIFY', params: { role: 'PCNU', template: 'SHELTER_PREP' }, dependsOn: [2], timeout: '10m' },
    { order: 5, action: 'ESCALATE', params: { if: 'step_3_timeout && !checkins_received', to: 'PWNU' }, dependsOn: [3], timeout: '30m' },
  ],
  requiredRoles: ['FIELD_STAFF', 'PCNU', 'PWNU'],
  estimatedDuration: '4h',
  escalationRules: [
    { condition: 'steps_1_2_3_failed', escalateTo: 'PWNU', reason: 'Initial response failure' }
  ]
}
```

### 28.2 Rule Orchestration Engine

```typescript
class RuleOrchestrator {
  private rules: Map<string, Rule[]> = new Map()

  async evaluateAll(trigger: string, context: EvaluationContext): Promise<Action[]> {
    const matchedRules = this.rules.get(trigger) || []
    const actions: Action[] = []

    for (const rule of matchedRules.sort((a, b) => b.priority - a.priority)) {
      const result = await this.evaluateCondition(rule.condition, context)
      if (result.truthy) {
        actions.push({ rule, context: result.context })
      }
    }
    return actions
  }

  async executePlaybook(playbookId: string, incidentId: string): Promise<string> {
    const playbook = await this.getPlaybook(playbookId)
    const executionId = uuid()
    await prisma.playbookExecution.create({
      data: { id: executionId, playbookId, incidentId, status: 'RUNNING' }
    })

    // Execute steps in order with dependency resolution
    const stepResults: Map<number, any> = new Map()
    for (const step of playbook.steps.sort((a, b) => a.order - b.order)) {
      if (step.dependsOn?.some(d => !stepResults.has(d))) {
        throw new Error(`Step ${step.order} dependencies not met: ${step.dependsOn}`)
      }
      const result = await this.executeStep(step, incidentId)
      stepResults.set(step.order, result)
    }

    return executionId
  }
}
```

### 28.3 Automated Escalation

```typescript
// Escalation timer — fires if step not completed within timeout
class EscalationTimer {
  private timers: Map<string, NodeJS.Timeout> = new Map()

  start(executionId: string, step: PlaybookStep, incidentId: string): void {
    const timeout = parseDuration(step.timeout)
    const timer = setTimeout(async () => {
      const status = await prisma.playbookExecutionStep.findFirst({
        where: { executionId, stepOrder: step.order }
      })
      if (status?.status !== 'COMPLETED') {
        await notificationService.send({
          type: 'ESCALATION',
          role: 'PWNU',
          title: `Playbook step ${step.order} timed out`,
          data: { executionId, step, incidentId }
        })
      }
    }, timeout)
    this.timers.set(`${executionId}:${step.order}`, timer)
  }
}
```

---

## 29. Disaster UX & Resilient Architecture

### 29.1 Disaster UX Principles

Disaster UX is fundamentally different from normal application UX. Users are under extreme stress: panic, darkness, wet conditions, poor signal, limited time.

| Principle | Implementation | Target |
|-----------|---------------|--------|
| **Emergency Mode** | One-tap activation, giant buttons, high contrast, minimal text | < 3 taps to submit report |
| **Voice-First Reporting** | Speech-to-text with Gemini NLU, voice confirmation | Report in < 30 seconds |
| **One-Hand Operation** | Bottom-sheet UI, thumb-reachable, key actions at bottom | 100% of critical actions |
| **Minimal Interaction Flow** | Pre-fill from context (GPS, time, device ID), smart defaults | 5-field maximum |
| **Panic Reporting** | Long-press home screen widget, instant incident creation with GPS | 1 tap to alert |
| **Offline Degraded Mode** | Full functionality without internet, queue + sync when connected | Zero interruption |
| **Auto-Recovery UI** | Session restore on crash, form state saved to local storage | Data never lost |

**Emergency Mode Wireframe:**

```
┌─────────────────────┐
│   ⚠️ DARURAT       │  ← Red banner, always visible
│                     │
│  ┌───────────────┐  │
│  │ 📸 LAPOR!     │  │  ← Giant button, whole screen width
│  │ Ambil Foto    │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ 🎤 Lapor      │  │  ← Voice report button
│  │ Suara         │  │
│  └───────────────┘  │
│                     │
│  ┌──────┐ ┌──────┐ │
│  │ SOS  │ │📍    │ │  ← Panic + Location
│  └──────┘ └──────┘ │
│                     │
│  Status: ✅ Online │
│  Antrian: 0        │  ← Offline queue indicator
└─────────────────────┘
```

### 29.2 Resilient Offline Architecture (Enhanced)

Going beyond basic offline queue to full **Resilient Mode**:

```
                    ┌───────────────────────┐
                    │   CONNECTED MODE       │
                    │  Normal API flow       │
                    └───────────┬───────────┘
                                │ Connection lost
                                ▼
                    ┌───────────────────────┐
                    │   DEGRADED MODE        │
                    │  Full local operation  │
                    │  - Local SQLite DB     │  ← sqflite / IndexedDB
                    │  - Local map tiles     │  ← flutter_map offline tiles
                    │  - Cached incidents    │
                    │  - Queue all writes    │  ← offline_queue table
                    └───────────┬───────────┘
                                │ No connectivity for > 1 hour
                                ▼
                    ┌───────────────────────┐
                    │   MESH MODE            │
                    │  Peer-to-peer sync     │
                    │  - Nearby devices via  │
                    │    WiFi Direct / BLE   │
                    │  - Mesh relay to       │
                    │    nearest connected   │
                    │    device              │
                    │  - Eventually          │
                    │    consistent          │
                    └───────────┬───────────┘
                                │ Reconnection
                                ▼
                    ┌───────────────────────┐
                    │   SYNC MODE            │
                    │  Delta sync engine     │
                    │  - Last-write-wins     │
                    │  - Conflict resolution │
                    │  - Idempotent replay   │
                    └───────────┬───────────┘
                                │ Sync complete
                                ▼
                    ┌───────────────────────┐
                    │   CONNECTED MODE       │
                    │  Normal operation      │
                    └───────────────────────┘
```

**Delta Synchronization:**

```typescript
interface SyncDelta {
  lastSyncTimestamp: string
  changes: {
    created: EntityChange[]
    updated: EntityChange[]
    deleted: string[]          // Entity IDs
  }
  conflicts: SyncConflict[]
  serverSnapshot: string       // Snapshot ID for consistency check
}

interface EntityChange {
  entityType: string
  entityId: string
  data: Record<string, any>
  version: number              // Optimistic concurrency
}

async function resolveConflict(local: EntityChange, server: EntityChange): Promise<EntityChange> {
  // Last-write-wins by default
  if (local.data.updatedAt > server.data.updatedAt) return local
  return server
}
```

### 29.3 Edge Computing Architecture

For true resilience, deploy lightweight edge nodes at PCNU/BPBD offices:

```
┌───────────────────────────────────┐
│        EDGE NODE (RPi/Intel NUC)  │
│                                   │
│  ┌────────────┐ ┌──────────────┐  │
│  │ Local DB    │ │ Local        │  │
│  │ (SQLite)    │ │ API Server   │  │
│  └────────────┘ └──────┬───────┘  │
│                        │          │
│  ┌─────────────────────▼──────┐   │
│  │     Sync Agent              │   │
│  │  - Queue changes            │   │
│  │  - Compress + encrypt       │   │
│  │  - Send when connected      │   │
│  └─────────────────────────────┘   │
│                        │          │
│  ┌─────────────────────▼──────┐   │
│  │     Local Mesh WiFi        │   │
│  │  - Serve nearby devices    │   │
│  │  - Relay to central server │   │
│  └─────────────────────────────┘   │
└───────────────────────────────────┘
```

---

## 30. Federated Ecosystem & Full Lifecycle Platform

### 30.1 Federated Multi-Agency Architecture

Disasters involve multiple organizations: BPBD, BNPB, TNI/Polri, PMI, NGO, media, donors. NURisk must become the coordination layer.

```
┌─────────────────────────────────────────────────────────────────────┐
│                   NURisk Federation Hub                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Agency A    │  │  Agency B    │  │  Agency C    │              │
│  │  (BPBD)      │  │  (PMI)       │  │  (TNI)       │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           │                                         │
│  ┌────────────────────────▼────────────────────────────────────┐   │
│  │               FEDERATION GATEWAY                              │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐    │   │
│  │  │ Auth Proxy   │ │ Tenant       │ │ Shared Incident   │    │   │
│  │  │ (OAuth2/SAML)│ │ Isolation    │ │ Protocol          │    │   │
│  │  └─────────────┘ └──────────────┘ └────────────────────┘    │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                           │                                         │
│  ┌────────────────────────▼────────────────────────────────────┐   │
│  │               INTEROPERABILITY STANDARDS                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │   │
│  │  │ CAP      │ │ EDXL     │ │ WMS/WFS  │ │ GeoJSON/STAC  │   │   │
│  │  │ (Alert)  │ │ (Data    │ │ (Map     │ │ (Geospatial)  │   │   │
│  │  │          │ │  Exchange)│ │  Layers) │ │               │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │   │
│  └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Federation API:**

```typescript
// Agency registration
POST /api/v1/federation/register
{
  agencyName: string
  agencyType: 'BPBD' | 'TNI' | 'PMI' | 'NGO' | 'MEDIA' | 'DONOR'
  contactInfo: { email: string; phone: string }
  authType: 'API_KEY' | 'OAUTH2' | 'SAML'
  allowedScopes: string[]    // e.g. ['incidents:read', 'resources:write']
  webhookUrl?: string         // For push-based sync
}

// Cross-agency incident sharing
POST /api/v1/federation/share-incident
{
  incidentId: string
  targetAgency: string
  sharingLevel: 'READ_ONLY' | 'PARTICIPATE' | 'TAKE_OWNERSHIP'
  expiresAt?: string
}
```

### 30.2 Interoperability Standards

| Standard | Full Name | Usage in NURisk |
|----------|-----------|-----------------|
| **CAP** | Common Alerting Protocol (OASIS) | Outgoing: Publish all CRITICAL incidents as CAP alerts for RSS/TV/Radio. Incoming: Ingest CAP from BMKG/BPBD. |
| **EDXL** | Emergency Data Exchange Language | Cross-agency resource tracking, situation report exchange. EDXL-RM for resource management, EDXL-SitRep for situation reports. |
| **GeoJSON** | RFC 7946 | All spatial data in REST API responses. |
| **WMS/WFS** | Web Map Service / Web Feature Service | Raster tile serving + vector feature query for GIS tools (QGIS, ArcGIS). |
| **STAC** | SpatioTemporal Asset Catalog | Satellite imagery catalog + ML training data discovery. |

### 30.3 Full Disaster Lifecycle Platform

NURisk must support the complete disaster management cycle, not just response:

```
                     ┌─────────────┐
                     │  PREVENTION  │  ← Risk assessment, Early warning, Public education
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │ PREPAREDNESS │  ← Training, Drills, Stockpiling, Evacuation planning
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │  RESPONSE   │  ← Current NURisk focus: Alert, Deploy, Rescue, Aid
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │  RECOVERY   │  ← Rehabilitation, Reconstruction, Economic recovery
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │ MITIGATION  │  ← Infrastructure hardening, Policy change, Zoning
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │ ADAPTATION  │  ← Climate adaptation, Long-term resilience building
                     └─────────────┘
```

**New Lifecycle Modules:**

| Phase | Module | Key Features |
|-------|--------|-------------|
| **Prevention** | Risk Assessment | Hazard mapping, vulnerability analysis, early warning dissemination |
| **Preparedness** | Readiness Management | Drill scheduling, training tracking, stockpile auditing, evacuation drill logs |
| **Response** | (Existing) | Incident management, dispatch, logistics — the current core |
| **Recovery** | Recovery Intelligence | Rehabilitation tracking, reconstruction monitoring, economic impact assessment, household recovery survey |
| **Mitigation** | Resilience Analytics | Infrastructure hardening tracker, policy recommendation engine, land-use risk scoring |
| **Adaptation** | Climate Adaptation | Long-term trend analysis, resilience indicator dashboard, community-based adaptation tracking |

**Economic Impact Assessment:**

```typescript
interface EconomicImpact {
  incidentId: string
  totalEstimatedLoss: number          // IDR
  sectors: {
    infrastructure: number            // Roads, bridges, public facilities
    housing: number                    // Residential damage
    agriculture: number               // Rice fields, crops, livestock
    business: number                  // SMEs, markets, shops
    health: number                    // Medical costs, lost productivity
  }
  affectedHouseholds: number
  affectedLivelihoods: number
  recoveryCost: number                // Estimated reconstruction cost
  recoveryTimeline: string            // e.g. "6-12 months"
  insuranceCoverage?: number          // If data available
  recommendedRelief: {
    cashAssistance: number
    foodAid: number
    shelterMaterials: number
  }
}
```

### 30.4 Multi-Region Disaster Recovery

For national-scale resilience:

| Capability | Implementation | RTO | RPO |
|-----------|---------------|-----|-----|
| Active-Passive Replication | Streaming replication to standby region | < 5 min | < 1 min |
| PITR Backup | pg_dump + WAL archiving to MinIO (30-day retention) | N/A | Point-in-time |
| Geo-Redundant MinIO | MinIO bucket replication across regions | < 1 min | < 5 min |
| DNS Failover | Automatic DNS switch via health check | < 2 min | N/A |
| State Sync | Redis replication + persistent RDB snapshots | < 30s | < 1s |

---

**Golden Rule**: *Data model yang benar akan menghemat ribuan baris refactor. Bangun otak (Backend) sebelum wajah (Frontend).*

<!-- EOF: PRD NURisk v4.0 -->
