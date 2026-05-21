import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Since we are using TypeScript and ES modules, we need to set this
    // Vitest will use the tsconfig for module resolution
    // We can also explicitly set the test file pattern
    include: ['src/**/*.test.ts'],
    // If we want to use TypeScript without building, we can use the following
    // But note: we are using "type": "module" in package.json, so we need to ensure
    // that Vitest can handle ES modules.
    // This should be fine with Vitest >= 0.30.0
  },
})