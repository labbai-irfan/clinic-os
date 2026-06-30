# ClinicOS — Quality Registry

> **Phase 9 · Part 12.** The single, living registry of the ClinicOS quality
> system: every **standard**, **gate**, **lint rule group**, **performance
> budget**, **accessibility rule**, and **localization rule**, with its
> enforcement, severity, and owner. This is the quality-system mirror of the
> registries in [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md); when a gate,
> budget, or standard changes, **update this file in the same PR**. It is
> referenced by [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) §"Quality Registry".

---

## 1. Standards registry

| Standard                  | Doc                                                      | Primary enforcement                   |
| ------------------------- | -------------------------------------------------------- | ------------------------------------- |
| Architecture              | [EngineeringStandards §1](./EngineeringStandards.md)     | `boundaries`, `validate:arch`         |
| Folder/File/Naming        | [EngineeringStandards §2–3](./EngineeringStandards.md)   | `validate:arch`                       |
| Components/Hooks          | [EngineeringStandards §4–5](./EngineeringStandards.md)   | `ds:registry`, `check:duplicates`     |
| Services/Repos/API        | [EngineeringStandards §6–8](./EngineeringStandards.md)   | `boundaries`, review                  |
| Pages/Layouts/Providers   | [EngineeringStandards §9–11](./EngineeringStandards.md)  | review                                |
| Utilities/Constants/Types | [EngineeringStandards §12–14](./EngineeringStandards.md) | `no-explicit-any`, `check:duplicates` |
| Validation                | [EngineeringStandards §15](./EngineeringStandards.md)    | Zod + review                          |
| Localization              | [LocalizationValidation](./LocalizationValidation.md)    | `i18next`, `check:i18n`               |
| Accessibility             | [AccessibilityValidation](./AccessibilityValidation.md)  | `jsx-a11y`, vitest-axe                |
| Performance               | [PerformanceBudgets](./PerformanceBudgets.md)            | `check:perf`                          |
| Documentation             | [DocumentationStandards](./DocumentationStandards.md)    | review, ADR                           |
| Testing                   | [EngineeringStandards §20](./EngineeringStandards.md)    | `test`, `e2e`, coverage               |
| Git Workflow              | [EngineeringStandards §21](./EngineeringStandards.md)    | commitlint, Husky, CI                 |

---

## 2. Gate registry

| Gate               | Script / tool                               | Command                 | Severity       | Owner         |
| ------------------ | ------------------------------------------- | ----------------------- | -------------- | ------------- |
| TypeScript         | `tsc -b`                                    | `pnpm typecheck`        | 🔴             | Engineering   |
| ESLint             | `eslint.config.js`                          | `pnpm lint`             | 🔴             | Engineering   |
| Prettier           | Prettier                                    | `pnpm format:check`     | 🔴             | Engineering   |
| Architecture       | `scripts/quality/validate-architecture.mjs` | `pnpm validate:arch`    | 🔴 (naming 🟡) | Architecture  |
| Duplication        | `scripts/quality/check-duplicates.mjs`      | `pnpm check:duplicates` | 🔴 (utils 🟡)  | Architecture  |
| Design tokens      | `scripts/quality/check-tokens.mjs` + ESLint | `pnpm check:tokens`     | 🔴             | Design System |
| Localization       | `scripts/quality/check-i18n.mjs`            | `pnpm check:i18n`       | 🔴             | Localization  |
| Component registry | `scripts/ds-registry.mjs`                   | `pnpm ds:registry`      | 🔴             | Design System |
| Asset hygiene      | `scripts/check-assets.mjs`                  | `pnpm check:assets`     | 🟡             | Design System |
| Tests + a11y       | Vitest + vitest-axe                         | `pnpm test`             | 🔴             | Engineering   |
| Build              | `tsc -b && vite build`                      | `pnpm build`            | 🔴             | Engineering   |
| Performance budget | `scripts/quality/check-perf-budget.mjs`     | `pnpm check:perf`       | 🔴             | Performance   |
| **Orchestrator**   | `scripts/quality/quality-gate.mjs`          | `pnpm quality`          | 🔴             | Engineering   |

---

## 3. Performance budget registry

Source of truth: [scripts/quality/budgets.json](../../scripts/quality/budgets.json). Text = gzipped; binary = raw; source maps excluded.

| Budget                   | Limit  | Current (2026-06-30) | Headroom |
| ------------------------ | ------ | -------------------- | -------- |
| JS total (gz)            | 300 KB | ~234 KB              | ~22%     |
| JS max single chunk (gz) | 170 KB | ~128 KB              | ~25%     |
| CSS total (gz)           | 24 KB  | ~11 KB               | ~54%     |
| Fonts total (raw)        | 360 KB | ~269 KB              | ~25%     |
| Font max file (raw)      | 110 KB | ~85 KB               | ~23%     |
| Image max file (raw)     | 250 KB | —                    | —        |
| Page transfer weight     | 640 KB | ~516 KB              | ~19%     |

