# ClinicOS — Enterprise Lint Rules

> **Phase 9 · Part 3.** The complete, explained catalog of the ClinicOS lint
> ruleset. The machine-checkable enforcement of the engineering laws lives in
> [eslint.config.js](../../eslint.config.js) (flat config, ESLint 9, type-aware)
> plus the structural scripts under `scripts/quality/`. Lint runs with
> **`--max-warnings 0`** — a warning is a failure. This document explains **what
> each rule does and why**; it extends [Coding-Standards.md](../Coding-Standards.md)
> and [DependencyRules.md](../architecture/DependencyRules.md).

> **How to read.** Rules are grouped by concern. Each row: **Rule → Setting → Why.**
> "(set)" = a recommended preset we inherit; "(custom)" = a ClinicOS-specific rule.

---

## 1. Imports

| Rule                          | Setting            | Why                                                                                                                      |
| ----------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `simple-import-sort/imports`  | error              | Deterministic, grouped import order (side-effects → external → `@app`→…→`@shared` → relative → styles). Zero diff churn. |
| `import/first`                | error              | Imports before any other statement — readability.                                                                        |
| `import/newline-after-import` | error              | Visual separation of imports from code.                                                                                  |
| `import/no-duplicates`        | error              | One import statement per module — no accidental double-imports.                                                          |
| `import/no-self-import`       | error              | A file importing itself is always a bug.                                                                                 |
| `import/no-cycle`             | error (maxDepth 1) | Cycles break tree-shaking, lazy-loading, and reasoning.                                                                  |
| `no-restricted-imports`       | error (custom)     | Blocks deep cross-module imports (`@modules/x/y`), `../../../` climbs, and **DTO/api/repository/mapper imports in UI**.  |

**Example.** ✅ `import { usePatient } from '@entities/patient'`. ❌ `import { mapPatient } from '@modules/patients/mappers/patient.mapper'` (deep + DTO layer in UI).

---

## 2. Exports

| Rule                         | Setting        | Why                                                                                            |
| ---------------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| `simple-import-sort/exports` | error          | Sorted, predictable barrel exports.                                                            |
| `boundaries/entry-point`     | error (custom) | A module/entity is importable **only** via its `index.ts`. The public surface is the contract. |

**Why.** The barrel is the only legal cross-layer surface; everything else is private. **Example.** ✅ `export * from './components/Button'` in `design-system/index.ts`. ❌ importing `design-system/components/button/Button` directly from a module.

---

## 3. Naming

| Rule                                   | Setting                                                                 | Why                                             |
| -------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| Component file `PascalCase.tsx`        | advisory (`validate:arch`)                                              | Components are recognisable at a glance.        |
| Hook file `use-x.ts`, symbol `useX`    | advisory (`validate:arch`)                                              | Consistent with NamingConvention.md.            |
| No `I`-prefix on interfaces; no `enum` | convention ([NamingConvention.md](../architecture/NamingConvention.md)) | Modern TS idiom; `as const` unions over `enum`. |

Naming is enforced **structurally** by `scripts/quality/validate-architecture.mjs` (advisory) rather than via the noisy `@typescript-eslint/naming-convention` rule, to avoid false positives on the established codebase. It graduates to blocking once modules exist (see [QualityRegistry.md](./QualityRegistry.md)).

---

## 4. React

| Rule                                      | Setting        | Why                                                                               |
| ----------------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| `react/*` recommended                     | set            | Core React correctness.                                                           |
| `react/jsx-no-constructed-context-values` | error (custom) | A new context value object each render defeats memoization — a real perf footgun. |
| `react/jsx-no-useless-fragment`           | error (custom) | Fragments around a single child are noise.                                        |
| `react/self-closing-comp`                 | error (custom) | `<X />` over `<X></X>` — consistency, smaller diffs.                              |
| `react/react-in-jsx-scope`                | off            | New JSX transform — no React import needed.                                       |
| `react/prop-types`                        | off            | TypeScript replaces prop-types.                                                   |

---

## 5. Hooks

| Rule                          | Setting    | Why                                                                       |
| ----------------------------- | ---------- | ------------------------------------------------------------------------- |
| `react-hooks/rules-of-hooks`  | error      | Hooks must be called unconditionally, top-level — the #1 React bug class. |
| `react-hooks/exhaustive-deps` | warn→error | Stale closures cause subtle, dangerous bugs in clinical data.             |

**Example.** ✅ `useEffect(() => sub(), [sub])`. ❌ a hook called inside an `if`.

---

## 6. Performance

| Rule                                      | Setting             | Why                                                |
| ----------------------------------------- | ------------------- | -------------------------------------------------- |
| `react/jsx-no-constructed-context-values` | error               | (see §4) prevents context-driven re-render storms. |
| `import/no-cycle`                         | error               | Cycles defeat code-splitting and lazy chunks.      |
| Bundle/perf budget                        | gate (`check:perf`) | Static budgets catch what lint cannot (size).      |

Render-time performance (memo, virtualization) is a **standard** ([PerformanceBudgets.md](./PerformanceBudgets.md)), verified by review + budgets rather than lint, because "should this be memoized?" needs measurement, not a blanket rule.

---

## 7. Accessibility

| Rule                          | Setting | Why                                                                                           |
| ----------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `jsx-a11y/*` recommended      | set     | Alt text, label association, valid ARIA, no positive tabindex, etc.                           |
| jsx-a11y `components` mapping | custom  | Maps custom controls (`Checkbox`, `Switch`, `Input`…) to native elements so a11y rules apply. |

