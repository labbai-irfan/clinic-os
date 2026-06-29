# 🖼️ Illustration & Avatar Guidelines

> **Parts 5 & 6 — the illustration system and the avatar system.** These are the calm, on-palette,
> reduced-motion-safe graphics that make ClinicOS feel human to stressed, low-literacy, non-English
> healthcare users — without ever becoming the thing that breaks a screen, a language, or a brand.
>
> **This doc governs the artwork contract**, not the registry mechanics: where illustrations and avatars
> live, how they're served, what colors they may use, how they degrade, and how they stay accessible and
> localizable. The **runtime indirection** (the logical key → CDN-aware URL) is the Asset Registry —
> [`src/shared/config/assets.ts`](../../src/shared/config/assets.ts), governed by
> **[OptimizationGuide.md](./OptimizationGuide.md)** and **AssetArchitecture.md** (the per-folder
> contract). The **palette** is the design system's, never re-derived here.
>
> Siblings: **[BrandGuidelines.md](./BrandGuidelines.md)** · **[OptimizationGuide.md](./OptimizationGuide.md)** ·
> source contract **[src/assets/README.md](../../src/assets/README.md)**.
> Canon it defers to: [design-system/ColorSystem.md](../design-system/ColorSystem.md) ·
> [design-system/Theme.md](../design-system/Theme.md) ·
> [design-system/Motion.md](../design-system/Motion.md) ·
> [theme-engine/ClinicBranding.md](../theme-engine/ClinicBranding.md) ·
> [theme-engine/AccessibilityTheme.md](../theme-engine/AccessibilityTheme.md). The product law it serves:
> **[Brain.md](../Brain.md) — "One Screen · One Primary Task · One Primary CTA."**

---

## The one rule that governs every illustration

> **An illustration is a companion to a message, never the message.** Every illustration ships paired
> with **a clear text headline + one supporting line + exactly one CTA** — the screen still obeys
> **One Screen / One Primary Task / One Primary CTA** ([Brain.md §Law 1](../Brain.md)). The art carries
> _tone_; the **text** carries _meaning_ and the **button** carries _the next step_. If you removed the
> illustration, the screen must still be fully understandable and operable. That is the test.

Three corollaries, each enforced below:

