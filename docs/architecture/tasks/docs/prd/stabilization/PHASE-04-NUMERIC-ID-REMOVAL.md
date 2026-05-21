# Task PHASE-04-NUMERIC-ID-REMOVAL

## Objective
Remove all numeric ID definitions and usages across the monorepo.

## Scope
Numeric ID removal:
- Type definitions
- Database models
- API contracts
- Function parameters

## Files Target
- packages/shared-types/src/**/*.ts
- packages/sdk/src/**/*.ts
- packages/validation/src/**/*.ts
- frontend-web/src/**/*.ts
- backend/src/**/*.ts
- backend/prisma/schema.prisma

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-04-ID-NORMALIZATION completed

## Implementation Steps
1. Search for all numeric ID patterns
2. Identify numeric ID type definitions
3. Replace with UUID string
4. Update all consumers
5. Verify Prisma schema has no numeric IDs
6. Verify TypeScript compiles
7. Document removals

## Deliverables
- Numeric ID removal report
- Replaced definitions
- Updated consumers

## Verification
- No numeric ID types exist
- Prisma schema has no numeric IDs
- TypeScript compiles

## Expected Result
- All numeric IDs removed
- UUID-only ID ecosystem
- No legacy ID patterns