# Contract Boundaries

**Version:** 1.0  
**Status:** LOCKED  
**Effective Date:** 2026-05-19  
**Phase:** PHASE-00 Baseline Freeze

---

## Purpose

This document defines the explicit boundaries between layers, including allowed imports, forbidden patterns, and transformation rules.

---

## Transport Transformation Boundary

### Mandatory Transformation Pipeline

```
Incoming API JSON (snake_case)
    ↓
@nurisk/validation (transform)
    ↓
Adapter (explicit conversion)
    ↓
@nurisk/shared-types entity (camelCase)
    ↓
Internal domain
```

### Reverse Path (Outgoing)

```
Internal domain
    ↓
@nurisk/shared-types entity (camelCase)
    ↓
Adapter (explicit conversion)
    ↓
@nurisk/validation (transform)
    ↓
Outgoing API JSON (snake_case)
```

---

## Naming Convention Boundaries

| Layer | Naming Convention | Notes |
|-------|-------------------|-------|
| PostgreSQL | snake_case | Database storage |
| Prisma schema | camelCase | ORM representation |
| shared-types | camelCase | TypeScript contracts |
| Frontend | camelCase | Internal domain |
| SDK | camelCase | Internal domain |
| API payload (transport) | snake_case | External API |

---

## Import Boundary Rules

### Rule 1: No Cross-Layer Imports

```
❌ FORBIDDEN:
frontend-web → backend (direct service imports)
frontend-web → Prisma (model imports)
@nurisk/sdk → Prisma
@nurisk/shared-types → Prisma
@nurisk/shared-types → backend
@nurisk/shared-types → frontend
@nurisk/validation → Prisma
```

### Rule 2: Downstream Imports Only

```
✅ ALLOWED:
frontend-web → @nurisk/shared-types
frontend-web → @nurisk/sdk
backend → @nurisk/shared-types
backend → @nurisk/validation
backend → Prisma
@nurisk/sdk → @nurisk/shared-types
@nurisk/validation → @nurisk/shared-types
```

### Rule 3: No Dist Imports

```
❌ FORBIDDEN:
import from './dist/'
import from '../other-package/dist/'

✅ ALLOWED:
import from '@nurisk/shared-types'
import from '../other-package/src/'
```

---

## Entity Contract Boundaries

### Canonical Source: @nurisk/shared-types

All reusable entity contracts MUST be defined in `@nurisk/shared-types`.

**Allowed in shared-types:**
- Interface definitions
- Type aliases
- Enum re-exports
- Generic utilities
- DTO contracts

**Forbidden in shared-types:**
- Runtime validation logic
- Business logic
- HTTP client code
- UI components
- Prisma imports

### Frontend Entity Rules

**Local types ALLOWED:**
- UI component props
- Local state types
- Presentation models
- Event handler types

**Local types FORBIDDEN:**
- Business entity contracts
- API response types
- Domain models
- Duplicate entity definitions

### Backend Entity Rules

**Local types ALLOWED:**
- Internal service types
- Repository interfaces
- DTO mapping types

**Local types FORBIDDEN:**
- Reusable entity contracts (must use shared-types)
- Manual .d.ts files for entities
- Duplicate DTO definitions

---

## Validation Boundary Rules

### Rule 1: Validation Consumes shared-types

Validation schemas MUST import entity types from `@nurisk/shared-types`.

```ts
// ✅ CORRECT
import { User } from '@nurisk/shared-types/auth';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

// Type inference from shared-types
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

```ts
// ❌ FORBIDDEN
// Defining entity in validation layer
export interface User {
  id: string;
  email: string;
  name: string;
}
```

### Rule 2: Snake_case Only at Transport Boundary

Transformation MUST happen at validation layer.

```ts
// ✅ CORRECT
// Input: { user_id: "123", user_name: "John" }
// Output: { userId: "123", userName: "John" }

export function transformUser(input: SnakeCaseUser): CamelCaseUser {
  return {
    userId: input.user_id,
    userName: input.user_name,
  };
}
```

### Rule 3: No Duplicate Validation Contracts

Each validation schema should have exactly one source.

---

## SDK Boundary Rules

### Rule 1: SDK Imports shared-types

SDK MUST import all entity types from `@nurisk/shared-types`.

```ts
// ✅ CORRECT
import { User, Mission, Incident } from '@nurisk/shared-types';
```

```ts
// ❌ FORBIDDEN
// SDK redefining entities
interface User {
  id: string;
  name: string;
}
```

### Rule 2: SDK-Specific Helpers Allowed

Transport-specific utilities are allowed in SDK.

```ts
// ✅ ALLOWED
export function createApiClient(baseUrl: string) {
  return axios.create({ baseURL: baseUrl });
}
```

### Rule 3: No Entity Redefinition

SDK cannot define entity models that exist in shared-types.

---

## Prisma Boundary Rules

### Rule 1: Single Schema Location

Only one Prisma schema allowed.

**Canonical Location:**
```
backend/prisma/schema.prisma
```

### Rule 2: No Frontend Prisma Imports

Frontend and SDK cannot import from Prisma.

```ts
// ❌ FORBIDDEN
import { User } from '@prisma/client';
```

### Rule 3: Generated Types Only

All Prisma types must be generated, not manually defined.

```bash
# Correct way to generate
cd backend
pnpm prisma generate
```

---

## ID Type Boundaries

### Rule 1: UUID String Only

All entity IDs MUST be `string` type with UUID format.

```ts
// ✅ CORRECT
type EntityId = string;

interface User {
  id: EntityId; // UUID string
}
```

```ts
// ❌ FORBIDDEN
interface User {
  id: number; // Numeric ID
}
```

### Rule 2: No ID Conversion

Explicit conversion between ID types is forbidden.

```ts
// ❌ FORBIDDEN
const id = String(userId);
const numId = Number(id);
```

---

## Enum Boundary Rules

### Rule 1: Prisma is Source of Truth

All enums originate from Prisma schema.

### Rule 2: Synchronization Chain

```
Prisma → shared-types → validation → SDK → consumers
```

### Rule 3: No Local Enum Definitions

Downstream layers cannot define their own enum values.

---

## Declaration Boundary Rules

### Rule 1: Generated Declarations Only

All `.d.ts` files must be generated by TypeScript compiler.

```ts
// ✅ CORRECT
// Generated by tsc: dist/index.d.ts
```

```ts
// ❌ FORBIDDEN
// Manually created entity declaration
declare interface User {
  id: string;
  name: string;
}
```

### Rule 2: No Manual .d.ts Files

Manually maintained declaration files are forbidden for entities.

---

## Verification Commands

```bash
# Verify no dist imports
grep -r "from.*dist/" packages/*/src/

# Verify no Prisma imports in frontend
grep -r "@prisma/client" frontend-web/src/

# Verify no local entity definitions in SDK
grep -r "interface.*User" packages/sdk/src/

# Verify shared-types imports validation
grep -r "@nurisk/shared-types" packages/validation/src/
```

---

## Enforcement

Boundary violations should be caught by:

1. **TypeScript compiler** - type errors
2. **ESLint rules** - import analysis
3. **CI pipeline** - build gates
4. **PHASE-11 lint rules** - ownership enforcement

---

**DOCUMENT STATUS: LOCKED**  
**Last Updated:** 2026-05-19  
**Next Review:** After PHASE-12 completion