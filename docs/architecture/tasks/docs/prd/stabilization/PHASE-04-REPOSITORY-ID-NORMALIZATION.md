# Task PHASE-04-REPOSITORY-ID-NORMALIZATION

## Objective
Normalize repository layer ID handling to use UUID string consistently.

## Scope
Repository ID normalization:
- Repository method parameters
- Repository return types
- Query builders

## Files Target
- backend/src/**/*Repository*.ts
- backend/src/**/*repository*.ts
- backend/src/**/*Repo*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-04-ID-NORMALIZATION completed

## Implementation Steps
1. Identify all repository files
2. Audit ID parameter types
3. Update to UUID string
4. Update return types
5. Update Prisma queries
6. Verify TypeScript compiles
7. Document changes

## Deliverables
- Repository update report
- Updated repository methods
- Documentation

## Verification
- All repositories use UUID IDs
- TypeScript compiles
- Prisma queries work correctly

## Expected Result
- Repository layer normalized
- Consistent ID handling
- Type-safe data access