# Task PHASE-07-FRONTEND-PROJECT-REFERENCES

## Objective
Configure frontend project references to properly reference shared-types and SDK.

## Scope
Project references:
- tsconfig project references
- Build order configuration
- Dependency resolution

## Files Target
- frontend-web/tsconfig.json
- frontend-web/tsconfig.build.json

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Configure tsconfig.json references
2. Add shared-types reference
3. Add SDK reference
4. Configure build order
5. Verify references resolve
6. Test incremental build
7. Document references

## Deliverables
- Configured project references
- Build order verified
- Reference documentation

## Verification
- References resolve correctly
- Incremental build works
- TypeScript compiles

## Expected Result
- Project references configured
- Proper build order
- Incremental builds work