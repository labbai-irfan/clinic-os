# Design Tokens

> Implemented token reference. For the full philosophy and rationale, read
> **[Frontend-Bible.md §3](../Frontend-Bible.md#3-the-token-system)** — this doc lists what shipped
> and how to consume it. Siblings: [README](./README.md) · [ColorSystem](./ColorSystem.md) ·
> [Typography](./Typography.md) · [Spacing](./Spacing.md) · [Elevation](./Elevation.md) ·
> [Motion](./Motion.md) · [Theme](./Theme.md) · [DesignGuidelines](./DesignGuidelines.md).

---

## Part 1 — Design philosophy (summary)

ClinicOS is **Simple · Minimal · Enterprise · Calm · Healthcare-friendly**: a quiet, confident,
token-driven UI that an elderly, low-literacy, or non-English-reading user can operate on the first
try. The healthcare palette is intentionally **calm/muted** — the one exception is `emergency`,
which is deliberately vivid because safety overrides calm. _Every color, size, and space is a token;_
_components consume semantic/component tokens only, never primitives or raw hex/px._

→ **Full rationale (do not re-read here):** [Frontend-Bible.md §1–§2](../Frontend-Bible.md#1-purpose--philosophy).

---

## Part 2 — Token architecture

### The three tiers

| Tier          | Purpose               | May reference      | Example                                  |
| ------------- | --------------------- | ------------------ | ---------------------------------------- |
| 1 — Primitive | raw scale values      | nothing (literals) | `--color-rose-500: #e87d7d`              |
| 2 — Semantic  | intent; themeable     | primitives         | `--color-primary: var(--color-rose-500)` |
| 3 — Component | per-component aliases | semantic only      | `--button-bg: var(--color-primary)`      |

Themes (`themes.css`) re-map **only the semantic tier**. Primitives and component tokens never change
between themes — that is what makes a single `data-theme` swap re-skin the whole app at runtime.

### File layout

```
src/shared/styles/
├─ tokens.css                 # barrel: @import primitives, semantic, components (in order)
├─ tokens/
│  ├─ primitives.css          # Tier 1 — raw values inside :root
│  ├─ semantic.css            # Tier 2 — :root = light default
│  └─ components.css          # Tier 3 — component aliases + keyframes
└─ themes.css                 # Tier 2 overrides: dark / high-contrast / large-text / reduced-motion
```

JS-side mirror for libraries that need numbers/arrays (framer-motion, charts, breakpoints):
`src/shared/theme/tokens.ts` (re-exported from `src/shared/theme/index.ts`). CSS remains the source
of truth for color/space; `tokens.ts` only carries values CSS can't hand to a JS lib.

### Naming rules (Bible §3.5)

- Semantic: `--<category>-<role>-<state?>` → `--color-primary-hover`, `--text-title`.
- Component: `--<component>-<part>-<state?>` → `--button-bg-active`, `--input-border-focus`.
- Categories: `color`, `space`, `radius`, `shadow`/`elevation`, `border-width`, `z`, `duration`,
  `ease`, `font`, `text`, `leading`, `tracking`, `weight`, `icon`, `breakpoint`, `container`, `layout`.
- Raw hex/px/ms appear **only** in primitives. Adding a value = add a primitive, alias it in semantic,
  optionally alias in component. Never hardcode in a component.

---

## Master token registry

Per-category values live in the focused docs; this is the index of every group + its Tailwind surface.

### Primitives (Tier 1)

| Group            | Tokens                                                       | Detail doc                                |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------- |
| Color ramps      | `--color-{rose,sand,teal,stone}-50…900`, functional 50–900   | [ColorSystem](./ColorSystem.md)           |
| Emergency ramp   | `--color-emergency-{50,100,500,600,700}` (vivid)             | [ColorSystem](./ColorSystem.md)           |
| Chart palette    | `--color-chart-1…8` (color-blind-safe categorical)           | [ColorSystem](./ColorSystem.md)           |
| Spacing          | `--space-0…40` (4px base, 8-pt grid)                         | [Spacing](./Spacing.md)                   |
| Radius           | `--radius-{none,sm,md,lg,xl,2xl,full}`                       | [DesignGuidelines](./DesignGuidelines.md) |
| Elevation        | `--shadow-{none,xs,sm,md,lg,xl,inset}`                       | [Elevation](./Elevation.md)               |
| Border / z-index | `--border-width-{0,1,2,4}`, `--z-base…toast`                 | [DesignGuidelines](./DesignGuidelines.md) |
| Motion           | `--duration-*`, `--ease-*`                                   | [Motion](./Motion.md)                     |
| Typography       | `--font-*`, full `--text/leading/weight/tracking-*` scale    | [Typography](./Typography.md)             |
| Layout / grid    | `--breakpoint-*`, `--container-*`, `--grid-*`                | [DesignGuidelines](./DesignGuidelines.md) |
| Icons            | `--icon-size-{xs…xl}`, `--icon-stroke`, `--icon-stroke-bold` | [DesignGuidelines](./DesignGuidelines.md) |

### Semantic (Tier 2)

| Group               | Tokens (intent)                                                          | Detail doc                                |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| Brand / interactive | `--color-primary*`, `--color-accent*`, `--color-on-*`                    | [ColorSystem](./ColorSystem.md)           |
| Surfaces            | `--color-surface*` (incl. sidebar/header/footer/hover/active/selected)   | [ColorSystem](./ColorSystem.md)           |
| Text / lines        | `--color-text*`, `--color-border*`, `--color-divider`, `--color-outline` | [ColorSystem](./ColorSystem.md)           |
| State / selection   | `--color-{hover,pressed,selection-*,disabled-*}`                         | [ColorSystem](./ColorSystem.md)           |
| Skeleton / loading  | `--color-skeleton-*`, `--color-loading`                                  | [ColorSystem](./ColorSystem.md)           |
| Functional + hovers | `--color-{success,warning,danger,info}` + `-hover`/`-subtle`             | [ColorSystem](./ColorSystem.md)           |
| Emergency           | `--color-emergency*`                                                     | [ColorSystem](./ColorSystem.md)           |
| Queue status        | `--color-status-*` (scheduled…cancelled)                                 | [ColorSystem](./ColorSystem.md)           |
| Medical / vitals    | `--color-vital-*` (normal…critical)                                      | [ColorSystem](./ColorSystem.md)           |
| Notification        | `--color-notify-*`                                                       | [ColorSystem](./ColorSystem.md)           |
| Chart               | `--color-chart-1…8`, `--color-chart-{grid,axis}`                         | [ColorSystem](./ColorSystem.md)           |
| Focus               | `--color-focus`, `--focus-ring-width`, `--focus-ring-offset`             | [DesignGuidelines](./DesignGuidelines.md) |
| Type role aliases   | `--text-{title,subtitle,label,button,nav,table,form,tooltip,…}`          | [Typography](./Typography.md)             |
| Elevation aliases   | `--elevation-{card,popover,modal,dropdown,sticky,sidebar}`               | [Elevation](./Elevation.md)               |
| Radius aliases      | `--radius-{control,card,surface,field,pill}`                             | [DesignGuidelines](./DesignGuidelines.md) |
| Layout semantics    | `--layout-*`, `--bento-*`                                                | [DesignGuidelines](./DesignGuidelines.md) |

### Component (Tier 3)

`button`, `button-secondary`, `button-ghost`, `input`, `card`, `badge`, `table`, `dialog`, `drawer`,
`tooltip`, `popover`, `sidebar`, `header`, `skeleton`, `avatar`, `switch`/`checkbox`. Each group is a
set of `--<component>-<part>` tokens that alias **semantic** tokens only — re-aliasing one re-skins the
component everywhere. Keyframes `cos-skeleton-shimmer` and `cos-spin` ship in `components.css` and are
disabled under reduced motion (see [Motion.md](./Motion.md)).

---

## Accessibility & usage note

- Components reach for **component or semantic** tokens only — never a primitive, never raw hex/px
  (lint-blocked). See the consumption rule in [README](./README.md#the-consumption-rule-memorize-this).
- Adding/changing a token follows the governance steps in
  [Frontend-Bible.md §12.1](../Frontend-Bible.md#12-governance): propose, keep tier discipline,
  contrast-check (AA), add to **all** theme maps, document, export via Tailwind.
- A semantic token missing from a theme map is a CI failure.
