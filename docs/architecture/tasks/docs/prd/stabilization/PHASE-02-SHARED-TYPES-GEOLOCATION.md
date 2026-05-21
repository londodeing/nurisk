# Task PHASE-02-SHARED-TYPES-GEOLOCATION

## Objective
Add Geolocation type to shared-types as a canonical contract for location data.

## Scope
Geolocation type:
- Interface definition
- Coordinate fields
- Export

## Files Target
- packages/shared-types/src/types/Geolocation.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-CANONICALIZATION completed

## Implementation Steps
1. Define Geolocation interface
2. Include latitude/longitude fields
3. Add optional altitude field
4. Export from index.ts
5. Verify TypeScript compiles
6. Document Geolocation type

## Deliverables
- Geolocation interface
- Export added
- Documentation

## Verification
- Geolocation interface is valid TypeScript
- Exported from shared-types
- No duplicate Geolocation definition

## Expected Result
- Geolocation type in shared-types
- Canonical contract established
- Ready for migration