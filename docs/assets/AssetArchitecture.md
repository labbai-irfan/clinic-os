# ClinicOS — Asset Architecture

> **Design-Infrastructure canon · Part of the ClinicOS Frontend Engineering Bible.**
> This document is the **authoritative description of the ClinicOS asset system as it is actually built** — the two-tier folder layout, the CDN-ready **Asset Registry**, brand management, and the optimization/hygiene pipeline.
>
> It **extends, and never contradicts,** the architecture canon:
> [architecture/FolderStructure.md §2 (`src/assets`) + §6 (`assets/*`)](../architecture/FolderStructure.md) · [Naming-Convention.md §3–§4](../Naming-Convention.md).
> Where FolderStructure.md §6 sketched the original four-folder asset idea (`fonts/ icons/ images/ animations/`), **this document supersedes it with the richer structure that was actually engineered** — and explains every decision behind that evolution.
>
> **Sibling asset docs:** [NamingStandards.md](./NamingStandards.md) (file-naming rules) · [README.md](./README.md) (index).
> **The code this governs:** Asset Registry → [`src/shared/config/assets.ts`](../../src/shared/config/assets.ts) · SVG pipeline → [`svgo.config.js`](../../svgo.config.js) · hygiene gate → [`scripts/check-assets.mjs`](../../scripts/check-assets.mjs) · source overview → [`src/assets/README.md`](../../src/assets/README.md).

---

## Table of contents

**Part 1 — Why an asset architecture (Decision Contracts)**

