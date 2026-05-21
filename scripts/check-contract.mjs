import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const packagesDir = join(process.cwd(), 'packages');
const requiredExports = ['packages/shared-types/src/index.ts'];

let allOk = true;

for (const pkg of requiredExports) {
  const fullPath = join(process.cwd(), pkg);
  if (!existsSync(fullPath)) {
    console.error(`❌ Missing expected package entry: ${pkg}`);
    allOk = false;
    continue;
  }
  const content = readFileSync(fullPath, 'utf8');
  const exports = content.match(/export\s+\S+\s+(\S+)/g) || [];
  console.log(`✅ ${pkg}: ${exports.length} exports found`);
}

if (allOk) {
  console.log('✅ Contract compliance: all required package exports present');
} else {
  console.error('❌ Contract compliance FAILED');
  process.exit(1);
}
