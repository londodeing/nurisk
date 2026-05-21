# NURisk Architectural State Snapshot
**Generated**: 2026-05-21

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| Backend Entry Points | 2 (Express.js + NestJS) |
| Language Mix | 239 .ts + 46 .js files |
| Frontend Files | 275 .tsx components |
| Prisma Schema | 2,409 lines (35+ tables) |
| API Routes | 15+ route files |
| Features Implemented | 18 epics planned |

**Critical Finding**: The project is in a **hybrid migration state** - both Express.js (legacy JS) and NestJS (modern TS) entry points exist, with ongoing migration from JavaScript to TypeScript.

---

## 2. Backend Architecture

### 2.1 Dual Entry Points

| Entry Point | Technology | Language | Status |
|------------|------------|----------|--------|
| `src/app.js` | Express.js | JavaScript | Legacy (active) |
| `src/main.ts` | NestJS | TypeScript | Modern (active) |

**Schema Drift**: 
- `app.js` uses raw SQL migrations
- `main.ts` uses Prisma ORM
- Both connect to same PostgreSQL database

### 2.2 File Distribution

```
backend/src/
├── TypeScript (.ts): 239 files
│   ├── auth/          - JWT, guards, decorators
│   ├── incident/     - CRUD, state machine
│   ├── volunteers/   - Management
│   ├── shelters/    - CRUD
│   ├── warehouses/  - Inventory
│   ├── logistics/   - Requests
│   ├── chat/        - Real-time
│   ├── notifications/
│   ├── analytics/
│   ├── maps/        - PostGIS
│   ├── playbook/    - SOP automation
│   ├── rules/       - Escalation
│   ├── decision/    - Risk orchestration
│   ├── risk/
│   ├── awareness/  - Tactical/Operational/Strategic
│   ├── briefing/
│   ├── early-warning/
│   └── services/    - AI, ML, trust scoring
│
└── JavaScript (.js): 46 files
    ├── controllers/   - Legacy route handlers
    ├── routes/       - Legacy routes
    ├── repositories/
    └── services/    - Legacy services
```

### 2.3 Database Layer

**Prisma Schema** (`prisma/schema.prisma`):
- 2,409 lines
- 35+ tables defined
- PostGIS geography types
- Role-based access control
- Full audit trail

**Tables**:
- User, Volunteer, Incident
- Shelter, Warehouse, Asset
- Chat, Notification
- Playbook, Rules
- Risk assessments
- Awareness data
- And more...

---

## 3. Frontend Architecture

### 3.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build | Vite |
| Routing | React Router 7 |
| Data Fetching | TanStack Query |
| State | Zustand |
| Styling | Tailwind CSS |
| UI Library | shadcn/ui |
| Maps | react-leaflet |

### 3.2 Component Distribution

```
frontend-web/src/
├── features/         - 10 feature directories
│   ├── auth/
│   ├── dashboard/
│   ├── incidents/
│   ├── map/
│   ├── volunteers/
│   ├── shelters/
│   ├── warehouses/
│   ├── chat/
│   ├── notifications/
│   └── assessment/
│
├── components/      - 275 .tsx files
│   ├── ui/        - shadcn components
│   ├── map/       - Leaflet layers
│   ├── dashboard/  - KPI cards, charts
│   ├── layout/    - Layouts, nav
│   ├── auth/     - Forms
│   ├── incidents/
│   ├── volunteers/
│   ├── shelters/
│   ├── warehouses/
│   ├── logistics/
│   ├── chat/
│   └── ...
│
└── app/           - Page components
```

---

## 4. API Routes

### 4.1 NestJS Routes (Modern)

| Module | Route | Status |
|-------|-------|--------|
| Auth | `/api/auth/*` | ✅ Implemented |
| Incident | `/api/incidents/*` | ✅ Implemented |
| Volunteer | `/api/volunteers/*` | ✅ Implemented |
| Shelter | `/api/shelters/*` | ✅ Implemented |
| Warehouse | `/api/warehouses/*` | ✅ Implemented |
| Logistics | `/api/logistics/*` | ✅ Implemented |
| Chat | `/api/chat/*` | ✅ Implemented |
| Notifications | `/api/notifications/*` | ✅ Implemented |
| Analytics | `/api/analytics/*` | ✅ Implemented |
| Maps | `/api/maps/*` | ✅ Implemented |
| Buildings | `/api/buildings/*` | ✅ Implemented |
| Playbook | `/api/playbooks/*` | ✅ Implemented |
| Rules | `/api/rules/*` | ✅ Implemented |
| Decision | `/api/decision/*` | ✅ Implemented |
| Risk | `/api/risk/*` | ✅ Implemented |
| Awareness | `/api/awareness/*` | ✅ Implemented |
| Briefing | `/api/briefing/*` | ✅ Implemented |
| Early Warning | `/api/early-warning/*` | ✅ Implemented |
| External | `/api/external/*` | ✅ Implemented |
| Health | `/api/health/*` | ✅ Implemented |

### 4.2 Legacy Routes (Express.js)

| Route File | Purpose |
|-----------|---------|
| `routes/briefingRoutes.js` | Executive briefing |
| `routes/trustRoutes.js` | Trust scoring |
| `routes/verificationRoutes.js` | Media verification |
| `routes/graphRoutes.js` | Knowledge graph |
| `routes/forecastRoutes.js` | Prophet forecasting |
| `routes/streamAnalyticsRoutes.js` | Real-time analytics |
| `routes/trendAnalysisRoutes.js` | Trend analysis |
| `routes/orchestratorRoutes.js` | AI orchestration |
| `routes/panicAlertRoutes.js` | Emergency alerts |
| `routes/sourceReliabilityRoutes.js` | Source trust |
| `routes/strategicRoutes.js` | Strategic awareness |
| `routes/tacticalRoutes.js` | Tactical awareness |
| `routes/deepfakeRoutes.js` | Deepfake detection |
| `routes/factualCheckRoutes.js` | AI fact-checking |
| `routes/forensicsRoutes.js` | Media forensics |