1. **Calm, healthcare-friendly, on-palette** — token colors only ([§5.2](#52-the-color-contract--token-colors-only)).
2. **No baked-in localizable text** — words live in the UI layer, never in the SVG ([§5.5](#55-no-baked-in-text--localization-part-10)).
3. **Optional + reduced-motion-safe** — a missing or motion-suppressed illustration never blocks the task ([§5.4](#54-optional-and-reduced-motion-safe)).

---

# Part 5 — The illustration system

## 5.1 The illustration catalog

Each illustration `type` maps to a recurring **moment** in the product. They are calm, generous in
whitespace, and read instantly at a glance. The foundational slots are seeded in the
[Asset Registry](../../src/shared/config/assets.ts) (`illustration.*`) and grow **additively** as
artwork is produced.

| Type             | Moment it serves                                | Registry key (seeded ones)  | Pairing (headline + CTA)                         |
| ---------------- | ----------------------------------------------- | --------------------------- | ------------------------------------------------ |
| `empty`          | A list/queue/search has no items **yet**        | `illustration.emptyGeneric` | "No patients in the queue" · _Add patient_       |
| `no-data`        | A report/range legitimately has nothing to show | (additive)                  | "No visits in this range" · _Change dates_       |
| `error`          | A recoverable failure (load/save failed)        | `illustration.errorGeneric` | "Couldn't load this" · _Try again_               |
| `loading`        | A long async wait (prefer **skeletons** first)  | (additive)                  | "Preparing your dashboard…" · _(no CTA)_         |
| `offline`        | Network lost / degraded                         | `illustration.offline`      | "You're offline" · _Retry_                       |
| `maintenance`    | Planned downtime / read-only window             | `illustration.maintenance`  | "Back shortly" · _(status only)_                 |
| `success`        | A flow completed (booked, saved, sent)          | (additive)                  | "Appointment booked" · _Done / View_             |
| `welcome`        | First sight of a feature / dashboard            | `illustration.welcome`      | "Welcome to ClinicOS" · _Get started_            |
| `onboarding`     | A guided first-run step                         | (additive)                  | "Add your first doctor" · _Continue_             |
| `authentication` | Login / verify / set-password screens           | (additive)                  | "Sign in to continue" · _(form is the CTA)_      |
| `medical`        | Clinical context art (vitals, rx, lab, triage)  | (additive)                  | context-specific · _(supports, never instructs)_ |

> **Loading specifically:** prefer the design system's **skeletons** (`--color-skeleton-*`,
> [ColorSystem §3.13](../design-system/ColorSystem.md)) over a loading _illustration_ — skeletons match
> the final layout with no shift and stop shimmering under reduced motion. A loading illustration is for
> **long, opaque** waits (first boot, heavy report), never for a row that's about to appear.

### Decision Contract — one illustration per moment, paired with text + one CTA

| Field            | Summary                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**          | Stressed, non-technical users need a calm, unmistakable cue for _what happened_ and _what to do next_ — and exactly one next step.      |
| **Benefits**     | Consistent tone across every empty/error state; the screen stays operable text-only; localization and theming are free (no baked text). |
| **Trade-offs**   | A fixed catalog is less "expressive" than bespoke art per screen — intentional: predictability beats novelty in a clinical tool.        |
| **Alternatives** | (a) Bespoke art per screen — inconsistent, unlocalizable. (b) No art, text-only — accessible but cold; we keep art **optional** on top. |
| **Enterprise**   | One catalog is auditable, white-labellable, and CDN-served; per-clinic overrides flow through the registry with **no source change**.   |

## 5.2 The color contract — token colors only

Illustrations are **calm and muted by default** — the same intent as the palette
([ColorSystem](../design-system/ColorSystem.md)). They use the **brand and neutral families**
(rose, sand, teal, stone) and never the vivid `emergency` family (life-safety is a UI-chrome concern,
not artwork).

- **SVG sources reference token colors, not raw hex.** Author shapes with `fill="currentColor"` or with
  CSS-var fills (`fill: var(--color-primary)`, `var(--color-accent)`, `var(--color-surface-raised)`,
  `var(--color-border)`, `var(--color-text-subtle)`) so a single illustration **re-themes automatically**
  under light / dark / high-contrast and under a clinic's white-label brand — exactly like icons
  ([src/assets/README.md](../../src/assets/README.md): "icons use `currentColor`").
- **Why this matters for white-label:** because the art consumes `--color-primary*`/`--color-accent*`
  (never `#e87d7d`), Northside's teal brand re-skins the welcome art with **zero edits** — the same
  discipline the theme engine enforces for components
  ([Theme.md §12.4](../design-system/Theme.md) · [ClinicBranding.md](../theme-engine/ClinicBranding.md)).
- **Palette anchors** (for reference only — author with the _token_, not the hex): rose `#E87D7D`,
  sand `#F8F3F0`, teal `#6B8E8E`, stone `#827473` ([ColorSystem §3.1](../design-system/ColorSystem.md)).
- **Contrast:** any text-like or icon-like detail inside art that conveys meaning must clear the same AA
  floor as the UI; decorative shapes need only the non-text 3:1 where they carry state. Prefer to keep
  **all meaning in the UI text**, so the art is purely decorative and contrast-exempt.

> 🚫 **Never** a hardcoded hex, a primitive ramp value, or the `emergency` family in an illustration.
> ✅ **Always** a semantic token (`var(--color-*)`) or `currentColor`.

## 5.3 Where illustrations live (source vs served)

ClinicOS has **two asset tiers** ([assets.ts header](../../src/shared/config/assets.ts)). Illustrations
can be either, by role:

| Tier             | Location                                           | Use for                                                        | Addressed by                                |
| ---------------- | -------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| **SOURCE**       | `src/assets/illustrations/<type>/` (SVG sources)   | Small, universal, theme-via-`currentColor`, ship in the bundle | `import art from '@assets/illustrations/…'` |
| **SERVED / CDN** | `public/assets/illustrations/…` (via the Registry) | Large or **white-labellable** art a clinic can override        | `assetUrl('illustration.welcome')`          |

- **Folder convention** (source): `src/assets/illustrations/<type>/<name>.svg`, kebab-case files, one
  optimized SVG per variant ([src/assets/README.md](../../src/assets/README.md) ·
  [OptimizationGuide.md](./OptimizationGuide.md) for the budget).
- **Registry convention** (served): logical key `illustration.<camelCaseName>` → kebab path under
  `illustrations/`. **The registry is the only place a served URL is built** — so the physical home
  (local `public/` ↔ CDN ↔ per-tenant bucket) can move with no code edit.
- **Per-clinic illustrations** ride the white-label model: a clinic's `ClinicBrand.illustrations` record
  supplies empty-state / onboarding art per tenant, resolved through the branding port — **no source
  change** ([ClinicBranding.md Part 6](../theme-engine/ClinicBranding.md)).

> **Rule of thumb:** if it must re-theme but never changes per clinic → **source SVG** with
> `currentColor`. If a clinic may swap it → **served via the registry / brand object**.

## 5.4 Optional and reduced-motion-safe

- **Optional.** An illustration is an _enhancement_. If the asset is missing, slow, or fails to load, the
  screen renders **text + CTA** alone and stays fully usable. Treat the `<img>`/inline SVG as
  progressive: it must never gate the headline or the button. (See the avatar fallback chain in
  [§6.4](#64-the-fallback-chain) for the analogous image-failure strategy.)
- **Reduced-motion-safe.** Animated illustrations (Lottie/JSON, [OptimizationGuide §formats](./OptimizationGuide.md))
  are **gated at the consumer** on the effective reduced-motion state — `useReducedMotion()` /
  `data-motion` ([Motion.md §reduced-motion](../design-system/Motion.md) ·
  [AccessibilityTheme.md Part 10](../theme-engine/AccessibilityTheme.md)). Under reduced motion the
  animation **does not play**; it freezes on a meaningful first/last frame (a static SVG fallback is
  preferred). Motion never conveys information a still frame doesn't.
- **No autoplay loops that distract.** A clinical tool is not a marketing page. Looping motion is
  reserved for genuine "in progress" affordances and always respects reduced motion.

## 5.5 No baked-in text — localization (Part 10)

> **NEVER bake localizable text into artwork.** The headline, body, and CTA label are React + i18n
> strings rendered _over/around_ the illustration — never letters drawn inside the SVG. This is the
> single hardest rule and the source contract repeats it
> ([src/assets/README.md](../../src/assets/README.md): "never bake localizable text into artwork").

ClinicOS ships **en / hi / mr / ur**, and **Urdu is RTL**
([AccessibilityTheme.md Part 11](../theme-engine/AccessibilityTheme.md)). Therefore:

- **Universal medical symbols** — use language-neutral, internationally legible marks (cross/plus for
  care, heart for vitals, pill/Rx, stethoscope, calendar). Avoid culture-specific or text-bearing icons.
- **Language-safe graphics** — no embedded words, no abbreviations that only parse in English, no signage
  drawn into the scene. If a label is needed, it's UI text.
- **RTL mirroring rules** — direction is i18n's source of truth; the engine only mirrors `dir`
  ([AccessibilityTheme.md Part 11](../theme-engine/AccessibilityTheme.md)). For artwork:

  | Element                                             | Under RTL (`dir="rtl"`) | Why                                              |
  | --------------------------------------------------- | ----------------------- | ------------------------------------------------ |
  | **Directional art** (arrows, progress, →next, flow) | **MIRROR**              | "forward/next" follows reading direction         |
  | **Scene layout / inline-positioned art**            | mirror via logical CSS  | layout flips with `margin-inline`, not transform |
  | **Medical symbols** (cross, heart, Rx, ECG trace)   | **NEVER mirror**        | a mirrored medical symbol is wrong/misleading    |
  | **Text** (there should be none in art)              | **NEVER mirror**        | it's UI text and i18n already handles it         |
  | **Logos / brand marks**                             | **NEVER mirror**        | a mirrored logo is a brand violation             |

  Mirror _directional_ meaning; **never** mirror a symbol whose orientation is its meaning. Implement the
  flip with **logical CSS** (the codebase forbids physical direction props) so one `dir` flip mirrors
  layout with no re-render ([AccessibilityTheme.md Part 11](../theme-engine/AccessibilityTheme.md)).

## 5.6 Accessibility (a11y)

- **Decorative when redundant.** When the illustration only reinforces adjacent text (the usual case),
  mark it **decorative** — inline SVG `aria-hidden="true"`, or `<img alt="">` (empty alt) — so screen
  readers skip it and read the real message once.
- **Meaningful only when it carries unique information** (rare). Then provide a concise `alt` derived from
  **data/context**, not a generic "illustration." Prefer to move that information into visible text and
  keep the art decorative.
- **Never color-alone.** Art may tint with status color, but the _state_ is always also conveyed by the
  icon + text the design system mandates ([ColorSystem "Never color alone"](../design-system/ColorSystem.md)).
- **Reduced motion** is honored (above); **focus** is never placed on decorative art.

---

# Part 6 — The avatar system

Avatars identify the **people and organizations** in ClinicOS — doctors, patients, receptionists,
admins, clinic owners, and the clinic/organization itself. They are small, square, theme-aware, and
**resilient**: a missing image must never leave a broken-image icon next to a patient's name.

## 6.1 Avatar roles & placeholders

| Role                      | Default placeholder (registry / source)                   | Notes                     |
| ------------------------- | --------------------------------------------------------- | ------------------------- |
| `doctor`                  | `avatar.doctor` (`avatars/avatar-doctor.svg`)             | seeded in the registry    |
| `patient`                 | `avatar.patient` (`avatars/avatar-patient.svg`)           | seeded in the registry    |
| `receptionist`            | role placeholder (additive)                               | front-desk staff          |
| `admin`                   | role placeholder (additive)                               | clinic admin              |
| `clinic-owner`            | role placeholder (additive)                               | owner                     |
| `organization` / `clinic` | `avatar.organization` (`avatars/avatar-organization.svg`) | the tenant itself; seeded |

Placeholders are **calm, neutral, token-colored** silhouettes (no photo, no baked text), authored with
`currentColor`/CSS-var fills so they re-theme and re-brand like every other asset
([§5.2](#52-the-color-contract--token-colors-only)).

## 6.2 Initials fallback

When there is **no image** but there **is** a name, render **initials** (1–2 letters derived from the
display name) on a token-colored chip. This is the most informative fallback — it identifies the person
without a photo and stays legible at small sizes.

- Initials chip background and text are **token colors** with an AA-clear pairing; never a random hex.
- Derive initials from the **same data** as the name label, so they always agree with what's on screen.
- Initials are **not** localizable text baked into an asset — they're rendered UI text over a token chip,
  so they respect language and direction (and are exempt from the "no text in art" rule because they are
  _not_ art).

## 6.3 Generated avatars (deterministic, token, color-blind-safe)

When you want visual variety without photos, generate an avatar **deterministically** from a stable
input (user `id`, falling back to name):

- **Deterministic:** the same `id`/name always yields the same avatar — stable across sessions, devices,
  and re-renders. (Hash the stable key → pick from a fixed set.)
- **Token colors only:** background/foreground are chosen from a **fixed, curated token palette**
  (brand + chart families from [ColorSystem](../design-system/ColorSystem.md)), never arbitrary HSL — so
  generated avatars stay on-brand and re-theme. Generated-avatar background patterns may live under
  `src/assets/avatars/` ([src/assets/README.md](../../src/assets/README.md)).
- **Color-blind safe:** the curated set is distinguishable in **hue AND lightness** (the same
  color-blind-safety rule the chart palette follows — [ColorSystem §3.14](../design-system/ColorSystem.md)),
  and identity never depends on color alone: the **initials** ride on top as the primary signal.
- **No PII leakage:** the avatar is derived from non-sensitive identifiers; never encode PHI into a
  generated image.

## 6.4 The fallback chain

Avatars degrade through a strict, ordered chain — each step is a graceful fallback for the one before:

```
1. image            (a real uploaded photo / brand logo)
      ↓ on load error or missing src
2. initials          (1–2 letters from the display name, on a token chip)
      ↓ when there is no usable name
3. generated avatar  (deterministic, token, color-blind-safe — optional middle step)
      ↓ when even an id is absent
4. default placeholder (the role's neutral silhouette from §6.1)
```

- The **`<img>` `onError`** (or a load check) demotes to the next step — a broken-image glyph must
  **never** appear. This is the avatar analogue of "illustrations are optional"
  ([§5.4](#54-optional-and-reduced-motion-safe)).
- The role's **default placeholder is the floor** — there is always _something_ coherent to render.
- For **organizations/clinics**, the chain is: clinic logo → clinic initials → organization placeholder
  (the clinic logo itself flows through the brand object — [BrandGuidelines.md](./BrandGuidelines.md) ·
  [ClinicBranding.md](../theme-engine/ClinicBranding.md)).

### Decision Contract — image → initials → generated → placeholder

| Field            | Summary                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Why**          | A patient's row must always render a coherent identity — a broken image next to a name is unacceptable in a clinical tool.    |
| **Benefits**     | Always something meaningful; initials are the most informative no-photo state; generated avatars add variety on-brand.        |
| **Trade-offs**   | A four-step chain is more logic than a single `<img>` — justified by zero broken images and deterministic, themable identity. |
| **Alternatives** | (a) `<img>` only — broken glyphs, no identity on failure. (b) Random color avatars — off-brand, not color-blind-safe.         |
| **Enterprise**   | Placeholders/generated avatars are token + registry-served, so they re-theme, re-brand, and CDN-cache like every other asset. |

## 6.5 Avatar accessibility

- **Alt text from data.** A _meaningful_ avatar (it's the only thing identifying the person in that
  context) gets `alt` = the person's name from data — e.g. `alt="Dr. Asha Rao"` — never `alt="avatar"`.
- **Decorative when redundant.** When the name label is already adjacent (the usual list/row case), the
  avatar is **decorative**: `aria-hidden`/empty `alt`, so the screen reader reads the name once, not twice.
- **Initials/generated avatars** follow the same rule — decorative beside a visible name, labeled when
  standing alone.
- **Never identity-by-color-alone** — initials (text) are always the primary identifier on generated
  avatars ([§6.3](#63-generated-avatars-deterministic-token-color-blind-safe)).

---

## Cross-references

- **Where artwork physically lives & the per-folder rules:** **AssetArchitecture.md** ·
  [src/assets/README.md](../../src/assets/README.md)
- **How a served/white-label URL is built:** [Asset Registry](../../src/shared/config/assets.ts) ·
  CDN base via `VITE_ASSET_BASE_URL` ([EnvironmentGuide.md](../architecture/EnvironmentGuide.md))
- **Compression, formats, lazy-loading & the performance budget:** [OptimizationGuide.md](./OptimizationGuide.md)
- **Logos, watermarks, white-label brand assets:** [BrandGuidelines.md](./BrandGuidelines.md)
- **Palette / motion / theme:** [ColorSystem.md](../design-system/ColorSystem.md) ·
  [Motion.md](../design-system/Motion.md) · [Theme.md](../design-system/Theme.md)
- **White-label runtime & RTL:** [ClinicBranding.md](../theme-engine/ClinicBranding.md) ·
  [AccessibilityTheme.md](../theme-engine/AccessibilityTheme.md)
- **Product law:** [Brain.md — One Screen / One CTA](../Brain.md)

---

_Asset System · Parts 5 & 6 · Illustration + Avatar guidelines · token-only, localizable-text-free,
reduced-motion-safe, white-label via the registry · palette/theme defer to the design system · 2026-06-30._
