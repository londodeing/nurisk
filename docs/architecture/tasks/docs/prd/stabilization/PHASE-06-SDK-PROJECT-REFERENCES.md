# Task PHASE-06-SDK-PROJECT-REFERENCES

## Objective
Configure SDK project references to properly reference shared-types and other dependencies.

## Scope
Project references:
- tsconfig project references
- Build order configuration
- Dependency resolution

## Files Target
- packages/sdk/tsconfig.json
- packages/sdk/tsconfig.build.json

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed

## Implementation Steps
1. Configure tsconfig.json references
2. Add shared-types reference
3. Add validation reference if needed
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