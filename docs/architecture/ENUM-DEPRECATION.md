# Enum Deprecation Map

## Overview
This document tracks all deprecated enum values that were removed or renamed during PHASE-03 canonicalization. The canonical source of truth is `backend/prisma/schema.prisma` for database-mirrored enums.

## Deprecated Values & Migration Path

### DisasterType (removed from `incident/enums.ts`)

| Removed Value | Replacement | Reason |
|--------------|-------------|--------|
| `GEMBALA` | `GEMPA` | Non-standard Indonesian — duplicate of GEMPA |
| `GEREK` | `EKSTREM_CUACA` | Non-standard Indonesian — covered by EKSTREM_CUACA |
| `LANAU` | `LONGSOR` | Non-standard Indonesian — duplicate of LONGSOR |

### IncidentStatus (changed in `incident/enums.ts`)

| Removed Value | Replacement | Reason |
|--------------|-------------|--------|
| `VERIFIED` | `ASSIGNED` | Prisma canonical uses `ASSIGNED` |
| `REOPENED` | — | Not in Prisma canonical — removed |
| **Added**: `ASSIGNED` | — | New canonical value from Prisma |

### ShelterStatus (changed in `shelter/enums.ts`)

| Removed Value | Replacement | Reason |
|--------------|-------------|--------|
| `PROPOSED` | `AKTIF` | Prisma canonical only has AKTIF/FULL/CLOSED |
| `PENDING_APPROVAL` | `AKTIF` | Prisma canonical only has AKTIF/FULL/CLOSED |
| `APPROVED` | `AKTIF` | Prisma canonical only has AKTIF/FULL/CLOSED |
| `ACTIVE` | `AKTIF` | Prisma uses Indonesian `AKTIF` |
| `INACTIVE` | `CLOSED` | Prisma canonical only has AKTIF/FULL/CLOSED |

### MissionStatus (changed in `mission/enums.ts`)

| Removed Value | Replacement | Reason |
|--------------|-------------|--------|
| `ABORTED` | `CANCELLED` | Prisma canonical uses `CANCELLED` |

### MessageType (changed in `chat/enums.ts`)

| Removed Value | Replacement | Reason |
|--------------|-------------|--------|
| `VIDEO` | `SYSTEM` | Prisma canonical uses `SYSTEM` |
| `LOCATION` | — | Not in Prisma canonical — removed |

### LogisticsRequestStatus (changed in `logistics/enums.ts`)

| Removed Value | Replacement | Reason |
|--------------|-------------|--------|
| `DRAFT` | `PENDING` | Prisma canonical uses `PENDING` |
| `SUBMITTED` | `PENDING` | Prisma canonical uses `PENDING` |
| `DISPATCHED` | `APPROVED` | Prisma canonical uses `APPROVED` |
| `COMPLETED` | `FULFILLED` | Prisma canonical uses `FULFILLED` |
| **Added**: `PENDING` | — | New canonical value from Prisma |
| **Added**: `FULFILLED` | — | New canonical value from Prisma |

### RegionType (changed in `map/enums.ts`)

| Removed Value | Replacement | Reason |
|--------------|-------------|--------|
| `REGENCY` | `SUB_DISTRICT` or `VILLAGE` | Prisma uses SUB_DISTRICT and VILLAGE instead |
| **Added**: `SUB_DISTRICT` | — | New canonical value from Prisma |
| **Added**: `VILLAGE` | — | New canonical value from Prisma |

### Backend: IncidentStatus → IncidentWorkflowStatus (renamed)

| Old Name | New Name | Reason |
|---------|----------|--------|
| `IncidentStatus` | `IncidentWorkflowStatus` | Renamed to eliminate collision with canonical `IncidentStatus` from shared-types |

## Name Collision Risks (resolved)

| Colliding Name | Source 1 | Source 2 | Resolution |
|---------------|----------|----------|------------|
| `IncidentStatus` | shared-types (canonical, 5 values) | backend state machine (8 values) | ✅ Backend enum renamed to `IncidentWorkflowStatus` |

## Enums Requiring Future Canonical Creation

These enum types exist as local definitions and have no canonical shared-types equivalent yet:

| Enum Name | Location | Values |
|-----------|----------|--------|
| `HazardType` (SDK) | `packages/sdk/src/hazard/HazardApi.ts:7` | `flood, earthquake, landslide, volcanic, tsunami, drought` |
| `SeverityLevel` (SDK) | `packages/sdk/src/hazard/HazardApi.ts:9` | `very_low, low, moderate, high, very_high` |
| `RiskLikelihood` | `packages/sdk/src/risk-registry/RiskRegistryApi.ts:7` | `1, 2, 3, 4, 5` |
| `RiskImpact` | `packages/sdk/src/risk-registry/RiskRegistryApi.ts:8` | `1, 2, 3, 4, 5` |
| `AuditAction` | `backend/src/common/services/audit.service.ts:4` | `CREATE, UPDATE, DELETE, LOGIN, LOGOUT, FAILED_LOGIN` |
| `WarningLevel` | `packages/sdk/src/early-warning/EarlyWarningApi.ts:7` | `info, advisory, watch, warning` |

## Affected Files (consumers needing updates)

| File | What Changed |
|------|-------------|
| `packages/validation/src/incident/schemas.ts` | Updated DisasterType values (removed 3), Updated IncidentStatus (removed 2, added 1) |
| `packages/validation/src/mission/schemas.ts:21` | Needs ABORTED → CANCELLED |
| `packages/validation/src/logistics/schemas.ts:48` | Needs DRAFT/SUBMITTED/DISPATCHED/COMPLETED → PENDING/FULFILLED/CANCELLED |
| `packages/validation/src/shelter/schemas.ts:17,48` | Needs old status values → AKTIF/FULL/CLOSED |
| `packages/validation/src/chat/schemas.ts:18` | Needs VIDEO → SYSTEM, remove LOCATION |
| `packages/validation/src/assessment/schemas.ts:44` | Regenerate from canonical |
| `frontend-web/src/constants/disasters.ts` | IncidentStatus constants updated |
| `frontend-web/src/constants/disaster.ts` | IncidentStatus labels updated |
| `frontend-web/src/constants/colors.ts` | IncidentStatus colors updated |
| `backend/prisma/seed.ts` | DisasterType seed values updated |
| `backend/src/incident/incident-states.config.ts` | Renamed to IncidentWorkflowStatus |
| `backend/src/incident/incident-state-machine.ts` | Uses IncidentWorkflowStatus |
| `backend/src/incident/incident-state-machine.spec.ts` | Uses IncidentWorkflowStatus |

## Deprecation Timeline

| Phase | Action | Target |
|-------|--------|--------|
| PHASE-03 | Remove deprecated enum values from canonical definitions | Complete |
| PHASE-03 | Update validation schemas to use canonical values | In progress |
| PHASE-03 | Rename backend IncidentStatus → IncidentWorkflowStatus | Complete |
| PHASE-07 | Update frontend constants to use canonical values | Planned |
| PHASE-08 | Update backend enum consumers | Planned |
| PHASE-12 | Verify all deprecated values are removed from codebase | Planned |
