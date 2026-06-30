#!/usr/bin/env node
/**
 * validate-architecture.mjs — ClinicOS Architecture Validation (Phase 9 · Part 4).
 *
 * A standalone, structural backstop to ESLint `boundaries`. Where ESLint
 * enforces the import GRAPH at the AST level, this gate enforces the physical
 * SHAPE of the repo so violations are caught even outside the TS project:
 *
 *   1. TOP-LEVEL LAYERS  — every directory under src/ is a known layer.
 *   2. BARREL EXPORTS    — every module/entity exposes a public index.ts.
 *   3. FILE/COMPONENT/HOOK NAMING — PascalCase components, useX hooks, etc.
 *   4. DEPENDENCY DIRECTION — shared/ never imports a domain or upper layer.
 *   5. FEATURE ISOLATION — no deep cross-module imports (past index.ts).
 *
 * Authoritative spec: docs/architecture/FolderStructure.md,
 * docs/architecture/DependencyRules.md, docs/architecture/NamingConvention.md.
 * Gate doc: docs/engineering/ArchitectureValidation.md.
 *
 * Usage: `pnpm validate:arch`
 */
import { existsSync, readdirSync } from 'node:fs';
import { reporter, walk, read, rel } from './_lib.mjs';

const SRC = 'src';
const r = reporter('Architecture validation');

// 1) TOP-LEVEL LAYERS — the only directories allowed directly under src/.
//    (Canonical set from FolderStructure.md §1; future layers append here.)
const ALLOWED_TOP_LEVEL = new Set([
  'app',
  'processes',
  'modules',
  'entities',
  'shared',
  'assets',
  'routes',
  'testing',
  'mock',
  'locales',
]);
if (existsSync(SRC)) {
  for (const entry of readdirSync(SRC, { withFileTypes: true })) {
    if (entry.isDirectory() && !ALLOWED_TOP_LEVEL.has(entry.name)) {
      r.error(
        `src/${entry.name}/ is not a known layer. Allowed: ${[...ALLOWED_TOP_LEVEL].join(', ')}. ` +
          `(FolderStructure.md §1)`,
      );
    }
  }
}

// 2) BARREL EXPORTS — every bounded-context module + global entity is entered
//    only through its public index.ts. Missing barrel = no legal import surface.
for (const layer of ['modules', 'entities']) {
  const base = `${SRC}/${layer}`;
  if (!existsSync(base)) continue;
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const hasBarrel =
      existsSync(`${base}/${entry.name}/index.ts`) || existsSync(`${base}/${entry.name}/index.tsx`);
    if (!hasBarrel) {
      r.error(
        `${layer}/${entry.name}/ has no public index.ts barrel — it cannot be imported safely. ` +
          `(DependencyRules: public-API-only)`,
      );
    }
  }
}

// 3) NAMING — file conventions that are unambiguous and machine-checkable.
const tsx = walk(SRC, ['tsx']);
const ts = walk(SRC, ['ts']);
const isTest = (p) => /\.(test|spec|stories)\.[tj]sx?$/.test(p);
const isSpecialName = (base) =>
  ['index.tsx', 'index.ts', 'main.tsx', 'vite-env.d.ts', 'setup.ts'].includes(base) ||
  /\.(d|config|constants|test|spec|stories|machine|types|schema|store|service|repository|mapper|adapter|port|adapter|handlers|seed|fixture)\.[tj]sx?$/.test(
    base,
  );

const PASCAL = /^[A-Z][A-Za-z0-9]+\.tsx$/;
// Convention (NamingConvention.md): hook FILE is kebab `use-x.ts`; symbol is `useX`.
const KEBAB_HOOK = /^use-[a-z0-9-]+\.ts$/;
// Component-bearing directories — only here is a `.tsx` expected to be a component.
const COMPONENT_DIRS = /[\\/](components|pages|layouts|widgets)[\\/]/;

for (const file of tsx) {
  const base = file.split(/[\\/]/).pop();
  if (isTest(file) || isSpecialName(base)) continue;
  // A component in a component dir MUST be PascalCase (VitalsCard.tsx).
  if (COMPONENT_DIRS.test(file.replace(/\\/g, '/')) && !PASCAL.test(base)) {
    r.warn(`Component file should be PascalCase: ${rel(file)} (NamingConvention.md §2)`);
  }
}
for (const file of ts) {
  const base = file.split(/[\\/]/).pop();
  if (!base.startsWith('use') || isTest(file)) continue;
  // Hook files are kebab-case on disk (use-theme.ts), symbol is useTheme.
  if (base.endsWith('.ts') && !KEBAB_HOOK.test(base)) {
    r.warn(`Hook file should be kebab-case use-x.ts: ${rel(file)} (NamingConvention.md §3)`);
  }
}

// 4) DEPENDENCY DIRECTION — shared/ must hold ZERO domain/upper-layer imports.
//    shared is the deepest layer; importing app/processes/modules/entities
//    inverts the dependency rule and is a hard failure.
const FORBIDDEN_IN_SHARED = [
  /from\s+['"]@app(\/|['"])/,
  /from\s+['"]@processes(\/|['"])/,
  /from\s+['"]@modules(\/|['"])/,
  /from\s+['"]@entities(\/|['"])/,
];
for (const file of [...walk(`${SRC}/shared`, ['ts']), ...walk(`${SRC}/shared`, ['tsx'])]) {
  if (isTest(file)) continue;
  const src = read(file);
  for (const re of FORBIDDEN_IN_SHARED) {
    if (re.test(src)) {
      r.error(
        `shared/ must not import a domain/upper layer: ${rel(file)} imports ${re.source}. ` +
          `(DependencyRules: downward-only)`,
      );
    }
  }
}

// entities/ may import only shared (+ other entities) — never modules/app/processes.
for (const file of [...walk(`${SRC}/entities`, ['ts']), ...walk(`${SRC}/entities`, ['tsx'])]) {
  if (isTest(file)) continue;
  const src = read(file);
  for (const re of [
    /from\s+['"]@app(\/|['"])/,
    /from\s+['"]@processes(\/|['"])/,
    /from\s+['"]@modules(\/|['"])/,
  ]) {
    if (re.test(src)) r.error(`entities/ may not import ${re.source}: ${rel(file)}.`);
  }
}

// 5) FEATURE ISOLATION — no deep import past another module's index.ts.
const DEEP_MODULE = /from\s+['"]@modules\/[^'"/]+\/[^'"]+['"]/;
for (const file of [...walk(SRC, ['ts']), ...walk(SRC, ['tsx'])]) {
  if (isTest(file)) continue;
  const src = read(file);
  if (DEEP_MODULE.test(src)) {
    r.error(
      `Deep cross-module import in ${rel(file)} — import a module ONLY via @modules/<module>. ` +
        `(DependencyRules §4 F1/F2)`,
    );
  }
}

const moduleCount = existsSync(`${SRC}/modules`)
  ? readdirSync(`${SRC}/modules`, { withFileTypes: true }).filter((d) => d.isDirectory()).length
  : 0;
r.done(
  `top-level layers, ${moduleCount} module(s), barrels, naming, and dependency direction consistent.`,
);
