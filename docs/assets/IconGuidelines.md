# Icon Guidelines — Part 3: Icon Architecture

> **The Icon Registry is the single source of truth for every icon in ClinicOS.** Feature code never
> imports `lucide-react` directly; it references a named, categorised concept from the registry and
> renders it through the design-system `<Icon>` wrapper. This document is the **authoring + governance**
> canon for that system.
>
> Reasoning ("why one library, why `currentColor`, why pair icon + word") lives in
> **[Frontend-Bible.md §6](../Frontend-Bible.md#6-iconography-imagery--illustration)** — this doc does
> not re-derive it. Token values live in **[design-system/DesignGuidelines.md §10](../design-system/DesignGuidelines.md)**
> and **[Theme.md](../design-system/Theme.md)**.
>
> **Source of truth:** [`src/shared/design-system/icons/registry.ts`](../../src/shared/design-system/icons/registry.ts) ·
> [`src/shared/design-system/components/icon/Icon.tsx`](../../src/shared/design-system/components/icon/Icon.tsx)
> **Siblings:** [SVGStandards.md](./SVGStandards.md) (Part 4) · [NamingStandards.md](./NamingStandards.md) ·
> [OptimizationGuide.md](./OptimizationGuide.md)
> **Registered in:** [PROJECT_BRAIN.md §32 Asset Registry](../brain/PROJECT_BRAIN.md) ·
> [architecture/AI_RULES.md](../architecture/AI_RULES.md) (Asset Registry trigger)

---

## 1. The model — Registry → `<Icon>` wrapper

Two files, two jobs. Neither feature code nor any other layer reaches past them.

```
                  ┌──────────────────────────────────────────────┐
   lucide-react   │  icons/registry.ts  (THE source of truth)    │
   (vendor) ─────▶│  semantic camelCase key → glyph component     │
                  │  icons.medical.consultation = Stethoscope     │
                  └───────────────────────┬──────────────────────┘
                                          │ icons.<category>.<concept>
                                          ▼
                  ┌──────────────────────────────────────────────┐
   tokens ───────▶│  components/icon/Icon.tsx  (the wrapper)      │
   (--icon-*)     │  size token + --icon-stroke + currentColor    │
                  │  + a11y (aria-label vs aria-hidden)           │
                  └───────────────────────┬──────────────────────┘
                                          ▼
                              Feature code (modules/*)
                       <Icon icon={icons.medical.consultation} … />
```

- **`registry.ts`** decides _which glyph_ represents a concept. It is the **only** file that imports
  `lucide-react`. Categories are closed maps (`satisfies Record<string, LucideIcon>`) so a typo or a
  removed glyph fails the build.
- **`Icon.tsx`** decides _how every glyph renders_: size from the `--icon-size-*` scale, stroke from
  `--icon-stroke`, colour from `currentColor`, and the decorative-vs-meaningful a11y contract.

> **Decision Contract — Registry over direct imports**
>
> | Facet                  | Position                                                                                                                                                                                                                                                                                               |
> | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | **Why**                | Decouple the product from the icon vendor and guarantee exactly one icon per concept across the whole UI. Direct `lucide-react` imports scattered through features make a vendor swap a project-wide refactor and let two screens drift to two different "delete" glyphs.                              |
> | **Benefits**           | **Vendor independence** — swap `lucide-react` for a custom pack (or a sprite, or an internal medical set) by editing **one file**; feature code is untouched. One concept → one glyph, enforced. Theming + a11y centralised in the wrapper. Closed-map typing turns icon mistakes into compile errors. |
> | **Trade-offs**         | One indirection hop and a small authoring step (register the glyph before use). A concept that genuinely needs a one-off glyph still goes through the registry — by design.                                                                                                                            |
> | **Alternatives**       | (a) Direct `lucide-react` imports per feature — rejected: vendor lock-in + visual drift. (b) An SVG sprite sheet only — rejected for the _primary_ set: loses tree-shaking and per-icon typing; reserved for brand marks (see [SVGStandards.md](./SVGStandards.md)).                                   |
> | **Future scalability** | Categories are the extension point: add a category or a custom pack behind the same `icons.*` surface; consumers never change (see [§8](#8-future-custom-icon-packs)).                                                                                                                                 |
> | **Enterprise**         | Centralised licensing/audit (one vendor surface), deterministic bundle (tree-shaken named imports), and white-label icon packs per tenant without touching features.                                                                                                                                   |

---

## 2. The categories — what belongs in each

The registry groups glyphs into seven semantic categories. The category answers _"what kind of thing
is this icon about?"_, not _"what does it look like?"_. Pick the category by **intent**.

| Category          | Export               | Belongs here                                                                                                 | Examples (key → glyph)                                                                                                                  |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **medical**       | `medicalIcons`       | Clinical / healthcare concepts. **Universal medical metaphors only** (see [§7](#7-medical-icon-guidelines)). | `consultation`→Stethoscope · `prescription`→Pill · `injection`→Syringe · `vitals`→HeartPulse · `lab`→Microscope · `emergency`→Ambulance |
| **navigation**    | `navigationIcons`    | Top-level destinations + directional movement. **One icon per destination** (the patient journey).           | `dashboard`→LayoutDashboard · `patients`→Users · `appointments`→CalendarDays · `queue`→Hourglass · `next`→ChevronRight                  |
| **action**        | `actionIcons`        | Generic verbs reused on every screen.                                                                        | `add`→Plus · `edit`→Pencil · `delete`→Trash2 · `search`→Search · `save`→Save · `confirm`→Check                                          |
| **status**        | `statusIcons`        | Lifecycle / state of an entity. **Always paired with text** (never colour/icon alone).                       | `success`→CheckCircle2 · `error`→XCircle · `pending`→Clock · `scheduled`→CalendarClock · `noShow`→UserX                                 |
| **alert**         | `alertIcons`         | Urgent attention surfaces only. Reserve for genuine escalation.                                              | `warning`→AlertTriangle · `critical`→AlertOctagon · `emergency`→Siren · `security`→ShieldAlert                                          |
| **analytics**     | `analyticsIcons`     | Charts + trend indicators.                                                                                   | `bar`→BarChart3 · `line`→LineChart · `pie`→PieChart · `trendUp`→TrendingUp · `trendDown`→TrendingDown                                   |
| **accessibility** | `accessibilityIcons` | A11y + theme controls.                                                                                       | `contrast`→Contrast · `largeText`→Type · `language`→Languages · `light`→Sun · `dark`→Moon                                               |

**Notes on boundaries (resolve overlaps consistently):**

- The same glyph may appear under two intents (e.g. `Stethoscope` is both `medical.consultation` and
  `navigation.consultation`; `Hourglass` is `navigation.queue` and `status.waiting`). **Reference the key
  that matches the intent at the call site** — a sidebar link uses `navigation.*`, a state badge uses
  `status.*`. This is deliberate: the _concept_ is one icon, the _category_ records why it is used there.
- `status.warning` (lifecycle of a record) and `alert.warning` (an attention surface) are intentionally
  separate concepts that share `AlertTriangle`. Choose by surface, not by glyph.

---

## 3. Consumption pattern (TSX)

Reference `icons.<category>.<concept>` and pass it to `<Icon>`. **Never** import the glyph yourself.

```tsx
import { Icon } from '@shared/design-system/components/icon/Icon';
import { icons } from '@shared/design-system/icons/registry';
import { useTranslation } from 'react-i18next';

function ConsultationHeader() {
  const { t } = useTranslation('consultation');
  return (
    <h2 className="text-title flex items-center gap-2">
      {/* Meaningful: localized accessible name from an i18n key */}
      <Icon icon={icons.medical.consultation} aria-label={t('header.iconLabel')} size="md" />
      {t('header.title')}
    </h2>
  );
}
```

**Decorative beside a visible word** (the common case — the text already names the thing, so the icon
must be hidden from assistive tech to avoid double announcement):

```tsx
<button type="button" className="inline-flex items-center gap-2">
  <Icon icon={icons.action.add} aria-hidden /> {/* decorative: hidden */}
  {t('patients.addPatient')} {/* the accessible name */}
</button>
```

**Icon-only control** (no visible label → the icon MUST carry the name):

```tsx
<IconButton aria-label={t('common.search')}>
  <Icon icon={icons.action.search} aria-hidden /> {/* the button owns the label */}
</IconButton>
```

> The `<Icon>` wrapper is decorative **by default** (`aria-hidden`). Passing a non-empty `aria-label`
> flips it to `role="img"` with that accessible name. There is **no** hardcoded default label.

### ❌ Never do this in feature code

```tsx
import { Trash2 } from 'lucide-react'; // ❌ direct vendor import — banned (Rule R1)
<Trash2 className="size-6 text-red-500" />; // ❌ raw glyph, hardcoded color, hardcoded size
```

```tsx
<svg width="24" height="24">
  …
</svg> // ❌ inline raw SVG — see SVGStandards.md
```

---

## 4. Theme-aware icons (`currentColor` + tokens)

Icons are monochrome and inherit colour from text. **Never hardcode an icon colour.**

- Lucide glyphs render `fill="none" stroke="currentColor"`. The wrapper sets
  `strokeWidth="var(--icon-stroke)"` (= `2`) so every icon shares one weight.
- Colour comes from the surrounding text colour, set via a **semantic token utility** — so light /
  dark / high-contrast re-theme automatically with zero icon changes.

```tsx
{
  /* Colour follows the text token — re-themes for free. */
}
<span className="inline-flex items-center gap-1 text-danger">
  <Icon icon={icons.status.error} aria-hidden />
  {t('form.errors.required')}
</span>;
```

```tsx
{
  /* Inherits the button's foreground token; no icon-level color anywhere. */
}
<Button variant="primary">
  <Icon icon={icons.action.save} aria-hidden />
  {t('common.save')}
</Button>;
```

Only ever set colour through a token utility (`text-primary`, `text-danger`, `text-muted`, …). See
[ColorSystem.md](../design-system/ColorSystem.md) and [Theme.md](../design-system/Theme.md).

---

## 5. Sizing (icon-size tokens via the wrapper)

Size is a **token**, applied by the wrapper via the `size` prop — never a hardcoded `width`/`height`.

| `size` prop      | Wrapper class | Token            | px  | Use                    |
| ---------------- | ------------- | ---------------- | --- | ---------------------- |
| `xs`             | `size-4`      | `--icon-size-xs` | 16  | Inline with small text |
| `sm`             | `size-5`      | `--icon-size-sm` | 20  | Dense UI, table rows   |
| `md` _(default)_ | `size-6`      | `--icon-size-md` | 24  | Buttons, nav, body     |
| `lg`             | `size-8`      | `--icon-size-lg` | 32  | Emphasis               |
| `xl`             | `size-10`     | `--icon-size-xl` | 40  | Empty states, hero     |

```tsx
<Icon icon={icons.navigation.dashboard} size="sm" aria-hidden />   {/* dense sidebar */}
<Icon icon={icons.medical.emergency} size="xl" aria-label={t('triage.emergency')} />  {/* hero */}
```

The wrapper also applies `shrink-0` so icons never squash inside flex rows. Do **not** pass a raw
`size`/`width`/`height` (the prop is `Omit<…, 'size'>` and a raw width would defeat tokenisation).

---

## 6. Accessibility (decorative vs meaningful)

The wrapper enforces exactly two states — pick deliberately at every call site:

| The icon is…   | Pass                        | Wrapper renders                | When                                            |
| -------------- | --------------------------- | ------------------------------ | ----------------------------------------------- |
| **Decorative** | nothing (omit `aria-label`) | `aria-hidden="true"`           | A visible text label is already next to it.     |
| **Meaningful** | `aria-label={t('…')}`       | `role="img"` + accessible name | Icon-only control / icon is the only signifier. |

**Rules (a11y §9, Bible §6.1):**

1. **Never icon-alone for meaning.** Primary actions and statuses pair **icon + word**
   (elderly / low-literacy users). An icon-only control must have an `aria-label` _and_ a visible
   tooltip/affordance.
2. **Never colour/icon alone for status.** Status = colour **+** icon **+** text. A red `XCircle`
   with no word is not an error message.
3. **Meaningful labels come from i18n keys**, never raw strings — `aria-label={t('…')}` so the name
   localizes (see [Localization §10](#)).
4. **Decorative icons must be hidden** so screen readers don't announce the glyph beside the word it
   duplicates.

---

## 7. Medical icon guidelines

Clinical icons are read under time pressure by users across literacy levels and cultures. They must be
**universal and instantly recognisable**.

- **Use universal medical metaphors** — stethoscope = consultation, pill = prescription, syringe =
  injection, heart-pulse = vitals, microscope = lab. These read the same worldwide.
- **No culturally-specific metaphors.** Avoid symbols whose meaning is regional, religious, or
  idiomatic (e.g. a specific cross variant for "first aid", a gesture, a region-specific currency for
  billing). What is obvious in one locale can be meaningless or wrong in another — see
  **Localization §10**.
- **Pair with the localized word** (§6 rule 1) — the icon reinforces, the text carries the meaning.
- **One concept, one glyph.** `consultation` is `Stethoscope` everywhere; don't introduce a second
  "consultation" glyph for a new screen — reuse the registry key.
- New clinical concepts get a **new semantic key** in `medicalIcons` (reviewed for universality),
  not an ad-hoc import.

---

## 8. Future custom icon packs (the extension point)

Categories are the seam. The public surface is always `icons.<category>.<concept>`, so the vendor
behind a category can change without touching a single feature.

**Swap the whole library** — edit only `registry.ts`:

```ts
// Replace the lucide glyph with a custom-pack component; consumers are unchanged.
import { Stethoscope as ClinicStethoscope } from '@clinicos/icon-pack';

export const medicalIcons = {
  consultation: ClinicStethoscope, // ← only this file changes
  // …
} as const satisfies Record<string, LucideIcon>;
```

> Any replacement must satisfy the `LucideIcon` contract (accepts `size`/`strokeWidth`/`className`,
> renders `stroke="currentColor"`). A non-conforming pack is adapted to that shape **inside** the
> registry — never at the call site.

**Add a new category** (e.g. a tenant-specific `branding` pack):

```ts
export const brandingIcons = {
  logoMark: ClinicLogoMark,
} as const satisfies Record<string, LucideIcon>;

export const icons = {
  medical: medicalIcons,
  // …existing categories…
  branding: brandingIcons, // ← new extension point; `IconCategory` widens automatically
} as const;
```

`IconCategory = keyof typeof icons` widens automatically, keeping the closed-map type safety. For
custom **SVG** sources (brand marks, sprites) and how they are optimized and imported, see
[SVGStandards.md](./SVGStandards.md).

---

## 9. RULES (enforced)

| #      | Rule                                                                                                                | Why                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **R1** | **Never import `lucide-react` (or any icon vendor) directly in feature code.** Only `registry.ts` may.              | Vendor independence; one swap point.       |
| **R2** | **One icon per concept.** Reuse the registry key; never introduce a second glyph for the same idea.                 | Visual consistency.                        |
| **R3** | **Always render through `<Icon>`.** No raw `<LucideGlyph>` and no inline `<svg>` in components.                     | Centralised size / stroke / colour / a11y. |
| **R4** | **Never hardcode icon colour, size, or stroke.** Colour = text token; size = `size` prop; stroke = `--icon-stroke`. | Theming + tokenisation.                    |
| **R5** | **Never icon-alone for meaning; never colour/icon-alone for status.** Pair icon + localized word.                   | Accessibility (§6).                        |
| **R6** | **Meaningful icons get a localized `aria-label` from an i18n key**; decorative icons are `aria-hidden`.             | Screen-reader correctness + i18n.          |
| **R7** | **New icons are registered in the right category** (universal metaphors for `medical`), not imported ad-hoc.        | Governance + the swap guarantee.           |

> ESLint should ban `lucide-react` imports outside `src/shared/design-system/icons/**`
> (`no-restricted-imports`) to enforce **R1** mechanically.

---

**See also:** [SVGStandards.md](./SVGStandards.md) (SVG sources, optimization, sprites) ·
[NamingStandards.md](./NamingStandards.md) (asset + icon-key naming) ·
[design-system/DesignGuidelines.md §10](../design-system/DesignGuidelines.md) (token table) ·
[Frontend-Bible.md §6](../Frontend-Bible.md#6-iconography-imagery--illustration) (rationale).
