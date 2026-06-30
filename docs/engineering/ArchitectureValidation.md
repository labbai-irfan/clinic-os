# ClinicOS — Architecture Validation

> This document specifies the **automated architecture validation system** that keeps the ClinicOS frontend structurally honest. It **extends** the engineering canon — it never contradicts it. Where this document and the canon appear to differ, the canon ([../brain/PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md), [../architecture/DependencyRules.md](../architecture/DependencyRules.md)) wins and this document is wrong. Validation here is mechanical enforcement of the 8 laws and the layer model, not new policy.

Architecture is only "real" if a machine rejects violations. Human review drifts; CI does not. ClinicOS enforces structure through **two complementary mechanisms**: ESLint (fast, editor-time, semantic — `eslint-plugin-boundaries` + `import/no-cycle`) and a structural backstop script ([`scripts/quality/validate-architecture.mjs`](../../scripts/quality/validate-architecture.mjs)) that walks the filesystem and import graph for things ESLint cannot see (missing barrels, naming, folder shape). Both run in [CI](../../.github/workflows/ci.yml) and in the local [quality gate](./QualityGates.md).

---

## 1. Why two enforcers (ESLint + script)

| Concern                                | ESLint (`eslint.config.js`)             | Script (`validate-architecture.mjs`)        |
| -------------------------------------- | --------------------------------------- | ------------------------------------------- |
| Import direction / layer boundaries    | ✅ primary (`boundaries/element-types`) | backstop (re-derives the matrix from paths) |
| Import cycles                          | ✅ primary (`import/no-cycle`)          | backstop                                    |
| Deep cross-module imports              | ✅ primary (`boundaries/no-private`)    | backstop                                    |
| File / folder naming                   | ⚠️ partial                              | ✅ primary (regex over the tree)            |
| Missing `index.ts` barrels             | ❌ cannot                               | ✅ primary                                  |
| Unknown top-level layers under `src/`  | ❌ cannot                               | ✅ primary                                  |
| Component / hook symbol-vs-file naming | ⚠️ partial                              | ✅ primary                                  |

**Why:** ESLint reasons about _modules and imports_; it does not assert that "every module folder must contain an `index.ts`" or "no unexpected directory may appear under `src/`". The script owns those filesystem-shape invariants. **Benefits:** editor-time feedback (ESLint) plus a deterministic, framework-independent gate (script) that survives ESLint config regressions. **Tradeoffs:** two systems to keep in sync — mitigated by both being thin readers of the same documented matrix, and by [QualityRegistry.md](./QualityRegistry.md) recording which check lives where. **Example:** a renamed `routes.tsx` → `Routes.tsx` passes ESLint but fails `pnpm validate:arch`.

> **Forward-ready backstop.** `modules/` and `entities/` are largely empty in Foundation v9. The rules below are **live now** so the first module added is born compliant. The script treats absent layers as "vacuously valid" — it never invents violations, but the moment a folder appears it is held to the full standard.

---

## 2. Commands

```bash
pnpm validate:arch     # runs scripts/quality/validate-architecture.mjs
pnpm lint              # ESLint (boundaries + import/no-cycle + the rest)
pnpm quality:quick     # validate:arch + lint + typecheck (fast pre-commit loop)
pnpm quality           # full gate (also i18n, tokens, duplicates, perf) — see QualityGates.md
```

Every check below is also wired into [`scripts/quality/quality-gate.mjs`](../../scripts/quality/quality-gate.mjs) and [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). A failure is a **hard stop** — the PR cannot merge. See [DefinitionOfDone.md](./DefinitionOfDone.md).

---

## 3. The checks

### 3.1 Folder Structure — only known top-level layers under `src/`

- **What is checked:** the immediate children of `src/` must be drawn from the known set: `app`, `processes`, `modules`, `entities`, `shared` (plus leaf infra files like `main.tsx`, `vite-env.d.ts`, and `locales/`, `styles/` where the canon places them). Any unexpected directory (e.g. `src/utils/`, `src/helpers/`, `src/components/`) is rejected.
- **Enforced by:** `validate-architecture.mjs` (ESLint cannot assert "no other folders").
- **Why:** the layer model ([../architecture/FolderStructure.md](../architecture/FolderStructure.md)) is a closed set. A stray top-level folder is where architecture rot begins — it becomes a junk drawer that escapes the layer matrix. Law 8 (simplicity beats cleverness).
- **❌ Failure example:**

  ```text
  ✖ Unknown top-level layer: src/utils
    Allowed: app, processes, modules, entities, shared
  ```

- **✅ Fix:** move the code to its rightful layer. Generic helpers → `src/shared/lib/`. Domain logic → the owning module's Domain ring. Never create a sibling of the five layers.

