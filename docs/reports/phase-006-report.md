# Phase Report — Asset Management System

> **Phase:** Asset Management System (the user's "Phase 6 — Asset System"; sequential **Phase 7** in `PROJECT_BRAIN.md`).
> **Date:** 2026-06-30 · **Status:** ✅ Complete · **Foundation:** v7

This phase builds the permanent, governed **visual foundation** — the _system_ that
manages assets (architecture, registries, pipelines, standards). Per the brief, it
creates NO business modules, pages, or components — only the asset ecosystem.

---

## 1. Completed tasks

- ✅ **Asset architecture** — a two-tier model: bundled **source** assets (`src/assets/**`) and CDN-ready **served** assets (`public/assets/**`) addressed by a stable registry key.
- ✅ **Asset folder tree** — `brand/`, `icons/`, `illustrations/`, `avatars/`, `images/`, `animations/lottie/`, `documents/` (33 source dirs) + `public/assets/`, `public/favicons/`, `public/social-preview/`, `public/splash/`; every leaf kept under VCS with `.gitkeep`.
- ✅ **Icon Registry** (code) — semantic, categorised icons decoupling the app from lucide.
- ✅ **Asset Registry** (code) — `assetUrl(key)` with a configurable CDN base (`VITE_ASSET_BASE_URL`).
- ✅ **SVG optimization pipeline** — `svgo.config.js` + `pnpm optimize:svg`.
- ✅ **Asset hygiene check** — `scripts/check-assets.mjs` + `pnpm check:assets` (duplicate + unused detection).
- ✅ **Documentation** — `docs/assets/` (7 guides + index).
- ✅ **Brain + Changelog + this report** updated/created.

## 2. Files created

| Area              | Files                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Icon Registry     | `src/shared/design-system/icons/registry.ts`, `icons/index.ts`                                                                                   |
| Asset Registry    | `src/shared/config/assets.ts`                                                                                                                    |
| Pipeline / checks | `svgo.config.js`, `scripts/check-assets.mjs`                                                                                                     |
| Asset tree        | `src/assets/**` (+ `README.md`, `.gitkeep`), `public/{assets,favicons,social-preview,splash}/**`                                                 |
| Docs              | `docs/assets/{README,AssetArchitecture,IconGuidelines,SVGStandards,IllustrationGuidelines,BrandGuidelines,NamingStandards,OptimizationGuide}.md` |
| Project           | `CHANGELOG.md`, `docs/reports/phase-006-report.md`                                                                                               |

## 3. Files modified

- `src/shared/design-system/index.ts` — export the Icon Registry (`export * from './icons'`).
- `src/shared/config/index.ts` — export the Asset Registry (`assetUrl`, `ASSETS`, `AssetKey`).
- `src/shared/config/env.ts` + `src/vite-env.d.ts` + `.env.example` — `VITE_ASSET_BASE_URL`.
- `package.json` — `svgo` devDep + `optimize:svg` / `check:assets` scripts.
- `eslint.config.js` — ignore `scripts/**` (Node tooling, not in the TS project).
- `docs/brain/PROJECT_BRAIN.md` — Completed Phase, ADR-0011, Asset Registry note, changelog, footer.

## 4. Architecture decisions

- **ADR-0011 — Asset Management System.** Two-tier assets (bundled source vs CDN-served-by-key); an **Icon Registry** as the single semantic icon source (vendor-independent — swap lucide → custom pack by editing one file); served assets addressed by a stable key via `assetUrl()` so location (local → CDN → per-tenant bucket) changes with zero code edits (white-label/CDN ready); SVGO pipeline + duplicate/unused hygiene checks.
- **Domain assets by filename, not folder** — domain-specific illustrations use a domain-prefixed filename inside the type folder (`illustrations/empty-states/empty-appointments.svg`) rather than per-domain folders — avoids folder explosion and keeps one naming rule.
- **No `src/assets/fonts/`** — fonts are delivered via the `@fontsource-variable/*` packages (recorded as a deliberate divergence from the original `FolderStructure.md` §6 sketch).

## 5. Brain updates

`PROJECT_BRAIN.md`: **Phase 7 — Asset Management System** added to Completed Phases; **ADR-0011** logged; §32 Asset Registry annotated with the implemented registries; Changelog entry; footer → **Foundation v7**.

## 6. Verification (Part 13 checks)

| Check                                                                                             | Result                                   |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Type Check (`tsc -b`)                                                                             | ✅ pass                                  |
| ESLint (incl. **import validation** + **circular-dependency** via `import/no-cycle` + boundaries) | ✅ pass                                  |
| Prettier (`format:check`)                                                                         | ✅ pass                                  |
| Tests (Vitest)                                                                                    | ✅ 41 pass                               |
| Build (`vite build`)                                                                              | ✅ pass                                  |
| Unused-asset / Duplicate-asset (`check:assets`)                                                   | ✅ clean (0 assets — folders scaffolded) |

## 7. Known issues

- **`pnpm optimize:svg`** exits non-zero when there are **no SVGs** yet (SVGO errors on an empty set). It is a manual authoring tool (not part of `verify`) and works once SVG sources exist.
- **Binary artwork is intentionally not produced** (logos, illustrations, fonts are out of scope — this phase builds the _system_). Folders are scaffolded and registry keys are reserved so artwork drops in with zero code change.
- Pre-existing `@storybook/test` peer-version warning (non-blocking).

## 8. Next phase requirements

- Produce the actual brand artwork (logos, favicons, social-preview, illustrations) against `docs/assets/` standards; run `pnpm optimize:svg` + `pnpm check:assets`.
- Wire `EmptyState` / `ErrorState` components to illustration assets via the Asset Registry; have the App Shell consume `icons.navigation.*`.
- Generate the favicon/PWA manifest set into `public/`.
