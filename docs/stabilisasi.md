# PRD — Nurisk Canonical Contract Stabilization & Monorepo Type System Reconstruction

Version: 3.0
Status: FINAL STABILIZATION PRD
Scope: Full Monorepo
Target: Permanent elimination of recurring TypeScript drift, contract duplication, enum inconsistency, Prisma mismatch, SDK divergence, and transport instability.

---

# 1. Executive Summary

This PRD defines the final stabilization architecture for the Nurisk monorepo.

The goal is NOT merely reducing TypeScript errors.

The goal is to permanently establish:

* a single canonical contract system,
* deterministic transport boundaries,
* stable Prisma ownership,
* normalized ID policy,
* deterministic enum lifecycle,
* controlled serialization rules,
* governance enforcement,
* and reproducible strict-mode builds.

This PRD replaces all prior ad-hoc stabilization attempts.

This PRD is architecture-first, not error-first.

---

# 2. Problem Statement

The monorepo currently suffers from systemic contract fragmentation caused by parallel type ownership across:

* Prisma schema
* shared-types
* frontend local interfaces
* backend DTOs
* SDK contracts
* validation schemas
* manual `.d.ts` declarations

This has produced recurring drift patterns:

| Drift Type            | Example                                  |
| --------------------- | ---------------------------------------- |
| Enum drift            | `LONGSOR` vs `TANAH_LONGSOR`             |
| ID drift              | `number` vs `string UUID`                |
| Naming drift          | `snake_case` vs `camelCase`              |
| Serialization drift   | `Date` vs `string`                       |
| Entity duplication    | local `Volunteer`, `Mission`, `Incident` |
| Contract divergence   | SDK vs backend vs frontend               |
| Shadow declarations   | manual `.d.ts` files                     |
| Transport instability | API payload mismatch                     |

The result is:

* recurring TypeScript instability,
* repeated stabilization loops,
* unsafe runtime transformations,
* broken SDK contracts,
* high regression risk,
* non-deterministic builds.

---

# 3. Stabilization Objectives

## Primary Objectives

1. Establish canonical contract ownership.
2. Eliminate duplicate entity definitions.
3. Normalize all ID handling to UUID string.
4. Normalize enum lifecycle across all layers.
5. Create explicit transport transformation boundaries.
6. Remove manual declaration shadow systems.
7. Ensure deterministic TypeScript strict-mode compilation.
8. Prevent future drift via governance enforcement.

---

# 4. Non-Goals

The following are explicitly OUT OF SCOPE:

* UI redesign
* business logic redesign
* feature additions
* API redesign
* database migration redesign
* performance optimization
* infrastructure migration
* Docker orchestration redesign

---

# 5. Canonical Ownership Model

## 5.1 Ownership Matrix

| Layer                    | Responsibility               | Canonical Owner        |
| ------------------------ | ---------------------------- | ---------------------- |
| Database schema          | persistence model            | Prisma                 |
| Entity contracts         | domain transport contracts   | `@nurisk/shared-types` |
| Runtime validation       | parsing & runtime validation | `@nurisk/validation`   |
| Transport implementation | HTTP clients                 | `@nurisk/sdk`          |
| UI state                 | local component state        | frontend               |
| Serialization            | DTO transformation           | backend adapters       |

---

# 6. Canonical Architecture Rules

## 6.1 Forbidden Rules

The following become prohibited:

* Local entity interfaces in frontend
* Local entity interfaces in SDK
* Duplicate DTO contracts
* Manual entity `.d.ts` files
* Multiple enum sources
* Number IDs
* Direct Prisma model exposure to frontend
* snake_case usage in frontend internal domain
* Direct validation schema ownership of entities

---

## 6.2 Mandatory Rules

The following become mandatory:

* Entity contracts originate from `@nurisk/shared-types`
* Prisma is canonical database source
* Validation imports shared-types
* SDK imports shared-types
* Frontend imports shared-types
* All IDs use UUID string
* API transport boundary explicitly transforms naming
* Dates serialized to ISO strings
* Generated declarations only

---

# 7. Canonical Layer Model

## 7.1 Database Layer

Canonical owner:

* Prisma schema

Rules:

