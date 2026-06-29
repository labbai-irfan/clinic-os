# SVG Standards — Part 4: SVG Strategy

> **SVG is the default format for every vector asset in ClinicOS** — icons, brand marks, and
> illustrations. This document is the **authoring, optimization, a11y, and import** canon for SVG
> sources under `src/assets/`. The Icon _Registry_ (lucide glyphs → `<Icon>`) is Part 3; this is the
> rules for **raw SVG files** we own.
>
> Reasoning ("why a single icon library, calm illustration style") lives in
> **[Frontend-Bible.md §6](../Frontend-Bible.md#6-iconography-imagery--illustration)**. Token values
> live in **[design-system/DesignGuidelines.md §10](../design-system/DesignGuidelines.md)** and
> **[Theme.md](../design-system/Theme.md)** — this doc does not re-derive them.
>
> **Source of truth:** [`svgo.config.js`](../../svgo.config.js) ·
> [`src/assets/icons/`](../../src/assets/icons/) · [`src/assets/images/`](../../src/assets/images/)
> **Siblings:** [IconGuidelines.md](./IconGuidelines.md) (Part 3) · [NamingStandards.md](./NamingStandards.md) ·
> [OptimizationGuide.md](./OptimizationGuide.md)
> **Registered in:** [PROJECT_BRAIN.md §32 Asset Registry](../brain/PROJECT_BRAIN.md) ·
> [architecture/FolderStructure.md §6 `assets/*`](../architecture/FolderStructure.md)

---

## 1. Why SVG (the default)

- **Crisp at any density.** Resolution-independent — sharp on a phone, a reception kiosk, and a wall
  display alike (Bible §7.1 targets) with no `@2x` raster juggling.
- **Themeable.** A monochrome SVG painted with `currentColor` re-themes for free across
  light / dark / high-contrast — same mechanism as registry icons (see [IconGuidelines.md §4](./IconGuidelines.md)).
- **Tiny + inspectable.** Optimized vector markup is usually smaller than equivalent PNGs, diffs
  cleanly in review, and is `gzip`/`brotli`-friendly.
- **Accessible + scriptable.** Native `<title>`/`<desc>`, ARIA roles, and CSS/DOM access for state.

> **Decision Contract — SVG-first for vectors**
>
> | Facet                  | Position                                                                                                                                                                                                                                                                      |
> | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | **Why**                | One vector format that is crisp, themeable, tiny, and accessible across every ClinicOS surface. Raster formats can't re-theme, blur when scaled, and ship per-density variants.                                                                                               |
> | **Benefits**           | Density-independent; `currentColor` theming; small + diffable; native a11y; CSS-stylable. Optimized deterministically by one shared pipeline ([§2](#2-the-optimization-pipeline)).                                                                                            |
> | **Trade-offs**         | Complex/photographic art is heavier as SVG than as a compressed raster → use raster (WebP/AVIF) for photography (Bible §6.2); SVG for icons + flat illustrations. Untrusted inline SVG is an XSS surface → we only inline **our own, optimized** sources, never user uploads. |
> | **Alternatives**       | (a) Icon font — rejected: a11y-hostile, no multi-colour, hinting issues. (b) PNG/raster sprites — rejected for vectors: no theming, density variants. (c) Raster photography — **kept** for real imagery only.                                                                |
> | **Future scalability** | Per-tenant brand SVGs and sprite sheets slot in behind the same import/registry surface with no consumer changes (white-label).                                                                                                                                               |
> | **Enterprise**         | Deterministic optimized output (audit/review-friendly), licensing tracked in the Asset Registry, and a strict "no raw user SVG inlined" security stance.                                                                                                                      |

---

## 2. The optimization pipeline — `pnpm optimize:svg`

Every SVG we own is optimized **before commit** by running SVGO over `src/assets/**`:

```bash
pnpm optimize:svg          # runs svgo with svgo.config.js over src/assets/**
```

The config ([`svgo.config.js`](../../svgo.config.js)) is intentionally minimal and is tuned to strip
editor cruft **without** mangling colour or breaking sizing/a11y:

```js
export default {
  multipass: true, // re-run plugins until the output stabilises
  js2svg: { indent: 2, pretty: false }, // compact, deterministic output
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false, // KEEP viewBox — sizing is the wrapper/CSS's job (§4)
          cleanupIds: false, // KEEP ids — <use>, gradients, masks, <title>/<desc> refs
        },
      },
    },
    'removeDimensions', // DROP width/height — viewBox + CSS drive the size (§4)
    'sortAttrs', // stable attribute order → clean, reviewable diffs
  ],
};
```

| Plugin / setting                    | What it does                                                                                        | Why we chose it                                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `multipass: true`                   | Re-runs the plugin chain until output stops shrinking.                                              | One pass can expose more to remove; deterministic minimum.                                                                                                       |
| `js2svg: { pretty: false }`         | Compact, stable serialisation.                                                                      | Smallest bytes; consistent diffs.                                                                                                                                |
| `preset-default`                    | SVGO's curated safe-cleanup set (strips comments, metadata, editor namespaces, empty groups, etc.). | Removes Figma/Illustrator cruft without hand-tuning dozens of plugins.                                                                                           |
| `removeViewBox: false` _(override)_ | **Keeps** `viewBox`.                                                                                | The `viewBox` is the intrinsic aspect ratio; without it, CSS/wrapper sizing breaks and the art can't scale. **Non-negotiable.**                                  |
| `cleanupIds: false` _(override)_    | **Keeps** `id`s.                                                                                    | Ids are referenced by `<use>`, gradients, `mask`/`clipPath`, and a11y (`aria-labelledby` → `<title>`/`<desc>`). Stripping them silently breaks rendering + a11y. |
| `removeDimensions`                  | **Removes** the `width`/`height` attributes.                                                        | Hardcoded pixel dimensions fight the wrapper/CSS. With only `viewBox`, the consumer owns the size (§4).                                                          |
| `sortAttrs`                         | Canonical attribute order.                                                                          | Minimises review noise on re-optimization.                                                                                                                       |

> **Why _not_ force-strip colours here:** the config deliberately does **not** run a "convert all fills
> to `currentColor`" plugin — that would destroy multi-colour illustrations. `currentColor` is enforced
> for icons at **authoring time and in review** ([§5](#5-color-rules)), not by the optimizer.

Full plugin-by-plugin rationale: [OptimizationGuide.md](./OptimizationGuide.md).

---

## 3. Accessibility

SVGs carry their own a11y; choose decorative vs meaningful exactly as with registry icons
([IconGuidelines.md §6](./IconGuidelines.md)).

**Meaningful** (the SVG conveys information on its own) — give it a name via `<title>` (+ `<desc>` for
detail) and wire `role="img"` + `aria-labelledby`:

```html
<svg viewBox="0 0 64 64" role="img" aria-labelledby="empty-queue-title empty-queue-desc">
  <title id="empty-queue-title">No patients in the queue</title>
  <desc id="empty-queue-desc">An empty waiting-room illustration.</desc>
  <!-- paths… -->
</svg>
```

> In React, the **localized** name should come from an i18n key, not baked into the file:
> `<EmptyQueue role="img" aria-label={t('queue.empty.illustrationLabel')} />`. Reserve hardcoded
> in-file `<title>` for static brand marks; localizable art is labelled by the consumer.

**Decorative** (adjacent to a visible label, or pure ornament) — hide it:

```html
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><!-- … --></svg>
```

- `aria-hidden="true"` removes it from the accessibility tree; `focusable="false"` stops IE/legacy
  focus traps.
- **Never icon/colour-alone for meaning** — same rule as registry icons; pair with a localized word
  (Bible §6.1).

---

## 4. Sizing rules

> **`viewBox` + wrapper/CSS control size. Never hardcode `width`/`height`.** (Enforced by
> `removeDimensions` + `removeViewBox: false`.)

- The `viewBox` defines the coordinate system + aspect ratio; the **consumer** sets the rendered size.
- Registry-style icons render through the [`<Icon>` wrapper](./IconGuidelines.md#5-sizing-icon-size-tokens-via-the-wrapper):
  size comes from the `--icon-size-*` scale via the `size` prop.
- Standalone SVGs are sized with a **token-mapped utility / CSS var**, never a literal:

```tsx
{/* ✅ size from the icon-size token scale */}
<LogoMark aria-hidden className="size-8" />            {/* 32px = --icon-size-lg */}

{/* ✅ illustration scales to its container, aspect ratio preserved by viewBox */}
<EmptyQueue role="img" aria-label={t('queue.empty.label')} className="w-full max-w-xs h-auto" />
```

```html
<!-- ❌ hardcoded dimensions fight the wrapper/CSS and break theming/scaling -->
<svg width="24" height="24" viewBox="0 0 24 24">…</svg>
```

---

## 5. Color rules

| Asset kind                       | Colour rule                                                                                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Icons** (monochrome)           | **MUST use `currentColor`** for `fill`/`stroke`. They then inherit the surrounding text colour and re-theme for free — set colour via a **semantic token utility** (`text-primary`, `text-danger`, …), never a hex.                                                             |
| **Illustrations** (multi-colour) | **MAY be multi-colour, but every colour MUST come from the token palette** (sand / rose / teal / stone ramps — [ColorSystem.md](../design-system/ColorSystem.md)). No off-palette hex. Prefer theme-aware fills via CSS vars so light/dark variants are automatic (Bible §6.3). |

```svg
<!-- ✅ ICON: currentColor → inherits text colour, re-themes automatically -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
  <path d="M4 12h16" />
</svg>
```

```svg
<!-- ✅ ILLUSTRATION: theme-aware fills from the token palette via CSS vars -->
<svg viewBox="0 0 64 64" role="img" aria-labelledby="t">
  <title id="t">Empty appointments</title>
  <rect fill="var(--color-sand-100)" x="0" y="0" width="64" height="64" rx="8" />
  <path  fill="var(--color-teal-400)" d="…" />
</svg>
```

```svg
<!-- ❌ hardcoded brand hex — off-token, won't re-theme -->
<path fill="#E87D7D" d="…" />
```

> Rendering happens through the same token mechanism as the rest of the design system — see
> [Theme.md](../design-system/Theme.md). The optimizer **does not** rewrite colours ([§2](#2-the-optimization-pipeline));
> `currentColor`/token usage is a review gate.

---

## 6. Stroke rules

- Line-style icons use the shared stroke variable so weight is uniform app-wide:
  **`stroke-width="var(--icon-stroke)"`** (= `2`; `--icon-stroke-bold` = `2.5` for emphasis).
- The [`<Icon>` wrapper](./IconGuidelines.md) already applies `strokeWidth="var(--icon-stroke)"` to
  registry glyphs — match that weight in hand-authored SVG icons so they sit consistently beside lucide ones.
- Use `stroke-linecap="round"` / `stroke-linejoin="round"` to match the calm, soft lucide aesthetic
  (Bible §6.1).

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="var(--icon-stroke)" stroke-linecap="round" stroke-linejoin="round"
     aria-hidden="true">
  <path d="M5 12h14M12 5v14" />
</svg>
```

---

## 7. Naming standards

SVG source files are **`kebab-case`** under `src/assets/{icons,images}/`, describing the **concept**,
not the visual:

```
src/assets/icons/logo-mark.svg            ✅   src/assets/icons/Logo_Mark.SVG     ❌
src/assets/images/empty-queue.svg         ✅   src/assets/images/img1.svg          ❌
src/assets/images/empty-appointments.svg  ✅
```

- Icons (brand marks, lucide overrides) → `src/assets/icons/`; illustrations / empty-state art →
  `src/assets/images/` ([FolderStructure.md §6](../architecture/FolderStructure.md)).
- React component identifiers derived from a file are `PascalCase` (`logo-mark.svg` → `LogoMark`).
- **Never bake localizable text into the artwork** — text is a translated DOM layer, not a path.

Full rules: **[NamingStandards.md](./NamingStandards.md)** and
[architecture/NamingConvention.md](../architecture/NamingConvention.md).

---

## 8. Import strategy — bundled source vs Asset Registry

Two delivery paths; choose by size, reuse, and cacheability.

| Path                                | Use for                                       | How                                                                                                                                                                        |
| ----------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bundled source (inlined)**        | Small, reused, themeable icons + brand marks. | Imported as a **React component** (SVGR) so it inlines into the DOM — `currentColor`, ARIA, and CSS sizing all work. Tree-shaken into the JS bundle.                       |
| **Served via Asset Registry (URL)** | Large or rarely-changing illustrations.       | Imported as a **URL** (`import url from '…svg'`) and rendered through `<img>`/`<picture>`/CSS `background`; cached by the CDN, lazy-loaded, and kept out of the JS bundle. |

```tsx
// ✅ Inline (component) — small, themeable icon: currentColor + ARIA + CSS sizing all apply.
import LogoMark from '@assets/icons/logo-mark.svg?react';
<LogoMark aria-hidden className="size-8" />;

// ✅ URL — large illustration served as an asset; lazy + cacheable, off the JS bundle.
import emptyQueueUrl from '@assets/images/empty-queue.svg';
<img src={emptyQueueUrl} alt={t('queue.empty.alt')} loading="lazy" className="w-full max-w-xs" />;
```

Every non-trivial SVG asset is registered (name · type · location · usage · **license** · status) in
the **[Asset Registry — PROJECT_BRAIN.md §32](../brain/PROJECT_BRAIN.md)**.

---

## 9. Bundle optimization

- **Inline small icons** (< ~2 KB optimized) as components — the request overhead exceeds the bytes,
  and inlining unlocks `currentColor` theming + ARIA. These tree-shake.
- **Lazy-load large illustrations** — serve via URL + `loading="lazy"`; never block first paint on
  empty-state art. Code-split route-specific illustrations with the route.
- **Prefer the registry** for any glyph that exists in lucide (tree-shakeable, no source file to ship);
  only author a custom SVG for true brand/medical marks lucide lacks ([IconGuidelines.md §8](./IconGuidelines.md#8-future-custom-icon-packs)).
- **Sprite sheets** are an option for a large set of same-styled custom icons (one cached request);
  keep the **registry indirection** so consumers stay vendor-agnostic ([IconGuidelines.md Decision Contract](./IconGuidelines.md)).
- Always run `pnpm optimize:svg` before commit — un-optimized exports carry editor metadata that
  inflates the bundle.

---

**See also:** [IconGuidelines.md](./IconGuidelines.md) (Part 3 — registry + `<Icon>`) ·
[NamingStandards.md](./NamingStandards.md) · [OptimizationGuide.md](./OptimizationGuide.md) ·
[design-system/Theme.md](../design-system/Theme.md) · [ColorSystem.md](../design-system/ColorSystem.md) ·
[Frontend-Bible.md §6](../Frontend-Bible.md#6-iconography-imagery--illustration).
