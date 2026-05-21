# Canonical Ownership Model

**Version:** 1.0  
**Status:** LOCKED  
**Effective Date:** 2026-05-19  
**Phase:** PHASE-00 Baseline Freeze

---

## Purpose

This document establishes the canonical ownership model for all type contracts across the Nurisk monorepo. Every layer has a single, unambiguous owner responsible for specific types of contracts.

---

## Ownership Matrix

| Layer | Canonical Owner | Source of Truth For | Forbidden Actions |
|-------|----------------|---------------------|-------------------|
| **Database Schema** | Prisma | Database models, relations, enums | No frontend imports |
| **Entity Contracts** | `@nurisk/shared-types` | Domain entities, DTOs, enums | No runtime code |
| **Runtime Validation** | `@nurisk/validation` | Zod schemas, transformations | No canonical entities |
| **Transport Implementation** | `@nurisk/sdk` | HTTP clients, API adapters | No entity duplication |
| **UI State** | `frontend-web` | Component state, UI models | No business contracts |
| **Orchestration** | `backend` | Service orchestration, persistence | No local entity contracts |

---

## Layer Responsibilities

### 1. Prisma (Database Layer)

**Owner:** Database Administrator / Backend Team

**Source of Truth For:**
- Database schema definitions
- Table relationships
- Database enum values
- Primary key types (UUID)

**Rules:**
- UUID primary keys only
- Prisma enums are canonical
- camelCase field names
- No frontend imports from Prisma

**Canonical Location:**
```
backend/prisma/schema.prisma
```

---

### 2. @nurisk/shared-types (Contract Layer)

**Owner:** Architecture Team

**Source of Truth For:**
- Transport-safe entity contracts
- API DTO contracts
- Enums (mirrored from Prisma)
- Pagination contracts
- Shared primitives

**Rules:**
- No runtime validation code
- No business logic
- No frontend state
- No Prisma imports
- All exports must be explicit

**Canonical Location:**
```
packages/shared-types/src/
```

**Export Submodules:**
- `analytics/`, `api/`, `assessment/`, `auth/`, `awareness/`
- `briefing/`, `chat/`, `common/`, `decision/`, `early-warning/`
- `forecast/`, `hazard/`, `incident/`, `inventory/`, `logistics/`
- `map/`, `mission/`, `notification/`, `resource/`, `risk/`
- `search/`, `shelter/`, `stream-analytics/`, `trend-analysis/`
- `volunteer/`, `volunteer-dispatch/`, `warehouse/`, `weather/`

---

### 3. @nurisk/validation (Validation Layer)

**Owner:** Backend Team

**Source of Truth For:**
- Runtime validation schemas
- Request parsing
- Transport transformation (snake_case ↔ camelCase)

**Rules:**
- Must import entities from shared-types
- Never defines canonical entities
- Responsible for naming convention conversion
- No entity duplication

**Canonical Location:**
```
packages/validation/src/
```

---

### 4. @nurisk/sdk (Transport Layer)

**Owner:** Frontend Team

**Source of Truth For:**
- HTTP transport implementation
- Endpoint wrappers
- API adapters

**Rules:**
- Must import all entities from shared-types
- No local entity duplication
- No business state
- SDK-specific transport helpers allowed

**Canonical Location:**
```
packages/sdk/src/
```

---

### 5. frontend-web (UI Layer)

**Owner:** Frontend Team

**Source of Truth For:**
- UI rendering
- UI state (Zustand stores)
- Presentation models

**Rules:**
- Entity contracts imported from shared-types
- Local types allowed ONLY for UI state
- No transport schema ownership
- No business logic duplication

**Canonical Location:**
```
frontend-web/src/
```

---

### 6. backend (Orchestration Layer)

**Owner:** Backend Team

**Source of Truth For:**
- Service orchestration
- Persistence logic
- Transport transformation

**Rules:**
- Uses Prisma internally
- Exposes shared-types externally
- Explicit DTO mapping layer required
- No local entity contracts

**Canonical Location:**
```
backend/src/
```

---

## Forbidden Import Patterns

| From | Cannot Import From |
|------|-------------------|
| frontend-web | Prisma, backend services |
| @nurisk/sdk | Prisma, backend services |
| @nurisk/validation | Prisma, frontend code |
| @nurisk/shared-types | Prisma, runtime code, frontend, backend |

---

## Mandatory Import Patterns

| Consumer | Must Import From |
|----------|-----------------|
| frontend-web | @nurisk/shared-types, @nurisk/sdk |
| @nurisk/sdk | @nurisk/shared-types |
| @nurisk/validation | @nurisk/shared-types |
| backend | @nurisk/shared-types, @nurisk/validation, Prisma |

---

## ID Ownership Policy

**All IDs MUST be:**
```ts
type EntityId = string;
```

**Format:** UUID string only

**Owner:** Prisma (database layer)

**Forbidden:**
- Numeric IDs
- Implicit casting
- Mixed ID types

---

## Enum Ownership Policy

**Synchronization Order:**
```
Prisma (source)
    ↓
@nurisk/shared-types
    ↓
@nurisk/validation
    ↓
@nurisk/sdk
    ↓
Consumers (frontend-web, backend)
```

**Owner:** Prisma (source of truth)

**Rule:** No local enum definitions allowed in any downstream layer.

---

## Date Serialization Policy

| Layer | Date Representation |
|-------|---------------------|
| Prisma | Date |
| Backend internal | Date |
| shared-types transport | string (ISO-8601) |
| SDK | string (ISO-8601) |
| Frontend | string (ISO-8601) |

**Owner:** Backend (transformation layer)

---

## Violation Handling

Violations of ownership boundaries should be caught by:

1. **TypeScript strict mode** - catches type mismatches
2. **Lint rules** - catches forbidden imports (PHASE-11)
3. **Build pipeline** - catches reference errors
4. **CI gates** - prevents merging violations (PHASE-11)

---

## Change Process

To change ownership assignments:

1. Create ADR (Architecture Decision Record)
2. Get approval from Architecture Team
3. Update this document
4. Update CODEOWNERS
5. Implement migration in appropriate phase

---

## Enforcement

Ownership rules are enforced through:

- **PHASE-11:** CI lint gates
- **PHASE-11:** Import boundary rules
- **PHASE-12:** Governance certification

---

**DOCUMENT STATUS: LOCKED**  
**Last Updated:** 2026-05-19  
**Next Review:** After PHASE-12 completion