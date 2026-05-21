# Task PHASE-02-SHARED-TYPES-INCIDENT

## Objective
Add Incident entity to shared-types as a canonical contract.

## Scope
Incident entity:
- Interface definition
- Required fields
- Optional fields
- Export

## Files Target
- packages/shared-types/src/entities/Incident.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-ENTITY-FOUNDATION completed

## Implementation Steps
1. Define Incident interface
2. Include all required fields
3. Add optional metadata fields
4. Export from index.ts
5. Verify TypeScript compiles
6. Document Incident entity

## Deliverables
- Incident interface
- Export added
- Documentation

## Verification
- Incident interface is valid TypeScript
- Exported from shared-types
- No duplicate Incident definition

## Expected Result
- Incident entity in shared-types
- Canonical contract established
- Ready for migration