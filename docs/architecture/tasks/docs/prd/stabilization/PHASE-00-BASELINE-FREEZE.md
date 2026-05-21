# Task PHASE-00-BASELINE-FREEZE

## Objective
Freeze all changes to type contracts, DTOs, enums, and ID policies across the monorepo to establish a stable baseline for subsequent stabilization phases.

## Scope
Prevent any modifications to:
- Entity interfaces/types in shared-types
- Prisma schema enum definitions
- UUID string ID policy
- API transport contracts in SDK
- Validation schemas in validation package

## Files Target
- packages/shared-types/src/**/*.ts
- backend/prisma/schema.prisma
- packages/sdk/src/**/*.ts
- packages/validation/src/**/*.ts
- frontend-web/src/types/**/*.ts
- frontend-web/src/services/api.ts

## Preconditions
- Backup of current state (optional but recommended)
- No ongoing migrations or partial refactors

## Implementation Steps
1. Notify all developers and AI agents that contract changes are frozen.
2. Update repository documentation to reflect the freeze.
3. Ensure any pending PRs that modify contract files are either merged or rejected before proceeding.
4. No further steps required; the freeze is a policy enforced by subsequent tasks.

## Forbidden Actions
- Creating new interfaces/types in shared-types
- Modifying enum values in Prisma schema
- Changing ID field types from string UUID to anything else
- Adding new DTOs in SDK or validation
- Modifying API endpoint payloads in SDK or backend
- Adding new enum definitions in any package
- Changing snake_case/camelCase conventions in transport layers

## Verification
- Attempt to lint or build should not fail due to new contract violations (but may fail due to existing issues).
- Specifically, run:
  ```bash
  pnpm --filter @nurisk/shared-types build
  pnpm --filter @nurisk/sdk build
  pnpm --filter @nurisk/validation build
  pnpm --filter backend build
  pnpm --filter frontend-web build
  ```
  These should complete without new TS errors related to contract changes (existing errors may remain).

## Expected Result
- No new contract changes are introduced after the freeze is declared.
- The monorepo enters a stable state where only bug fixes and internal logic changes are allowed.
- Subsequent stabilization phases can safely refactor without chasing moving targets.

## Notes
- This task is a policy/task to establish a baseline; it does not modify code directly.
- It is idempotent: declaring the freeze again has no effect.
- The freeze remains in effect until explicitly lifted after all stabilization phases are complete.