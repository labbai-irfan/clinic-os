#!/usr/bin/env node
/**
 * check-assets.mjs — the ClinicOS asset hygiene check (Phase: Asset System, Part 13).
 *
 * Two checks over the asset folders:
 *   1. DUPLICATE assets — identical file contents under different names (wasteful,
 *      drift-prone). Reported as an ERROR (exit 1).
 *   2. UNUSED assets — asset files whose basename / registry key is not referenced
 *      anywhere in `src/**`. Reported as a WARNING (exit 0) — newly added artwork is
 *      legitimately "unused" until wired up.
 *
 * Scans: src/assets, public/assets, public/favicons, public/social-preview,
 * public/splash. Ignores .gitkeep and README.md. No deps; safe to run in CI.
 *
 * Usage: `pnpm check:assets`
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const ASSET_ROOTS = [
  'src/assets',
  'public/assets',
  'public/favicons',
  'public/social-preview',
  'public/splash',
];
const ASSET_EXT = new Set([
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.json',
  '.lottie',
  '.woff2',
]);
const IGNORE = new Set(['.gitkeep', 'README.md']);

/** Recursively collect files under a directory (returns [] if it doesn't exist). */
function walk(dir) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (IGNORE.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out = out.concat(walk(full));
    else if (ASSET_EXT.has(extname(name).toLowerCase())) out.push(full);
  }
  return out;
}

/** Collect the source text we search for asset references (basenames / keys). */
function sourceText() {
  const collect = (dir) => {
    let text = '';
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return text;
    }
    for (const name of entries) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) text += collect(full);
      else if (/\.(ts|tsx|css|html|json)$/.test(name) && !full.includes('assets')) {
        try {
          text += readFileSync(full, 'utf8');
        } catch {
          /* ignore unreadable */
        }
      }
    }
    return text;
  };
  return collect('src') + collect('index.html');
}

const assets = ASSET_ROOTS.flatMap(walk);
console.log(`Asset hygiene check — scanned ${assets.length} asset file(s).`);

if (assets.length === 0) {
  console.log('✓ No assets present yet (folders are scaffolded). Nothing to check.');
  process.exit(0);
}

// 1) Duplicates by content hash.
const byHash = new Map();
for (const file of assets) {
  const hash = createHash('sha1').update(readFileSync(file)).digest('hex');
  (byHash.get(hash) ?? byHash.set(hash, []).get(hash)).push(relative(ROOT, file));
}
const duplicates = [...byHash.values()].filter((group) => group.length > 1);

// 2) Unused (basename not referenced in source).
const src = sourceText();
const unused = assets
  .map((file) => relative(ROOT, file))
  .filter((rel) => {
    const base = rel.split(/[\\/]/).pop();
    const stem = base.replace(/\.[^.]+$/, '');
    return !src.includes(base) && !src.includes(stem);
  });

if (unused.length) {
  console.warn(`\n⚠ ${unused.length} possibly-unused asset(s) (not referenced in src/):`);
  for (const u of unused) console.warn(`   - ${u}`);
}

if (duplicates.length) {
  console.error(`\n✗ ${duplicates.length} duplicate asset group(s) (identical contents):`);
  for (const group of duplicates) console.error(`   - ${group.join('  ==  ')}`);
  console.error('\nRemove the duplicate(s) and reference a single canonical file.');
  process.exit(1);
}

console.log('✓ No duplicate assets.');
process.exit(0);
