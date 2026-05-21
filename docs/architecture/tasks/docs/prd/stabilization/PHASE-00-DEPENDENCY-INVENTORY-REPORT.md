# PHASE-00-DEPENDENCY-INVENTORY Report

**Date:** 2026-05-19  
**Phase:** PHASE-00 Baseline Freeze  
**Task:** DEPENDENCY-INVENTORY

---

## Executive Summary

Complete inventory of all dependencies across 6 workspace packages. Identified version inconsistencies and duplicate dependencies that will be addressed in PHASE-10.

---

## Dependency Summary by Package

### 1. @nurisk/shared-types
**Dependencies:** None (pure type library)  
**DevDependencies:** 7 packages

| Package | Version | Purpose |
|---------|---------|---------|
| tsup | 8.5.1 | Build tool |
| typescript | 5.9.3 | Type checking |
| vitest | 3.2.4 | Testing |
| ts-to-openapi | 1.3.0 | OpenAPI generation |
| tsx | 4.22.0 | TypeScript executor |
| yaml | 2.9.0 | YAML parsing |
| zod-to-json-schema | 3.25.2 | Schema conversion |

---

### 2. @nurisk/sdk
**Dependencies:** 2 packages

| Package | Version | Purpose |
|---------|---------|---------|
| @nurisk/shared-types | workspace:* | Entity contracts |
| axios | 1.16.1 | HTTP client |

**DevDependencies:** 3 packages

| Package | Version |
|---------|---------|
| tsup | 8.5.1 |
| typescript | 5.9.3 |
| vitest | 3.2.4 |

---

### 3. @nurisk/validation
**Dependencies:** 1 package

| Package | Version | Purpose |
|---------|---------|---------|
| zod | 4.4.3 | Runtime validation |

**DevDependencies:** 3 packages

| Package | Version |
|---------|---------|
| tsup | 8.5.1 |
| typescript | 5.9.3 |
| vitest | 3.2.4 |

---

### 4. pusdatin_nu (Backend)
**Dependencies:** 36 packages

