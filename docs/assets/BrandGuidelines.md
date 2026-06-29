# 🏷️ Brand Guidelines

> **Part 7 — the brand-asset architecture.** How ClinicOS distinguishes **its own** startup/product
> brand from **each clinic's** brand, the variants every logo ships in (monochrome / light / dark),
> the print-and-document brand assets (PDF / invoice / prescription logos + watermarks), the
> **white-label model** that lets a clinic re-skin everything with **no source change**, and the usage
> rules (clear space, min size, do/don't) — all resolved through tokens and the Asset Registry.
>
> **This doc governs the brand _assets_.** The white-label **runtime** (the port, generator, validator,
> persistence) is the theme engine's — [ClinicBranding.md](../theme-engine/ClinicBranding.md) — and the
> CSS **hook** (`[data-clinic-theme='<id>']` re-maps only brand/accent semantics) is the design
> system's — [Theme.md §12.4](../design-system/Theme.md). We **defer** to both and never re-derive them.
>
> Siblings: **[IllustrationGuidelines.md](./IllustrationGuidelines.md)** ·
> **[OptimizationGuide.md](./OptimizationGuide.md)** · source contract
> **[src/assets/README.md](../../src/assets/README.md)**.
> Canon it defers to: [Asset Registry `assets.ts`](../../src/shared/config/assets.ts) ·
> [design-system/ColorSystem.md](../design-system/ColorSystem.md) ·
> [design-system/Theme.md](../design-system/Theme.md) ·
> [theme-engine/ClinicBranding.md](../theme-engine/ClinicBranding.md) ·
> [architecture/EnvironmentGuide.md](../architecture/EnvironmentGuide.md).

---

## The one rule that governs brand assets

> **There are two brands, never confused, and a clinic re-brands the app with zero source changes.**
> ClinicOS's **product brand** (the startup's identity) is fixed and lives in the bundle/registry. A
> **clinic's brand** is _tenant data_ supplied through the branding port and resolved through the Asset
> Registry + theme engine — so onboarding a new clinic's logo, colors, favicon, and document headers is a
> **data** change, not a code change. Every brand color is a **token**; no raw hex in any component.

---

# Part 7 — Brand assets

## 7.1 Two brands: ClinicOS product vs clinic tenant

| Dimension     | **ClinicOS product brand** (the startup)                                          | **Clinic brand** (the tenant)                                       |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Whose         | The platform's own identity                                                       | Each customer clinic / organization                                 |
| Where defined | Bundled + seeded in the [registry](../../src/shared/config/assets.ts) (`brand.*`) | Tenant **data** via the `ClinicBrandSource` port                    |
| Changes       | Rarely; a deploy                                                                  | Per clinic, at runtime, **no deploy**                               |
| Applied by    | `assetUrl('brand.logo')` / `@assets/brand/…`                                      | `useClinicBrand()` → `brand.logo.*`; colors via `data-clinic-theme` |
| Governs       | Login chrome by default, docs, error pages, the app shell when un-branded         | The whole shell once a clinic brand is loaded                       |

The seeded **ClinicOS** brand slots already in the registry:

| Registry key      | Path                            | Use                                            |
| ----------------- | ------------------------------- | ---------------------------------------------- |
| `brand.logo`      | `brand/clinicos-logo.svg`       | Full wordmark + mark (default)                 |
| `brand.logoMark`  | `brand/clinicos-mark.svg`       | Mark only (square contexts, favicons, avatars) |
| `brand.logoLight` | `brand/clinicos-logo-light.svg` | Light-theme-tuned variant                      |
| `brand.logoDark`  | `brand/clinicos-logo-dark.svg`  | Dark-theme-tuned variant                       |
| `brand.logoMono`  | `brand/clinicos-mono.svg`       | Single-color (print, watermark, embossing)     |

