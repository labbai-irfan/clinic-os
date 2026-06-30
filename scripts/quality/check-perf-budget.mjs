#!/usr/bin/env node
/**
 * check-perf-budget.mjs — ClinicOS Performance Budget gate (Phase 9 · Part 5).
 *
 * Performance is a feature, especially on the low-end devices clinics actually
 * use. A budget that isn't enforced is a wish. This gate reads the production
 * `dist/` and fails the build when transfer weight exceeds the budgets in
 * `scripts/quality/budgets.json`:
 *
 *   - JS  total + per-chunk    — measured GZIPPED (wire weight).
 *   - CSS total                — measured GZIPPED.
 *   - Fonts total + per-file   — measured RAW (woff2 is already compressed).
 *   - Images per-file          — measured RAW.
 *   - Page transfer weight     — gzip(text) + raw(binary), excl. source maps.
 *
 * If `dist/` is absent it WARNS and exits 0 (run `pnpm build` first; CI builds
 * before this gate). No third-party deps — gzip via node:zlib.
 *
 * Gate doc: docs/engineering/PerformanceBudgets.md. Usage: `pnpm check:perf`
 */
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { reporter, walk, read, rel, fileSize, KB } from './_lib.mjs';

const r = reporter('Performance budget');
const DIST = 'dist';

if (!existsSync(DIST)) {
  console.warn('⚠ Performance budget: no dist/ found — run `pnpm build` first. Skipping (exit 0).');
  process.exit(0);
}

const budgets = JSON.parse(read('scripts/quality/budgets.json'));
const gzipKB = (file) => KB(gzipSync(readFileSync(file)).length);
const rawKB = (file) => KB(fileSize(file));

const files = walk(DIST).filter((f) => !f.endsWith('.map'));
const jsFiles = files.filter((f) => extname(f) === '.js');
const cssFiles = files.filter((f) => extname(f) === '.css');
const htmlFiles = files.filter((f) => extname(f) === '.html');
const fontFiles = files.filter((f) => extname(f) === '.woff2');
const imageFiles = files.filter((f) =>
  ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(extname(f)),
);

// --- JS ---
let jsTotal = 0;
let biggestChunk = { name: '', kb: 0 };
for (const f of jsFiles) {
  const kb = gzipKB(f);
  jsTotal += kb;
  if (kb > biggestChunk.kb) biggestChunk = { name: rel(f), kb };
  if (kb > budgets.js.maxChunkGzipKB) {
    r.error(`JS chunk over budget: ${rel(f)} = ${kb}KB gz > ${budgets.js.maxChunkGzipKB}KB.`);
  }
}
jsTotal = Math.round(jsTotal * 100) / 100;
if (jsTotal > budgets.js.totalGzipKB) {
  r.error(`Total JS over budget: ${jsTotal}KB gz > ${budgets.js.totalGzipKB}KB.`);
}

// --- CSS ---
const cssTotal = Math.round(cssFiles.reduce((s, f) => s + gzipKB(f), 0) * 100) / 100;
if (cssTotal > budgets.css.totalGzipKB) {
  r.error(`Total CSS over budget: ${cssTotal}KB gz > ${budgets.css.totalGzipKB}KB.`);
}

// --- Fonts ---
let fontTotal = 0;
for (const f of fontFiles) {
  const kb = rawKB(f);
  fontTotal += kb;
  if (kb > budgets.fonts.maxFileRawKB) {
    r.error(`Font over budget: ${rel(f)} = ${kb}KB > ${budgets.fonts.maxFileRawKB}KB.`);
  }
}
fontTotal = Math.round(fontTotal * 100) / 100;
if (fontTotal > budgets.fonts.totalRawKB) {
  r.error(`Total fonts over budget: ${fontTotal}KB > ${budgets.fonts.totalRawKB}KB.`);
}

// --- Images ---
for (const f of imageFiles) {
  const kb = rawKB(f);
  if (kb > budgets.images.maxFileRawKB) {
    r.error(`Image over budget: ${rel(f)} = ${kb}KB > ${budgets.images.maxFileRawKB}KB.`);
  }
}

// --- Page transfer weight = gzip(text) + raw(binary) ---
const textWeight = jsTotal + cssTotal + htmlFiles.reduce((s, f) => s + gzipKB(f), 0);
const binaryWeight = fontTotal + imageFiles.reduce((s, f) => s + rawKB(f), 0);
const pageWeight = Math.round((textWeight + binaryWeight) * 100) / 100;
if (pageWeight > budgets.page.transferWeightKB) {
  r.error(
    `Page transfer weight over budget: ${pageWeight}KB > ${budgets.page.transferWeightKB}KB.`,
  );
}

console.log(
  `Perf — JS ${jsTotal}KB gz (max chunk ${biggestChunk.kb}KB: ${biggestChunk.name}) · ` +
    `CSS ${cssTotal}KB gz · fonts ${fontTotal}KB · page ${pageWeight}KB / ${budgets.page.transferWeightKB}KB.`,
);
r.done(`all budgets within limits.`);
