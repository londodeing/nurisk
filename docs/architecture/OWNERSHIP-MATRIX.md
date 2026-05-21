# Ownership Matrix

**Version:** 1.0  
**Status:** ACTIVE  
**Effective Date:** 2026-05-19

---

## Quick Reference

| Layer | Owner | Package | Source of Truth For |
|-------|-------|---------|---------------------|
| Database Schema | Backend Team | `backend/prisma/` | Models, Relations, Enums |
| Entity Contracts | Architecture Team | `@nurisk/shared-types` | Domain entities, DTOs |
| Runtime Validation | Backend Team | `@nurisk/validation` | Zod schemas |
| Transport | Frontend Team | `@nurisk/sdk` | HTTP clients |
| UI State | Frontend Team | `frontend-web` | Component state |
| Orchestration | Backend Team | `backend` | Services |

---

## Detailed Ownership

### 1. Database Schema (Prisma)

| Aspect | Owner | Contact |
|--------|-------|---------|
| Schema Definition | Backend Team | @nurisk/backend-team |
| Enum Values | Backend Team | @nurisk/backend-team |
| Relations | Backend Team | @nurisk/backend-team |
| Migrations | Backend Team | @nurisk/backend-team |

**Location:** `backend/prisma/schema.prisma`

**Responsibilities:**
- Maintain single source of truth for database schema
- Ensure UUID primary keys
- Define canonical enums
- Generate Prisma client

---

### 2. Entity Contracts (@nurisk/shared-types)

| Aspect | Owner | Contact |
|--------|-------|---------|
| Entity Definitions | Architecture Team | @nurisk/architecture-team |
| DTO Contracts | Architecture Team | @nurisk/architecture-team |
| Enum Re-exports | Architecture Team | @nurisk/architecture-team |
| Export Structure | Architecture Team | @nurisk/architecture-team |

**Location:** `packages/shared-types/src/`

**Responsibilities:**
- Define all reusable entity contracts
- Mirror enums from Prisma
- Maintain transport-safe types
- No runtime code

---

### 3. Runtime Validation (@nurisk/validation)

| Aspect | Owner | Contact |
|--------|-------|---------|
| Zod Schemas | Backend Team | @nurisk/backend-team |
| Transformations | Backend Team | @nurisk/backend-team |
| snake_case ↔ camelCase | Backend Team | @nurisk/backend-team |

**Location:** `packages/validation/src/`

**Responsibilities:**
- Implement runtime validation
- Transform naming conventions
- Consume shared-types entities
- No entity definitions

---

### 4. Transport Implementation (@nurisk/sdk)

| Aspect | Owner | Contact |
|--------|-------|---------|
| HTTP Clients | Frontend Team | @nurisk/frontend-team |
| API Adapters | Frontend Team | @nurisk/frontend-team |
| Endpoint Wrappers | Frontend Team | @nurisk/frontend-team |

**Location:** `packages/sdk/src/`

**Responsibilities:**
- Implement HTTP transport
- Consume shared-types entities
- No entity duplication
- SDK-specific helpers allowed

---

### 5. UI State (frontend-web)

| Aspect | Owner | Contact |
|--------|-------|---------|
| Components | Frontend Team | @nurisk/frontend-team |
| State Management | Frontend Team | @nurisk/frontend-team |
| Routing | Frontend Team | @nurisk/frontend-team |

**Location:** `frontend-web/src/`

**Responsibilities:**
- UI rendering
- Local state management
- Consume shared-types entities
- No business logic duplication

---

### 6. Orchestration (backend)

| Aspect | Owner | Contact |
|--------|-------|---------|
| Services | Backend Team | @nurisk/backend-team |
| Controllers | Backend Team | @nurisk/backend-team |
| Repositories | Backend Team | @nurisk/backend-team |

**Location:** `backend/src/`

**Responsibilities:**
- Service orchestration
- Prisma usage internally
- shared-types externally
- Explicit DTO mapping

---

## Change Request Process

### For Schema Changes (Prisma)

1. Backend team proposes change
2. Architecture team reviews
3. ADR created if significant
4. Migration planned
5. Shared-types updated
6. Downstream consumers updated

### For Entity Changes (shared-types)

1. Architecture team reviews request
2. ADR created
3. Implementation in shared-types
4. Downstream consumers updated
5. Verification in all packages

### For Validation Changes

1. Backend team implements
2. Consumes shared-types
3. No entity duplication
4. Verified by build

---

## Emergency Changes

For urgent fixes:

1. Document the issue
2. Get verbal approval from owner
3. Implement fix
4. Create follow-up ADR
5. Complete formal process

---

**MATRIX STATUS: ACTIVE**  
**Last Updated:** 2026-05-19