> The mark (`brand.logoMark`) is the atom that also feeds **favicons / social-preview / splash**
> ([§7.5](#75-favicons-social-preview-splash-publi)) and the **organization avatar**
> ([IllustrationGuidelines §6.1](./IllustrationGuidelines.md)).

## 7.2 Logo variants — monochrome / light / dark

Every logo (ClinicOS's, and ideally each clinic's) ships in **three theme-aware variants** so it reads on
any surface under any of the four modes ([Theme.md §12.3](../design-system/Theme.md)):

| Variant        | Registry suffix     | When it's used                                                       |
| -------------- | ------------------- | -------------------------------------------------------------------- |
| **Light**      | `…-light` / default | On light surfaces (`--color-surface*` light, default theme)          |
| **Dark**       | `…-dark`            | On dark surfaces (`[data-theme='dark']`, dark hero/footers)          |
| **Monochrome** | `…-mono`            | Single-ink contexts: print, watermark, fax, embossing, low-color env |

Authoring rules:

- **Theme-aware via tokens.** Where a logo is a ClinicOS UI mark (not a fixed customer logo), author it
  with `currentColor`/CSS-var fills so it follows `--color-text`/`--color-primary` and re-themes without
  a second file — the same `currentColor` discipline as icons
  ([src/assets/README.md](../../src/assets/README.md)). Where a brand demands an exact, fixed treatment
  (a clinic's official logo), ship explicit **light/dark/mono** files and pick by theme.
- **Pick the variant by theme**, never by hardcoding: read the active `data-theme`
  ([Theme.md §12.2](../design-system/Theme.md)) — e.g. resolve `brand.logoDark` under dark, `brand.logoLight`
  otherwise; high-contrast prefers **mono**.
- **High-contrast** ([Theme.md §12.3](../design-system/Theme.md)) → use the **monochrome** variant so the
  mark survives black-on-white with no mid-tones.

## 7.3 Document brand assets — PDF / invoice / prescription + watermarks

Printed and exported artifacts (prescriptions, invoices, lab reports) carry brand too — and these are the
**clinic's** brand, applied to the document, not the app chrome. Sources live under
`src/assets/documents/` and `src/assets/brand/` ([src/assets/README.md](../../src/assets/README.md)).

| Document asset                    | Source / field                           | Rules                                                                     |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| **Header logo**                   | `ClinicBrand.document.headerLogoUrl`     | The clinic's logo at the top of every PDF; **mono-safe** for B/W print    |
| **Footer text**                   | `ClinicBrand.document.footerText`        | Clinic legal/footer line — **i18n text**, never baked into an image       |
| **Accent color**                  | `ClinicBrand.document.accentColor`       | Document rules/headings; derived/validated like brand color               |
| **Watermark**                     | `brand/…watermark` / `documents/` source | Low-opacity **monochrome** mark; never obscures clinical content          |
| **Prescription/​invoice headers** | `documents/` print-branding sources      | Print-tuned layouts; the logo here is the **mono** or exact-color variant |

Rules specific to documents:

- **Print = monochrome-first.** Many clinics print in black-and-white; the **mono** variant
  ([§7.2](#72-logo-variants--monochrome--light--dark)) and a low-opacity mono **watermark** must remain
  legible with no color.
- **No baked text in the image.** Footer/legal lines are i18n **text** drawn by the document renderer —
  same rule as illustrations ([IllustrationGuidelines §5.5](./IllustrationGuidelines.md)); a logo image
  carries **no localizable words**.
- **Watermarks never reduce legibility** of dosage, totals, or clinical data — opacity stays low and the
  watermark sits behind, not over, meaningful text. (Watermarks are a safety/anti-fraud affordance, not
  decoration.)
- **All clinic document assets flow from `ClinicBrand.document.*`** through the branding port — adding a
  clinic's prescription header is **data**, no source change ([ClinicBranding.md Part 6](../theme-engine/ClinicBranding.md)).

## 7.4 The white-label model — per-clinic brand, no source changes

A clinic re-skins **the entire app** by supplying **one `ClinicBrand` object** through the
`ClinicBrandSource` **port** — the engine derives the skin; **no code change, no redeploy**
([ClinicBranding.md Part 6](../theme-engine/ClinicBranding.md)). Brand **assets** specifically resolve
like this:

```
ClinicBrand (tenant data, via the port)
   ├─ colors.primary / colors.accent ─▶ generator ─▶ inline --color-* + data-clinic-theme  (Theme.md §12.4)
   ├─ logo.full / logo.mark           ─▶ shell reads via useClinicBrand()                   (asset object)
   ├─ faviconUrl                       ─▶ applyClinicBrand() updates <link rel="icon">       (§7.5)
   ├─ loaderUrl                        ─▶ brand splash while the app boots                    (§7.5)
   ├─ login.backgroundUrl / tagline    ─▶ unauthenticated entry point                         (assets/text)
   ├─ illustrations (record)           ─▶ per-clinic empty/onboarding art                     (Illustration §5.3)
   └─ document.headerLogoUrl / …       ─▶ PDF / prescription / invoice branding               (§7.3)
```

- **Colors are tokens, assets are URLs.** A clinic re-maps **only** `--color-primary*`/`--color-accent*`
  semantics (everything else carries cross-clinic meaning and is never re-branded —
  [Theme.md §12.4 rules 1–4](../design-system/Theme.md)); **assets** (logos, favicon, splash, document
  headers) are addressed by **stable logical keys / brand-object fields**, so the physical file can be a
  per-tenant CDN bucket with no edit ([assets.ts](../../src/shared/config/assets.ts)).
- **Resolved via the Asset Registry + theme engine.** Served/white-labellable brand artwork goes through
  `assetUrl(...)` (or the brand object); the **only** place a served URL is built is the registry, with
  the CDN base from `VITE_ASSET_BASE_URL` ([§7.6](#76-the-cdn-indirection)).
- **The validator is the gate.** A clinic brand whose `on-primary`/`on-accent` fails AA is rejected
  **before it paints** ([AccessibilityTheme.md Part 10](../theme-engine/AccessibilityTheme.md)) — brand
  customization can never break contrast.
- **Cross-link, don't duplicate:** the _mechanism_ (port, generator, persistence, the load pipeline
  mermaid) is fully documented in [ClinicBranding.md](../theme-engine/ClinicBranding.md); the _CSS hook_
  in [Theme.md §12.4](../design-system/Theme.md). This doc only says **which brand assets exist and how
  they're used**.

## 7.5 Favicons / social-preview / splash (in `public/`)

A few brand assets are referenced by the **HTML document and platforms**, not imported by code — they
live in **`public/`** (served verbatim, not hashed) so their paths are stable:

| Asset                      | Lives in                                  | Purpose                                                                                                          |
| -------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Favicon(s)**             | `public/` (`favicon.svg`/ico, sized PNGs) | Browser tab / bookmark; **clinic favicon** swapped at runtime via `ClinicBrand.faviconUrl` → `<link rel="icon">` |
| **Social preview**         | `public/` (Open Graph / Twitter image)    | Link unfurls; ClinicOS default, 1200×630, mark-forward                                                           |
| **App splash / loader**    | `public/` (+ `ClinicBrand.loaderUrl`)     | First paint while the app boots; clinic splash via the brand object                                              |
| **Web-app manifest icons** | `public/` (PWA manifest)                  | Installed-app icon set                                                                                           |

- **ClinicOS favicons/social/splash ship as fixed files in `public/`**; the **clinic** equivalents are
  swapped at runtime from the brand object (`faviconUrl`, `loaderUrl`) by `applyClinicBrand`
  ([ClinicBranding.md Part 6](../theme-engine/ClinicBranding.md)) — again, **no source change**.
- These are derived from the **mark** ([§7.1](#71-two-brands-clinicos-product-vs-clinic-tenant)) at the
  required sizes; see [OptimizationGuide.md](./OptimizationGuide.md) for format/size budgets (SVG favicon
  - minimal PNG fallbacks).

## 7.6 The CDN indirection

All **served** brand assets are addressed by a **stable logical key** through the registry, and the URL
is built **only** by `assetUrl(key)` — base = `VITE_ASSET_BASE_URL` (a CDN origin like
`https://cdn.clinicos.app`) when set, else the app base path
([assets.ts](../../src/shared/config/assets.ts) · [EnvironmentGuide.md §2](../architecture/EnvironmentGuide.md)).
That single indirection is what lets brand artwork move local `public/` → CDN → per-tenant bucket with
**zero code edits**. Full caching/CDN strategy: [OptimizationGuide.md](./OptimizationGuide.md).

---

## 7.7 Brand usage rules (clear space · min size · do/don't)

These apply to **both** the ClinicOS mark and any clinic logo rendered in-app.

### Clear space

- Maintain protected clear space around the logo equal to the **height of the mark's core glyph** (or
  ≈ the cap-height of the wordmark) on all sides. Express it with **spacing tokens**
  ([Spacing.md](../design-system/Spacing.md)) — never ad-hoc pixels.
- Nothing (text, icon, edge, image) intrudes into the clear space.

### Minimum size

- **Wordmark** stays legible at ≥ its documented min width; below that, switch to the **mark**
  (`brand.logoMark`).
- **Mark / favicon** has a hard minimum (favicon 16px floor); below it, simplify to the single-glyph mono
  ([§7.2](#72-logo-variants--monochrome--light--dark)).
- Logos are **vector (SVG)** so they scale crisply ([OptimizationGuide.md](./OptimizationGuide.md)).

### Do

- ✅ Use the **correct variant for the surface/theme** (light/dark/mono — [§7.2](#72-logo-variants--monochrome--light--dark)).
- ✅ Resolve every brand color through **tokens** (`--color-primary*`/`--color-accent*`).
- ✅ Serve via the **registry / brand object** so it's CDN-ready and white-labellable.
- ✅ Keep clinic logos in their **as-supplied** proportions and colors.

### Don't

- 🚫 Recolor a logo with a **hardcoded hex** or a primitive ramp value (tier violation —
  [design-system/README.md](../design-system/README.md)).
- 🚫 **Mirror** the logo under RTL — logos are **never** mirrored
  ([IllustrationGuidelines §5.5](./IllustrationGuidelines.md)).
- 🚫 Stretch, skew, rotate, add shadows, or place the logo on a low-contrast/busy background.
- 🚫 Bake **localizable text** into a brand image, or substitute the `emergency` family into brand art.
- 🚫 Hardcode a logo path in a component — go through `assetUrl(...)` / `useClinicBrand()`.

### Decision Contract — brand assets through tokens + the registry/port

| Field            | Summary                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**          | A multi-tenant healthcare SaaS must re-skin per clinic (logo, colors, favicon, documents) without a redeploy, and never leak raw hex.         |
| **Benefits**     | One brand object re-skins shell + documents + favicon/splash; colors stay AA-validated tokens; assets are CDN-ready and stable-keyed.         |
| **Trade-offs**   | Two brand tiers + variants (light/dark/mono) is more assets to produce — the cost of looking right on every theme, surface, and print.        |
| **Alternatives** | (a) One logo, no variants — breaks on dark/print. (b) Checked-in CSS per clinic — doesn't scale, needs a deploy (design-system example only). |
| **Enterprise**   | White-label is first-class: the port is the platform-team seam, the validator is the compliance gate, the registry is the CDN seam.           |

---

## Cross-references

- **White-label runtime (port, generator, persistence, pipeline):** [ClinicBranding.md](../theme-engine/ClinicBranding.md)
- **White-label CSS hook (`data-clinic-theme`):** [Theme.md §12.4](../design-system/Theme.md)
- **Served-URL construction + CDN base:** [Asset Registry `assets.ts`](../../src/shared/config/assets.ts) ·
  `VITE_ASSET_BASE_URL` in [EnvironmentGuide.md](../architecture/EnvironmentGuide.md)
- **Color tokens / contrast gate:** [ColorSystem.md](../design-system/ColorSystem.md) ·
  [AccessibilityTheme.md](../theme-engine/AccessibilityTheme.md)
- **Logos in avatars / no-mirror rule:** [IllustrationGuidelines.md](./IllustrationGuidelines.md)
- **Formats, sizes & the performance budget:** [OptimizationGuide.md](./OptimizationGuide.md)
- **Source folders & per-folder contract:** [src/assets/README.md](../../src/assets/README.md) · AssetArchitecture.md

---

_Asset System · Part 7 · Brand assets · two brands, three variants, token colors, white-label via the
registry + port with **no source change** · runtime/CSS-hook defer to the theme engine & design system ·
2026-06-30._
