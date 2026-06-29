# ⚡ Optimization Guide

> **Part 8 — image/asset optimization & performance.** Compression, responsive images, lazy-loading,
> the right **format** per asset class, the caching + **CDN-ready** strategy, and a hard
> **performance budget** every asset must pass. ClinicOS runs on slow clinic networks and modest
> hardware — assets that are heavy, render-blocking, or un-cacheable are a **bug**, not a polish item.
>
> This doc governs **how assets are encoded, sized, loaded, and cached.** The **content** rules
> (token colors, no baked text, fallbacks) live in [IllustrationGuidelines.md](./IllustrationGuidelines.md)
> and [BrandGuidelines.md](./BrandGuidelines.md); the **registry/CDN indirection** is
> [`src/shared/config/assets.ts`](../../src/shared/config/assets.ts). `assets.ts` names this file as its
> governing optimization spec.
>
> Siblings: **[IllustrationGuidelines.md](./IllustrationGuidelines.md)** ·
> **[BrandGuidelines.md](./BrandGuidelines.md)** · source contract
> **[src/assets/README.md](../../src/assets/README.md)**.
> Canon it defers to: [architecture/EnvironmentGuide.md](../architecture/EnvironmentGuide.md)
> (`VITE_ASSET_BASE_URL`) · [design-system/Motion.md](../design-system/Motion.md) (reduced motion).

---

## The one rule that governs optimization

> **Every asset is the smallest correct thing, loaded at the last responsible moment, cached forever
> when hashed, and never render-blocking.** If an image delays first paint or interactivity, ships
> bytes the viewport doesn't need, or can't be cached, it fails review — regardless of how good it
> looks.

---

# Part 8 — Image & asset optimization

## 8.1 Formats — the right encoder per asset class

| Asset class                                                   | Format                              | Why / rule                                                                                                                           |
| ------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Vector** (icons, logos, illustrations, avatar placeholders) | **SVG** (optimized)                 | Infinitely scalable, tiny, `currentColor`-themable; **run `pnpm optimize:svg`** ([src/assets/README.md](../../src/assets/README.md)) |
| **Raster photo / complex art**                                | **AVIF** → **WebP** → fallback      | AVIF/WebP are far smaller than JPG/PNG; serve via `<picture>`/`srcset` with a JPG/PNG fallback                                       |
| **Fonts**                                                     | **woff2**                           | Best compression; subset to used glyphs; `font-display: swap`                                                                        |
| **Motion / animation**                                        | **Lottie / JSON** (or animated SVG) | Vector motion, tiny vs video/GIF; **reduced-motion gated at the consumer** ([Motion.md](../design-system/Motion.md))                 |
| **Favicon**                                                   | **SVG** + minimal PNG fallbacks     | One scalable SVG + the few legacy sizes only ([BrandGuidelines §7.5](./BrandGuidelines.md))                                          |

- **SVG is the default** for everything that _can_ be vector — it's the lightest and the only format that
  re-themes via tokens/`currentColor`.
- **Never GIF** for animation (huge, 256-color); never an un-optimized PNG where SVG/WebP fits.
- **Strip metadata** (EXIF, editor cruft, hidden layers) from every raster and SVG on the way in.

## 8.2 Compression

- **SVG:** every source SVG is run through the optimizer (`pnpm optimize:svg`) — removes editor metadata,
  collapses transforms, rounds precision, drops hidden nodes. Gate it in CI with `pnpm check:assets`
  ([src/assets/README.md](../../src/assets/README.md)).
- **Raster:** encode AVIF/WebP at a quality that's visually lossless for the asset's role; never ship a
  2× PNG where a quality-tuned WebP is 1/5 the size.
- **Fonts:** subset to the glyphs each language actually uses (en/hi/mr/ur) and ship **woff2** only.
- **Transport:** rely on the CDN/server for Brotli/gzip on text-based assets (SVG, JSON, fonts) — but the
  _source_ must already be minimal; compression is not a substitute for a smaller asset.

## 8.3 Responsive images (`srcset` / `sizes`)

For any **raster** that renders at variable widths (login backgrounds, clinic hero/banner, content
images):

```html
<img
  src="banner-800.webp"
  srcset="banner-400.webp 400w, banner-800.webp 800w, banner-1600.webp 1600w"
  sizes="(max-width: 768px) 100vw, 800px"
  loading="lazy"
  decoding="async"
  width="800"
  height="300"
  alt=""
/>
```

