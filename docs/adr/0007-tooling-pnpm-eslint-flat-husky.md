# ADR-0007 — Toolchain: pnpm + ESLint flat config (boundaries) + Prettier + Husky/lint-staged + Commitlint + path aliases + Vite build

- **Status:** Accepted
- **Date:** 2026-06-27
- **Phase:** Phase 3 (Engineering Foundation)
- **Deciders:** Frontend Architecture
- **Supersedes:** —
- **Superseded by:** —
- **Related:** [architecture/DeveloperGuide.md](../architecture/DeveloperGuide.md) · [architecture/DependencyRules.md](../architecture/DependencyRules.md) · [architecture/NamingConvention.md](../architecture/NamingConvention.md) · [Brain.md](../Brain.md) · [adr/0001-domain-module-architecture.md](./0001-domain-module-architecture.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)

---

## Context

ADR-0001 organizes the codebase into domain modules with a **strictly downward Dependency Rule** and access only through public `index.ts` surfaces. For that to hold across hundreds of developers over 10+ years, the rules must be **machine-enforced** — a convention nobody can lint is a convention everyone eventually breaks. Phase 3 must therefore choose a concrete, cohesive toolchain that makes the architecture's laws, formatting, commit conventions, and build outputs **automatic** rather than aspirational.

The choices must be reproducible across machines and CI (Windows included), and must fail locally — at commit time — before bad code reaches CI.

## Decision

Adopt one cohesive, enforced toolchain:

- **Package manager — pnpm 9** (`packageManager: pnpm@9.12.0`, Node `>=20`, ESM `"type": "module"`). Content-addressed store + strict, non-flat `node_modules` prevents phantom dependencies; `pnpm-lock.yaml` is committed for reproducibility. `.npmrc`: `strict-peer-dependencies=false`, `auto-install-peers=true`.
- **ESLint 9 flat config** (`eslint.config.js`) composing `@eslint/js` + `typescript-eslint` + `react` + `react-hooks` + `jsx-a11y` + `import` + `simple-import-sort` + **`boundaries`** + `i18next`, with `eslint-config-prettier` last. **`eslint-plugin-boundaries`** defines element types (`app, processes, modules, entities, shared`) and enforces the **downward-only** Dependency Rule in CI — this is the teeth behind ADR-0001. `i18next/no-literal-string` blocks hardcoded UI strings (off in tests/config). `lint --max-warnings 0`: warnings are errors.
- **Prettier** (`.prettierrc.json` + `prettier-plugin-tailwindcss`) owns all formatting; ESLint owns correctness. No overlap, no debate.
- **Husky + lint-staged** — a `pre-commit` hook runs `lint-staged` (ESLint `--fix` + Prettier on staged files only); a `commit-msg` hook runs Commitlint. Hooks use `#!/usr/bin/env sh` for cross-platform (Windows) execution. `lint-staged` config lives in `.lintstagedrc.json`.
- **Commitlint + Conventional Commits** (`@commitlint/config-conventional`) — enforced at commit time, driving readable history and (future) automated versioning/changelogs.
- **tsconfig path aliases** — the **single source of truth** for module resolution (`@/* @app/* @processes/* @modules/* @entities/* @shared/* @assets/* @testing/* @mock/* @locales/*`); Vite reads them via `vite-tsconfig-paths`. No `../../..` across layers; import order enforced by `simple-import-sort`.
- **Vite build** — `manualChunks` vendor split for cache-friendly bundles; `define` injects `APP_VERSION`; the bundle visualizer runs in `analyze` mode emitting `dist/stats.html`; Vitest (jsdom + V8 coverage) for tests.

## Consequences

**Positive**

- The Dependency Rule, a11y, i18n, hooks rules, and import order are **enforced automatically** — architecture stops depending on memory.
- Bad code fails at **commit time**, not in CI minutes later; reviews focus on design, not style.
- Reproducible installs/builds across every machine and CI runner; aliases keep imports stable and refactors cheap.
- One source of truth for paths (tsconfig) consumed by both TS and Vite — no drift.

**Negative / costs**

- The flat-config + boundaries setup is non-trivial to author and maintain (offset by rarely changing once correct).
- Contributors must use pnpm and Conventional Commits — a small onboarding cost, documented in the [DeveloperGuide](../architecture/DeveloperGuide.md).
- Husky adds a `prepare` step; misconfigured local Git hooks need the documented `pnpm prepare` fix.

---

## Decision Contract

| Field                         | Summary                                                                                                                                                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**                       | Architectural laws (ADR-0001) and quality conventions only hold at scale if a machine enforces them locally and in CI; the toolchain must also be reproducible cross-platform.                                                                                                    |
| **Benefits**                  | Lint-enforced boundaries/a11y/i18n/imports; commit-time gates; reproducible pnpm installs; stable path aliases (one source of truth); cache-friendly chunked builds; analyzable bundles.                                                                                          |
| **Trade-offs**                | Flat config + boundaries are complex to author; contributors must adopt pnpm + Conventional Commits; Husky adds a setup step.                                                                                                                                                     |
| **Alternatives considered**   | (a) npm/yarn — phantom deps / slower, weaker guarantees. (b) ESLint legacy `.eslintrc` — deprecated path; flat config is the supported future. (c) Biome — fast but immature plugin/boundaries story for our needs. (d) No commit hooks — defers failures to CI, slower feedback. |
| **Future scalability**        | Flat config composes new rule sets per layer as modules grow; aliases absorb new layers without import churn; manualChunks tunes per module; the same setup extends to Nx/Turborepo or Module Federation later.                                                                   |
| **Enterprise considerations** | Enforced boundaries + Conventional Commits + reproducible builds support CODEOWNERS, audit trails, automated release notes, and the multi-team, long-horizon governance a healthcare SaaS requires.                                                                               |

---

_This ADR is registered in [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) → Architectural Decisions. Changes to this decision require a superseding ADR._
