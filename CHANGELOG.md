# Changelog

All notable changes to the ClinicOS frontend are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/); commits follow
[Conventional Commits](https://www.conventionalcommits.org/). The authoritative,
exhaustive per-phase record lives in
[`docs/brain/PROJECT_BRAIN.md`](docs/brain/PROJECT_BRAIN.md) (Changelog + Completed Phases).

## [Unreleased]

## [0.10.0] — 2026-06-30 — DevOps & Automation Platform

### Added — DevOps & Automation Platform (Phase 10)

- **Git strategy & GitHub architecture** — `.github/`: `CODEOWNERS` (bounded-context
  team topology), `pull_request_template.md` (8-Laws + gates + rollback), three issue
  forms + a chooser (`ISSUE_TEMPLATE/`), a synced label taxonomy (`labels.yml` +
  `labeler.yml`), and a declared `BRANCH_PROTECTION.md` (trunk-based, squash + linear,
  Code-Owner review, required checks).
- **CI/CD** — extended `ci.yml` (now also `validate:docs` + `validate:brain` + a build
  artifact) and **six** new workflows: `codeql.yml` (SAST), `dependency-review.yml`,
  `release-drafter.yml`, `labeler.yml`, `release.yml` (tag → published GitHub Release),
  and a provider-agnostic, approval-gated `deploy.yml` (preview/staging/production +
  health + smoke).
- **Versioning & releases** — SemVer derived from Conventional Commits / PR labels;
  `package.json` adopts manifest-tracked versioning (`0.0.0` → `0.10.0`);
  `release-drafter.yml` + `scripts/release/generate-release-notes.mjs` (`pnpm release:notes`)
  produce grouped notes and infer the next version.
- **Phase-completion pipeline** — `scripts/phase/complete-phase.mjs` (`pnpm phase:complete`):
  one deterministic command that runs the gate, validates the Brain/docs/report,
  generates release notes, and (with `--execute`) commits · tags · pushes.
- **Documentation/Brain validators** — `scripts/quality/validate-docs.mjs` +
  `validate-brain.mjs` (`pnpm validate:docs` / `validate:brain`), wired into `verify`
  and CI: required-doc presence, scoped link integrity, ADR-marker sync, footer/version.
- **Security & dependency mgmt** — `dependabot.yml` (weekly grouped PRs), CodeQL,
  dependency review with a copyleft-license denylist, least-privilege workflow
  permissions, protected `main` + tags.
- **Canon** — `docs/devops/` (14 docs): README, GitStrategy, GitHubArchitecture,
  CICDPipeline, VersionManagement, ReleaseManagement, PhaseCompletionPipeline,
  DocumentationAutomation, Deployment, Monitoring, Security, DeveloperWorkflow,
  AutomationAIRules, DevOpsRegistry. ADR-0014.

## [0.9.0] — 2026-06-30 — Engineering Quality Platform

### Added — Engineering Quality Platform (Phase 9)

- **Quality gates** — five dependency-free Node validators under `scripts/quality/`:
  `validate-architecture.mjs` (layers · barrels · naming · dependency direction · feature isolation),
  `check-duplicates.mjs` (duplicate components/hooks/services/utilities),
  `check-tokens.mjs` (no hardcoded hex / unsanctioned inline styles),
  `check-i18n.mjs` (en→hi/mr/ur key parity, empty/stale/unused keys),
  `check-perf-budget.mjs` (gzipped JS/CSS + raw fonts/images vs `scripts/quality/budgets.json`).
- **Orchestrator** — `quality-gate.mjs` runs all 12 gates and regenerates
  `docs/reports/engineering-quality-report.md`. New scripts: `pnpm quality`, `quality:quick`,
  `validate:arch`, `check:duplicates`, `check:tokens`, `check:i18n`, `check:perf`; extended `verify`.
- **Enterprise lint rules** — `eslint.config.js`: `no-explicit-any`, no-hardcoded-hex (`no-restricted-syntax`,
  theme-engine exempt), `jsx-no-constructed-context-values`, `no-useless-fragment`, `self-closing-comp`,
  `no-console` (logger exempt), `no-debugger`/`no-var`/`prefer-const`. Fixed an inline context-value
  perf bug in `Radio.tsx` (now `useMemo`).
- **Engineering canon** — `docs/engineering/` (13 docs): README, EngineeringStandards, QualityGates,
  LintRules, ArchitectureValidation, PerformanceBudgets, AccessibilityValidation, LocalizationValidation,
  DocumentationStandards, DefinitionOfDone, ReviewChecklists, AIQualityRules, QualityRegistry.
- **CI** — `.github/workflows/ci.yml` extended with the architecture, duplication, token, i18n, and
  performance-budget gates.

### Added — Production readiness

- **CI/CD** — `.github/workflows/ci.yml`: runs the full gate (typecheck · lint · format · test · build · `ds:registry` · `check:assets`) on every push to `main` and every PR, plus a Playwright E2E job.
- **E2E** — `playwright.config.ts` + `e2e/app.e2e.spec.ts`: a smoke suite (app boots, welcome screen renders, theme control switches the appearance live). `pnpm e2e`.
- **Web essentials** — `public/favicon.svg` (brand mark) + `public/manifest.webmanifest` (installable PWA metadata) + `index.html` favicon/manifest/OG tags.
- **Repo hygiene** — `LICENSE` (proprietary) + `CONTRIBUTING.md`.
- **Husky/lint-staged hardening** — hooks resolve `pnpm` via Corepack fallback; lint-staged eslint uses `--no-warn-ignored`. `.claude/` gitignored.

### Added — Design System Architecture

- **Component Registry (code)** — `src/shared/design-system/registry/component-registry.ts`:
  the type-safe, machine-checkable source of truth (24 shipped + 14 planned components,
  categorised) — exported from `@shared/design-system`.
- **`pnpm ds:registry`** — `scripts/ds-registry.mjs` validates the registry against the
  component folders + barrel (component validation + unused/unregistered detection) and
  generates the catalog `docs/design-system/ComponentRegistry.md`.
- **Design System Architecture docs** — `docs/design-system/`: DesignSystem, ArchitectureGuide,
  ComponentStandards, ContributionGuide, StorybookGuide, TestingGuide, MigrationGuide, BestPractices.

## [0.7.0] — 2026-06-30 — Asset Management System

### Added — Asset Management System

- **Asset architecture (two tiers):** bundled **source** assets in `src/assets/**`
  and CDN-ready **served** assets in `public/assets/**`, the latter addressed by a
  stable logical key so their physical location can move to a CDN with zero code edits.
- **Icon Registry** — `src/shared/design-system/icons/registry.ts`: semantic,
  categorised icons (medical / navigation / action / status / alert / analytics /
  accessibility) that decouple the product from lucide and are consumed via the
  `<Icon>` wrapper. Exported from `@shared/design-system`.
- **Asset Registry** — `src/shared/config/assets.ts`: `assetUrl(key)` resolves served
  assets against a configurable base (`VITE_ASSET_BASE_URL` → CDN). Exported from `@shared/config`.
- **SVG pipeline** — `svgo.config.js` + `pnpm optimize:svg` (keeps `viewBox`, drops
  dimensions, preserves illustration colour).
- **Asset hygiene check** — `scripts/check-assets.mjs` + `pnpm check:assets`
  (duplicate-content + unused-asset detection).
- **Asset folder tree** — `brand/`, `icons/`, `illustrations/`, `avatars/`, `images/`,
  `animations/lottie/`, `documents/` under `src/assets/`, plus `public/assets/`,
  `public/favicons/`, `public/social-preview/`, `public/splash/` — each with a defined contract.
- **Docs** — `docs/assets/`: AssetArchitecture, IconGuidelines, SVGStandards,
  IllustrationGuidelines, BrandGuidelines, OptimizationGuide, NamingStandards.
- **Env** — `VITE_ASSET_BASE_URL` (optional CDN base for served assets).

## History

Phases 1–6 — Foundation docs → Enterprise Architecture → Engineering Foundation →
Design Token System → Theme Engine → Component Library (+ a UI-polish pass: real
fonts, live showcase) — are recorded in
[`docs/brain/PROJECT_BRAIN.md`](docs/brain/PROJECT_BRAIN.md).
