# PHASE-00-TYPESCRIPT-BASELINE-CAPTURE Report

**Date:** 2026-05-19  
**Phase:** PHASE-00 Baseline Freeze  
**Task:** TYPESCRIPT-BASELINE-CAPTURE

---

## Executive Summary

Captured TypeScript configuration baseline across all 6 packages. Found **inconsistent module resolution strategies** and **non-standard path alias configurations** that will need standardization in PHASE-09.

---

## Configuration Matrix

| Package | Target | Module | Resolution | Strict | Composite |
|---------|--------|--------|------------|--------|-----------|
| **Root** | ESNext | CommonJS | node | ✅ | ❌ |
| **tsconfig.base** | ES2022 | ESNext | bundler | ✅ | ✅ |
| **shared-types** | ES2022 | ESNext | bundler | ✅ | ✅ |
| **sdk** | ES2022 | ESNext | bundler | ✅ | ❌ |
| **validation** | ES2022 | ESNext | bundler | ✅ | ✅ |
| **shared** | (inherit) | (inherit) | (inherit) | ✅ | ❌ |
| **backend** | ES2022 | commonjs | node | ✅ | ❌ |
| **frontend-web** | ES2022 | ESNext | bundler | ✅ | ❌ |

---

## Detailed Analysis

### 1. Root tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitAny": true,
    "skipLibCheck": true,
    "isolatedModules": true
  }
}
```
**Issues:**
- Uses `ESNext` target but `CommonJS` module (inconsistent)
- `moduleResolution: "node"` is legacy (should be `bundler`)

### 2. tsconfig.base.json (Reference Base)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "composite": true
  }
}
```
**Status:** ✅ Modern configuration

### 3. @nurisk/shared-types
```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true
  }
}
```
**Status:** ✅ Correct configuration

### 4. @nurisk/sdk
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "@nurisk/shared-types": ["./node_modules/@nurisk/shared-types/dist/index.d.ts"]
    }
  }
}
```
**Issues:**
- ❌ Missing `composite: true`
- ⚠️ Path alias points to `dist/` (violates Rule #33: no imports from dist/)

### 5. @nurisk/validation
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true
  }
}
```
**Status:** ✅ Correct configuration

### 6. @nurisk/shared
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```
**Status:** ✅ Uses inheritance correctly

### 7. backend (pusdatin_nu)
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "paths": {
      "@nurisk/validation": ["../packages/validation/src/index.ts"],
      "@nurisk/shared-types": ["../packages/shared-types/src/index.ts"]
    }
  },
  "references": [
    { "path": "../packages/shared-types" },
    { "path": "../packages/validation" }
  ]
}
```
**Issues:**
- ❌ `module: "commonjs"` overrides base ESNext
- ❌ `moduleResolution: "node"` overrides base bundler
- ⚠️ Path aliases point to `src/` (correct, not dist/)
- ✅ Has project references

### 8. frontend-web
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["src/*"],
      "@nurisk/shared-types": ["../packages/shared-types/src"],
      "@nurisk/shared-types/*": ["../packages/shared-types/src/*"]
    }
  }
}
```
**Status:** ✅ Correct configuration

---

## Path Alias Summary

| Package | @nurisk/shared-types | @nurisk/validation | Custom |
|---------|---------------------|-------------------|--------|
| **sdk** | `./node_modules/.../dist/` ❌ | N/A | None |
| **backend** | `../packages/shared-types/src/` ✅ | `../packages/validation/src/` ✅ | None |
| **frontend-web** | `../packages/shared-types/src/` ✅ | N/A | `@/*`, `@components/*`, etc. |

---

## Issues Identified

### Critical Issues
1. **SDK path alias violation** - Points to `dist/` instead of `src/`
2. **Backend module inconsistency** - Uses `commonjs` + `node` resolution instead of inheriting ESNext + bundler
3. **Missing composite in sdk** - Not marked as composite despite being a library

### Minor Issues
1. **Root tsconfig.json** - Legacy configuration (not used by packages)
2. **shared package** - Missing explicit strict mode in tsconfig.json (inherits from base)

---

## Verification Commands

```bash
# Check TypeScript errors per package
cd C:\nurisk
pnpm --filter @nurisk/shared-types tsc --noEmit
pnpm --filter @nurisk/sdk tsc --noEmit
pnpm --filter @nurisk/validation tsc --noEmit
pnpm --filter @nurisk/shared tsc --noEmit
cd backend && pnpm tsc --noEmit
cd ../frontend-web && pnpm tsc --noEmit
```

---

## Recommended Actions (for PHASE-09)

1. **SDK tsconfig.json:**
   - Add `composite: true`
   - Change path alias from `dist/` to `src/`

2. **Backend tsconfig.json:**
   - Remove `module: "commonjs"` override
   - Remove `moduleResolution: "node"` override
   - Let it inherit from base

3. **shared package:**
   - Add explicit `strict: true` in compilerOptions

---

## Conclusion

TypeScript configurations have inconsistencies that will be addressed in PHASE-09 (Monorepo Build Stabilization). The baseline is captured for comparison.

**CAPTURE STATUS: ✅ COMPLETE**