// Copies the backend's source-of-truth contracts into the frontend.
// Run from intervio-frontend: `npm run sync:contracts`.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../intervio-backend/src/contracts');
const dest = resolve(here, '../src/lib/contracts');

if (!existsSync(src)) {
  console.error(`✖ Backend contracts not found at ${src}`);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log(`✓ Synced contracts → ${dest}`);
