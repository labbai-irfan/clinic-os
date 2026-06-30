#!/usr/bin/env node
/**
 * check-duplicates.mjs — ClinicOS Duplication Gate (Phase 9 · Part 2).
 *
 * "NEVER duplicate an existing component or util" (AI_RULES §5). Duplication is
 * how a 10-year codebase rots: two `Button`s, two `formatDate`s, two patient
 * mappers that slowly diverge. This gate detects same-named units of the same
 * KIND living in different folders:
 *
 *   - COMPONENTS  — PascalCase `*.tsx` (excl. index/stories/tests).   (ERROR)
 *   - HOOKS       — `use*.ts`.                                         (ERROR)
 *   - SERVICES    — `*.service.ts`.                                    (ERROR)
 *   - UTILITIES   — files under any `utils/` or `helpers/` folder.     (WARN)
 *
 * Rationale for ERROR vs WARN: a duplicated component/hook/service is almost
 * always an accident or a missed reuse-search. Utilities occasionally share a
 * generic name legitimately (a module-local helper), so those are surfaced as a
 * warning to review, not an automatic block.
 *
 * Gate doc: docs/engineering/QualityGates.md. Usage: `pnpm check:duplicates`
 */
import { reporter, walk, rel } from './_lib.mjs';

const r = reporter('Duplication gate');

const tsx = walk('src', ['tsx']);
const ts = walk('src', ['ts']);
const isTest = (p) => /\.(test|spec|stories)\.[tj]sx?$/.test(p);

/** Group repo-relative paths by a derived identity key. */
function groupBy(files, keyOf) {
  const map = new Map();
  for (const f of files) {
    if (isTest(f)) continue;
    const key = keyOf(f);
    if (!key) continue;
    (map.get(key) ?? map.set(key, []).get(key)).push(rel(f));
  }
  return map;
}

const base = (f) => f.split(/[\\/]/).pop();

// Components: PascalCase Foo.tsx (exclude index.tsx).
const components = groupBy(tsx, (f) => {
  const b = base(f);
  return /^[A-Z][A-Za-z0-9]+\.tsx$/.test(b) ? b.replace(/\.tsx$/, '') : null;
});
// Hooks: useFoo.ts
const hooks = groupBy(ts, (f) => {
  const b = base(f);
  return /^use[A-Z][A-Za-z0-9]*\.ts$/.test(b) ? b.replace(/\.ts$/, '') : null;
});
// Services: foo.service.ts
const services = groupBy(ts, (f) => {
  const b = base(f);
  return /\.service\.ts$/.test(b) ? b : null;
});
// Utilities: files inside a utils/ or helpers/ folder.
const utilFiles = [...ts, ...tsx].filter((f) =>
  /[\\/](utils|helpers)[\\/]/.test(f.replace(/\\/g, '/')),
);
const utils = groupBy(utilFiles, (f) => base(f).replace(/\.(ts|tsx)$/, ''));

const reportDup = (label, map, severity) => {
  for (const [key, paths] of map) {
    if (paths.length > 1) {
      const msg = `Duplicate ${label} "${key}" in ${paths.length} places: ${paths.join(', ')}. Reuse/compose the shared one.`;
      severity === 'error' ? r.error(msg) : r.warn(msg);
    }
  }
};

reportDup('component', components, 'error');
reportDup('hook', hooks, 'error');
reportDup('service', services, 'error');
reportDup('utility', utils, 'warn');

r.done(
  `${components.size} component(s), ${hooks.size} hook(s), ${services.size} service(s), ` +
    `${utils.size} utility name(s) — no forbidden duplicates.`,
);