* UUID primary keys only
* Prisma enums canonical
* camelCase Prisma fields
* no frontend imports from Prisma

---

## 7.2 Shared Contract Layer

Canonical owner:

* `packages/shared-types`

Responsibilities:

* transport-safe entities
* API-safe DTO contracts
* enums
* pagination contracts
* shared primitives

Rules:

* no runtime validation
* no business logic
* no frontend state
* no Prisma imports

---

## 7.3 Validation Layer

Canonical owner:

* `packages/validation`

Responsibilities:

* runtime validation
* request parsing
* transport transformation

Rules:

* imports shared-types
* never defines canonical entities
* responsible for snake_case ↔ camelCase conversion

---

## 7.4 SDK Layer

Canonical owner:

* `packages/sdk`

Responsibilities:

* HTTP transport
* endpoint wrappers
* API adapters

Rules:

* imports all entities from shared-types
* no local entity duplication
* no business state

---

## 7.5 Frontend Layer

Responsibilities:

* UI rendering
* UI state
* presentation models

Rules:

* entity contracts imported from shared-types
* local types allowed ONLY for UI state
* no transport schema ownership

---

## 7.6 Backend Layer

Responsibilities:

* orchestration
* persistence
* transport transformation

Rules:

* Prisma internally
* shared-types externally
* explicit DTO mapping layer required

---

# 8. Canonical Naming Policy

| Layer                 | Naming Convention |
| --------------------- | ----------------- |
| PostgreSQL            | snake_case        |
| Prisma schema         | camelCase         |
| Shared-types          | camelCase         |
| Frontend              | camelCase         |
| SDK                   | camelCase         |
| API payload transport | snake_case        |

---

# 9. Canonical ID Policy

## Mandatory Standard

All IDs MUST be:

```ts
type EntityId = string;
```

Format:

* UUID string only

Forbidden:

* numeric IDs
* implicit casting
* mixed ID types

---

# 10. Canonical Enum Policy

## Prisma becomes canonical enum source

All downstream enums MUST mirror Prisma.

Synchronization order:

```txt
Prisma
↓
shared-types
↓
validation
↓
SDK
↓
frontend/backend consumers
```

No local enum definitions allowed.

---

# 11. Date Serialization Policy

| Layer                  | Date Representation |
| ---------------------- | ------------------- |
| Prisma                 | Date                |
| Backend internal       | Date                |
| Shared-types transport | string              |
| SDK                    | string              |
| Frontend               | string              |

Serialization format:

* ISO-8601 only

---

# 12. Transport Transformation Boundary

## Mandatory Transformation Pipeline

```txt
Incoming API JSON
(snake_case)
↓
validation layer
↓
transform adapter
↓
shared-types entity
(camelCase)
↓
internal domain
```

Reverse path required for outgoing responses.

---

# 13. Duplicate Contract Classification Model

## CLASS-A — IDENTICAL

Safe direct replacement.

## CLASS-B — EXTENDED

Local extension over canonical entity.

Requires adapter extraction.

## CLASS-C — PROJECTION

Partial view-model.

Must remain local projection.

## CLASS-D — DRIFTED

Conflicting contract.

Requires canonicalization first.

---

# 14. Shared-types Completion Strategy

The following entities MUST be added to shared-types before migration:

* Mission
* Volunteer
* Shelter
* Warehouse
* Incident
* LogisticsItem
* LogisticsRequest
* ChatUser
* Message
* Conversation
* RiskFilters
* SearchOptions
* HazardType
* SeverityLevel

---

# 15. Manual Declaration Elimination

## Current Risk

Manual `.d.ts` files create shadow contracts.

## Policy

Allowed declarations:

* generated Prisma declarations
* generated TypeScript declarations

Forbidden:

* manually maintained entity `.d.ts`

---

# 16. Prisma Stabilization Requirements

## Required Conditions

* Prisma client generated
* schema validated
* enums canonicalized
* UUID consistency enforced
* duplicate repositories removed

---

# 17. SDK Stabilization Requirements

## Required Conditions

* syntax-clean
* buildable
* references shared-types
* no duplicated entity models
* generated dist artifacts valid

---

# 18. Monorepo Build Requirements

## Required

