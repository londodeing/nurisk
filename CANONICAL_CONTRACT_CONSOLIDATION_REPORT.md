# CANONICAL CONTRACT CONSOLIDATION REPORT
**Generated**: 2026-05-21

---

## 1. CANONICAL CONTRACT

### Definition
```ts
ListResponse<T> {
  items: T[]
  pagination: PaginationMeta
}
```

### Source of Truth
- **Package**: `@nurisk/shared-types/api`
- **Location**: `packages/shared-types/src/api/types.ts`
- **Status**: ✅ DEFINED

### Backend Usage
| Module | Contract | Status |
|--------|----------|--------|
| Incidents | ListResponse<Incident> | ✅ Canonical |
| Volunteers | ListResponse<Volunteer> | ✅ Canonical |
| Shelters | ListResponse<Shelter> | ✅ Canonical |
| Warehouses | ListResponse<Warehouse> | ✅ Canonical |
| Assets | ListResponse<Asset> | ✅ Canonical |
| Buildings | ListResponse<Building> | ✅ Canonical |
| Playbook | ListResponse<Playbook> | ✅ Canonical |

### Frontend SDK Usage
| Hook | Contract | Status |
|------|----------|--------|
| use-incidents.ts | ListResponse<Incident> | ✅ Canonical |
| use-volunteers.ts | ListResponse<Volunteer> | ✅ Canonical |
| use-resources.ts | ListResponse<Resource> | ⚠️ Has array adapter |
| use-shelters.ts | ListResponse<Shelter> | ✅ Canonical |
| use-warehouses.ts | ListResponse<Warehouse> | ✅ Canonical |

### Legacy Contract (DEPRECATED)
```ts
PaginatedResponseDTO<T> {
  data: T[]
  total: number
}
```
- **Location**: `packages/shared/src/dto/pagination.dto.ts`
- **Status**: ⚠️ DEPRECATED but still referenced in tests

---

## 2. FRONTEND HOOK MIGRATION

### Hooks Using Canonical ListResponse
| Hook | File | Status |
|------|------|--------|
| use-incidents | src/hooks/use-incidents.ts | ✅ Canonical |
| use-volunteers | src/hooks/use-volunteers.ts | ✅ Canonical |
| use-resources | src/hooks/use-resources.ts | ⚠️ Has array adapter |
| use-shelters | src/hooks/use-shelters.ts | ✅ Uses SDK |
| use-warehouses | src/hooks/use-warehouses.ts | ✅ Uses SDK |

### Hooks With Response Contract Issues
| Hook | File | Issue |
|------|------|-------|
| use-analytics | src/hooks/use-analytics.ts | `response.data ?? []` - SILENT FALLBACK |
| use-awareness | src/hooks/use-awareness.ts | `tactical.assets ?? []` - SILENT FALLBACK |
| use-briefing | src/hooks/use-briefing.ts | `briefing.recommendedActions ?? []` - SILENT FALLBACK |
| use-hazard | src/hooks/use-hazard.ts | `zones?.filter(...) ?? []` - SILENT FALLBACK |
| use-logistics | src/hooks/use-logistics.ts | `response.data ?? []` - SILENT FALLBACK |
| use-risk-registry | src/hooks/use-risk-registry.ts | `risks?.filter(...) ?? []` - SILENT FALLBACK |
| use-stream-analytics | src/hooks/use-stream-analytics.ts | `streamData?.dataPoints ?? []` - SILENT FALLBACK |
| use-trend-analysis | src/hooks/use-trend-analysis.ts | `})) ?? []` - SILENT FALLBACK |
| use-volunteer-dispatch | src/hooks/use-volunteer-dispatch.ts | `incident.data?.requiredSkills || []` - SILENT FALLBACK |
| use-warehouses | src/hooks/use-warehouses.ts | `response.data ?? []` - SILENT FALLBACK |

---

## 3. SILENT FAILURE REMOVAL

### Files with Silent Fallbacks (MUST FIX)

#### frontend-web/src/hooks/use-analytics.ts
```ts
// Line 102 - MUST REMOVE
return response.data ?? [];
// Line 113 - MUST REMOVE
return response.data ?? [];
// Line 124 - MUST REMOVE
return response.data ?? [];
// Line 135 - MUST REMOVE
return response.data ?? [];
// Line 146 - MUST REMOVE
return response.data ?? [];
// Line 156 - MUST REMOVE
return response.data ?? [];
```

