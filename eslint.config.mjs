import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';

const workspaceBoundaries = [
  {
    from: ['backend'],
    to: ['frontend-web', 'frontend-web/**'],
    message: 'backend must not import from frontend-web',
  },
  {
    from: ['frontend-web'],
    to: ['backend', 'backend/**'],
    message: 'frontend-web must not directly import from backend; use @nurisk/sdk instead',
  },
  {
    from: ['frontend-web', 'backend'],
    to: ['packages/sdk/src/**'],
    message: 'Do not import SDK internals directly; import from @nurisk/sdk',
  },
  {
    from: ['frontend-web', 'backend'],
    to: ['packages/validation/src/**'],
    message: 'Do not import validation internals directly; import from @nurisk/validation',
  },
];

function restrictDirectImports(boundaries) {
  const restrictedPaths = [];
  for (const { from, to, message } of boundaries) {
    for (const f of from) {
      for (const t of to) {
        restrictedPaths.push({
          name: t,
          message,
          from: { files: [`**/${f}/**`] },
        });
      }
    }
  }
  return {
    files: ['**/*.{ts,tsx,mts}'],
    rules: {
      'no-restricted-imports': ['error', { paths: restrictedPaths }],
    },
  };
}

const inlineStringPatterns = [
  {
    selector:
      'Literal[value=/^(planned|in_progress|completed|cancelled)$/]',
    message:
      'Use IncidentStatus enum from @nurisk/shared-types instead of inline string literals',
  },
  {
    selector:
      'Literal[value=/^(pending|active|completed|failed)$/]',
    message:
      'Use MissionStatus enum from @nurisk/shared-types instead of inline string literals',
  },
];

// ===========================================
// CANONICAL GOVERNANCE RULES
// ===========================================
const canonicalGovernanceRules = {
  files: ['frontend-web/src/**/*.{ts,tsx}'],
  excludedFiles: ['frontend-web/src/**/__tests__/**', 'frontend-web/src/**/*.test.ts', 'frontend-web/src/hooks/use-chat.ts'],
  rules: {
    // Forbid snake_case Incident fields
    'no-restricted-syntax': [
      'error',
      {
        selector: "MemberExpression[object.name=incident][property.name=created_at]",
        message: 'Use canonical incident.createdAt (camelCase)',
      },
      {
        selector: "MemberExpression[object.name=incident][property.name=updated_at]",
        message: 'Use canonical incident.updatedAt (camelCase)',
      },
      {
        selector: "MemberExpression[object.name=incident][property.name=latitude]",
        message: 'Use canonical incident.location.lat',
      },
      {
        selector: "MemberExpression[object.name=incident][property.name=longitude]",
        message: 'Use canonical incident.location.lng',
      },
    ],
    // Forbid lowercase Incident enums in production code
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value='critical']",
        message: 'Use canonical PriorityLevel.CRITICAL from @nurisk/shared-types/incident',
      },
      {
        selector: "Literal[value='high']",
        message: 'Use canonical PriorityLevel.HIGH from @nurisk/shared-types/incident',
      },
      {
        selector: "Literal[value='medium']",
        message: 'Use canonical PriorityLevel.MEDIUM from @nurisk/shared-types/incident',
      },
      {
        selector: "Literal[value='low']",
        message: 'Use canonical PriorityLevel.LOW from @nurisk/shared-types/incident',
      },
      {
        selector: "Literal[value='reported']",
        message: 'Use canonical IncidentStatus.REPORTED from @nurisk/shared-types/incident',
      },
      {
        selector: "Literal[value='verified']",
        message: 'Use canonical IncidentStatus.ASSIGNED from @nurisk/shared-types/incident',
      },
      {
        selector: "Literal[value='completed']",
        message: 'Use canonical IncidentStatus.CLOSED from @nurisk/shared-types/incident',
      },
    ],
  },
};

export default [
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'error',
    },
  },
  restrictDirectImports(workspaceBoundaries),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...tseslint.configs['flat/recommended'].rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx,mts}'],
    rules: {
      'no-warning-comments': [
        'warn',
        { terms: ['fixme', 'xxx', 'hack', 'todo'], location: 'start' },
      ],
    },
  },
  // CANONICAL GOVERNANCE RULES
  canonicalGovernanceRules,
];