* project references enabled
* composite mode enabled
* isolatedModules enabled
* deterministic builds
* strict mode enabled
* no TS build drift

---

# 19. Governance Enforcement

## 19.1 Lint Rules

Required rules:

* no local entity contracts
* no duplicate enums
* no number IDs
* no direct Prisma exposure

---

## 19.2 ADR Requirement

Architecture Decision Record required for:

* new entities
* enum changes
* transport changes
* serialization changes

---

# 20. Stabilization Phases

---

# PHASE-00 — Architecture Freeze

Goals:

* freeze type ownership
* freeze enum changes
* freeze DTO additions

Deliverables:

* audit baseline locked

Exit Criteria:

* no uncontrolled contract changes

---

# PHASE-01 — Prisma Canonicalization

Goals:

* Prisma client generation
* enum stabilization
* schema validation

Deliverables:

* generated client
* stable enums

Exit Criteria:

* zero Prisma import failures

---

# PHASE-02 — Shared-types Domain Completion

Goals:

* add missing canonical entities

Deliverables:

* complete shared contract coverage

Exit Criteria:

* no missing core entities

---

# PHASE-03 — Transport Contract Canonicalization

Goals:

* establish canonical transport contracts

Deliverables:

* shared transport entities

Exit Criteria:

* SDK/frontend/backend consume same contracts

---

# PHASE-04 — Enum Canonicalization

Goals:

* eliminate enum drift

Deliverables:

* synchronized enums

Exit Criteria:

* zero enum mismatch errors

---

# PHASE-05 — ID Normalization

Goals:

* eliminate numeric IDs

Deliverables:

* UUID-only ecosystem

Exit Criteria:

* zero mixed-ID signatures

---

# PHASE-06 — Serialization Stabilization

Goals:

* standardize date serialization

Deliverables:

* ISO serialization utilities

Exit Criteria:

* zero Date/string drift

---

# PHASE-07 — Validation Boundary Stabilization

Goals:

* isolate snake_case transformation

Deliverables:

* explicit adapters

Exit Criteria:

* no naming leakage

---

# PHASE-08 — SDK Migration

Goals:

* replace duplicate SDK entities

Deliverables:

* shared-types imports

Exit Criteria:

* zero SDK duplicate entities

---

# PHASE-09 — Frontend Migration

Goals:

* replace frontend duplicate entities

Deliverables:

* canonical entity imports

Exit Criteria:

* zero frontend entity duplication

---

# PHASE-10 — Backend Migration

Goals:

* replace backend duplicate contracts

Deliverables:

* canonical DTO adapters

Exit Criteria:

* zero backend entity duplication

---

# PHASE-11 — Declaration Elimination

Goals:

* remove manual `.d.ts`

Deliverables:

* generated declarations only

Exit Criteria:

* zero manual entity declaration files

---

# PHASE-12 — Governance Enforcement

Goals:

* prevent future drift

Deliverables:

* lint rules
* ADR rules

Exit Criteria:

* drift prevention automated

---

# PHASE-13 — Strict Mode Finalization

Goals:

* deterministic strict compilation

Deliverables:

* zero TS errors

Exit Criteria:

* `pnpm tsc --build --force` passes

---

# 21. Success Criteria

The stabilization is considered COMPLETE only if:

| Requirement  | Condition              |
| ------------ | ---------------------- |
| TypeScript   | zero errors            |
| Prisma       | generated successfully |
| SDK          | builds successfully    |
| Frontend     | strict compile passes  |
| Backend      | strict compile passes  |
| shared-types | canonical owner        |
| validation   | transformation-only    |
| enums        | fully synchronized     |
| IDs          | UUID-only              |
| declarations | generated-only         |
| duplicates   | eliminated             |
| governance   | enforced               |

---

# 22. Final Expected State

After implementation:

* one canonical contract system exists,
* all layers share deterministic entities,
* transport boundaries are explicit,
* Prisma becomes authoritative,
* SDK becomes stable,
* frontend/backend stop redefining entities,
* strict mode becomes sustainable,
* stabilization loops stop permanently.

---

# 23. Final Principle

The objective is NOT:

> “making TypeScript compile.”

The objective is:

> establishing a deterministic, governable, canonical contract architecture for the entire Nurisk monorepo.