**Core Web Vitals targets** (low-end device): LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1. Budgets only **tighten**; loosening requires an ADR. Full rationale: [PerformanceBudgets.md](./PerformanceBudgets.md).

---

## 4. Accessibility rule registry (WCAG 2.2 AA floor)

| Rule                         | Criterion      | Enforcement                  |
| ---------------------------- | -------------- | ---------------------------- |
| Keyboard operable, no traps  | 2.1.1 / 2.1.2  | jsx-a11y + manual            |
| Focus visible / not obscured | 2.4.7 / 2.4.11 | token focus ring + manual    |
| Name/Role/Value, live status | 4.1.2 / 4.1.3  | jsx-a11y + vitest-axe        |
| Contrast (text/UI)           | 1.4.3 / 1.4.11 | token palette + audit        |
| Target size ≥ 44/24px        | 2.5.5 / 2.5.8  | design system + review       |
| Never color alone            | 1.4.1          | review (icon+text+shape)     |
| Reduced motion               | 2.3.3          | `prefers-reduced-motion`     |
| RTL / language               | 3.1.1–3.1.2    | logical props + `check:i18n` |

Full operational guide: [AccessibilityValidation.md](./AccessibilityValidation.md). Criterion source: [Project-Checklist.md §5](../Project-Checklist.md).

---

## 5. Localization rule registry

| Rule                           | Enforcement                       |
| ------------------------------ | --------------------------------- |
| Key parity across en/hi/mr/ur  | `check:i18n` (🔴)                 |
| No hardcoded strings           | `i18next/no-literal-string` (🔴)  |
| No empty translations          | `check:i18n` (🔴)                 |
| Stale/unused keys              | `check:i18n` (🟡)                 |
| ICU plurals/gender             | review                            |
| RTL logical properties         | review + `check:tokens` adjacency |
| Intl dates/numbers/currency    | review                            |
| Medical terminology SME review | review (🔴 for clinical strings)  |

Full guide: [LocalizationValidation.md](./LocalizationValidation.md). Criterion source: [Project-Checklist.md §6](../Project-Checklist.md).

---

## 6. Developer checklist & Definition of Done

- **Per-PR DoD:** [DefinitionOfDone.md §2](./DefinitionOfDone.md) (copy into every PR).
- **Reviewer checklists:** [ReviewChecklists.md](./ReviewChecklists.md) (per artifact).
- **AI contract:** [AIQualityRules.md](./AIQualityRules.md).
- **60-second blocker gate:** [Project-Checklist.md §9](../Project-Checklist.md).

---

## 7. Sanctioned exemptions registry

| Path                                                  | Relaxes                  | Reason                                          |
| ----------------------------------------------------- | ------------------------ | ----------------------------------------------- |
| `src/shared/theme/**`                                 | no-hex                   | Color math / ramp generation / JS token mirror  |
| `src/shared/styles/**`                                | token compliance         | The CSS token source (primitive tier)           |
| `src/shared/logger/**`                                | `no-console`             | The sanctioned console boundary                 |
| `ErrorFallback.tsx`, `router.tsx`, `I18nProvider.tsx` | inline-style             | Pre-paint / error-boundary bootstrap surfaces   |
| tests / specs / stories / `testing/` / `mock/`        | i18n, unsafe, boundaries | Fixtures legitimately use literals/reach across |

Adding an exemption requires a code comment explaining why **and** a row here.

---

## 8. Future improvements (roadmap)

These deepen the platform without re-architecting it:

- **Dead-file detection** — add `knip` to flag unused files/exports across the full source graph (today: assets only + module barrels).
- **Bundle-size diff in PRs** — `size-limit` or a CI comment showing the gzip delta per chunk vs base.
- **Auto-generated registries** — derive Component/Route/API registry rows from code (codegen) so they cannot drift.
- **Token-contrast CI report** — compute AA contrast for every semantic token pair and fail on regressions.
- **i18n coverage report** — per-language completeness % published as a CI artifact.
- **Storybook ↔ Component Registry sync check** — every shipped component has a story.
- **Visual-regression + interaction tests** — `@storybook/test` play functions + Chromatic-style snapshots.
- **`naming-convention` graduation** — turn the advisory naming checks blocking once modules exist.
- **Mutation testing** — Stryker on services/mappers to verify test quality, not just coverage.
- **PHI lint** — a custom rule flagging known PHI field names in logger/analytics/URL call sites.

Each item, when adopted, is recorded in [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) Changelog + this registry.

_Phase 9 · Engineering Quality Platform · Part 12 · Status: **Foundation v9** · 2026-06-30_
_Mirror of the quality system in [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) · Companion: [QualityGates.md](./QualityGates.md) · [README.md](./README.md)_
