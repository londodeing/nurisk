import { defineConfig } from 'tsup'
import { readdirSync } from 'fs'
import { join } from 'path'

const srcDir = join(__dirname, 'src')
const entries = readdirSync(srcDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)

// Build ESM + CJS
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    ...Object.fromEntries(
      entries.map((name) => [name, `src/${name}/index.ts`])
    ),
  },
  format: ['esm', 'cjs'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  noWorkers: true,
})

// Build DTS for a single domain
export const dtsConfig = defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['dts'],
  dts: false,
  outDir: 'dist',
  noWorkers: true,
})