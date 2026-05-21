# Task PHASE-02-SHARED-TYPES-MESSAGE

## Objective
Add Message entity to shared-types as a canonical contract.

## Scope
Message entity:
- Interface definition
- Required fields
- Optional fields
- Export

## Files Target
- packages/shared-types/src/entities/Message.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-ENTITY-FOUNDATION completed

## Implementation Steps
1. Define Message interface
2. Include all required fields
3. Add optional metadata fields
4. Export from index.ts
5. Verify TypeScript compiles
6. Document Message entity

## Deliverables
- Message interface
- Export added
- Documentation

## Verification
- Message interface is valid TypeScript
- Exported from shared-types
- No duplicate Message definition

## Expected Result
- Message entity in shared-types
- Canonical contract established
- Ready for migration