---

## 5. Feature Implementation Status

### 5.1 Backend Features

| Epic | Feature | Status | Notes |
|------|---------|--------|-------|
| E01 | Monorepo & Shared | ✅ Complete | Turborepo configured |
| E02 | Database & Data Layer | 🔄 In Progress | Prisma schema exists, migration ongoing |
| E03 | Backend Core Services | ✅ Complete | Auth, Incident, Volunteer CRUD |
| E04 | Backend Extended Services | ✅ Complete | Shelter, Warehouse, Logistics, Chat |
| E05 | AI Engine & Scrapers | ✅ Complete | BMKG, MAGMA, CEVADIS scrapers |
| E06 | AI Operational Agents | ✅ Complete | 8 agents implemented |
| E07 | Decision & Simulation | ✅ Complete | Risk orchestrator, flood sim |
| E08 | Knowledge Graph | ✅ Complete | Apache Age integration |
| E09 | Playbook & Automation | ✅ Complete | SOP automation |
| E10 | Situational Awareness | ✅ Complete | Tactical/Operational/Strategic |
| E11 | Resilient & Offline | 🔄 Partial | Sync engine exists |
| E12 | Disaster UX | N/A | Frontend concern |
| E13 | Frontend Web | ✅ Complete | React 19 PWA |
| E14 | Flutter APK | 🔄 Partial | BLoC architecture exists |
| E15 | MLOps & Observability | 🔄 Partial | OpenTelemetry configured |
| E16 | Security & Federation | 🔄 Partial | RBAC, PII shield exists |
| E17 | Geospatial Platform | ✅ Complete | PostGIS, WMS |
| E18 | Disaster Lifecycle | 🔄 Partial | Recovery tracking |

### 5.2 Frontend Features

| Feature | Status |
|---------|--------|
| Public Dashboard | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| Incident Management | ✅ Complete |
| Map Display | ✅ Complete |
| Volunteer Management | ✅ Complete |
| Shelter Management | ✅ Complete |
| Warehouse Management | ✅ Complete |
| Logistics Tracking | ✅ Complete |
| Chat | ✅ Complete |
| Notifications | ✅ Complete |
| Analytics | ✅ Complete |
| PWA/Offline | 🔄 Partial |
| Emergency Mode | �� Partial |

---

## 6. Known Issues & Technical Debt

### 6.1 Critical Issues

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | Dual backend entry points | 🔴 KRITIS | Schema drift, maintenance burden |
| 2 | Mixed JS/TS files | 🔴 KRITIS | Inconsistent type safety |
| 3 | No unified API gateway | 🟠 HIGH | Route fragmentation |
| 4 | Legacy Express routes still active | 🟠 HIGH | Duplicate functionality |
| 5 | Flutter APK incomplete | 🟠 HIGH | Mobile features missing |

### 6.2 Technical Debt

| # | Item | Status |
|---|-------|--------|
| 1 | Test coverage | Low (0%) |
| 2 | E2E tests | None |
| 3 | API documentation | Partial (Swagger) |
| 4 | Error handling standardization | Partial |
| 5 | Rate limiting | Partial |

---

## 7. Dependencies

### 7.1 Backend

| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/core | ^10.x | Framework |
| @prisma/client | ^6.x | ORM |
| prisma | ^6.x | ORM |
| passport | ^0.7.x | Auth |
| @nestjs/passport | ^10.x | Auth |
| socket.io | ^4.x | Real-time |
| class-validator | ^0.14.x | Validation |
| bcryptjs | ^2.4.x | Hashing |
| jsonwebtoken | ^9.x | JWT |

### 7.2 Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.x | Framework |
| @tanstack/react-query | ^5.x | Data fetching |
| zustand | ^5.x | State |
| react-router | ^7.x | Routing |
| tailwindcss | ^4.x | Styling |
| react-leaflet | ^4.x | Maps |
| recharts | ^2.x | Charts |
| shadcn/ui | latest | Components |

---

## 8. Configuration

### 8.1 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...

# Redis
REDIS_URL=...

# External APIs
BMKG_URL=...
MAGMA_URL=...
GEMINI_API_KEY=...
```

### 8.2 Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| backend | 3000 | API server |
| frontend-web | 5173 | Web app |
| postgres | 5432 | Database |
| redis | 6379 | Cache/Queue |

---

## 9. Migration Path

### Phase 1: Consolidation (Current)
- [ ] Deprecate `app.js` Express entry point
- [ ] Migrate remaining 46 .js files to .ts
- [ ] Remove legacy routes

### Phase 2: Completion
- [ ] Complete Flutter APK implementation
- [ ] Add E2E tests
- [ ] API documentation

### Phase 3: Optimization
- [ ] Performance tuning
- [ ] Full offline support
- [ ] Federation

---

## 10. Recommendations

1. **Deprecate Express.js entry point** - Use NestJS as single entry point
2. **Complete JS→TS migration** - Convert remaining 46 files
3. **Unify API routes** - Single gateway pattern
4. **Add tests** - Critical for maintenance
5. **Complete Flutter APK** - Mobile is incomplete

---

*End of Snapshot*