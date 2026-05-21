# Enum Consumer Audit Report

## Summary
- **Canonical enum types**: ~75 defined across shared-types (43 Prisma-mirrored + 32 application-only)
- **Local enum definitions found**: 20+ across SDK, frontend, backend, validation
- **Name collision risks**: 4 enum names with conflicting definitions
- **Inline z.enum() values**: 40+ in validation schemas — none imported from shared-types

## Consumer Map by Package

### `packages/sdk/src/` — SDK
**Canonical imports**: 15 API domain files import types from `@nurisk/shared-types/*`
**Local enum definitions** (need migration):
| Type | File | Conflict |
|------|------|----------|
| `HazardType` | `src/hazard/HazardApi.ts:7` | DIFFERENT values from canonical (`flood/earthquake/...` vs `NATURAL/TECHNOLOGICAL/...`) |
| `SeverityLevel` | `src/hazard/HazardApi.ts:9` | DIFFERENT values from canonical (`very_low/low/...` vs `RENDAH/SEDANG/...`) |
| `RiskLikelihood`, `RiskImpact`, `RiskStatus`, `RiskCategory` | `src/risk-registry/RiskRegistryApi.ts:7-10` | No canonical equivalent — new types to add |
| `WarningLevel`, `WarningType`, `WarningSource` | `src/early-warning/EarlyWarningApi.ts:7-9` | No canonical equivalent |
| `ResourceType` | `src/resource/ResourceApi.ts:7` | Similar to shared-types `common/enums.AssetType` |
| `SearchCategory` | `src/search/SearchApi.ts:7` | No canonical equivalent |

### `packages/validation/src/` — Validation
**Total z.enum() usages**: ~40 across 10 schema files
**All z.enum() values defined inline** — zero imports from shared-types
**Value drift from canonical**:
| Schema File | Field | Drift |
|------------|-------|-------|
| `mission/schemas.ts:21` | status | Uses `ABORTED` — canonical has `CANCELLED` |
| `logistics/schemas.ts:48` | status | Uses `DRAFT/SUBMITTED/DISPATCHED/COMPLETED` — canonical has `PENDING/FULFILLED/CANCELLED` |
| `shelter/schemas.ts:17` | status | Uses `PROPOSED/PENDING_APPROVAL/APPROVED/ACTIVE/INACTIVE` — canonical has `AKTIF/FULL/CLOSED` |
| `chat/schemas.ts:18` | messageType | Uses `VIDEO/LOCATION` — canonical has `SYSTEM` |

### `frontend-web/src/` — Frontend
**Canonical imports**: 30+ files import from `@nurisk/shared-types`
**Local enum definitions** (need migration):
| Type | File | Notes |
|------|------|-------|
| `LogisticsStatus` (enum) | `src/hooks/use-logistics.ts:14` | Duplicates `LogisticsRequestStatus` |
| `LogisticsPriority` (enum) | `src/hooks/use-logistics.ts:25` | Duplicates `RequestPriority` |
| `NeedCategory` (enum) | `src/hooks/use-logistics.ts:32` | Unique — no canonical equivalent |
| `TimeRange` | `src/hooks/use-analytics.ts:8` | Different values from canonical `analytics/enums.TimeRange` |

### `backend/src/` — Backend
**Canonical imports**: 30+ files import from `@nurisk/shared-types`
**Local enum definitions** (status: handled/fixed):
| Type | File | Status |
|------|------|--------|
| `IncidentWorkflowStatus` | `incident/incident-states.config.ts:10` | ✅ Renamed from IncidentStatus |
| `RegionType` | `auth/decorators/region-scoped.decorator.ts:26` | ⚠️ Different values from canonical (`REGENCY` vs `SUB_DISTRICT`) |
| `RuleExecutionStatus` | `rules/rules.schema.ts:59` | Backend-only — no canonical equivalent |
| `ExecutionStatus` | `playbook-execution/playbook.schema.ts:43` | Backend-only — no canonical equivalent |
| `EscalationStatus` | `escalation/escalation.schema.ts:31` | Backend-only — no canonical equivalent |
| `AuditAction` | `common/services/audit.service.ts:4` | ⚠️ Should use canonical audit types |

## Name Collision Risks
1. **HazardType**: SDK defines `flood|earthquake|landslide|volcanic|tsunami|drought` — canonical has `NATURAL|TECHNOLOGICAL|BIOLOGICAL|SOCIAL`
2. **SeverityLevel**: SDK defines `very_low|low|moderate|high|very_high` — canonical has `RENDAH|SEDANG|TINGGI|KRITIS`
3. **RegionType**: Backend defines `PROVINCE|REGENCY|DISTRICT|VILLAGE` — canonical has `PROVINCE|DISTRICT|SUB_DISTRICT|VILLAGE`
4. **AuditAction**: Backend defines `CREATE|UPDATE|DELETE|LOGIN|LOGOUT|FAILED_LOGIN` — may not have canonical
