# ClinicOS — Code Quality Gates

> **Phase 9 · Part 2.** Every pull request is **automatically verified** by the
> gates below before it can merge. A gate is either **🔴 blocking** (CI fails,
> PR cannot merge) or **🟡 advisory** (prints a warning, does not block). The
> same gates run locally via `pnpm quality` and in CI via
> [.github/workflows/ci.yml](../../.github/workflows/ci.yml), so "green on my
> laptop" equals "green in CI". This extends the per-PR DoD in
> [Project-Checklist.md](../Project-Checklist.md).

> **The one command:** `pnpm quality` runs all 12 gates and regenerates
> [../reports/engineering-quality-report.md](../reports/engineering-quality-report.md).
> `pnpm quality:quick` skips the heavy gates (build, test) for fast pre-commit feedback.

---

## 1. The gate matrix

| #   | Gate                    | Command                       | Blocking | Implemented by                                              |
| --- | ----------------------- | ----------------------------- | -------- | ----------------------------------------------------------- |
| 1   | ESLint                  | `pnpm lint`                   | 🔴       | `eslint.config.js` (`--max-warnings 0`)                     |
| 2   | Prettier                | `pnpm format:check`           | 🔴       | Prettier                                                    |
| 3   | TypeScript              | `pnpm typecheck`              | 🔴       | `tsc -b --noEmit`                                           |
| 4   | Build                   | `pnpm build`                  | 🔴       | `tsc -b && vite build`                                      |
| 5   | Bundle size             | `pnpm check:perf`             | 🔴       | `scripts/quality/check-perf-budget.mjs`                     |
| 6   | Unused imports          | `pnpm lint`                   | 🔴       | `@typescript-eslint/no-unused-vars`                         |
| 7   | Unused files            | `pnpm check:assets`           | 🟡       | `scripts/check-assets.mjs` (assets); see §4                 |
| 8   | Circular dependencies   | `pnpm lint`                   | 🔴       | `import/no-cycle`                                           |
| 9   | Dead code               | `pnpm lint`                   | 🔴       | `no-unreachable`, `no-unused-vars`, TS strict               |
| 10  | Duplicate components    | `pnpm check:duplicates`       | 🔴       | `scripts/quality/check-duplicates.mjs`                      |
| 11  | Duplicate hooks         | `pnpm check:duplicates`       | 🔴       | same                                                        |
| 12  | Duplicate services      | `pnpm check:duplicates`       | 🔴       | same                                                        |
| 13  | Duplicate utilities     | `pnpm check:duplicates`       | 🟡       | same                                                        |
| 14  | Accessibility           | `pnpm test`                   | 🔴       | vitest-axe + jsx-a11y; Storybook addon-a11y                 |
| 15  | Localization            | `pnpm check:i18n`             | 🔴       | `scripts/quality/check-i18n.mjs`                            |
| 16  | Performance budget      | `pnpm check:perf`             | 🔴       | `scripts/quality/check-perf-budget.mjs`                     |
| 17  | Design-token compliance | `pnpm check:tokens`           | 🔴       | `scripts/quality/check-tokens.mjs` + ESLint                 |
| 18  | Component standards     | `pnpm ds:registry`            | 🔴       | `scripts/ds-registry.mjs` (registry ↔ code)                 |
| 19  | Folder standards        | `pnpm validate:arch`          | 🔴       | `scripts/quality/validate-architecture.mjs`                 |
| 20  | Naming standards        | `pnpm validate:arch`          | 🟡       | same (naming advisory; structure blocking)                  |
| 21  | Import standards        | `pnpm lint` + `validate:arch` | 🔴       | `boundaries`, `simple-import-sort`, `no-restricted-imports` |

> The 12 distinct commands collapse to **one**: `pnpm quality`. The rows above
> map each _requirement_ in the Phase-9 brief to the tool that satisfies it.

---

## 2. Each gate in detail

For every gate: **What it verifies · Why · How to run · How to fix.**

### 2.1 ESLint 🔴

- **Verifies.** The full ClinicOS rule set: layer boundaries, import hygiene, React/hooks, jsx-a11y, no-`any`, no-`console`, no hardcoded hex, no inline-style violations, no unused vars, no cycles.
- **Why.** The single machine-checkable enforcement of the engineering laws.
- **Run.** `pnpm lint` (CI runs with `--max-warnings 0` — warnings fail).
- **Fix.** `pnpm lint:fix` for auto-fixable; otherwise resolve the reported rule. Catalog: [LintRules.md](./LintRules.md).

### 2.2 Prettier 🔴

- **Verifies.** Canonical formatting (incl. Tailwind class order).
- **Why.** Zero formatting debates; minimal diffs.
- **Run.** `pnpm format:check`. **Fix.** `pnpm format`.

### 2.3 TypeScript 🔴

