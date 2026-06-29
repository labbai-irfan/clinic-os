# ClinicOS — Asset Management System

> The official, governed visual foundation for ClinicOS. **Nothing goes into assets ad-hoc** — every asset has a home, a name, an optimization rule, and (where served) a stable registry key.

This canon documents the asset _system_ (architecture, registries, pipelines, standards). The binary artwork itself (logos, illustrations, fonts) is produced against these rules.

## The two tiers

| Tier                   | Where                         | Addressed by                                          | Use for                                                                              |
| ---------------------- | ----------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Source** (bundled)   | `src/assets/**`               | `import x from '@assets/...'` (Vite hashes + bundles) | Icons, small inline SVGs                                                             |
| **Served** (CDN-ready) | `public/assets/**` (or a CDN) | **Asset Registry** → `assetUrl(key)`                  | Logos, illustrations, avatars — white-label / CDN-swappable with **zero code edits** |

## Code (the system)

- **Icon Registry** — [`src/shared/design-system/icons/registry.ts`](../../src/shared/design-system/icons/registry.ts): semantic, categorised icons (`icons.medical.consultation`) decoupling the app from lucide. Consume via the `<Icon>` wrapper.
- **Asset Registry** — [`src/shared/config/assets.ts`](../../src/shared/config/assets.ts): `assetUrl(key)` resolves served assets against a configurable base (`VITE_ASSET_BASE_URL` → CDN).
- **SVG pipeline** — [`svgo.config.js`](../../svgo.config.js) (`pnpm optimize:svg`).
- **Hygiene check** — [`scripts/check-assets.mjs`](../../scripts/check-assets.mjs) (`pnpm check:assets`: duplicate + unused detection).

## The docs

| Document                                                 | Covers                                                                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [AssetCatalog.md](./AssetCatalog.md)                     | **The named inventory** — every image/SVG/Lottie/document, one-line description + `Now/Next/Future` priority (the build-to contract) |
| [AssetArchitecture.md](./AssetArchitecture.md)           | Why asset architecture; the complete folder structure + every folder's 6-field contract                                              |
| [IconGuidelines.md](./IconGuidelines.md)                 | Icon Registry, categories, the `<Icon>` wrapper, theme-aware + medical icons, custom packs                                           |
| [SVGStandards.md](./SVGStandards.md)                     | SVG-first strategy, optimization pipeline, sizing/color/stroke, a11y                                                                 |
| [IllustrationGuidelines.md](./IllustrationGuidelines.md) | Illustration system (empty/error/loading/…) + avatar system                                                                          |
| [BrandGuidelines.md](./BrandGuidelines.md)               | Logos, themed/mono variants, PDF/invoice/prescription branding, white-label                                                          |
| [OptimizationGuide.md](./OptimizationGuide.md)           | Compression, responsive images, lazy loading, formats, CDN, performance budgets                                                      |
| [NamingStandards.md](./NamingStandards.md)               | Asset file + registry-key naming standards                                                                                           |

## Always-on rules

- **Accessibility** — icons/illustrations are decorative (`aria-hidden`) unless meaningful (alt/`aria-label`, never color-only); high-contrast + reduced-motion safe.
- **Localization** — universal medical symbols; never bake localizable text into artwork; mirror directional art for RTL, never medical symbols/logos.
- **Performance** — optimize every SVG; lazy-load large artwork; respect the performance budget.

_Related canon: [design-system/](../design-system/README.md) (tokens/components) · [theme-engine/](../theme-engine/README.md) (white-label) · [architecture/FolderStructure.md](../architecture/FolderStructure.md)._
