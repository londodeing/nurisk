# Task PHASE-04-UUID-STRING-ENFORCEMENT

## Objective
Enforce UUID string as the only acceptable ID format in type definitions and function signatures.

## Scope
UUID enforcement:
- Type definitions
- Function parameters
- Return types
- API contracts

## Files Target
- packages/shared-types/src/**/*.ts
- packages/sdk/src/**/*.ts
- packages/validation/src/**/*.ts
- frontend-web/src/**/*.ts
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-04-ID-NORMALIZATION completed

## Implementation Steps
1. Create UUID validation utility
2. Add type guards for UUID strings
3. Update type definitions to use EntityId
4. Add runtime UUID validation
5. Update function signatures
6. Verify TypeScript compiles
7. Document UUID enforcement

## Deliverables
- UUID validation utility
- Type guard functions
- Updated type definitions

## Verification
- All IDs use EntityId type
- UUID validation is in place
- TypeScript compiles

## Expected Result
- UUID string enforced everywhere
- Type safety for IDs
- No implicit ID conversions