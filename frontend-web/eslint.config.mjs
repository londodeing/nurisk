import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-unused-vars': 'off',
      // ===========================================
      // CANONICAL RESPONSE CONTRACT GOVERNANCE
      // ===========================================
      // Forbid silent fallback patterns
      'no-undefined': 'error',
    },
  },
  // ===========================================
  // SILENT FAILURE GOVERNANCE RULES
  // ===========================================
  {
    files: ['src/**/*.{ts,tsx}'],
    excludedFiles: ['src/**/__tests__/**', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: {
      // Forbid ?? [] silent fallback
      'no-restricted-syntax': [
        'error',
        {
          selector: 'BinaryExpression[operator="??"]',
          message: 'SILENT FALLBACK DETECTED: Use throw new Error() instead of ?? [] for invalid responses',
        },
      ],
      // Forbid || [] silent fallback
      {
        selector: 'BinaryExpression[operator="||"]',
        message: 'SILENT FALLBACK DETECTED: Use throw new Error() instead of || [] for invalid responses',
      },
      // Forbid catch with empty return
      {
        selector: 'CatchClause',
        message: 'CATCH CLAUSE: Must throw or propagate error, not return empty',
      },
    },
  },
  // ===========================================
  // CANONICAL GOVERNANCE RULES
  // ===========================================
  {
    files: ['src/**/*.{ts,tsx}'],
    excludedFiles: ['src/**/__tests__/**', 'src/**/*.test.ts', 'src/**/*.test.tsx', 'src/hooks/use-chat.ts'],
    rules: {
      // Forbid snake_case Incident fields (API boundary exception: use-chat.ts)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[object.name=incident]',
          message: 'Use canonical incident.location.lat/lng instead of incident.latitude/longitude',
        },
        {
          selector: 'MemberExpression[object.name=incident]',
          property: { name: 'created_at' },
          message: 'Use canonical incident.createdAt (camelCase)',
        },
        {
          selector: 'MemberExpression[object.name=incident]',
          property: { name: 'updated_at' },
          message: 'Use canonical incident.updatedAt (camelCase)',
        },
        {
          selector: 'MemberExpression[object.name=incident]',
          property: { name: 'reporter_name' },
          message: 'Use canonical incident.reportedByName',
        },
      ],
      // Forbid lowercase Incident enums
      'no-restricted-properties': [
        'error',
        {
          object: 'incident',
          property: 'severity',
          message: 'Use canonical PriorityLevel: CRITICAL, HIGH, MEDIUM, LOW',
        },
        {
          object: 'incident',
          property: 'status',
          message: 'Use canonical IncidentStatus: REPORTED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED',
        },
      ],
    },
  },
  // Forbid local duplicate domain interfaces
  {
    files: ['src/**/*.{ts,tsx}'],
    excludedFiles: ['packages/shared-types/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSInterfaceDeclaration[id.name=Incident]',
          message: 'Incident must be imported from @nurisk/shared-types/incident',
        },
        {
          selector: 'TSInterfaceDeclaration[id.name=Mission]',
          message: 'Mission must be imported from @nurisk/shared-types/mission',
        },
        {
          selector: 'TSInterfaceDeclaration[id.name=AuditLogEntry]',
          message: 'AuditLogEntry must be imported from @nurisk/shared-types/audit',
        },
      ],
    },
  },
  {
    ignores: ['dist', 'node_modules', '*.config.js'],
  },
];