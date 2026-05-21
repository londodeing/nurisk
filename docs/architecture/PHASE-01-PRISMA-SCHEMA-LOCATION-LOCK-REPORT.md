# PHASE-01: Prisma Schema Location Lock Report

**Task:** PRISMA-SCHEMA-LOCATION-LOCK  
**Status:** ✅ COMPLETED  
**Date:** 2026-05-19  
**Owner:** @nurisk/backend-team  

---

## Executive Summary

Audited the Prisma schema location to ensure canonical single-source-of-truth enforcement. **The schema location is properly locked** with a single canonical schema at `backend/prisma/schema.prisma`.

---

## Policy Reference (from OWNERSHIP.md)

### Canonical Location

```
backend/prisma/schema.prisma
```

**Owner:** Prisma (database layer)

**Rule:** No duplicate schemas allowed in any downstream layer.

---

## Audit Results

### Schema Location Inventory

| Path | Found | Canonical | Compliant |
|------|-------|-----------|-----------|
| `backend/prisma/schema.prisma` | ✅ Yes | ✅ Yes | ✅ |
| `packages/*/schema.prisma` | ❌ None | N/A | ✅ |
| `frontend-*/schema.prisma` | ❌ None | N/A | ✅ |
| `**/introspect_schema.prisma` | ⚠️ 1 | ❌ No | ✅ (non-canonical) |

**Result:** Single canonical schema confirmed.

---

## Detailed Analysis

### 1. Canonical Schema Location

**File:** `backend/prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["extendedWhereUnique"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

✅ **Canonical:** This is the single source of truth for all database models.

---

### 2. Prisma Configuration

**File:** `backend/prisma/prisma.config.ts`

```typescript
export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'migrations'),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
```

✅ **Configuration Points to Canonical Location**

---

### 3. Non-Canonical Schema File

**File:** `backend/prisma/introspect_schema.prisma`

**Purpose:** Used for database introspection only, not for code generation.

**Status:** ✅ Acceptable - clearly separated from canonical schema.

---

### 4. Package Workspace Configuration

**File:** `pnpm-workspace.yaml`

```yaml
packages:
  - 'backend'
  - 'frontend-web'
  - 'packages/*'
  - 'tooling/*'
```

**Analysis:**
- `backend` contains the canonical Prisma schema
- `packages/*` includes: sdk, shared, shared-types, validation
- `tooling/*` is referenced but directory not found (may need creation)

✅ **Workspace structure supports single schema pattern**

---

### 5. Backend Package Configuration

**File:** `backend/package.json`

```json
{
  "name": "pusdatin_nu",
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "@nurisk/shared-types": "workspace:*",
    "@nurisk/validation": "workspace:*"
  },
  "devDependencies": {
    "prisma": "^5.22.0"
  }
}
```

✅ **Backend properly configured with Prisma and workspace dependencies**

---

### 6. Enum Source Documentation

**File:** `packages/shared-types/src/incident/enums.ts`

```typescript
// CANONICAL SOURCE: backend/prisma/schema.prisma
```

✅ **Downstream packages correctly reference canonical source**

---

## Monorepo Structure

```
C:\nurisk\
├── backend/
│   └── prisma/
│       ├── schema.prisma          ← CANONICAL SCHEMA
│       ├── prisma.config.ts        ← Config pointing to schema
│       ├── migrations/             ← Migration history
│       └── introspect_schema.prisma ← Introspection only
├── packages/
│   ├── sdk/                        ← Imports from shared-types
│   ├── shared-types/               ← Mirrors enums from Prisma
│   └── validation/                 ← Uses shared-types
├── frontend-web/                   ← Uses SDK and shared-types
└── pnpm-workspace.yaml              ← Workspace config
```

---

## Forbidden Patterns Check

| Pattern | Found | Status |
|---------|-------|--------|
| Duplicate schema.prisma in packages | 0 | ✅ None |
| schema.prisma in frontend | 0 | ✅ None |
| schema.prisma in shared-types | 0 | ✅ None |
| Custom Prisma configs pointing elsewhere | 0 | ✅ None |

---

## Findings

### ✅ Compliant Areas

1. **Single Canonical Schema:** Only one `schema.prisma` exists at the canonical location
2. **Configuration Alignment:** `prisma.config.ts` correctly points to canonical location
3. **Clear Separation:** Introspection schema clearly separated from canonical
4. **Workspace Support:** Monorepo structure supports single-schema pattern
5. **Downstream References:** Packages correctly reference canonical source

### ⚠️ Observations (Non-Blocking)

1. **Missing tooling/ Directory:** Referenced in `pnpm-workspace.yaml` but not found. May need creation or removal from workspace config.

2. **No Schema Validation in CI:** PHASE-01-CI-VALIDATION will address this.

---

## Recommendations

### Immediate Actions (Optional)

1. **Remove or Create tooling/:**
   ```bash
   # Option A: Remove from workspace if not needed
   # Option B: Create empty tooling package
   mkdir -p tooling && cd tooling && npm init -y
   ```

### Future Improvements (PHASE-08+)

1. **Add Schema Hash Validation:**
   ```yaml
   # .github/workflows/validate.yml
   - name: Validate Schema Hash
     run: |
       SCHEMA_HASH=$(sha256sum backend/prisma/schema.prisma)
       echo "schema_hash=$SCHEMA_HASH" >> $GITHUB_ENV
   ```

2. **Document Schema Ownership:**
   Add to `OWNERSHIP.md`:
   ```markdown
   ## Schema Location Policy
   - Canonical: `backend/prisma/schema.prisma`
   - Forbidden: Any other schema.prisma in monorepo
   - Exception: `introspect_schema.prisma` for introspection only
   ```

---

## Verification Commands

```bash
# Count all schema.prisma files
Get-ChildItem -Recurse -Filter "schema.prisma" | Measure-Object

# Verify canonical location
Test-Path "backend/prisma/schema.prisma"

# Validate Prisma schema
cd backend && npx prisma validate

# Check for duplicates
find . -name "schema.prisma" -not -path "./backend/prisma/*"
```

---

## Conclusion

**Status:** ✅ COMPLIANT

The Prisma schema location is **properly locked** with a single canonical source at `backend/prisma/schema.prisma`. No duplicate schemas exist in the monorepo.

**No changes required.**

---

**Report Generated:** 2026-05-19  
**Auditor:** PHASE-01-PRISMA-SCHEMA-LOCATION-LOCK  
**Next Task:** CI-VALIDATION