#!/usr/bin/env node
/**
 * check-tokens.mjs — ClinicOS Design-Token Compliance (Phase 9 · Part 3 / Part 5).
 *
 * Law 5: "Every color/size/space is a token. No hardcoded visual values. Ever."
 * This gate enforces that in code the linter's `no-restricted-syntax` cannot
 * fully see (raw CSS, template literals, dynamic styles):
 *
 *   1. NO RAW HEX COLORS in component code (.ts/.tsx).                   (ERROR)
 *   2. NO INLINE style={{…}} outside the allowlisted bootstrap surfaces. (ERROR)
 *   3. NO RAW px in component className/style literals (use spacing
 *      tokens / Tailwind token scale).                                   (WARN)
 *
 * SANCTIONED EXCEPTIONS (these legitimately handle raw values):
 *   - src/shared/styles/**   — the CSS token SOURCE (primitive tier).
 *   - src/shared/theme/**    — the Theme Engine (color math, ramp generation,
 *                              the JS token mirror) is where raw hex lives by design.
 *   - *.test.* / *.spec.* / *.stories.* — fixtures may use literals.
 *   - The pre-paint / error-boundary bootstrap files (see ALLOWLIST) that must
 *     render before the token pipeline / i18n is available.
 *
 * Gate doc: docs/engineering/PerformanceBudgets.md + Frontend-Bible tokens.
 * Usage: `pnpm check:tokens`
 */
import { reporter, walk, read, rel } from './_lib.mjs';

const r = reporter('Design-token compliance');

// Directories where raw color/size values are the sanctioned source of truth.
const ALLOWED_DIRS = ['src/shared/styles/', 'src/shared/theme/'];
// Bootstrap surfaces that must paint WITHOUT the token/i18n pipeline (last-resort
// inline styles are intentional here — documented in each file).
const INLINE_STYLE_ALLOWLIST = [
  'src/shared/errors/ErrorFallback.tsx',
  'src/app/router/router.tsx',
  'src/app/providers/I18nProvider.tsx',
];

const isExempt = (relPath) =>
  ALLOWED_DIRS.some((d) => relPath.startsWith(d)) ||
  /\.(test|spec|stories)\.[tj]sx?$/.test(relPath) ||
  relPath.endsWith('.d.ts');

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const INLINE_STYLE = /style=\{\{/;

const files = [...walk('src', ['ts']), ...walk('src', ['tsx'])];
let scanned = 0;

for (const file of files) {
  const relPath = rel(file);
  if (isExempt(relPath)) continue;
  scanned++;
  const src = read(file);
  const lines = src.split('\n');

  lines.forEach((line, i) => {
    const ln = i + 1;
    // strip line comments to avoid flagging documentation of hex values
    const code = line.replace(/\/\/.*$/, '');

    if (HEX.test(code)) {
      r.error(
        `Hardcoded hex color in ${relPath}:${ln} — use a semantic/component token ` +
          `(var(--color-*) / Tailwind token class). (Law 5)`,
      );
    }
    if (INLINE_STYLE.test(code) && !INLINE_STYLE_ALLOWLIST.includes(relPath)) {
      r.error(
        `Inline style={{…}} in ${relPath}:${ln} — style via tokens + Tailwind classes (CVA). ` +
          `If this is a pre-paint bootstrap surface, add it to the documented allowlist. (Law 5)`,
      );
    }
    // raw px inside JSX className / arbitrary Tailwind values like [12px]
    if (/\[\d{1,4}px\]/.test(code)) {
      r.warn(`Raw px arbitrary value in ${relPath}:${ln} — prefer a spacing/size token.`);
    }
  });
}

r.done(`${scanned} component file(s) scanned — no hardcoded colors / unsanctioned inline styles.`);
