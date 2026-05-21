# Canonical Governance

This document defines the engineering rules for maintaining canonical domain type compliance across the monorepo.

## 1. Canonical Contract Rules

### Incident Domain

All Incident domain types MUST be imported from `@nurisk/shared-types/incident`:

```typescript
// ✅ CORRECT
import type { Incident, IncidentStatus, PriorityLevel, DisasterType, GeoLocation, IncidentFilter } from '@nurisk/shared-types/incident';

// ❌ FORBIDDEN
import { Incident } from './types'; // local duplicate
interface Incident { ... } // local shadow
```

### Required Canonical Types

| Type | Import Path |
|------|-----------|
| Incident | @nurisk/shared-types/incident |
| IncidentStatus | @nurisk/shared-types/incident |
| PriorityLevel | @nurisk/shared-types/incident |
| DisasterType | @nurisk/shared-types/incident |
| GeoLocation | @nurisk/shared-types/common |
| IncidentFilter | @nurisk/shared-types/incident |

## 2. Enum Rules

### Incident Severity

```typescript
// ✅ CORRECT
severity === 'CRITICAL'
severity === 'HIGH'
severity === 'MEDIUM'
severity === 'LOW'

// ❌ FORBIDDEN (lowercase)
severity === 'critical'
severity === 'high'
severity === 'medium'
severity === 'low'
```

### Incident Status

```typescript
// ✅ CORRECT
status === 'REPORTED'
status === 'ASSIGNED'
status === 'IN_PROGRESS'
status === 'RESOLVED'
status === 'CLOSED'

// ❌ FORBIDDEN (legacy)
status === 'reported'
status === 'verified'
status === 'assessment'
status === 'completed'
```

### Disaster Type

```typescript
// ✅ CORRECT
type === 'BANJIR'
type === 'LONGSOR'
type === 'GEMPA'
type === 'TSUNAMI'
type === 'VOLKANO'
type === 'KEBAKARAN_HUTAN'
type === 'KEBAKARAN_BANGUNAN'
type === 'EKSTREM_CUACA'
type === 'WABAH_PENYAKIT'

// ❌ FORBIDDEN (lowercase)
type === 'flood'
type === 'earthquake'
type === 'fire'
```

## 3. Structural Rules

### Location Access

```typescript
// ✅ CORRECT
incident.location.lat
incident.location.lng

// ❌ FORBIDDEN (flat)
incident.latitude
incident.longitude
```

### Timestamp Fields

```typescript
// ✅ CORRECT
incident.createdAt
incident.updatedAt

// ❌ FORBIDDEN (snake_case)
incident.created_at
incident.updated_at
```

## 4. Projection Model Rules

Projection models are allowed ONLY if ALL conditions are met:

1. Explicitly named with suffix: `Projection`, `ViewModel`, `RenderModel`
2. Pure mapping function exists
3. Mapping is one-directional (canonical → projection)
4. Projection is internal-only (not exported)
5. Canonical source remains untouched
6. Purpose documented in JSDoc

```typescript
// ✅ ALLOWED
interface MapIncidentProjection {
  id: string;
  latitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

function projectIncidentToMapProjection(incident: Incident): MapIncidentProjection {
  return { ... };
}
```

## 5. API Boundary Rules

Compatibility transforms allowed ONLY at:

- API boundary (axios/fetch responses)
- WebSocket boundary (socket events)
- Third-party SDK boundary

```typescript
// ✅ ALLOWED (API boundary only)
const mapMessage = (m: any): Message => ({
  id: m.id,
  createdAt: m.created_at, // snake_case → camelCase
});
```

```typescript
// ❌ FORBIDDEN (generic normalizers)
function normalizeIncident(incident: any): Incident { ... }
function normalizeStatus(status: string): IncidentStatus { ... }
function normalizeSeverity(severity: string): PriorityLevel { ... }
```

## 6. Exception Classification

| Exception | Classification | Example |
|-----------|----------------|---------|
| Test files | TEST_ONLY | hooks/__tests__/use-incidents.test.tsx |
| Mock data | MOCK_ONLY | hooks/use-awareness.ts |
| API boundary | API_BOUNDARY | hooks/use-chat.ts |
| Separate domain | SEPARATE_DOMAIN | warehouse inventory, mission |
| UI tokens | VALID_UI_TOKEN | Badge variants |

## 7. Forbidden Patterns

### Local Duplicate Interfaces

```typescript
// ❌ FORBIDDEN
interface Incident {
  id: string;
  title: string;
  // ...
}
```

### Stringly Typed Domain Fields

```typescript
// ❌ FORBIDDEN
const incident: { severity: string } = { severity: 'critical' };

// ✅ CORRECT
const incident: { severity: PriorityLevel } = { severity: 'CRITICAL' };
```

### Compatibility Layers

```typescript
// ❌ FORBIDDEN
export const normalizeStatus = (status) => status.toUpperCase();
export const normalizeSeverity = (severity) => severity.toUpperCase();
```

## 8. CI Enforcement

The CI pipeline includes canonical governance checks:

1. **canonical-governance job**: Scans for:
   - Lowercase Incident severity enums
   - Snake_case Incident fields
   - Local duplicate domain interfaces

2. **Lint rules**: ESLint configuration includes:
   - No snake_case Incident fields
   - No lowercase Incident enums
   - No local duplicate interfaces

## 9. Migration Lessons Learned

### What Worked

1. Explicit mapping functions for projection models
2. Direct canonical enum replacement
3. CI grep-based enforcement

### What Didn't Work

1. Generic compatibility layers (normalizeStatus, etc.)
2. Fallback logic for structural drift
3. Implicit coercion

### Key Takeaways

- Single source of truth is non-negotiable
- Compatibility layers create technical debt
- CI enforcement prevents regression
- Documentation enables onboarding