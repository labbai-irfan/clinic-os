# Typography

> Part 4 — the shipped type scale, role aliases, and Tailwind utilities. Font choices, loading
> strategy, and the "why" live in **[Frontend-Bible.md §5](../Frontend-Bible.md#5-typography)** —
> not repeated here. Siblings: [README](./README.md) · [DesignTokens](./DesignTokens.md) ·
> [DesignGuidelines](./DesignGuidelines.md).

**Headings: Plus Jakarta Sans. Body: Inter. Codes/IDs: JetBrains Mono.** No ad-hoc font sizes — only
scale tokens. Every step bakes size + line-height + weight + tracking, and multiplies size by
`--font-scale` so Large Text Mode just works.

---

## 4.1 Font families (primitives)

| Token            | Value                                                       | Tailwind class | Use                     |
| ---------------- | ----------------------------------------------------------- | -------------- | ----------------------- |
| `--font-heading` | `'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif` | `font-heading` | All headings            |
| `--font-body`    | `'Inter', ui-sans-serif, system-ui, sans-serif`             | `font-body`    | Body / UI text          |
| `--font-mono`    | `'JetBrains Mono', ui-monospace, 'SF Mono', monospace`      | `font-mono`    | Codes, IDs, MRNs        |
| `--font-scale`   | `1` (themes multiply → 1.25 in Large Text Mode)             | —              | Global scale multiplier |

---

## 4.2 Type scale (size · leading · weight · tracking)

Each token = `calc(<rem> * var(--font-scale))`. Tailwind maps the paired form
`key: ['var(--text-KEY)', { lineHeight, fontWeight, letterSpacing }]`.

| Token (`--text-…`) | Size (rem) | Leading | Weight | Tracking | Tailwind class  | Use                            |
| ------------------ | ---------- | ------- | ------ | -------- | --------------- | ------------------------------ |
| `display`          | 3.0        | 1.1     | 700    | -0.02em  | `text-display`  | Marketing / hero only          |
| `h1`               | 2.25       | 1.15    | 700    | -0.02em  | `text-h1`       | Page title (one per screen)    |
| `h2`               | 1.75       | 1.2     | 600    | -0.01em  | `text-h2`       | Section                        |
| `h3`               | 1.375      | 1.25    | 600    | -0.01em  | `text-h3`       | Sub-section / card title       |
| `h4`               | 1.125      | 1.3     | 600    | 0        | `text-h4`       | Group label                    |
| `h5`               | 1.0        | 1.4     | 600    | 0        | `text-h5`       | Dense headings                 |
| `h6`               | 0.875      | 1.4     | 600    | 0.01em   | `text-h6`       | Smallest heading               |
| `body-lg`          | 1.125      | 1.6     | 400    | 0        | `text-body-lg`  | Primary reading, forms         |
| `body-md`          | 1.0        | 1.55    | 400    | 0        | `text-body-md`  | Default body                   |
| `body-sm`          | 0.875      | 1.5     | 400    | 0        | `text-body-sm`  | Secondary text                 |
| `caption`          | 0.75       | 1.45    | 500    | 0.01em   | `text-caption`  | Helper, timestamps             |
| `overline`         | 0.6875     | 1.4     | 600    | 0.08em   | `text-overline` | Eyebrow labels (UPPER via CSS) |

Weight primitives: `--weight-regular:400` · `--weight-medium:500` · `--weight-semibold:600` ·
`--weight-bold:700`.

---

## 4.3 Role aliases (semantic — map a UI role → a scale step)

Reach for the **role** in components so the underlying scale can shift without touching component code.

| Token (`--text-…`) | Maps to                                      | Tailwind class      | Use                        |
| ------------------ | -------------------------------------------- | ------------------- | -------------------------- |
| `title`            | `h3` (+ `--leading-title`, `--weight-title`) | `text-title`        | Card / panel title         |
| `subtitle`         | `h5` (+ `--leading-subtitle`)                | `text-subtitle`     | Secondary heading          |
| `label`            | `body-sm` + `--weight-label` (600)           | `text-label`        | Form / field labels        |
| `button`           | `body-md` + `--weight-button` (600)          | `text-button`       | Button text                |
| `nav`              | `body-md`                                    | `text-nav`          | Nav items                  |
| `table`            | `body-sm`                                    | `text-table`        | Table cells                |
| `form`             | `body-md`                                    | `text-form`         | Form inputs                |
| `tooltip`          | `caption`                                    | `text-tooltip`      | Tooltip text               |
| `chart`            | `overline`                                   | `text-chart`        | Chart axis / legend labels |
| `dialog-title`     | `h4`                                         | `text-dialog-title` | Dialog title               |
| `medical-doc`      | `body-md`                                    | `text-medical-doc`  | Clinical document body     |

---

## 4.4 Responsive & Large Text scaling

- **Large Text Mode** sets `--font-scale: 1.25` on `[data-large-text='true']` → the entire ramp grows
  proportionally with **zero per-component work** (every size derives from one multiplier). Targets also
  grow via `--tap-target-min` (see [Theme.md](./Theme.md)).
- The scale is `rem`-based, so it also respects the user's browser root font-size.
- For responsive role sizing, switch the role/scale token at the breakpoint
  (e.g. `text-h2 md:text-h1`) — never an arbitrary `text-[…px]`.

---

## 4.5 Rules & accessibility

- **Never** write `text-[17px]`, `style={{ fontSize }}`, or a raw `rem`. Use a scale/role token. Lint
  blocks arbitrary sizes.
- One `<h1>` per screen (the page title — One Screen · One Task); keep heading order logical.
- Body copy ≥ `body-md` (16px) for clinical reading; default to `body-lg` in forms used by elderly users.
- Reading blocks: line length 45–75ch via a tokened measure (`max-w-[65ch]`).
- `overline` uppercasing is a **CSS** concern (`text-transform`), never in the source string (i18n).
- Full rationale + font-loading: [Frontend-Bible.md §5](../Frontend-Bible.md#5-typography).
