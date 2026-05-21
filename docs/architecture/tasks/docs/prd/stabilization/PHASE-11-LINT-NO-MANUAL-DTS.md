# Task PHASE-11-LINT-NO-MANUAL-DTS

## Objective
Add ESLint rule to prevent manual .d.ts declaration files.

## Scope
Lint rule:
- Rule implementation
- Error messages
- Fix suggestions

## Files Target
- eslint.config.js or .eslintrc*
- packages/*/src/**/*.d.ts
- frontend-web/src/**/*.d.ts
- backend/src/**/*.d.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-11-GOVERNANCE-ENFORCEMENT completed

## Implementation Steps
1. Create custom ESLint rule
2. Define .d.ts patterns to detect
3. Add error messages
4. Configure rule in ESLint config
5. Test rule on codebase
6. Document rule

## Deliverables
- Custom ESLint rule
- Rule configuration
- Documentation

## Verification
- Rule detects manual .d.ts files
- Error messages are clear
- Rule is enforced in CI

## Expected Result
- Manual .d.ts files are blocked
- Generated types only
- No shadow declarations