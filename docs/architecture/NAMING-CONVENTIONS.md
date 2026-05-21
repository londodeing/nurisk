# Naming Conventions

## Type Names (PascalCase)
- All interfaces, types, and enums use PascalCase
  - `Incident`, `GeoLocation`, `MissionStatus`
- Generic type parameters use single uppercase letters
  - `T`, `K`, `V`

## Property Names (camelCase)
- All object properties use camelCase
  - `createdAt`, `updatedAt`, `lastName`
- Acronyms are treated as words
  - `isValid` (not `isValid`)
  - `parseUrl` (not `parseURL`)

## Enum Members (UPPER_SNAKE_CASE)
- All enum values use UPPER_SNAKE_CASE
  - `BANJIR`, `LONGSOR`, `IN_PROGRESS`
- Exception: legacy string unions may use PascalCase for backward compatibility

## File Naming
- Files use PascalCase for type definitions
  - `Incident.ts`, `GeoLocation.ts`
- Directory names use kebab-case
  - `early-warning/`, `volunteer-dispatch/`

## Export Conventions
- Barrel files (`index.ts`) re-export all public types
- Use `export type` for type-only exports
- Prefer named exports over default exports
