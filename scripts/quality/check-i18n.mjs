#!/usr/bin/env node
/**
 * check-i18n.mjs — ClinicOS Localization Validation (Phase 9 · Part 7).
 *
 * Locale catalogs live in src/locales/<lang>/<namespace>.json for the four
 * active languages (en, hi, mr, ur). English is the SOURCE OF TRUTH; every key
 * present in en must exist in every other language. This gate verifies:
 *
 *   1. NAMESPACE PARITY — every en namespace file exists in hi/mr/ur.  (ERROR)
 *   2. KEY PARITY (missing keys) — every leaf key in en exists in each
 *      language; a missing translation is a release blocker.            (ERROR)
 *   3. EXTRA KEYS — keys present in a translation but not in en (stale). (WARN)
 *   4. UNUSED KEYS — en keys never referenced as a string in src/.       (WARN)
 *   5. EMPTY VALUES — a key whose value is "" in any language.           (ERROR)
 *
 * Hardcoded-string detection is enforced separately and authoritatively by
 * ESLint `i18next/no-literal-string` (eslint.config.js §7); this gate owns key
 * COMPLETENESS, which ESLint cannot see. Gate doc:
 * docs/engineering/LocalizationValidation.md.
 *
 * Usage: `pnpm check:i18n`
 */
import { existsSync, readdirSync } from 'node:fs';
import { reporter, walk, read } from './_lib.mjs';

const LOCALES_DIR = 'src/locales';
const BASE = 'en';
const LANGS = ['en', 'hi', 'mr', 'ur'];
const r = reporter('Localization validation');

if (!existsSync(`${LOCALES_DIR}/${BASE}`)) {
  console.log('✓ Localization validation: no locale catalogs yet (nothing to check).');
  process.exit(0);
}

/** Flatten a nested message object to dotted leaf keys → value. */
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function loadNs(lang, ns) {
  const file = `${LOCALES_DIR}/${lang}/${ns}`;
  try {
    return flatten(JSON.parse(read(file)));
  } catch {
    return null;
  }
}

const baseNamespaces = readdirSync(`${LOCALES_DIR}/${BASE}`).filter((f) => f.endsWith('.json'));
const allBaseKeys = new Set();
let checkedKeys = 0;

for (const ns of baseNamespaces) {
  const baseKeys = loadNs(BASE, ns);
  if (!baseKeys) {
    r.error(`en/${ns} is not valid JSON.`);
    continue;
  }
  Object.keys(baseKeys).forEach((k) => allBaseKeys.add(`${ns}:${k}`));

  // empty values in base
  for (const [k, v] of Object.entries(baseKeys)) {
    if (v === '' || v == null) r.error(`Empty value in en/${ns} → "${k}".`);
  }

  for (const lang of LANGS.filter((l) => l !== BASE)) {
    // 1) namespace parity
    if (!existsSync(`${LOCALES_DIR}/${lang}/${ns}`)) {
      r.error(`Missing namespace: ${lang}/${ns} (exists in en).`);
      continue;
    }
    const langKeys = loadNs(lang, ns);
    if (!langKeys) {
      r.error(`${lang}/${ns} is not valid JSON.`);
      continue;
    }
    // 2) missing keys
    for (const key of Object.keys(baseKeys)) {
      checkedKeys++;
      if (!(key in langKeys)) r.error(`Missing key: ${lang}/${ns} → "${key}".`);
      else if (langKeys[key] === '' || langKeys[key] == null)
        r.error(`Empty translation: ${lang}/${ns} → "${key}".`);
    }
    // 3) extra/stale keys
    for (const key of Object.keys(langKeys)) {
      if (!(key in baseKeys)) r.warn(`Stale key (not in en): ${lang}/${ns} → "${key}".`);
    }
  }
}

// 4) unused keys — leaf key never referenced anywhere in src/ source.
const srcText = [...walk('src', ['ts']), ...walk('src', ['tsx'])]
  .filter((f) => !/\/locales\//.test(f.replace(/\\/g, '/')))
  .map(read)
  .join('\n');
for (const nsKey of allBaseKeys) {
  const [, dotted] = nsKey.split(':');
  const leaf = dotted.split('.').pop();
  // Heuristic: the dotted key OR its leaf must appear in source.
  if (!srcText.includes(dotted) && !srcText.includes(leaf)) {
    r.warn(`Possibly-unused i18n key: ${nsKey} (not referenced in src/).`);
  }
}

r.done(
  `${LANGS.length} languages · ${baseNamespaces.length} namespace(s) · ` +
    `${allBaseKeys.size} keys · ${checkedKeys} translation checks consistent.`,
);
