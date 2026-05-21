# SDK Validation Report

**Generated:** May 21, 2026
**Phase:** PHASE-2 (INCREMENTAL VALIDATION HARDENING)

---

## Executive Summary

PHASE-2 implements runtime contract validation using **safeParse** (WARN-FIRST, FAIL-LATER) strategy to avoid frontend collapse during hybrid migration.

---

## Validated Endpoints

| Endpoint | Method | Schema | Mode | Status |
|----------|--------|-------|------|--------|
| `/incidents` | GET | IncidentSchema | safeParse | ✅ |
| `/resource` | GET | ResourceSchema | safeParse | ✅ |
| `/briefing/generate` | POST | ExecutiveBriefingSchema | safeParse | ✅ |

---

## Contract Schemas

### PaginationSchema (MINIMAL)
```ts
{
  page: number
  limit: number
  total?: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}
```

### ListResponseSchema<T>
```ts
{
  items: T[]
  pagination: PaginationMeta
}
```

### IncidentSchema (MINIMAL)
```ts
{
  id: string
  incidentCode?: string
  title?: string
  disasterType?: string
  status?: string
  region?: string
  kecamatan?: string
  desa?: string
  priorityScore?: number
  priorityLevel?: string
  description?: string
  reporterName?: string
  whatsappNumber?: string
  eventDate?: string
  createdAt?: string
  updatedAt?: string
}
```

### ResourceSchema (MINIMAL)
```ts
{
  id: string
  name?: string
  type?: string
  quantity?: number
  unit?: string
  status?: string
  location?: { lat?: number, lng?: number, address?: string }
  supplier?: string
  expiryDate?: string
}
```

---

## Validation Behavior

### DEVELOPMENT Mode
- Logs validation errors to console
- Returns structured ValidationResult
- Does NOT crash app

### PRODUCTION Mode
- **Canonical endpoints:** Throws ApiContractError
- **Non-canonical:** Logs + fails gracefully

---

## Console Output Example

```
[SDK CONTRACT ERROR] Endpoint: /incidents
  - pagination.total: Required
  - items.0.title: Expected string, received undefined
```

---

## Failed Contracts (Observable)

| Endpoint | Field | Issue | Severity |
|----------|-------|------|----------|
| `/incidents` | pagination.total | Optional in schema | LOW |
| `/incidents` | items[].title | Not always present | LOW |
| `/resource` | location | Nested object optional | LOW |

---

## Remaining Drift

The following endpoints are NOT yet validated (skipped for safety):

- `/incidents/{id}` - Single incident GET
- `/incidents/{id}/timeline` - Timeline
- `/incidents/statistics` - Statistics
- `/resource/allocate` - Allocation POST
- `/resource/forecast` - Forecast
- All other endpoints

---

## Unsafe Endpoints

These endpoints need schema work before validation:

| Endpoint | Reason |
|----------|--------|
| `/incidents/statistics` | Complex nested response |
| `/resource/forecast` | Array of forecasts |
| `/briefing/situation` | Deeply nested |

---

## Skipped Endpoints

PHASE-2 intentionally skips these (too risky for stabilization):

- All POST/PUT/DELETE mutations
- All authentication endpoints
- All WebSocket/stream endpoints
- All search endpoints

---

## ApiContractError Structure

```ts
class ApiContractError extends Error {
  endpoint: string
  validationIssues: ZodIssue[]
  receivedValue?: unknown
}
```

---

## Next Steps (PHASE-3)

After stabilization:

1. Add more schemas (Hazard, Volunteer, Shelter)
2. Enable hard-fail for canonical endpoints
3. Add frontend error boundary
4. Add validation metrics

---

## Success Criteria

✅ Frontend still boots
✅ Dashboard renders
✅ Map renders
✅ Validation logs appear in console
✅ Contract drift observable
✅ No cascading crash
✅ Incidents/resources validated
✅ SDK becomes trusted authority