- Provide **multiple widths** via `srcset` + a `sizes` hint so the browser fetches only what the viewport
  needs — never a 1600px image into a 400px slot.
- Use **`<picture>`** to offer AVIF → WebP → fallback in priority order.
- **Always set `width`/`height`** (or `aspect-ratio`) to reserve space and prevent layout shift (CLS).
- **Vectors (SVG) need no `srcset`** — they scale losslessly; ship one file.

## 8.4 Lazy loading

- **Below-the-fold imagery:** `loading="lazy"` + `decoding="async"` on `<img>` — the browser defers the
  fetch until it's near the viewport.
- **Above-the-fold / LCP image:** **eager** (`loading="eager"`, optionally `fetchpriority="high"`) — never
  lazy-load the thing that _is_ first paint.
- **Heavier/conditional assets** (Lottie animations, large illustrations, charts' assets): mount behind an
  **`IntersectionObserver`** so the asset (and its decode/parse cost) is only paid when it scrolls into
  view. Animations additionally check reduced motion before playing
  ([Motion.md](../design-system/Motion.md) · [IllustrationGuidelines §5.4](./IllustrationGuidelines.md)).
- **No render-blocking imagery.** Decorative/empty-state art must never sit on the critical path; the
  screen's **text + CTA** render first, art fills in ([IllustrationGuidelines §5.4](./IllustrationGuidelines.md)).

### Decision Contract — lazy by default, eager only for LCP

| Field            | Summary                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Why**          | Clinic networks are slow; fetching off-screen imagery up front steals bandwidth from the content the user is reading.  |
| **Benefits**     | Faster first paint + interactivity, less data on metered/rural connections, lower memory from un-decoded images.       |
| **Trade-offs**   | A lazy image may flash in on fast scroll — mitigated by reserved dimensions and a token skeleton placeholder.          |
| **Alternatives** | (a) Eager-load everything — wastes the critical path. (b) Manual JS for all — `loading="lazy"` covers the common case. |
| **Enterprise**   | Predictable, low-bandwidth loading is a clinical reliability requirement, not an optimization nicety.                  |

## 8.5 Caching + CDN-ready strategy

ClinicOS's two tiers cache differently, and both are CDN-ready by design
([assets.ts header](../../src/shared/config/assets.ts)):

| Tier                  | How it's named                                        | Cache policy                                                                                   |
| --------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Bundled (source)**  | Vite content-**hashed** filenames (`logo.[hash].svg`) | `Cache-Control: public, max-age=31536000, immutable` — the hash _is_ the cache-bust            |
| **Served (registry)** | Stable logical key → path via `assetUrl()`            | Long cache + revalidation; swap the file or flip `VITE_ASSET_BASE_URL` to a versioned CDN path |

- **Immutable hashed bundled assets:** because the filename changes whenever the bytes change, bundled
  assets are safe to cache **forever** — a new build ships a new URL, never a stale one.
- **The `VITE_ASSET_BASE_URL` indirection** is the CDN seam: `assetUrl(key)` builds the URL from this
  base (a CDN origin when set, else the app base path —
  [assets.ts](../../src/shared/config/assets.ts) · [EnvironmentGuide.md §2](../architecture/EnvironmentGuide.md)).
  Moving served assets local `public/` → CDN → per-tenant bucket is a **config change, zero code edits**.
- **One place builds a served URL** (`assetUrl`) — so cache strategy, base, and versioning are governed in
  exactly one spot.
- **Preload only what's critical** (the LCP image, the brand mark on the shell); preconnect to the CDN
  origin so the first asset fetch doesn't pay DNS/TLS latency.

## 8.6 The performance budget (enforced)

Budgets are **ceilings**, checked in review (and gate-able via `pnpm check:assets`). An asset over budget
is re-optimized or rejected — not waved through.

### Per-asset ceilings

| Asset                                   | Budget (gzipped/brotli where text) | Notes                                                   |
| --------------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| **Icon** (SVG)                          | **< 2 KB**                         | Most are a few hundred bytes; `currentColor`, optimized |
| **Logo / mark** (SVG)                   | **< 10 KB**                        | Vector, optimized; mono variant smaller                 |
| **Illustration** (SVG)                  | **< 30 KB**                        | The hard ceiling for empty/error/onboarding art         |
| **Avatar placeholder** (SVG)            | **< 5 KB**                         | Simple silhouette, token-colored                        |
| **Raster image** (per responsive width) | **≤ 150 KB** (AVIF/WebP)           | Use `srcset`; the largest width is the budgeted one     |
| **Lottie / JSON animation**             | **< 50 KB**                        | Reduced-motion gated; prefer SVG if it fits             |
| **Font** (woff2, per face)              | **< 100 KB** subset                | Subset to used glyphs per language                      |
| **Favicon** (SVG)                       | **< 5 KB**                         | + tiny legacy PNG fallbacks only                        |

### Page / total budgets

| Budget                                | Ceiling                                       | Rule                                                |
| ------------------------------------- | --------------------------------------------- | --------------------------------------------------- |
| **Total imagery per critical screen** | **≤ 200 KB** above the fold                   | Lazy-load the rest                                  |
| **No render-blocking imagery**        | **0 bytes** on the critical path              | Text + CTA paint first; art is progressive          |
| **LCP image**                         | single, **eager**, preloaded, sized           | one hero/LCP image, never lazy, dimensions reserved |
| **Animations on first paint**         | **0** unless essential & reduced-motion-aware | motion is opt-in and gated                          |

> **Color/token discipline is also a budget:** an SVG that hardcodes hex instead of `currentColor`/tokens
> fails review even if it's small — it can't re-theme or white-label
> ([IllustrationGuidelines §5.2](./IllustrationGuidelines.md) · [BrandGuidelines §7.7](./BrandGuidelines.md)).

### Decision Contract — explicit per-asset + total budgets

| Field            | Summary                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Why**          | Without hard ceilings, asset weight creeps until the app is slow on the exact low-end devices/networks clinics run on.  |
| **Benefits**     | Predictable performance; reviewers have an objective pass/fail; regressions are caught at PR, not in production.        |
| **Trade-offs**   | Some richer art must be simplified to fit — acceptable: calm, fast, legible beats heavy and pretty in a clinical tool.  |
| **Alternatives** | (a) No budget — weight creep, slow app. (b) Only a total budget — lets one fat asset hide; per-asset ceilings catch it. |
| **Enterprise**   | Budgets make performance auditable and CI-enforceable — a reliability/compliance posture, not a vibe.                   |

---

## 8.7 Optimization checklist (per asset, before commit)

- [ ] **Right format** for the class (SVG vector · AVIF/WebP raster · woff2 font · Lottie/JSON motion) — [§8.1](#81-formats--the-right-encoder-per-asset-class)
- [ ] **Compressed:** `pnpm optimize:svg` run; raster quality-tuned; font subset — [§8.2](#82-compression)
- [ ] **Responsive** if raster + variable width: `srcset`/`sizes`/`<picture>`, `width`/`height` set — [§8.3](#83-responsive-images-srcset--sizes)
- [ ] **Lazy** below the fold (`loading="lazy"`) / **eager** only for LCP; heavy assets behind `IntersectionObserver` — [§8.4](#84-lazy-loading)
- [ ] **Cacheable:** bundled → hashed/immutable; served → via `assetUrl()` + `VITE_ASSET_BASE_URL` — [§8.5](#85-caching--cdn-ready-strategy)
- [ ] **Under budget** (per-asset + contributes to the page total) — [§8.6](#86-the-performance-budget-enforced)
- [ ] **Token-colored / `currentColor`, no baked text** (re-theme + white-label safe) — [IllustrationGuidelines](./IllustrationGuidelines.md)
- [ ] **Reduced-motion-safe** if it animates — [Motion.md](../design-system/Motion.md)
- [ ] **`pnpm check:assets`** passes — [src/assets/README.md](../../src/assets/README.md)

---

## Cross-references

- **Registry / CDN indirection (`assetUrl`, `VITE_ASSET_BASE_URL`):** [Asset Registry `assets.ts`](../../src/shared/config/assets.ts) ·
  [EnvironmentGuide.md](../architecture/EnvironmentGuide.md)
- **Content rules (tokens, no baked text, fallbacks, reduced motion):** [IllustrationGuidelines.md](./IllustrationGuidelines.md)
- **Brand variants, favicons/splash, white-label assets:** [BrandGuidelines.md](./BrandGuidelines.md)
- **Reduced-motion contract:** [Motion.md](../design-system/Motion.md)
- **Source folders, `optimize:svg` / `check:assets`:** [src/assets/README.md](../../src/assets/README.md) · AssetArchitecture.md

---

_Asset System · Part 8 · Optimization & performance · smallest-correct-thing, lazy, immutable-cached,
CDN-ready, budgeted · the optimization spec named by [`assets.ts`](../../src/shared/config/assets.ts) ·
2026-06-30._