| Category | Count | Notable |
|----------|-------|---------|
| Framework | 8 | @nestjs/*, express, socket.io |
| Database | 2 | @prisma/client, pg |
| Auth | 4 | passport, jwt, bcryptjs |
| AI/ML | 1 | @google/generative-ai |
| Utils | 21 | axios, jspdf, leaflet, etc. |
| Workspace | 2 | @nurisk/shared-types, @nurisk/validation |

**DevDependencies:** 13 packages

| Package | Version | Issue |
|---------|---------|-------|
| jest | 30.4.2 | ⚠️ Major version jump |
| vitest | 2.1.9 | ⚠️ Version mismatch with others |
| typescript | 5.9.3 | ✅ Consistent |

---

### 5. pusdatin-nu-frontend (Frontend)
**Dependencies:** 43 packages

| Category | Count | Notable |
|----------|-------|---------|
| Framework | 2 | react, react-dom |
| Routing | 1 | react-router-dom |
| State | 2 | zustand, @tanstack/react-query |
| Mobile | 15 | @capacitor/* |
| UI | 3 | @radix-ui/*, lucide-react |
| Charts | 3 | chart.js, recharts |
| Maps | 4 | leaflet, react-leaflet |
| Utils | 13 | axios, clsx, xlsx, etc. |
| Workspace | 2 | @nurisk/sdk, @nurisk/shared-types |

**DevDependencies:** 11 packages

| Package | Version | Issue |
|---------|---------|-------|
| typescript | 6.0.3 | ⚠️ Older than others |
| vite | 5.4.21 | ⚠️ Older than backend (6.4.2) |
| vitest | 4.1.6 | ⚠️ Version mismatch |

---

### 6. @nurisk/shared
**Dependencies:** None  
**DevDependencies:** 2 packages

| Package | Version |
|---------|---------|
| tsup | 8.5.1 |
| typescript | 5.9.3 |

---

## Version Consistency Analysis

### ✅ CONSISTENT Versions

| Package | Version | Used By |
|---------|---------|---------|
| tsup | 8.5.1 | shared-types, sdk, validation, shared |
| axios | 1.16.1 | sdk, backend, frontend |
| leaflet | 1.9.4 | backend, frontend |
| jspdf | 2.5.2 | backend, frontend |
| socket.io-client | 4.8.3 | backend, frontend |

### ⚠️ INCONSISTENT Versions

| Package | Versions Found | Packages |
|---------|----------------|----------|
| vitest | 2.1.9, 3.2.4, 4.1.6 | backend, shared-types/sdk/validation, frontend |
| typescript | 5.9.3, 6.0.3 | packages, frontend |
| vite | 5.4.21, 6.4.2 | frontend, backend |
| jest | 30.4.2 | backend only |
| react | 18.3.1, 19.2.6 | backend, frontend |
| recharts | 2.15.4, 3.8.1 | frontend, backend |
| react-leaflet | 4.2.1, 5.0.0 | frontend, backend |

---

## Duplicate Dependencies

### High Priority Duplicates

| Package | Versions | Risk |
|---------|----------|------|
| vitest | 3 versions | Test inconsistency |
| typescript | 2 versions | Type checking差异 |
| vite | 2 versions | Build inconsistency |
| react | 2 major versions | Runtime issues |
| recharts | 2 versions | Chart rendering差异 |

### Medium Priority Duplicates

| Package | Versions | Impact |
|---------|----------|--------|
| axios | 1.6.0, 1.15.0, 1.16.1 | HTTP behavior差异 |
| leaflet | 1.9.4, 1.9.8, 1.9.21 | Map rendering差异 |
| jspdf-autotable | 3.8.4 | PDF generation |

---

## Peer Dependency Gaps

### Missing Peer Dependencies

| Package | Consumer | Expected Peer | Status |
|---------|----------|---------------|--------|
| @nurisk/sdk | frontend-web | react | Missing |
| @nurisk/shared-types | sdk, validation | None | OK |
| @nurisk/validation | backend | zod | Already in backend |

---

## @types Package Usage

| Package | @types Package | Version |
|---------|----------------|---------|
| backend | @types/bcryptjs | 2.4.6 |
| backend | @types/jest | 30.0.0 |
| backend | @types/node | 25.8.0 |
| backend | @types/passport-jwt | 4.0.1 |
| backend | @types/pg | 8.20.0 |
| backend | @types/supertest | 7.2.0 |
| backend | @types/uuid | 10.0.0 |
| frontend | @types/leaflet | 1.9.21 |
| frontend | @types/leaflet.markercluster | 1.5.6 |
| frontend | @types/node | 25.8.0 |
| frontend | @types/react | 19.2.14 |
| frontend | @types/react-dom | 19.2.3 |

---

## Workspace Dependencies Graph

```
nurisk-monorepo (root)
├── @nurisk/shared-types ──────────────────────┐
│   └── (no dependencies)                      │
├── @nurisk/sdk                                │
│   └── @nurisk/shared-types                   │
├── @nurisk/validation                         │
│   └── (zod only)                             │
├── @nurisk/shared                             │
│   └── (no dependencies)                     │
├── pusdatin_nu (backend)                      │
│   ├── @nurisk/shared-types                   │
│   ├── @nurisk/validation                     │
│   └── @prisma/client                         │
└── pusdatin-nu-frontend                      │
    ├── @nurisk/sdk                            │
    ├── @nurisk/shared-types                   │
    └── @capacitor/* (15 packages)             │
```

---

## Issues Requiring PHASE-10 Resolution

### Critical Issues

1. **vitest version mismatch** (3 different versions)
   - Affects: shared-types, sdk, validation, backend, frontend
   - Action: Standardize to single version

2. **typescript version mismatch** (5.9.3 vs 6.0.3)
   - Affects: packages vs frontend
   - Action: Upgrade frontend to 5.9.3

3. **react version mismatch** (18.3.1 vs 19.2.6)
   - Affects: backend vs frontend
   - Action: Align to React 19

### High Priority Issues

4. **vite version mismatch** (5.4.21 vs 6.4.2)
   - Affects: frontend vs backend
   - Action: Standardize

5. **recharts version mismatch** (2.15.4 vs 3.8.1)
   - Affects: frontend vs backend
   - Action: Standardize

---

## Verification Commands

```bash
# List all dependencies
pnpm list --depth 0

# Check for outdated packages
pnpm outdated

# Check for duplicate dependencies
pnpm dedupe --check
```

---

## Conclusion

Dependency inventory complete. Identified 7 version inconsistencies requiring resolution in PHASE-10.

**INVENTORY STATUS: ✅ COMPLETE**