### 3.2 File Naming — kebab-case + role suffixes

- **What is checked:** non-component files are `kebab-case`; role files carry their mandated suffix: `routes.tsx`, `*.service.ts`, `*.store.ts`, `*.queries.ts`, `*.repository.ts`, `*.mapper.ts`, `*.schema.ts`, `*.validator.ts`, `*.types.ts`, `*.constants.ts`, `*.adapter.ts`.
- **Enforced by:** `validate-architecture.mjs` (regex per role); ESLint covers a subset.
- **Why:** the filename _is_ the layer signal. A reviewer (and the boundaries plugin) infers the Clean Architecture ring from the suffix. See [../architecture/NamingConvention.md](../architecture/NamingConvention.md).
- **❌ Failure:** `appointmentService.ts` → expected `appointment.service.ts`.
- **✅ Fix:** rename to the suffix form; update the barrel export.

### 3.3 Component Naming — `PascalCase.tsx`

- **What is checked:** files inside `components/`, `pages/`, `layouts/`, `widgets/` are `PascalCase.tsx` and the default/named export matches the filename.
- **Enforced by:** `validate-architecture.mjs` (file ↔ symbol match); ESLint partial.
- **Why:** JSX requires capitalized identifiers; matching file-to-symbol makes imports predictable and grep-able.
- **❌ Failure:** `patient-card.tsx` exporting `PatientCard` → expected `PatientCard.tsx`.
- **✅ Fix:** rename file to `PatientCard.tsx`.

### 3.4 Hook Naming — file `use-x.ts`, symbol `useX`

- **What is checked:** hook files are `use-<kebab>.ts` and export a `use<Pascal>` function (e.g. `use-patient-search.ts` → `usePatientSearch`).
- **Enforced by:** `validate-architecture.mjs`; ESLint `react-hooks/rules-of-hooks` covers usage, not naming.
- **Why:** consistent discovery and lint correctness — the `use` prefix is how the React linter recognizes hooks.
- **❌ Failure:** `usePatientSearch.ts` (camelCase file) or `getPatientSearch` symbol.
- **✅ Fix:** file `use-patient-search.ts`, symbol `usePatientSearch`.

### 3.5 Import Layers — downward-only matrix

- **What is checked:** imports may only point **downward** through the layer stack. The legal matrix:

| From ↓ / May import → | app | processes |      modules      |     entities      | shared |
| --------------------- | :-: | :-------: | :---------------: | :---------------: | :----: |
| **app**               |  –  |    ✅     |        ✅         |        ✅         |   ✅   |
| **processes**         | ❌  |     –     |        ✅         |        ✅         |   ✅   |
| **modules**           | ❌  |    ❌     | ⚠️ via index only |        ✅         |   ✅   |
| **entities**          | ❌  |    ❌     |        ❌         | ⚠️ via index only |   ✅   |
| **shared**            | ❌  |    ❌     |        ❌         |        ❌         |   –    |

- **Enforced by:** ESLint `boundaries/element-types` (**primary, error**); `validate-architecture.mjs` re-derives the matrix from paths as backstop.
- **Why:** Law 6/7 — UI never talks to backend directly and the frontend is backend-independent only if dependencies flow one way. Upward imports create cycles and untestable coupling.
- **❌ Failure:** `shared/ui/Button.tsx` importing from `modules/scheduling` → boundaries error `disallow: shared → modules`.
- **✅ Fix:** invert the dependency — the module consumes the shared component, never the reverse.

### 3.6 Dependency Direction — shared has zero domain imports

- **What is checked:** `shared/` imports **nothing** from `entities`/`modules`/`processes`/`app`; `entities/` imports **only** from `shared/`. Inside a module, the Clean Architecture rings hold: Presentation → Application → Domain ← Infrastructure (Domain depends on nothing inward; Infrastructure depends on Domain types only).
- **Enforced by:** ESLint `boundaries/element-types` + `import/no-cycle` (**error**); script backstop.
- **Why:** keeps `shared` and `entities` reusable and pure. A domain leak into `shared` makes the design system depend on a feature.
- **❌ Failure:** `entities/patient/model.ts` importing `modules/billing` → backstop error `entities may only import shared`.
- **✅ Fix:** relocate the type to the module, or push a genuinely shared primitive down into `shared`.

### 3.7 Barrel Exports — `index.ts` is the only door

