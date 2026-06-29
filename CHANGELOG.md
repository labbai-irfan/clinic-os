# Changelog

All notable changes to the ClinicOS frontend are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/); commits follow
[Conventional Commits](https://www.conventionalcommits.org/). The authoritative,
exhaustive per-phase record lives in
[`docs/brain/PROJECT_BRAIN.md`](docs/brain/PROJECT_BRAIN.md) (Changelog + Completed Phases).

## [Unreleased]

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