Runtime a11y (contrast, focus order, SR) is verified by **vitest-axe + manual audit** ([AccessibilityValidation.md](./AccessibilityValidation.md)) — lint catches the static subset.

---

## 8. TypeScript

| Rule                                       | Setting        | Why                                                                                                         |
| ------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `typescript-eslint` recommendedTypeChecked | set            | Type-aware linting (no floating promises, no unsafe member access, etc.).                                   |
| `@typescript-eslint/no-explicit-any`       | error (custom) | **No `any`.** It deletes the type contract — unacceptable in healthcare.                                    |
| `@typescript-eslint/no-unused-vars`        | error          | Dead variables/imports.                                                                                     |
| strict tsconfig flags                      | compiler       | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals`. |

**Example.** ✅ `function parse(x: unknown): Patient { … }`. ❌ `function parse(x: any)`.

---

## 9. Files

| Rule / check                  | Setting                     | Why                                                |
| ----------------------------- | --------------------------- | -------------------------------------------------- |
| One responsibility per file   | review + `check:duplicates` | Small, testable units; no `helpers.ts` grab-bag.   |
| Kebab-case slug + role suffix | `validate:arch`             | Filename declares layer + role.                    |
| Barrel-only public surface    | `boundaries/entry-point`    | Files are private unless exported from `index.ts`. |

---

## 10. Folders

| Rule / check                       | Setting                  | Why                                 |
| ---------------------------------- | ------------------------ | ----------------------------------- |
| Known top-level layers only        | `validate:arch` (error)  | No rogue `src/` directories.        |
| Module template segments           | `validate:arch` + review | Every module is shaped identically. |
| Every module/entity has `index.ts` | `validate:arch` (error)  | No module without a public surface. |

---

## 11. Architecture & Dependency Layers

| Rule                         | Setting | Why                                                                                                       |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `boundaries/element-types`   | error   | The downward-only import matrix: `app → processes → modules → entities → shared`. No upward, no sideways. |
| `boundaries/entry-point`     | error   | Public-API-only access.                                                                                   |
| `no-restricted-imports` (UI) | error   | UI (pages/components) must not import `api/`, `repositories/`, `mappers/`, or DTOs.                       |
| `validate:arch` direction    | error   | `shared/` imports zero domain; `entities` import only `shared`/entities.                                  |

This is the heart of the architecture's enforcement — see [DependencyRules.md](../architecture/DependencyRules.md) and [ArchitectureValidation.md](./ArchitectureValidation.md).

---

## 12. Component Composition

| Rule / check               | Setting                                 | Why                                                         |
| -------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| Reuse before create        | `check:duplicates` + Component Registry | No duplicate components/hooks/services.                     |
| CVA for variants           | standard                                | No conditional class-soup; variants are declarative.        |
| `forwardRef` on primitives | standard                                | Composability + a11y (ref forwarding for focus management). |

---

## 13. The four hard "NO" rules

These are the Phase-9 brief's non-negotiables, each enforced:

| "No …"                   | Enforced by                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **No `any`**             | `@typescript-eslint/no-explicit-any` (error) + strict tsconfig.                                                                                 |
| **No inline styles**     | `scripts/quality/check-tokens.mjs` (error; bootstrap-surface allowlist) — style via tokens + CVA.                                               |
| **No hardcoded colors**  | ESLint `no-restricted-syntax` (hex literal) + `check:tokens` (error); exempt only `shared/theme` (color math) + `shared/styles` (token source). |
| **No hardcoded strings** | ESLint `i18next/no-literal-string` (markup + `alt`/`aria-label`/`title`/`placeholder`/`label`) + `check:i18n` parity.                           |
| **No duplicated logic**  | `scripts/quality/check-duplicates.mjs` (components/hooks/services error; utilities advisory).                                                   |

---

## 14. Sanctioned exemptions (and why)

Strict rules need narrow, **documented** escape hatches so they stay credible:

| Exemption                                                  | Rule relaxed                        | Why                                                                                  |
| ---------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| `src/shared/theme/**`                                      | no-hex `no-restricted-syntax`       | The Theme Engine _is_ color math (ramps, contrast, JS token mirror).                 |
| `src/shared/styles/**`                                     | token compliance                    | The CSS token **source** (primitive tier).                                           |
| `src/shared/logger/**`                                     | `no-console`                        | The logger port/adapter is the one sanctioned `console` boundary.                    |
| `ErrorFallback.tsx`, `router.tsx`, `I18nProvider.tsx`      | inline-style (`check:tokens`)       | Pre-paint / error-boundary surfaces that must render before the token/i18n pipeline. |
| `*.test.*`, `*.spec.*`, `*.stories.*`, `testing/`, `mock/` | i18n, unsafe-assignment, boundaries | Fixtures/tests legitimately use literals and reach across layers.                    |

Any new exemption must be added in `eslint.config.js`/the script **with a comment explaining why**, and noted in the [Quality Registry](./QualityRegistry.md).

_Phase 9 · Engineering Quality Platform · Part 3 · Status: **Foundation v9** · 2026-06-30_
_Source of truth: [eslint.config.js](../../eslint.config.js) · Companion: [QualityGates.md](./QualityGates.md) · [ArchitectureValidation.md](./ArchitectureValidation.md)_