#### frontend-web/src/hooks/use-awareness.ts
```ts
// Line 42 - MUST REMOVE
return tactical.assets ?? [];
// Line 58 - MUST REMOVE
return tactical.incidents ?? [];
// Line 74 - MUST REMOVE
return tactical.volunteers ?? [];
// Line 114 - MUST REMOVE
return tactical.channels ?? [];
// Line 130 - MUST REMOVE
return tactical.broadcasts ?? [];
// Line 146 - MUST REMOVE
return tactical.timeline ?? [];
```

#### frontend-web/src/hooks/use-briefing.ts
```ts
// Line 95 - MUST REMOVE
return briefing.recommendedActions ?? [];
```

#### frontend-web/src/hooks/use-hazard.ts
```ts
// Line 256 - MUST REMOVE
const filtered = zones?.filter((z) => z.hazardType === hazardType) ?? [];
// Line 277 - MUST REMOVE
) ?? [];
```

#### frontend-web/src/hooks/use-logistics.ts
```ts
// Line 122 - MUST REMOVE
setRequests(response.data ?? []);
```

#### frontend-web/src/hooks/use-risk-registry.ts
```ts
// Line 145 - MUST REMOVE
const highRisks = risks?.filter((r) => r.inherentRisk >= 15) ?? [];
// Line 161 - MUST REMOVE
data: risks ?? [],
// Line 173 - MUST REMOVE
data: risks ?? [],
// Line 183 - MUST REMOVE
const openRisks = allRisks?.filter((r) => r.status !== 'closed') ?? [];
// Line 207 - MUST REMOVE
})) ?? [];
```

#### frontend-web/src/hooks/use-stream-analytics.ts
```ts
// Line 144 - MUST REMOVE
streamData?.dataPoints ?? [],
// Line 148 - MUST REMOVE
streamData?.dataPoints ?? [],
// Line 152 - MUST REMOVE
streamData?.dataPoints ?? [],
// Line 176 - MUST REMOVE
const triggeredAlerts = alerts?.filter((a: any) => a.triggered) ?? [];
```

#### frontend-web/src/hooks/use-trend-analysis.ts
```ts
// Line 101 - MUST REMOVE
})) ?? [];
```

#### frontend-web/src/hooks/use-volunteer-dispatch.ts
```ts
// Line 162 - MUST REMOVE
incident.data?.requiredSkills || [],
```

#### frontend-web/src/hooks/use-warehouses.ts
```ts
// Line 213 - MUST REMOVE
setInventory(response.data ?? []);
// Line 243 - MUST REMOVE
setMovements(response.data ?? []);
// Line 273 - MUST REMOVE
setCrew(response.data ?? []);
// Line 303 - MUST REMOVE
setEquipment(response.data ?? []);
// Line 333 - MUST REMOVE
setAlerts(response.data ?? []);
```

---

## 4. RUNTIME VALIDATION

### Current Validation (Partial)
| Hook | Validation | Status |
|------|------------|--------|
| use-incidents.ts | `throw new Error('[incidents] Invalid ListResponse: missing items field')` | ✅ Implemented |
| use-volunteers.ts | `throw new Error('[volunteers] Invalid ListResponse: missing items field')` | ✅ Implemented |
| use-resources.ts | `throw new Error('[resources] Invalid response: expected array or ListResponse')` | ✅ Implemented |

### Missing Validation (MUST ADD)
| Hook | Current | Required |
|------|---------|----------|
| use-analytics.ts | `response.data ?? []` | Throw on invalid |
| use-awareness.ts | `tactical.assets ?? []` | Throw on invalid |
| use-briefing.ts | `briefing.recommendedActions ?? []` | Throw on invalid |
| use-hazard.ts | `zones?.filter(...) ?? []` | Throw on invalid |
| use-logistics.ts | `response.data ?? []` | Throw on invalid |
| use-risk-registry.ts | `risks?.filter(...) ?? []` | Throw on invalid |
| use-stream-analytics.ts | `streamData?.dataPoints ?? []` | Throw on invalid |
| use-trend-analysis.ts | `})) ?? []` | Throw on invalid |
| use-volunteer-dispatch.ts | `incident.data?.requiredSkills || []` | Throw on invalid |
| use-warehouses.ts | `response.data ?? []` | Throw on invalid |

---

## 5. REACT QUERY HARDENING

### Current Error Handling (Partial)
| Hook | Error State | Loading State |
|------|------------|--------------|
| use-incidents.ts | ✅ Explicit | ✅ Explicit |
| use-volunteers.ts | ✅ Explicit | ✅ Explicit |
| use-resources.ts | ✅ Explicit | ✅ Explicit |

### Missing Error Boundaries (MUST ADD)
All hooks must have explicit error states - no `return null` for failed queries.

---

## 6. GOVERNANCE HARDENING

