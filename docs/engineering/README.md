# ClinicOS — Engineering Quality Platform

> **Phase 9 · The permanent Quality Assurance System governing every future feature in ClinicOS.**
> This canon turns the eight product laws, the enterprise architecture, and the
> healthcare quality bar into an **automated, enforced, copy-pasteable** system:
> standards → gates → lint rules → validators → budgets → checklists → AI rules.
> It **extends** and never contradicts [Brain.md](../Brain.md) (Phase 1
> constitution), [architecture/README.md](../architecture/README.md) (Phase 2
> anchor), and [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) (living memory).

ClinicOS is a **Clinic Operating System** — healthcare SaaS architected for a
**10+ year horizon at a billion-dollar quality bar**. After this phase,
**everything produced must automatically satisfy enterprise standards**: a change
is not "done" because it works; it is done when it passes every gate below,
updates the Brain, and ships green CI.

---

## 📜 The canon (read in this order)

| #   | Document                                                       | What it gives you                                                                         | Part |
| --- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---- |
| 1   | **[EngineeringStandards.md](./EngineeringStandards.md)**       | The standard for every artifact: architecture → git, with Why/Benefits/Tradeoffs/Examples | 1    |
| 2   | **[QualityGates.md](./QualityGates.md)**                       | The 12 automated PR gates: what each verifies, command, blocking vs advisory              | 2    |
| 3   | **[LintRules.md](./LintRules.md)**                             | Every enterprise lint rule, explained and categorised                                     | 3    |
| 4   | **[ArchitectureValidation.md](./ArchitectureValidation.md)**   | Automated folder/naming/layer/barrel/isolation validation                                 | 4    |
| 5   | **[PerformanceBudgets.md](./PerformanceBudgets.md)**           | JS/CSS/font/image/page budgets + memory/CPU/render targets                                | 5    |
| 6   | **[AccessibilityValidation.md](./AccessibilityValidation.md)** | WCAG 2.2 AA validation: keyboard → RTL, automated + manual                                | 6    |
| 7   | **[LocalizationValidation.md](./LocalizationValidation.md)**   | Missing/unused keys, RTL, ICU, Intl, medical terminology                                  | 7    |
| 8   | **[DocumentationStandards.md](./DocumentationStandards.md)**   | What every feature/module must document (README → Brain update)                           | 8    |
| 9   | **[DefinitionOfDone.md](./DefinitionOfDone.md)**               | The complete, gated Definition of Done — no merge without it                              | 9    |
| 10  | **[ReviewChecklists.md](./ReviewChecklists.md)**               | Per-artifact reviewer checklists (component → docs)                                       | 10   |
| 11  | **[AIQualityRules.md](./AIQualityRules.md)**                   | The binding quality contract for AI agents                                                | 11   |
| —   | **[QualityRegistry.md](./QualityRegistry.md)**                 | The single registry of standards, gates, budgets, owners                                  | 12   |

---

## 🚦 The system in 60 seconds

```
Standard            →  what "good" means          (docs/engineering/*)
Lint rule / script  →  machine enforces it        (eslint.config.js, scripts/quality/*)
Quality gate        →  CI blocks the PR if it fails (.github/workflows/ci.yml)
Checklist / DoD     →  human verifies the rest      (ReviewChecklists, DefinitionOfDone)
Brain update        →  the memory never drifts      (PROJECT_BRAIN registries)
```

**One command runs everything:** `pnpm quality` (or `pnpm quality:quick` to skip
build/test locally). It runs the 12 gates and regenerates
[../reports/engineering-quality-report.md](../reports/engineering-quality-report.md).

---

## 🔧 The gates at a glance

| Gate                 | Command                 | Enforced by                                 |
| -------------------- | ----------------------- | ------------------------------------------- |
| TypeScript (strict)  | `pnpm typecheck`        | `tsc -b`                                    |
| ESLint + boundaries  | `pnpm lint`             | `eslint.config.js`                          |
| Prettier             | `pnpm format:check`     | Prettier                                    |
| Architecture         | `pnpm validate:arch`    | `scripts/quality/validate-architecture.mjs` |
| Duplication          | `pnpm check:duplicates` | `scripts/quality/check-duplicates.mjs`      |
| Design tokens        | `pnpm check:tokens`     | `scripts/quality/check-tokens.mjs`          |
| Localization         | `pnpm check:i18n`       | `scripts/quality/check-i18n.mjs`            |
| Component registry   | `pnpm ds:registry`      | `scripts/ds-registry.mjs`                   |
| Asset hygiene        | `pnpm check:assets`     | `scripts/check-assets.mjs`                  |
| Unit + a11y tests    | `pnpm test`             | Vitest + vitest-axe                         |
| Production build     | `pnpm build`            | `tsc -b && vite build`                      |
| Performance budget   | `pnpm check:perf`       | `scripts/quality/check-perf-budget.mjs`     |
| **All of the above** | **`pnpm quality`**      | `scripts/quality/quality-gate.mjs`          |

Full details for each: [QualityGates.md](./QualityGates.md).

---

## 🏛️ Governance

This platform is the operational companion to the [Project-Checklist.md](../Project-Checklist.md)
(per-PR DoD) and [AI_RULES.md](../architecture/AI_RULES.md) (AI workflow). Standards
only **tighten** over time; loosening a gate or a budget requires an **ADR**
(`docs/adr/NNNN-*.md`). Every change to this canon is recorded in
[PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) (Changelog + Quality Registry).

_Phase 9 · Engineering Quality Platform · Owner: Engineering / Quality · Status: **Foundation v9** · 2026-06-30_
