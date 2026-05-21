# Contract Consolidation Map

## Objective
Migration map for all duplicate entity contracts to be safely moved to `@nurisk/shared-types`.

**Status:** AUDIT ONLY - No refactoring performed

---

# Canonical Ownership Policy

| Contract Type | Canonical Owner |
|--------------|----------------|
| Database models | Prisma |
| Entity contracts | `@nurisk/shared-types` |
| Validation runtime | `packages/validation` |
| SDK transport | `packages/sdk` |
| UI-only state | frontend local |

---

# Classification Summary

| Class | Description | Count | Risk |
|-------|------------|-------|-----|
| CLASS-A | IDENTICAL | TBD | LOW |
| CLASS-B | EXTENDED | TBD | MEDIUM |
| CLASS-C | PROJECTION | TBD | MEDIUM |
| CLASS-D | DRIFTED | TBD | HIGH |

---

# FRONTEND-WEB DUPLICATES

## Mission

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | components/dashboard/MissionCard.tsx | Mission | - | CLASS-D | No | No shared-types equivalent |

## Volunteer

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | components/map/VolunteerMarkers.tsx | Volunteer | - | CLASS-D | No | No shared-types equivalent |
| frontend-web | components/volunteers/VolunteerDatabaseIntegration.tsx | Volunteer | - | CLASS-D | No | No shared-types equivalent |

## Shelter

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | components/map/ShelterMarkers.tsx | Shelter | - | CLASS-D | No | No shared-types equivalent |

## Warehouse

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | components/map/WarehouseMarkers.tsx | Warehouse | - | CLASS-D | No | No shared-types equivalent |

## MapIncident

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | components/map/MapProvider.tsx | MapIncident | - | CLASS-D | No | No shared-types equivalent |

## MapShelter

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | components/map/MapProvider.tsx | MapShelter | - | CLASS-D | No | No shared-types equivalent |

## IncidentFilters

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | hooks/use-incidents.ts | IncidentFilters | - | CLASS-D | No | No shared-types equivalent |

## LogisticsItem

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | hooks/use-logistics.ts | LogisticsItem | - | CLASS-D | No | No shared-types equivalent |

## LogisticsRequest

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | hooks/use-logistics.ts | LogisticsRequest | - | CLASS-D | No | No shared-types equivalent |

## ChatUser

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | hooks/use-chat.ts | ChatUser | - | CLASS-D | No | No shared-types equivalent |

## Message

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | hooks/use-chat.ts | Message | - | CLASS-D | No | No shared-types equivalent |

## Conversation

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | hooks/use-chat.ts | Conversation | - | CLASS-D | No | No shared-types equivalent |

## SkillInfo

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| frontend-web | constants/skills.ts | SkillInfo | - | CLASS-D | No | No shared-types equivalent |

---

# BACKEND DUPLICATES

## SafeUser

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | auth/dto/user.dto.ts | SafeUser | - | CLASS-D | No | - | - |

## RegisterDto

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | auth/auth.service.ts | RegisterDto | - | CLASS-D | No | - | - |

## LoginDto

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | auth/auth.service.ts | LoginDto | - | CLASS-D | No | - | - |

## Mission

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|
| backend | missions/missions.repository.ts | Mission | - | CLASS-D | No | - |

## Warehouse

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | warehouses/warehouses.repository.ts | Warehouse | - | CLASS-D | No | - | - |

## LogisticsRequest

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | logistics/logistics.repository.ts | LogisticsRequest | - | CLASS-D | No | - | - |

## CreateNotificationDTO

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | notifications/notifications.service.ts | CreateNotificationDTO | - | CLASS-D | No | - | - |

## EscalationRule

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | escalation/models.ts | EscalationRule | - | CLASS-D | Yes | Yes | - |

## Playbook

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | playbook/models.ts | Playbook | - | CLASS-D | Yes | Yes | - |

## Rule

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | rules/models.ts | Rule | - | CLASS-D | Yes | Yes | - |

## ExecutiveBriefing

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Manual .d.ts | Safe To Remove |
|-------|-----|-----------|-------------|----------------|--------------|---------------|---------------|
| backend | services/executive-briefing.ts | ExecutiveBriefing | - | CLASS-D | Yes | Yes | - |

---

# SDK DUPLICATES

## GeoLocation

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| SDK | awareness/AwarenessApi.ts | GeoLocation | common/types | CLASS-A | Yes | Identical |

