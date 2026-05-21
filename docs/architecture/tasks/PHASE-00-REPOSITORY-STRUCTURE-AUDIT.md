# Task PHASE-00-REPOSITORY-STRUCTURE-AUDIT

## Objective
Audit the repository structure to identify the current package boundaries, dependency graph, and potential circular dependencies.

## Scope
Examine the monorepo structure including:
- Root directory packages
- backend/
- frontend-web/
- packages/
- infra/
- scripts/
- docs/

## Files Target
- package.json (root)
- pnpm-workspace.yaml
- turbo.json
- tsconfig.base.json
- All package.json files in packages/*, backend/, frontend-web/

## Do Not Modify
Any source code files (this is an audit-only task).

## Preconditions
- The repository is in a clean state (no uncommitted changes).
- No ongoing migrations.

## Implementation Steps
1. List all directories in the root that are considered packages (backend, frontend-web, packages/*).
2. For each package, examine its package.json to determine:
   - Name
   - Version
   - Dependencies (including workspace dependencies)
   - Exported files (if any)
3. Build a dependency graph of workspace packages.
4. Check for circular dependencies in the workspace.
5. Verify that the tsconfig paths and references match the package structure.
6. Document any violations of clean architecture (e.g., frontend depending on backend directly, packages depending on each other inappropriately).

## Forbidden Actions
- Modifying any source code or configuration files.
- Creating new files or directories.
- Changing existing dependencies.

## Verification
- Run `pnpm ls -r --depth=0` to list all workspace packages and verify they are accounted for.
- Run `pnpm store path` to ensure the store is valid (indirect check).
- Check that the dependency graph is acyclic (using `pnpm ls --filter <package> --json` or similar).
- Validate that the tsconfig.base.json paths correspond to the actual package locations.

## Expected Result
- A document (audit report) listing:
  - All workspace packages
  - Dependency graph
  - Any circular dependencies found
  - Any structural violations (e.g., incorrect dependencies, missing exports)
  - Recommendations for restructuring if needed

## Notes
- This task is informational and does not change the codebase.
- The audit should be used to inform subsequent tasks in PHASE-07 and PHASE-09 (monorepo build stabilization and dependency stabilization).
- The task is deterministic: given the same repository state, it will produce the same audit findings.