- **Verifies.** Strict type-check (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals`).
- **Why.** Types are the cheapest tests; healthcare cannot afford `undefined is not a function`.
- **Run/Fix.** `pnpm typecheck`; resolve the type error (never `// @ts-ignore` without justification).

### 2.4 Build 🔴

- **Verifies.** A clean production build (`tsc -b && vite build`) — no broken imports, no failed transforms.
- **Why.** If it doesn't build, nothing else matters. Also produces `dist/` for the perf gate.
- **Run/Fix.** `pnpm build`; read the Vite/Rollup error.

### 2.5 Bundle size / Performance budget 🔴

- **Verifies.** JS/CSS gzipped + fonts/images raw + total page weight against `scripts/quality/budgets.json`.
- **Why.** A budget that isn't enforced is a wish; clinics run low-end devices.
- **Run.** `pnpm build && pnpm check:perf`. **Fix.** Code-split, lazy-load, trim deps; `pnpm analyze` for the visualizer. See [PerformanceBudgets.md](./PerformanceBudgets.md).

### 2.6 Unused imports / Dead code 🔴

- **Verifies.** No unused imports/vars, no unreachable code.
- **Why.** Dead code misleads readers and bloats bundles.
- **Run/Fix.** `pnpm lint` → `pnpm lint:fix`.

### 2.7 Unused files 🟡

- **Verifies.** Assets not referenced in `src/` (advisory — new artwork is legitimately "unused" until wired). Orphaned **modules** are surfaced by the architecture validator's barrel check; full source-graph dead-file detection is a roadmap item (Knip — see [QualityRegistry.md](./QualityRegistry.md) Future Improvements).
- **Run.** `pnpm check:assets`.

### 2.8 Circular dependencies 🔴

- **Verifies.** No import cycles (`import/no-cycle`).
- **Why.** Cycles break tree-shaking, lazy-loading, and reasoning.
- **Run/Fix.** `pnpm lint`; break the cycle by moving the shared piece down a layer.

### 2.9 Duplicate components / hooks / services / utilities

- **Verifies.** No two same-named units of the same kind in different folders (components/hooks/services 🔴; utilities 🟡).
- **Why.** Duplication is how a codebase rots — two `Button`s that slowly diverge.
- **Run.** `pnpm check:duplicates`. **Fix.** Delete the copy; reuse/compose the shared one (check the [Component Registry](../design-system/ComponentRegistry.md) first).

### 2.10 Accessibility 🔴

- **Verifies.** No axe violations in unit tests (vitest-axe) or Storybook; jsx-a11y lint rules pass.
- **Why.** WCAG 2.2 AA is the floor (Law 3).
- **Run.** `pnpm test`. **Fix.** See [AccessibilityValidation.md](./AccessibilityValidation.md).

### 2.11 Localization 🔴

- **Verifies.** Every `en` key exists in `hi/mr/ur`, no empty translations, valid JSON; advisory: stale/unused keys.
- **Why.** A missing translation is a broken screen for that locale (Law 4).
- **Run.** `pnpm check:i18n`. **Fix.** Add the missing keys. See [LocalizationValidation.md](./LocalizationValidation.md).

### 2.12 Design-token compliance 🔴

- **Verifies.** No hardcoded hex colors or unsanctioned inline `style={{}}` in component code; no raw-px arbitrary values (advisory).
- **Why.** Law 5 — every visual value is a token, so a theme/brand swap is a token re-map.
- **Run.** `pnpm check:tokens` (+ ESLint `no-restricted-syntax`). **Fix.** Replace with a semantic/component token or Tailwind token class.

### 2.13 Component / Folder / Naming / Import standards

- **Component standards** 🔴 — `pnpm ds:registry`: every component folder is registered and exported; the registry is the single source of truth.
- **Folder standards** 🔴 — `pnpm validate:arch`: only known layers, every module/entity has a barrel.
- **Naming standards** 🟡 — `pnpm validate:arch`: PascalCase components, kebab hook files (advisory; surfaced for review).
- **Import standards** 🔴 — `pnpm lint` (`boundaries`, `simple-import-sort`, `no-restricted-imports`) + `validate:arch` (no deep cross-module imports, shared has zero domain imports).

See [ArchitectureValidation.md](./ArchitectureValidation.md).

---

## 3. Blocking vs advisory — the policy

| Severity    | Meaning                             | Examples                                                                                                     |
| ----------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 🔴 Blocking | CI fails; PR cannot merge           | types, lint, format, build, perf, a11y, i18n parity, tokens, duplicates (component/hook/service), boundaries |
| 🟡 Advisory | Printed warning; reviewer judgement | naming, duplicate utilities, unused assets, raw-px, stale i18n keys                                          |

An advisory finding is **not** a free pass — a reviewer must consciously accept it (and note why in the PR). Advisory gates graduate to blocking as the codebase matures; that graduation is recorded in the [Quality Registry](./QualityRegistry.md). **Loosening any blocking gate requires an ADR.**

---

## 4. Local & CI integration

- **Pre-commit** (Husky + lint-staged): ESLint + Prettier + typecheck on staged files — fast feedback before a commit lands.
- **Pre-push / local full run:** `pnpm verify` (typecheck → lint → format → test → arch → duplicates → tokens → i18n → registry → assets) or `pnpm quality` (adds build + perf + report).
- **CI** ([ci.yml](../../.github/workflows/ci.yml)): the `verify` job runs every gate as a required check; the `e2e` job runs Playwright smoke. Both must pass to merge.

```bash
# Fast local loop (no build/test):
pnpm quality:quick
# Full gate + report (what CI enforces):
pnpm quality
```

_Phase 9 · Engineering Quality Platform · Part 2 · Status: **Foundation v9** · 2026-06-30_
_Companion: [LintRules.md](./LintRules.md) · [ArchitectureValidation.md](./ArchitectureValidation.md) · [PerformanceBudgets.md](./PerformanceBudgets.md) · [DefinitionOfDone.md](./DefinitionOfDone.md)_
