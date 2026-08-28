import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const manifestPath = new URL('../dist/asset-manifest.json', import.meta.url);
const serviceWorkerPath = new URL('../dist/sw.js', import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const files = new Set();

for (const entry of Object.values(manifest)) {
  if (entry.file) files.add(`/${entry.file}`);
  for (const css of entry.css || []) files.add(`/${css}`);
  for (const asset of entry.assets || []) files.add(`/${asset}`);
}

const builtFiles = [...files].sort();
const buildHash = createHash('sha256').update(JSON.stringify(builtFiles)).digest('hex').slice(0, 12);
const source = await readFile(serviceWorkerPath, 'utf8');
if (!source.includes('/* __BUILT_FILES__ */ []') || !source.includes('__BUILD_HASH__')) {
  throw new Error('Service-worker precache placeholders are missing.');
}
const output = source
  .replaceAll('__BUILD_HASH__', buildHash)
  .replace('/* __BUILT_FILES__ */ []', JSON.stringify(builtFiles));
await writeFile(serviceWorkerPath, output);
