# Task PHASE-02-SHARED-TYPES-RISK-FILTERS

## Objective
Add RiskFilters type to shared-types as a canonical contract for filtering criteria.

## Scope
RiskFilters type:
- Interface definition
- Filter fields
- Export

## Files Target
- packages/shared-types/src/types/RiskFilters.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-CANONICALIZATION completed

## Implementation Steps
1. Define RiskFilters interface
2. Include all filter fields
3. Add optional filter combinations
4. Export from index.ts
5. Verify TypeScript compiles
6. Document RiskFilters type

## Deliverables
- RiskFilters interface
- Export added
- Documentation

## Verification
- RiskFilters interface is valid TypeScript
- Exported from shared-types
- No duplicate RiskFilters definition

## Expected Result
- RiskFilters type in shared-types
- Canonical contract established
- Ready for migration