1. [The problem: assets are infrastructure, not decoration](#1-the-problem-assets-are-infrastructure-not-decoration)
2. [Decision: a two-tier asset model (source vs served)](#2-decision-a-two-tier-asset-model-source-vs-served)
3. [Decision: the Asset Registry + `assetUrl(key)` indirection (CDN-ready)](#3-decision-the-asset-registry--asseturlkey-indirection-cdn-ready)
4. [Decision: brand management as first-class assets](#4-decision-brand-management-as-first-class-assets)
5. [Decision: performance — optimization & hygiene as a pipeline](#5-decision-performance--optimization--hygiene-as-a-pipeline)
6. [Decision: domain assets use prefixed FILENAMES, not per-domain folders](#6-decision-domain-assets-use-prefixed-filenames-not-per-domain-folders)

**Part 2 — The complete folder structure (every folder that exists)**

7. [The authoritative asset tree](#7-the-authoritative-asset-tree)
8. [Tier 1 — `src/assets/**` (bundled source) per-folder contracts](#8-tier-1--srcassets-bundled-source-per-folder-contracts)
9. [Tier 2 — `public/**` (CDN-served) per-folder contracts](#9-tier-2--public-cdn-served-per-folder-contracts)
10. [Where fonts live (and why not in `src/assets/`)](#10-where-fonts-live-and-why-not-in-srcassets)
11. [Cross-references](#11-cross-references)

---

# Part 1 — Why an asset architecture

Each decision below carries the standard **Decision Contract**: **Why · Benefits · Trade-offs · Alternatives · Future · Enterprise**. This is the same contract shape used throughout the ClinicOS canon, so any decision can be audited the same way ten years from now.

---

## 1. The problem: assets are infrastructure, not decoration

In a clinic product that must run for **10+ years without a rewrite**, the static artwork — the logo on every prescription PDF, the empty-state when a patient has no appointments, the offline illustration shown to a receptionist on a flaky connection — is not cosmetic. It is **infrastructure**, and it fails in expensive ways when left unmanaged:

- **Brand drift** — five subtly different logo files appear across the app; a rebrand becomes an archaeology dig.
- **White-labelling pain** — a clinic chain wants its own logo and palette, but the logo is `import`-ed and hashed into the JS bundle, so it cannot be swapped without a redeploy.
- **Performance rot** — un-optimized SVGs ship editor cruft; raster images bloat the bundle; duplicate files multiply silently.
- **Localization leaks** — text baked into a PNG cannot be translated to Hindi, Marathi, or Urdu (RTL).
- **"Where does this go?" entropy** — without a contract, every asset lands wherever the author happened to drop it.

The ClinicOS asset architecture answers all five with **structure + indirection + a pipeline**. The rest of Part 1 is the reasoning; Part 2 is the map.

---

## 2. Decision: a two-tier asset model (source vs served)

ClinicOS splits every static asset into one of **two tiers**, by a single question: _does the physical location of this file ever need to change without a code edit?_

| Tier                | Lives in              | Reaches code via                                                          | Build behavior                                              | Use it for                                                                                                             |
| ------------------- | --------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Tier 1 · SOURCE** | `src/assets/**`       | `import url from '@assets/...'`                                           | Hashed + bundled by Vite (cache-busted, fingerprinted)      | Small, code-coupled artwork: icon sources, inline SVGs, build-time imagery                                             |
| **Tier 2 · SERVED** | `public/**` (→ a CDN) | a **stable logical key** through the **Asset Registry** (`assetUrl(key)`) | Copied verbatim to the served root; URL resolved at runtime | Large / white-labellable / swappable artwork: logos, illustrations, avatars, favicons, social previews, splash screens |

> **Decision Contract — two-tier asset model**
>
> - **Why** — Bundled imports and runtime-served files have opposite requirements. A bundled asset _wants_ to be hashed and tree-shaken; a brand logo _wants_ a stable URL that can point at a per-tenant CDN bucket tomorrow. Forcing both through one mechanism breaks one of them.
> - **Benefits** — (1) Bundled source assets get content-hashing and dead-asset elimination for free. (2) Served assets get a **stable, swappable URL** with zero re-import. (3) The boundary is mechanical: "is it addressed by a registry key?" decides the tier with no judgement call.
> - **Trade-offs** — Two homes to learn instead of one; a contributor must know which tier a new asset belongs to (mitigated by [§6](#6-decision-domain-assets-use-prefixed-filenames-not-per-domain-folders) and the naming rules in [NamingStandards.md](./NamingStandards.md)).
> - **Alternatives considered** — (a) _Everything bundled_ → kills white-labelling and CDN offload; a rebrand needs a redeploy. (b) _Everything in `public/`_ → loses hashing/cache-busting and import-time safety for code-coupled assets. (c) _A third-party DAM from day one_ → over-engineered for the foundation; the registry indirection ([§3](#3-decision-the-asset-registry--asseturlkey-indirection-cdn-ready)) keeps that door open without paying for it now.
> - **Future** — Tier 2 can move file-by-file to a CDN or per-tenant bucket with no code change; Tier 1 can be split into an asset package if needed.
> - **Enterprise** — Matches how large products separate _application assets_ from _brand/marketing assets_; supports multi-tenant white-labelling, CDN economics, and independent brand-asset release cadence.

---

## 3. Decision: the Asset Registry + `assetUrl(key)` indirection (CDN-ready)

Tier 2 assets are **never** referenced by a hardcoded path. They are referenced by a **logical key** registered in the **Asset Registry** ([`src/shared/config/assets.ts`](../../src/shared/config/assets.ts)), and resolved through a single function:

```ts
// src/shared/config/assets.ts  (the ACTUAL registry, abbreviated)
export const ASSETS = {
  'brand.logo': 'brand/clinicos-logo.svg',
  'brand.logoMark': 'brand/clinicos-mark.svg',
  'brand.logoLight': 'brand/clinicos-logo-light.svg',
  'brand.logoDark': 'brand/clinicos-logo-dark.svg',
  'brand.logoMono': 'brand/clinicos-mono.svg',
  'illustration.emptyGeneric': 'illustrations/empty-generic.svg',
  'illustration.errorGeneric': 'illustrations/error-generic.svg',
  'illustration.offline': 'illustrations/offline.svg',
  'illustration.maintenance': 'illustrations/maintenance.svg',
  'illustration.welcome': 'illustrations/welcome.svg',
  'avatar.doctor': 'avatars/avatar-doctor.svg',
  'avatar.patient': 'avatars/avatar-patient.svg',
  'avatar.organization': 'avatars/avatar-organization.svg',
} as const;

export type AssetKey = keyof typeof ASSETS;

export function assetUrl(key: AssetKey): string {
  return `${ASSET_BASE}/assets/${ASSETS[key]}`;
}
```

`ASSET_BASE` resolves to a **CDN origin when `VITE_ASSET_BASE_URL` is set** (e.g. `https://cdn.clinicos.app`), otherwise the app's base path (`import.meta.env.BASE_URL`, default `/`). `assetUrl(key)` is the **only** place a served-asset URL is constructed.

```tsx
// ✅ consume by key — physical location is the registry's concern, not the component's
<img src={assetUrl('illustration.offline')} alt={t('common.offline.illustrationAlt')} />

// ❌ never hardcode a served path in a component
<img src="/assets/illustrations/offline.svg" />
```

> **Decision Contract — Asset Registry + `assetUrl(key)`**
>
> - **Why** — A served asset's _identity_ ("the offline illustration") is stable forever; its _location_ ("which bucket / which CDN / which tenant override") is not. Indirection separates the two so the unstable thing can change without touching the hundreds of call sites that depend on the stable thing.
> - **Benefits** — (1) **CDN-ready**: flip one env var (`VITE_ASSET_BASE_URL`) and every served asset moves to the CDN — zero code edits. (2) **Type-safe**: `AssetKey` is a union of registered keys; a typo or missing asset is a **compile-time error**, not a 404 in production. (3) **One source of truth**: every served URL flows through one function, so audits, per-tenant overrides, and cache-busting hook in at exactly one place. (4) **White-label seam**: a per-tenant base/manifest can be injected without changing consumers.
> - **Trade-offs** — Every served asset must be registered before use (one extra line); the registry is a small file that grows. This friction is intentional — it is the gate that keeps Tier 2 catalogued.
> - **Alternatives considered** — (a) _Raw string paths_ → no type safety, no swap point, paths duplicated across files. (b) _Vite `import` for everything_ → re-bundles brand assets, defeating CDN offload and white-labelling. (c) _A runtime config service from day one_ → premature; the registry is the contract a config service would later implement.
> - **Future** — The registry can be backed by a per-tenant manifest, a remote config service, or a DAM, all behind the same `assetUrl(key)` signature. Responsive/`srcset` variants and theme-aware resolution can be added to the resolver without changing call sites.
> - **Enterprise** — This is the standard "logical asset id → physical URL" indirection used by large multi-tenant SaaS; it underpins white-labelling, CDN/edge delivery, and brand-asset versioning.

---

## 4. Decision: brand management as first-class assets

The ClinicOS brand is not one logo — it is a **family**: a full lockup, a compact mark, light/dark variants for surfaces of either polarity, a monochrome version for print and single-colour contexts, and watermarks for documents. The built structure gives each a home (`src/assets/brand/{logos,monochrome,themed,watermarks}`) and the served, swappable copies live under `public/assets/brand/` behind the registry's `brand.*` keys.

> **Decision Contract — brand as a first-class, multi-variant asset family**
>
> - **Why** — A single logo file cannot serve a dark sidebar, a printed prescription, a favicon, and a co-branded tenant header. Brand correctness across themes, print, and tenants requires _named variants_, not ad-hoc one-offs.
> - **Benefits** — (1) Theme-correct rendering (`brand.logoLight` / `brand.logoDark`) without CSS hacks. (2) Print/mono path (`brand.logoMono`) keeps documents crisp and ink-cheap. (3) A rebrand is a **swap of registered files**, not a code hunt. (4) White-labelling overrides the `brand.*` keys per tenant in one place.
> - **Trade-offs** — More files to author and keep visually in sync; mitigated by strict naming ([NamingStandards.md §brand](./NamingStandards.md)) and the duplicate check in [`check-assets.mjs`](../../scripts/check-assets.mjs).
> - **Alternatives considered** — (a) _One logo, recoloured via CSS `filter`_ → fragile, blurry, breaks on multi-colour marks. (b) _Per-theme `import`s in components_ → bundles brand into JS, blocking tenant swap.
> - **Future** — Per-tenant brand packs, seasonal variants, and an animated logo all slot in as new registered files/keys with no consumer changes.
> - **Enterprise** — Mirrors brand-system practice (logo lockups + clearspace + mono + reversed); ready for a brand-asset governance workflow and tenant theming.

---

## 5. Decision: performance — optimization & hygiene as a pipeline

Two scripts make asset performance and cleanliness **mechanical and CI-enforceable**, not a matter of reviewer diligence:

| Tool                                                                             | Command                                       | What it does                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SVGO** ([`svgo.config.js`](../../svgo.config.js))                              | `pnpm optimize:svg` (`svgo -f src/assets -r`) | Strips editor cruft + metadata; **keeps `viewBox`** (the `<Icon>` wrapper / CSS controls size via `removeDimensions`); **keeps ids** (`cleanupIds:false` — preserves `<use>`, gradients, masks, `<title>`/`<desc>` a11y); does **not** force-strip colours (would break multi-colour illustrations). |
| **Asset hygiene** ([`scripts/check-assets.mjs`](../../scripts/check-assets.mjs)) | `pnpm check:assets`                           | (1) **Duplicates** by content hash → **ERROR** (exit 1). (2) **Unused** assets (basename/stem not referenced in `src/**`) → **WARNING** (exit 0). Scans `src/assets`, `public/assets`, `public/favicons`, `public/social-preview`, `public/splash`.                                                  |

> **Decision Contract — optimization & hygiene pipeline**
>
> - **Why** — Performance and tidiness decay silently. A reviewer cannot eyeball whether an SVG carries 4 KB of Illustrator metadata or whether two illustrations are byte-identical. Tools can.
> - **Benefits** — (1) Smaller, theme-aware SVGs (`currentColor` icons re-theme for free; `viewBox` kept so sizing stays in CSS/tokens). (2) Duplicate assets are a **hard failure** — no silent brand drift. (3) Unused assets surface as warnings so newly-added artwork is allowed but dead art is visible. (4) Both run in CI with **no dependencies** beyond the toolchain.
> - **Trade-offs** — `currentColor` for monochrome icons is enforced at authoring/review time (SVGO deliberately does **not** mangle colours, to protect illustrations); the "unused" check is heuristic (basename/stem match) and can yield false positives for dynamically-built names — hence WARNING, not ERROR.
> - **Alternatives considered** — (a) _Manual review only_ → unenforceable at scale. (b) _Aggressive SVGO defaults_ → would drop `viewBox`/ids and recolour illustrations, breaking sizing and art. The config is tuned precisely to avoid that.
> - **Future** — Add raster compression (sharp/squoosh), per-format budgets, and a CI size gate; extend `check-assets` to validate registry keys resolve to existing files.
> - **Enterprise** — Asset CI is table-stakes for a product shipping artwork across themes, locales, print, and tenants; keeps bundle and CDN costs bounded over a decade.

---

## 6. Decision: domain assets use prefixed FILENAMES, not per-domain folders

ClinicOS has many domains — `patients`, `appointments`, `pharmacy`, `billing`, `queue`, `consultation`, … — and each will eventually want its own empty-state and error artwork. The decision is explicit:

> **Domain-specific artwork is a domain-prefixed FILENAME inside the asset-TYPE folder — never a per-domain sub-folder.**

```text
✅  illustrations/empty-states/empty-appointments.svg
✅  illustrations/empty-states/empty-patients.svg
✅  illustrations/empty-states/empty-prescriptions.svg
✅  illustrations/error-states/error-billing.svg

❌  illustrations/appointments/empty.svg          # per-domain folder explosion
❌  illustrations/patients/empty-state.svg
❌  illustrations/billing/error.svg
```

> **Decision Contract — domain-prefixed filename, not per-domain folder**
>
> - **Why** — Folders organise by **what the asset _is_** (an empty-state illustration), not by **which domain happens to use it**. A patient empty-state and an appointment empty-state are the _same kind of thing_ and belong together.
> - **Benefits** — (1) **No folder explosion** — adding the 14th domain does not add 14 near-empty folders across every illustration type. (2) **One naming rule** governs everything (`empty-<context>`, `error-<context>` — see [NamingStandards.md](./NamingStandards.md)), so a file's purpose is legible from its name alone. (3) **Discoverability** — all empty-states sit in one folder, making reuse and visual consistency obvious. (4) **Mechanical placement** — type decides the folder, domain decides the filename suffix; no judgement call.
> - **Trade-offs** — A very large single domain's assets are not visually grouped in the file tree (they share the type folder with all domains); the filename prefix is what groups them. This is the intended trade — names group, folders don't proliferate.
> - **Alternatives considered** — (a) _Per-domain folders under each type_ (`illustrations/<domain>/<type>.svg`) → folder count = domains × types; rebrand and audit become painful. (b) _Per-domain folders at the top_ (`assets/<domain>/...`) → duplicates the type taxonomy inside every domain and contradicts the type-first tree.
> - **Future** — A domain can grow dozens of contexts (`empty-appointments`, `empty-appointments-today`, …) with no structural change; per-tenant overrides slot in by filename/registry key.
> - **Enterprise** — Type-first foldering with descriptive filenames is the scalable pattern for large asset libraries; it keeps the tree shallow and the naming rule singular across hundreds of files.

---

# Part 2 — The complete folder structure

This part documents **every folder that exists today** under `src/assets/**` and `public/**` (each currently scaffolded with a `.gitkeep`). Each folder carries the **6-field contract**:

> **Purpose · Responsibilities · Allowed file types · Naming rules · Optimization rules · Future scalability**

Naming rules below are summaries; the full, authoritative file-naming standard is [NamingStandards.md](./NamingStandards.md).

---

## 7. The authoritative asset tree

```text
src/assets/                         # TIER 1 — bundled source (imported, hashed by Vite)
├── README.md                       #   source-asset overview (links here)
├── brand/                          #   brand mark family — SVG sources
│   ├── logos/                      #     full logo lockups (clinicos-logo*)
│   ├── monochrome/                 #     single-colour marks (clinicos-mono*)
│   ├── themed/                     #     light/dark surface variants
│   └── watermarks/                 #     faint document/background marks
├── icons/                          #   custom SVG icon SOURCES (not in lucide)
│   ├── action/                     #     verbs (dispense, check-in, …)
│   ├── brand/                      #     brand/product glyphs
│   ├── medical/                    #     clinical glyphs (vitals, rx, …)
│   ├── navigation/                 #     nav/wayfinding glyphs
│   └── status/                     #     state glyphs (success, offline, …)
├── illustrations/                  #   multi-colour spot art (type-foldered)
│   ├── authentication/             #     sign-in / sign-up art
│   ├── empty-states/               #     empty-<context>.svg
│   ├── error-states/               #     error-<context>.svg
│   ├── loading/                    #     loading/skeleton art
│   ├── maintenance/                #     maintenance / scheduled-downtime
│   ├── medical/                    #     clinical scene art
│   ├── offline/                    #     offline / connectivity art
│   ├── onboarding/                 #     first-run / tour art
│   └── success/                    #     confirmation / celebratory art
├── avatars/                        #   default avatar art
│   ├── patterns/                   #     generated-avatar background patterns
│   └── placeholders/               #     default doctor/patient/org avatars
├── images/                         #   raster/SVG non-illustration imagery
│   ├── backgrounds/                #     page/section backgrounds
│   └── patterns/                   #     repeatable texture/pattern tiles
├── animations/                     #   motion sources
│   └── lottie/                     #     Lottie/JSON (reduced-motion gated)
└── documents/                      #   print/PDF branding sources
    ├── pdf/                        #     PDF header/footer branding
    └── print/                      #     print-stylesheet branding art

public/                             # TIER 2 — served verbatim (CDN-swappable via registry)
├── assets/                         #   registry-addressed served assets (<base>/assets/<path>)
│   ├── brand/                      #     served logo family (brand.* keys)
│   └── illustrations/              #     served illustrations (illustration.* keys)
├── favicons/                       #   favicon set + manifest icons
├── social-preview/                 #   Open Graph / Twitter card images
└── splash/                         #   PWA / launch splash screens
```

> **Fonts note:** there is intentionally **no `src/assets/fonts/`**. ClinicOS self-hosts fonts via the `@fontsource-variable/*` packages (Plus Jakarta Sans + Inter) — see [§10](#10-where-fonts-live-and-why-not-in-srcassets). This is the one place the built structure deliberately diverges from FolderStructure.md §6's original sketch.

---

## 8. Tier 1 — `src/assets/**` (bundled source) per-folder contracts

All Tier-1 folders inherit the `src/assets` law ([FolderStructure.md §2](../architecture/FolderStructure.md)): **static only, no logic, imported-by code but importing nothing.** Run `pnpm optimize:svg` over any new SVG and `pnpm check:assets` before committing.

### `src/assets/brand/`

The ClinicOS brand mark family (SVG sources). The served, swappable copies live in `public/assets/brand/` behind `brand.*` registry keys.

| Field                  | Contract                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**            | Source-of-truth SVGs for the ClinicOS logo family and document watermarks.                                                                                          |
| **Responsibilities**   | Hold the full lockup, mark, monochrome, themed, and watermark variants as editable optimized SVG.                                                                   |
| **Allowed file types** | `.svg` (vector only — brand must stay crisp at any size and print).                                                                                                 |
| **Naming rules**       | `clinicos-logo`, `clinicos-mark`, `clinicos-mono`, `clinicos-logo-light`, `clinicos-logo-dark` (kebab-case). See [NamingStandards.md §brand](./NamingStandards.md). |
| **Optimization rules** | SVGO via `pnpm optimize:svg`; keep `viewBox`; **do not** strip colours; no localizable text baked in.                                                               |
| **Future scalability** | Per-tenant brand packs, seasonal/animated variants; served copies swap via `brand.*` keys with zero code edits.                                                     |

- **`brand/logos/`** — full logo lockups (wordmark + symbol). `.svg`. `clinicos-logo[-<theme>].svg`.
- **`brand/monochrome/`** — single-colour marks for print/single-ink contexts. `.svg`. `clinicos-mono[-<variant>].svg`.
- **`brand/themed/`** — light/dark surface-polarity variants. `.svg`. `clinicos-logo-light.svg`, `clinicos-logo-dark.svg`.
- **`brand/watermarks/`** — faint marks for document/background use. `.svg`. `clinicos-watermark[-<context>].svg`.

### `src/assets/icons/`

Custom SVG icon **sources** for glyphs not provided by lucide. The semantic icon **registry is code** (`@shared/design-system` → `icons`); these are the raw vector sources it can reference.

| Field                  | Contract                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**            | Hold optimized SVG sources for ClinicOS-specific icons, organised by semantic group.                                                                                      |
| **Responsibilities**   | Provide monochrome, theme-aware glyphs consumed via the design-system `Icon` wrapper.                                                                                     |
| **Allowed file types** | `.svg` only.                                                                                                                                                              |
| **Naming rules**       | kebab-case `<concept>[-<variant>].svg` (e.g. `dispense.svg`, `check-in.svg`). Folder = semantic group.                                                                    |
| **Optimization rules** | SVGO; **monochrome icons MUST use `currentColor`** for fill/stroke (theme-aware) — enforced at authoring/review (SVGO won't recolour). Keep `viewBox`; drop width/height. |
| **Future scalability** | Icon set grows additively; can be sprite-built or packaged; theming is free via `currentColor`/tokens.                                                                    |

- **`icons/action/`** — verbs/actions (dispense, check-in, advance-queue).
- **`icons/brand/`** — brand/product glyphs (compact marks used as icons).
- **`icons/medical/`** — clinical glyphs (vitals, prescription, stethoscope).
- **`icons/navigation/`** — nav/wayfinding glyphs (sidebar, breadcrumbs).
- **`icons/status/`** — state glyphs (success, warning, offline, syncing).

### `src/assets/illustrations/`

Multi-colour spot artwork, **foldered by illustration TYPE**; the **domain is encoded in the filename** ([§6](#6-decision-domain-assets-use-prefixed-filenames-not-per-domain-folders)).

| Field                  | Contract                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**            | Empty-state, error, loading, onboarding, and scene artwork for ClinicOS screens.                                                                                                                 |
| **Responsibilities**   | Provide consistent, on-brand spot art; domain-specific art lives here by filename prefix.                                                                                                        |
| **Allowed file types** | `.svg` (preferred — crisp, themeable), `.webp`/`.png` only when the art is inherently raster.                                                                                                    |
| **Naming rules**       | `empty-<context>.svg`, `error-<context>.svg`, plus context names per folder (e.g. `empty-appointments.svg`, `error-billing.svg`). See [NamingStandards.md §illustrations](./NamingStandards.md). |
| **Optimization rules** | SVGO (colours preserved); compress raster; **never** bake localizable text into art (use text + tokens).                                                                                         |
| **Future scalability** | New domains add files, not folders; per-tenant overrides by filename/registry key.                                                                                                               |

- **`illustrations/authentication/`** — sign-in / sign-up / locked art.
- **`illustrations/empty-states/`** — `empty-<context>.svg` (e.g. `empty-appointments.svg`, `empty-patients.svg`).
- **`illustrations/error-states/`** — `error-<context>.svg` (e.g. `error-generic.svg`, `error-billing.svg`).
- **`illustrations/loading/`** — loading / skeleton placeholder art.
- **`illustrations/maintenance/`** — maintenance / scheduled-downtime art.
- **`illustrations/medical/`** — clinical scene art (consult, vitals, pharmacy).
- **`illustrations/offline/`** — offline / connectivity-lost art.
- **`illustrations/onboarding/`** — first-run / product-tour art.
- **`illustrations/success/`** — confirmation / celebratory art.

### `src/assets/avatars/`

Default avatar placeholders and generated-avatar backgrounds. Served, swappable defaults are also registered as `avatar.*` keys.

| Field                  | Contract                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**            | Fallback avatar imagery when a real photo is absent.                                                                            |
| **Responsibilities**   | Provide role-default avatars and pattern backgrounds for generated (initials) avatars.                                          |
| **Allowed file types** | `.svg` (preferred).                                                                                                             |
| **Naming rules**       | `avatar-<role>.svg` (e.g. `avatar-doctor.svg`, `avatar-patient.svg`, `avatar-organization.svg`); patterns `pattern-<name>.svg`. |
| **Optimization rules** | SVGO; keep neutral, theme-friendly colours; no text.                                                                            |
| **Future scalability** | More roles/patterns add files; served defaults swap via `avatar.*` registry keys.                                               |

- **`avatars/placeholders/`** — default `avatar-doctor.svg`, `avatar-patient.svg`, `avatar-organization.svg`.
- **`avatars/patterns/`** — `pattern-<name>.svg` backgrounds for initials avatars.

### `src/assets/images/`

Raster/SVG imagery that is **not** illustration spot-art: backgrounds and repeatable patterns.

| Field                  | Contract                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Purpose**            | Decorative backgrounds and tileable patterns.                                                    |
| **Responsibilities**   | Provide page/section backgrounds and texture tiles.                                              |
| **Allowed file types** | `.svg`, `.webp` (preferred raster), `.png` (fallback).                                           |
| **Naming rules**       | `bg-<context>.<ext>`, `pattern-<name>.<ext>` (kebab-case).                                       |
| **Optimization rules** | SVGO for vector; compress raster (`.webp`); provide responsive sizes where large; no baked text. |
| **Future scalability** | Per-tenant/brand backgrounds; large images can move to `public/`/CDN.                            |

- **`images/backgrounds/`** — `bg-<context>.<ext>` page/section backgrounds.
- **`images/patterns/`** — `pattern-<name>.<ext>` repeatable texture tiles.

### `src/assets/animations/`

Motion sources.

| Field                  | Contract                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**            | Lottie/JSON motion for loaders and micro-interactions.                                                                                |
| **Responsibilities**   | Hold lightweight motion files consumed behind a `prefers-reduced-motion` gate.                                                        |
| **Allowed file types** | `.json`, `.lottie`.                                                                                                                   |
| **Naming rules**       | `<concept>.lottie.json` / `<concept>.json` (e.g. `sync-success.lottie.json`).                                                         |
| **Optimization rules** | Keep files small; **gate playback by `prefers-reduced-motion` at the consumer**; never autoplay distracting motion (calm-by-default). |
| **Future scalability** | Motion library grows additively; reduced-motion fallbacks keep a11y intact.                                                           |

- **`animations/lottie/`** — Lottie/JSON files.

### `src/assets/documents/`

Branding sources for generated documents (prescription PDFs, invoices) and print stylesheets.

| Field                  | Contract                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| **Purpose**            | Source art for document/print branding (headers, footers, watermarks).                              |
| **Responsibilities**   | Provide print-safe, mono-friendly branding for PDF and print output.                                |
| **Allowed file types** | `.svg` (preferred for print crispness); `.png` only if required by a renderer.                      |
| **Naming rules**       | `<document>-<part>.svg` (e.g. `prescription-header.svg`, `invoice-watermark.svg`).                  |
| **Optimization rules** | SVGO; prefer monochrome/print-friendly; no localizable text baked in (compose text at render time). |
| **Future scalability** | Per-tenant document branding; multiple paper sizes/locales as new files.                            |

- **`documents/pdf/`** — PDF header/footer/watermark branding (prescription, invoice).
- **`documents/print/`** — print-stylesheet branding art.

---

## 9. Tier 2 — `public/**` (CDN-served) per-folder contracts

Tier-2 folders are **copied verbatim to the served root** and addressed through the registry (`<base>/assets/<path>`) or directly by the HTML document (favicons, social, splash). They are **CDN-swappable**: setting `VITE_ASSET_BASE_URL` repoints them with no code change. All are scanned by [`check-assets.mjs`](../../scripts/check-assets.mjs).

### `public/assets/`

Registry-addressed served assets. A file here at `assets/<path>` is reached as `assetUrl('<category>.<name>')`.

| Field                  | Contract                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**            | Hold large / white-labellable artwork resolved through the Asset Registry.                                                                                        |
| **Responsibilities**   | Provide the runtime-served, CDN-swappable copies of logos and illustrations.                                                                                      |
| **Allowed file types** | `.svg` (preferred), `.webp`/`.png` for raster.                                                                                                                    |
| **Naming rules**       | Path under `assets/` MUST match a registry value; file is kebab-case; key is `category.name` camelCase. See [NamingStandards.md §registry](./NamingStandards.md). |
| **Optimization rules** | Optimize before commit; **no duplicates** (hard-fail in `check:assets`); long-cache-friendly (stable paths).                                                      |
| **Future scalability** | Move to CDN / per-tenant bucket via `VITE_ASSET_BASE_URL`; add `srcset` variants behind the resolver.                                                             |

- **`public/assets/brand/`** — served logo family (`brand.logo`, `brand.logoMark`, `brand.logoLight`, `brand.logoDark`, `brand.logoMono`).
- **`public/assets/illustrations/`** — served illustrations (`illustration.emptyGeneric`, `illustration.errorGeneric`, `illustration.offline`, `illustration.maintenance`, `illustration.welcome`).

### `public/favicons/`

| Field                  | Contract                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**            | Favicon set and PWA manifest icons referenced by `index.html` / the web manifest.                                                                |
| **Responsibilities**   | Provide all favicon sizes/formats and maskable PWA icons.                                                                                        |
| **Allowed file types** | `.ico`, `.svg`, `.png` (and `site.webmanifest`/`manifest` JSON alongside).                                                                       |
| **Naming rules**       | Conventional: `favicon.ico`, `favicon.svg`, `favicon-<size>.png` (e.g. `favicon-32x32.png`), `apple-touch-icon.png`, `icon-<size>-maskable.png`. |
| **Optimization rules** | Compress PNGs; provide an SVG favicon; exact sizes only (no oversized icons).                                                                    |
| **Future scalability** | Per-tenant favicons; new platform icon sizes added as files; served via CDN.                                                                     |

### `public/social-preview/`

| Field                  | Contract                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------- |
| **Purpose**            | Open Graph / Twitter card images for link previews.                                |
| **Responsibilities**   | Provide share-preview imagery referenced by `og:image` / `twitter:image` meta.     |
| **Allowed file types** | `.png`, `.webp`, `.jpg`.                                                           |
| **Naming rules**       | `og-<context>.png` / `twitter-<context>.png` (e.g. `og-default.png`).              |
| **Optimization rules** | Exact platform dimensions (e.g. 1200×630); compressed; readable at thumbnail size. |
| **Future scalability** | Per-tenant / per-campaign previews; localized variants.                            |

### `public/splash/`

| Field                  | Contract                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Purpose**            | PWA / app launch splash screens.                                                  |
| **Responsibilities**   | Provide device-sized launch screens for the installed PWA.                        |
| **Allowed file types** | `.png`, `.webp`.                                                                  |
| **Naming rules**       | `splash-<width>x<height>.png` (device-targeted).                                  |
| **Optimization rules** | Compressed; correct per-device dimensions; on-brand, theme-aware where supported. |
| **Future scalability** | New device classes add files; per-tenant splash; CDN-served.                      |

---

## 10. Where fonts live (and why not in `src/assets/`)

FolderStructure.md §6 originally sketched an `assets/fonts/` folder for self-hosted brand fonts. **The built system does not use it.** ClinicOS instead self-hosts fonts through the **`@fontsource-variable/*` packages**:

- `@fontsource-variable/plus-jakarta-sans` (headings)
- `@fontsource-variable/inter` (body)

> **Why no `src/assets/fonts/`** — The fontsource packages already deliver self-hosted, subsetted, variable `.woff2` files plus the `@font-face` CSS, versioned through the package manager. Hand-managing font files in `src/assets/fonts/` would duplicate that with no benefit and risk version drift. The original §6 intent — _self-hosted, privacy-respecting, token-matched fonts, never a third-party CDN at runtime_ — is **fully satisfied** by the packages; only the mechanism changed. This is the single deliberate divergence from §6, recorded here so the canon and reality do not drift.

If a future script (Devanagari for Hindi/Marathi, Arabic for Urdu/RTL) is not available via fontsource, a `src/assets/fonts/` folder may be reintroduced under the original §6 contract — at which point this note is updated rather than contradicted.

---

## 11. Cross-references

| Need                                                                         | Document / code                                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Asset **file-naming** standards (full rules + ✅/❌)                         | [NamingStandards.md](./NamingStandards.md)                                      |
| Global naming rulebook (kebab-case, forbidden names)                         | [../Naming-Convention.md](../Naming-Convention.md)                              |
| The `assets/*` per-folder contract in the architecture canon (extended here) | [../architecture/FolderStructure.md §2, §6](../architecture/FolderStructure.md) |
| The Asset Registry + `assetUrl(key)`                                         | [`src/shared/config/assets.ts`](../../src/shared/config/assets.ts)              |
| SVG optimization config                                                      | [`svgo.config.js`](../../svgo.config.js)                                        |
| Asset hygiene (duplicate/unused) gate                                        | [`scripts/check-assets.mjs`](../../scripts/check-assets.mjs)                    |
| Source-asset overview (per-folder quick table)                               | [`src/assets/README.md`](../../src/assets/README.md)                            |

---

_Design-Infrastructure canon · Asset Architecture · Owner: Frontend Architecture · Extends [architecture/FolderStructure.md](../architecture/FolderStructure.md) & [Naming-Convention.md](../Naming-Convention.md), never contradicts them._
