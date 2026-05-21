# Task PHASE-02-SHARED-TYPES-HAZARD-TYPE

## Objective
Add HazardType enum to shared-types as a canonical contract for hazard classification.

## Scope
HazardType enum:
- Enum definition
- Values from Prisma
- Export

## Files Target
- packages/shared-types/src/enums/HazardType.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-CANONICALIZATION completed
- PHASE-01-PRISMA-ENUM-EXPORT-AUDIT completed

## Implementation Steps
1. Mirror HazardType from Prisma
2. Define enum values
3. Export from index.ts
4. Verify TypeScript compiles
5. Document HazardType enum

## Deliverables
- HazardType enum
- Export added
- Documentation

## Verification
- HazardType enum matches Prisma
- Exported from shared-types
- No duplicate HazardType definition

## Expected Result
- HazardType enum in shared-types
- Canonical enum established
- Ready for PHASE-03 enum canonicalization