- **What is checked:** every `module` and `entity` folder has an `index.ts`; all **cross-layer** access goes through that barrel. Importing an internal path (`modules/scheduling/services/foo.service.ts`) from outside the module is forbidden.
- **Enforced by:** ESLint `boundaries/no-private` / `boundaries/entry-point` (**error**); script verifies the `index.ts` **exists** (ESLint cannot).
- **Why:** the barrel is the module's public API. It lets internals refactor freely without breaking consumers — Law 8.
- **❌ Failure:** `import { mapPatient } from 'modules/patient/infrastructure/patient.mapper'` from another module.
- **✅ Fix:** export the public surface from `modules/patient/index.ts`; import `from 'modules/patient'`. Do not re-export infrastructure internals.

### 3.8 Shared Component Usage — reuse, never duplicate

- **What is checked:** UI is composed from `shared/design-system` primitives; near-duplicate components/utilities are flagged.
- **Enforced by:** [`scripts/quality/check-duplicates.mjs`](../../scripts/quality/check-duplicates.mjs) (`pnpm check:duplicates`) + design-system registry (`pnpm ds:registry`); ESLint boundaries ensure the import is even legal.
- **Why:** a second `Button` fractures tokens, a11y, and i18n. One source of truth keeps WCAG 2.2 AA (Law 3) and token discipline (Law 5) intact.
- **❌ Failure:** a new `modules/intake/components/PrimaryButton.tsx` ~95% similar to `shared/design-system/Button`.
- **✅ Fix:** delete the copy; consume `Button` from the design system. If the variant is genuinely new, add it to the design system and register it.

### 3.9 Feature Isolation — no deep cross-module imports, no cycles

- **What is checked:** module → module access only via the other module's `index.ts`; **no** reach into another module's internals; **no** import cycles anywhere.
- **Enforced by:** ESLint `boundaries/no-private` + `import/no-cycle` (**error**); script backstop.
- **Why:** isolated features can be built, tested, and removed independently. Cycles defeat tree-shaking and make reasoning impossible.
- **❌ Failure:** `modules/billing` importing `modules/scheduling/store/slot.store.ts`; or A→B→A cycle.
- **✅ Fix:** depend on `modules/scheduling` (the barrel), or lift the shared concept into `entities`/`shared`. Break cycles by extracting the shared type downward.

---

## 4. Check → Enforcer → Severity matrix

| Check                               | Enforced by                             | Command            | Severity |
| ----------------------------------- | --------------------------------------- | ------------------ | -------- |
| Folder Structure (known layers)     | `validate-architecture.mjs`             | `validate:arch`    | error    |
| File Naming (suffixes, kebab)       | `validate-architecture.mjs`             | `validate:arch`    | error    |
| Component Naming (`PascalCase.tsx`) | `validate-architecture.mjs`             | `validate:arch`    | error    |
| Hook Naming (`use-x.ts` / `useX`)   | `validate-architecture.mjs`             | `validate:arch`    | error    |
| Import Layers (downward matrix)     | ESLint `boundaries/element-types`       | `lint`             | error    |
| Dependency Direction                | ESLint `boundaries` + `import/no-cycle` | `lint`             | error    |
| Barrel exists                       | `validate-architecture.mjs`             | `validate:arch`    | error    |
| Barrel-only access                  | ESLint `boundaries/no-private`          | `lint`             | error    |
| Shared reuse / duplication          | `check-duplicates.mjs`                  | `check:duplicates` | error    |
| Feature isolation / no cycles       | ESLint `import/no-cycle`                | `lint`             | error    |

> All architecture checks are **error** severity. There are no `warn`-level architecture rules — structure is binary. Style-only `warn` rules live in [LintRules.md](./LintRules.md).

---

## 5. Triage workflow

1. Run `pnpm quality:quick` locally before pushing.
2. **ESLint failure** → fix the import; the message names the illegal edge (`disallow: X → Y`). Consult the matrix in §3.5.
3. **`validate:arch` failure** → it is a _shape_ problem (naming, missing barrel, stray folder). Fix the filesystem.
4. **`check:duplicates` failure** → reuse from `shared/design-system`; delete the copy.
5. Re-run `pnpm quality` to confirm the full gate is green. Record any intentional structural decision as an ADR (see [DocumentationStandards.md](./DocumentationStandards.md)).

See also: [README.md](./README.md) · [EngineeringStandards.md](./EngineeringStandards.md) · [QualityGates.md](./QualityGates.md) · [AIQualityRules.md](./AIQualityRules.md) · [../architecture/AI_RULES.md](../architecture/AI_RULES.md) · [../Project-Checklist.md](../Project-Checklist.md) · [../Frontend-Bible.md](../Frontend-Bible.md).

---

_Phase 9 · Engineering Quality Platform · Part 4 · Status: **Foundation v9** · 2026-06-30_
_Cross-links: [QualityGates.md](./QualityGates.md) · [DependencyRules.md](../architecture/DependencyRules.md) · [FolderStructure.md](../architecture/FolderStructure.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)_
