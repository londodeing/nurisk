# Task PHASE-04-SERVICE-ID-SIGNATURE-NORMALIZATION

## Objective
Normalize service layer ID signatures to use UUID string consistently.

## Scope
Service ID signatures:
- Service method parameters
- Service return types
- Internal service calls

## Files Target
- backend/src/**/*Service*.ts
- backend/src/**/*service*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-04-ID-NORMALIZATION completed

## Implementation Steps
1. Identify all service files
2. Audit ID parameter types
3. Update to UUID string
4. Update return types
5. Update internal calls
6. Verify TypeScript compiles
7. Document signature changes

## Deliverables
- Service signature update report
- Updated service methods
- Documentation

## Verification
- All services use UUID IDs
- TypeScript compiles
- No implicit conversions

## Expected Result
- Service signatures normalized
- Consistent ID types
- Type-safe service layer