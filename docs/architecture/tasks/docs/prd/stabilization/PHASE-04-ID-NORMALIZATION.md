# Task PHASE-04-ID-NORMALIZATION

## Objective
Normalize all ID types across the monorepo to use UUID string exclusively.

## Scope
ID normalization:
- Entity IDs
- Foreign keys
- Response IDs
- Request IDs

## Files Target
- packages/shared-types/src/**/*.ts
- packages/sdk/src/**/*.ts
- packages/validation/src/**/*.ts
- frontend-web/src/**/*.ts
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-01-PRISMA-UUID-POLICY-LOCK completed
- PHASE-02-SHARED-TYPES-ID-POLICY completed

## Implementation Steps
1. Audit all ID type usages
2. Identify non-UUID ID types
3. Convert numeric IDs to UUID strings
4. Update type definitions
5. Update all consumers
6. Verify TypeScript compiles
7. Document normalization

## Deliverables
- ID normalization report
- Converted ID fields
- Updated consumers

## Verification
- All IDs are UUID strings
- TypeScript compiles
- No numeric IDs remain

## Expected Result
- All IDs normalized to UUID
- No mixed ID types
- Foundation for PHASE-04 subsequent tasks