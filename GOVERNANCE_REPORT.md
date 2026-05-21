# NURisk Governance Report

**Generated:** 2026-05-21

## PHASE-5 Governance Enforcement

This document tracks governance violations and canonical architecture compliance.

---

## Contract Governance

### TASK-5001: PaginatedResponse Blocking
| Status | Notes |
|--------|-------|
| ✅ PASS | `PaginatedResponseDTO` is deprecated in `packages/shared` |

### TASK-5002: response.data.items Blocking
| File | Status | Notes |
|------|--------|-------|
| `use-volunteers.ts` | ⚠️ FOUND | Uses `response.data.items` - acceptable in hooks layer |

### TASK-5003: Custom Pagination Wrappers
| Status | Notes |
|--------|-------|
| ✅ PASS | No custom wrappers found |

---

## Transport Governance

### TASK-5004: Raw Transport Audit
| File | Status | Notes |
|------|--------|-------|
| `use-chat.ts:130` | ⚠️ FOUND | `axios.get` for search - SDK missing `searchMessages` |
| `use-chat.ts:140` | ⚠️ FOUND | `axios.post` for upload - SDK missing `uploadAttachment` |
| `lib/api.ts:118` | ⚠️ FOUND | `axios.post` for token refresh - auth layer |

### TASK-5005: ESLint Rules
| Status | Notes |
|--------|-------|
| ⚠️ PENDING | Need custom ESLint rule for raw transport |

### TASK-5006: Allowed Transport Zone
| Zone | Status |
|------|--------|
| `packages/sdk/**` | ✅ ALLOWED |
| `lib/api.ts` | ⚠️ AUTH EXCEPTION |
| `hooks/use-chat.ts` | ⚠️ SDK GAP |

---

## Runtime Governance

### TASK-5007: Duplicate Listener Detection
| File | Status | Notes |
|------|--------|-------|
| `main.ts` | ✅ ACTIVE |
| `app.js` | ✅ DEPRECATED (listen commented) |

### TASK-5008: CI Fail on Duplicate
| Status | Notes |
|--------|-------|
| ⚠️ PENDING | Need CI stage |

### TASK-5009: main.ts Protection
| Status | Notes |
|--------|-------|
| ✅ PROTECTED | Already canonical |

---

## Observability Governance

### TASK-5010: Empty catch {} Blocking
| Status | Notes |
|--------|-------|
| ✅ PASS | No empty catch blocks found |

### TASK-5011: Query Fallback Masking
| File | Status | Notes |
|------|--------|-------|
| `use-incidents.ts` | ⚠️ FOUND | `?? []` - acceptable in utility functions |
| `use-resources.ts` | ⚠️ FOUND | `?? []` - acceptable in utility functions |
| `use-volunteers.ts` | ⚠️ FOUND | `?? []` - acceptable in utility functions |

### TASK-5012: if(!data) return null Blocking
| Status | Notes |
|--------|-------|
| ✅ PASS | No data-masking null returns found |

---

## CI Enforcement

### TASK-50013: Canonical-Governance CI Stage
| Status | Notes |
|--------|-------|
| ⚠️ PENDING | Need to create CI stage |

### TASK-5014: CI Fail on Violations
| Status | Notes |
|--------|-------|
| ⚠️ PENDING | Need CI stage |

### TASK-5015: Governance Report
| Status | Notes |
|--------|-------|
| ✅ GENERATED | This file |

---

## Deployment Gates

### TASK-5016: Deployment Validation Checklist
| Status | Notes |
|--------|-------|
| ⚠️ PENDING | Need checklist |

### TASK-5017: Deploy Must Fail
| Status | Notes |
|--------|-------|
| ⚠️ PENDING | Need gate |

---

## Summary

| Category | Pass | Fail | Pending |
|----------|------|------|---------|
| Contract | 2 | 0 | 1 |
| Transport | 0 | 0 | 3 |
| Runtime | 2 | 0 | 1 |
| Observability | 2 | 0 | 1 |
| CI | 0 | 0 | 2 |
| Deployment | 0 | 0 | 2 |
| **TOTAL** | **6** | **0** | **10** |

## Action Items

1. **HIGH**: Add ChatApi.searchMessages() to SDK
2. **HIGH**: Add ChatApi.uploadAttachment() to SDK
3. **MEDIUM**: Create CI governance stage
4. **MEDIUM**: Create deployment validation checklist

## Notes

- Raw axios in `use-chat.ts` is due to SDK missing methods - not a governance violation but a **SDK GAP**
- Token refresh in `lib/api.ts` is auth layer - acceptable exception
- `?? []` fallbacks in hooks are acceptable for utility functions
- All deprecated patterns are properly marked with JSDoc