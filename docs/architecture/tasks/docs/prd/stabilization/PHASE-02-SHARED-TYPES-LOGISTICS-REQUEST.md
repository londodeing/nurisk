# Task PHASE-02-SHARED-TYPES-LOGISTICS-REQUEST

## Objective
Add LogisticsRequest entity to shared-types as a canonical contract.

## Scope
LogisticsRequest entity:
- Interface definition
- Required fields
- Optional fields
- Export

## Files Target
- packages/shared-types/src/entities/LogisticsRequest.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-ENTITY-FOUNDATION completed

## Implementation Steps
1. Define LogisticsRequest interface
2. Include all required fields
3. Add optional metadata fields
4. Export from index.ts
5. Verify TypeScript compiles
6. Document LogisticsRequest entity

## Deliverables
- LogisticsRequest interface
- Export added
- Documentation

## Verification
- LogisticsRequest interface is valid TypeScript
- Exported from shared-types
- No duplicate LogisticsRequest definition

## Expected Result
- LogisticsRequest entity in shared-types
- Canonical contract established
- Ready for migration