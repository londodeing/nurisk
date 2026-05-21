# Task PHASE-11-LINT-IMPORT-BOUNDARIES

## Objective
Add ESLint rule to enforce import boundaries between packages.

## Scope
Lint rule:
- Rule implementation
- Import path validation
- Error messages

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
2. Define allowed import patterns
3. Add error messages
4. Configure rule in ESLint config
5. Test rule on codebase
6. Document rule

## Deliverables
- Custom ESLint rule
- Rule configuration
- Documentation

## Verification
- Rule detects boundary violations
- Error messages are clear
- Rule is enforced in CI

## Expected Result
- Import boundaries enforced
- No cross-boundary violations
- Clear package separation