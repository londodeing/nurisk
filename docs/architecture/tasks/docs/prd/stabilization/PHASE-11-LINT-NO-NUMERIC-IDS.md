# Task PHASE-11-LINT-NO-NUMERIC-IDS

## Objective
Add ESLint rule to prevent numeric ID type definitions.

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
2. Define numeric ID patterns to detect
3. Add error messages
4. Configure rule in ESLint config
5. Test rule on codebase
6. Document rule

## Deliverables
- Custom ESLint rule
- Rule configuration
- Documentation

## Verification
- Rule detects numeric IDs
- Error messages are clear
- Rule is enforced in CI

## Expected Result
- Numeric IDs are blocked
- UUID string enforced
- ID policy compliance