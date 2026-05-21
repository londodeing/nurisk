import { readdirSync, rmSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = join(__dirname, 'src')
const distDir = join(__dirname, 'dist')

const entries = readdirSync(srcDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)

console.log('Building DTS for domains:', entries.length)

// Build main index first
console.log('Building DTS for: index')
try {
  execSync(
    `pnpm exec tsc "${join(srcDir, 'index.ts')}" --declaration --declarationMap --outDir "${distDir}" --rootDir "${srcDir}" --skipLibCheck --moduleResolution bundler --target ES2022 --module ESNext`,
    { cwd: __dirname, stdio: 'inherit' }
  )
  console.log('✓ index')
} catch (e) {
  console.error(`✗ index: ${e.message}`)
}

// Build each domain
for (const name of entries) {
  console.log(`Building DTS for: ${name}`)
  const outDir = join(distDir, name)
  const tempDir = join(distDir, 'temp', name)
  
  try {
    rmSync(outDir, { recursive: true, force: true })
    rmSync(tempDir, { recursive: true, force: true })
    mkdirSync(tempDir, { recursive: true })
  } catch {}
  
  try {
    execSync(
      `pnpm exec tsc "${join(srcDir, name, 'index.ts')}" --declaration --declarationMap --outDir "${tempDir}" --rootDir "${srcDir}" --skipLibCheck --moduleResolution bundler --target ES2022 --module ESNext`,
      { cwd: __dirname, stdio: 'inherit' }
    )
    
    const srcTempDir = join(tempDir, name)
    const finalDir = join(distDir, name)
    mkdirSync(finalDir, { recursive: true })
    
    for (const file of readdirSync(srcTempDir).filter(f => f.endsWith('.d.ts') || f.endsWith('.d.ts.map'))) {
      const srcFile = join(srcTempDir, file)
      const destFile = join(finalDir, file)
      try {
        const content = readFileSync(srcFile)
        writeFileSync(destFile, content)
      } catch {}
    }
    
    rmSync(tempDir, { recursive: true, force: true })
    console.log(`✓ ${name}`)
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`)
  }
}

console.log('DTS build complete')