## Incident

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| SDK | awareness/AwarenessApi.ts | Incident | - | CLASS-D | No | No shared-types equivalent |
| SDK | volunteer-dispatch/VolunteerDispatchApi.ts | Incident | - | CLASS-D | No | No shared-types equivalent |

## Volunteer

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| SDK | awareness/AwarenessApi.ts | Volunteer | - | CLASS-D | No | No shared-types equivalent |
| SDK | volunteer-dispatch/VolunteerDispatchApi.ts | Volunteer | - | CLASS-D | No | No shared-types equivalent |

## Asset

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| SDK | awareness/AwarenessApi.ts | Asset | - | CLASS-D | No | No shared-types equivalent |

## RiskFilters

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| SDK | risk-registry/RiskRegistryApi.ts | RiskFilters | - | CLASS-D | No | No shared-types equivalent |

## SearchOptions

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| SDK | search/SearchApi.ts | SearchOptions | - | CLASS-D | No | No shared-types equivalent |

## HazardType

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| SDK | hazard/HazardApi.ts | HazardType | - | CLASS-D | No | No shared-types equivalent |

## SeverityLevel

| Layer | File | Local Type | Shared Type | Classification | Safe Replace | Notes |
|-------|-----|-----------|-------------|----------------|--------------|-------|
| SDK | hazard/HazardApi.ts | SeverityLevel | - | CLASS-D | No | No shared-types equivalent |

---

# HIDDEN DRIFT DETECTION

## snake_case vs camelCase

| Location | Type | Issue |
|----------|------|-------|
| validation | createIncidentSchema | Uses snake_case |
| shared-types | Incident | Uses camelCase |

**Status:** DETECTED - Needs transformation layer

## string vs number ID

| Location | Type | Issue |
|----------|------|-------|
| backend services | IncidentService | Uses number IDs |
| shared-types | Incident | Uses string UUIDs |

**Status:** DETECTED - ID normalization needed

## Date vs string

| Location | Type | Issue |
|----------|------|-------|
| Prisma | Incident | DateTime |
| shared-types | Incident | string |

**Status:** DETECTED - Type mismatch

---

# MIGRATION PRIORITY TABLE

| Priority | Type | Layer | Replacement Difficulty | Regression Risk |
|----------|------|-------|---------------------|---------------------|
| P1 | GeoLocation | SDK | LOW | LOW |
| P2 | (none CLASS-A found) | - | - | - |
| P3 | MapIncident | Frontend | MEDIUM | MEDIUM |
| P4 | Incident | Backend | HIGH | HIGH |

---

# RECOMMENDED MIGRATION ORDER

1. **Phase 1:** Add missing types to shared-types (Mission, Volunteer, Shelter, Warehouse, etc.)
2. **Phase 2:** Update SDK to import from shared-types (GeoLocation already identical)
3. **Phase 3:** Update frontend to import from shared-types
4. **Phase 4:** Update backend to import from shared-types
5. **Phase 5:** Remove manual .d.ts files (after verification)
6. **Phase 6:** Handle CLASS-D drift (enum normalization, ID conversion)

---

# ROOT CAUSE ANALYSIS

## Why So Many Duplicates?

1. **shared-types incomplete** - Missing core entity types (Mission, Volunteer, Shelter, Warehouse)
2. **No project references** - Frontend/SDK don't reference shared-types properly
3. **Parallel development** - Each layer developed independently
4. **No governance** - No rule enforcing single source of truth

## Why No CLASS-A Types?

- shared-types was created AFTER frontend/backend/SDK
- All entity types were defined locally first
- No migration of local types to shared-types was done

---

# RECOMMENDATIONS

1. **Add missing entity types to shared-types:**
   - Mission
   - Volunteer
   - Shelter
   - Warehouse
   - Incident (full, not just filters)
   - LogisticsItem
   - LogisticsRequest
   - ChatUser
   - Message
   - Conversation

2. **Fix project references:**
   - Add frontend-web reference to shared-types
   - Add SDK reference to shared-types

3. **Enforce governance:**
   - Lint rule: no local entity type definitions
   - ADR: entity types must come from shared-types

---

# VERIFICATION

```bash
pnpm tsc --noEmit
```

**Expected:** No new errors introduced (audit only)

---

# NOTES

- This is an AUDIT document only
- No code modifications performed
- Classification based on field-by-field comparison
- Hidden drift detected via pattern matching
- Migration to be performed in subsequent tasks