### ESLint Rules Required
```ts
// DISALLOWED
catch { return [] }
catch { return null }
response.data ?? fallback

// REQUIRED
ListResponse<T>
```

### Files to Add Rules
- `eslint.config.mjs` (frontend-web)
- `eslint.config.mjs` (backend)

---

## 7. HYBRID BACKEND AUDIT

### Dual Entry Points
| Entry | File | Framework | Language | Routes |
|-------|------|-----------|-----------|--------|
| Legacy | src/app.js | Express.js | JavaScript | 15+ routes |
| Modern | src/main.ts | NestJS | TypeScript | 20+ modules |

### Route Overlap Analysis
| Route | app.js | main.ts | Status |
|-------|-------|--------|--------|
| /api/incidents | ✅ | ✅ | DUPLICATE |
| /api/volunteers | ✅ | ✅ | DUPLICATE |
| /api/shelters | ✅ | ✅ | DUPLICATE |
| /api/warehouses | ✅ | ✅ | DUPLICATE |
| /api/logistics | ✅ | ✅ | DUPLICATE |
| /api/chat | ✅ | ✅ | DUPLICATE |
| /api/notifications | ✅ | ✅ | DUPLICATE |
| /api/analytics | ✅ | ✅ | DUPLICATE |
| /api/maps | ✅ | ✅ | DUPLICATE |

### Middleware Inconsistency
| Middleware | app.js | main.ts |
|-----------|--------|--------|
| Auth | Manual | Passport/JWT |
| Validation | Manual | class-validator |
| Error Handling | Manual | Exception Filter |
| Logging | Manual | Interceptor |

---

## ROOT CAUSE SUMMARY

1. **Response Contract Drift**: Frontend hooks expect `data` field while backend returns `items` field
2. **Silent Fallback Architecture**: `?? []` pattern masks API failures
3. **Dual Backend Entry Points**: Two different frameworks serving same routes
4. **SDK Method Gaps**: Some SDK methods missing, hooks fallback to raw axios
5. **No Runtime Validation**: Invalid responses silently become empty arrays

---

## FIXES APPLIED

### Phase 1: Canonical Contract ✅
- ListResponse<T> defined in @nurisk/shared-types/api
- Backend uses canonical contract
- SDK uses canonical contract

### Phase 2: Frontend Hook Consolidation ⚠️
- use-incidents.ts: ✅ Canonical
- use-volunteers.ts: ✅ Canonical
- use-resources.ts: ⚠️ Has adapter (needs review)
- Other hooks: ❌ Need migration

### Phase 3: Silent Failure Removal ❌
- 30+ silent fallbacks identified
- 0 removed (pending implementation)

### Phase 4: Runtime Validation ⚠️
- 3 hooks have validation
- 10+ hooks need validation added

### Phase 5: React Query Hardening ⚠️
- Error states partial
- Loading states partial

### Phase 6: Governance Hardening ❌
- ESLint rules not added

### Phase 7: Hybrid Backend Audit ✅
- Documented dual entry points
- Route overlap identified

---

## ARCHITECTURAL RISKS REMAINING

1. **Silent failures in 10+ hooks** - UI shows empty without error
2. **Dual backend** - Maintenance burden, route ambiguity
3. **SDK method gaps** - Some hooks use raw axios
4. **No governance enforcement** - Rules can be bypassed
5. **Incomplete migration** - 46 .js files remain

---

## VALIDATION

| Component | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Dashboard | Metrics visible | ❌ Empty (silent fail) | FAIL |
| Map | Tiles/markers | ❌ Empty (silent fail) | FAIL |
| Resources | List visible | ⚠️ Partial | PARTIAL |
| Reports | Render success | ❌ Empty (silent fail) | FAIL |
| Query Layer | No swallowed errors | ❌ 30+ failures | FAIL |
| Network | No contract mismatch | ⚠️ Partial | PARTIAL |
| Runtime | Explicit errors | ❌ Silent | FAIL |

---

## RECOMMENDATIONS

### Immediate Actions
1. **Remove all `?? []` fallbacks** - Replace with throw statements
2. **Add runtime validation** - All hooks must validate response shape
3. **Add React Query error boundaries** - Explicit error states

### Short-term Actions
1. **Migrate remaining hooks** - Use canonical ListResponse
2. **Add SDK methods** - Fill gaps in awareness, briefing, hazard
3. **Add ESLint rules** - Prevent future silent failures

### Long-term Actions
1. **Deprecate Express.js entry** - Single NestJS entry point
2. **Complete JS→TS migration** - Convert remaining 46 files
3. **Add E2E tests** - Validate response contracts

---

*End of Report*