# Task PHASE-07-FRONTEND-SKILL-INFO-MIGRATION

## Objective
Migrate frontend SkillInfo type to use shared-types.

## Scope
SkillInfo migration:
- Remove local SkillInfo type
- Import from shared-types
- Update consumers

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local SkillInfo type in frontend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated SkillInfo
- Removed local type
- Migration report

## Verification
- SkillInfo from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Frontend uses shared-types SkillInfo
- No duplication
- Consistent type