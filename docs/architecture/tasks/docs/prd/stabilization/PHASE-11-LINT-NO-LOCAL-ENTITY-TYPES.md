# Task PHASE-11-LINT-NO-LOCAL-ENTITY-TYPES

## Objective
Add ESLint rule to prevent local entity type definitions in packages that should use shared-types.

## Scope
Lint rule:
- Rule implementation
- Error messages
- Fix suggestions

## Files Target
- eslint.config.js or .eslintrc*
- packages/*/src/**/*.ts
- frontend-web/src/**/*.ts
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-11-GOVERNANCE-ENFORCEMENT completed

## Implementation Steps
1. Create custom ESLint rule
2. Define entity type patterns to detect
3. Add error messages
4. Configure rule in ESLint config
5. Test rule on codebase
6. Document rule

## Deliverables
- Custom ESLint rule
- Rule configuration
- Documentation

## Verification
- Rule detects local entity types
- Error messages are clear
- Rule is enforced in CI

## Expected Result
- Local entity types are blocked
- shared-types is enforced
- No entity duplication