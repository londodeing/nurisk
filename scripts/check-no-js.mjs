import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const dir = join(process.cwd(), 'backend', 'src');
let foundAny = false;

function walk(d) {
  const entries = readdirSync(d, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(d, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      walk(full);
    } else if (entry.name.endsWith('.js')) {
      const rel = relative(process.cwd(), full);
      console.error(`❌ Stale .js file found: ${rel}`);
      foundAny = true;
    }
  }
}

walk(dir);

if (foundAny) {
  process.exit(1);
} else {
  console.log('✅ No stale .js files in backend/src/');
}
