# Color System

> Part 3 — every shipped color token, grouped, with its Tailwind utility and usage rule.
> Rationale, palette derivation, and the color-blind-safety reasoning live in
> **[Frontend-Bible.md §3.1](../Frontend-Bible.md#31-tier-1--primitive-color-ramps)** and
> **[§9.5 contrast tables](../Frontend-Bible.md#95-color-contrast-with-the-actual-tokens)** — not repeated here.
> Siblings: [README](./README.md) · [DesignTokens](./DesignTokens.md) · [Theme](./Theme.md).

> **Never color alone (mandatory).** Every status, vital, queue-state, and notification color MUST be
> paired with an **icon + text** label. A colored dot as the only signal is a bug (Bible §9.6).

The palette is intentionally **calm/muted** — except `emergency`, which is deliberately **vivid**
because life-safety overrides calm.

---

## 3.1 Primitive ramps (Tier 1 — never used directly by components)

Full 50–900 ramps. Raw hex lives only here. Brand anchors: rose `#E87D7D`, sand `#F8F3F0`,
teal `#6B8E8E`, stone `#827473`.

| Family            | Anchor        | Range                                   | Role                          |
| ----------------- | ------------- | --------------------------------------- | ----------------------------- |
| `rose`            | 500           | `--color-rose-50…900`                   | Primary brand                 |
| `sand`            | 100           | `--color-sand-50…900`                   | Surfaces / secondary          |
| `teal`            | 500           | `--color-teal-50…900`                   | Accent, focus, link           |
| `stone`           | 500           | `--color-stone-50…900`                  | Neutral text / borders        |
| `success`         | 500 `#2E9E5B` | `-50,100,300,500,600,700,900`           | Functional green-teal         |
| `warning`         | 500 `#D9961A` | `-50,100,300,500,600,700,900`           | Functional amber (dark text)  |
| `danger`          | 500 `#CF3A3A` | `-50,100,300,500,600,700,900`           | Functional red (≠ brand rose) |
| `info`            | 500 `#2F73C2` | `-50,100,300,500,600,700,900`           | Functional blue               |
| `white` / `black` | —             | `#ffffff` / `#1a1514` (warm near-black) | Absolute neutrals             |

**Emergency ramp (NEW, vivid — life-safety only):**
`--color-emergency-50:#fdeaea` · `-100:#fbd0d0` · `-500:#e11d1d` · `-600:#c40f0f` · `-700:#9c0a0a`.

> Primitives have **no Tailwind utility** by design. Use the semantic tokens below.

---

## 3.2 Brand & interactive (semantic)

| Token                    | Value (light) | Tailwind class      | Usage / Rule                              |
| ------------------------ | ------------- | ------------------- | ----------------------------------------- |
| `--color-primary`        | `rose-500`    | `bg-primary`        | The ONE action per screen. Use sparingly. |
| `--color-primary-hover`  | `rose-600`    | `bg-primary-hover`  | Hover; deepens to clear AA for text.      |
| `--color-primary-active` | `rose-700`    | `bg-primary-active` | Pressed.                                  |
| `--color-primary-subtle` | `rose-50`     | `bg-primary-subtle` | Tinted backgrounds, selected rows.        |
| `--color-on-primary`     | `white`       | `text-primary-fg`   | Text/icon on primary. Bold + ≥ body-md.   |
| `--color-accent`         | `teal-500`    | `bg-accent`         | Secondary emphasis, accent icons.         |
| `--color-accent-hover`   | `teal-600`    | `bg-accent-hover`   | Accent hover.                             |
| `--color-on-accent`      | `white`       | `text-accent-fg`    | Text/icon on accent.                      |

> **AA note:** white on `rose-500` is ~2.6:1 — only for **bold ≥ body-md**; hover/active (`rose-600/700`)
> clear AA for all text; high-contrast theme swaps primary to `rose-800` (AAA). See Bible §9.5.

---

## 3.3 Surfaces

| Token                      | Value (light)        | Tailwind class        | Usage / Rule                 |
| -------------------------- | -------------------- | --------------------- | ---------------------------- |
| `--color-surface`          | `sand-100`           | `bg-surface`          | App background.              |
| `--color-surface-raised`   | `white`              | `bg-surface-raised`   | Cards, modals, inputs.       |
| `--color-surface-sunken`   | `sand-200`           | `bg-surface-sunken`   | Wells, table headers.        |
| `--color-surface-overlay`  | `rgba(36,31,30,.45)` | `bg-surface-overlay`  | Modal/drawer scrim.          |
| `--color-surface-sidebar`  | `sand-50`            | `bg-surface-sidebar`  | Left nav surface.            |
| `--color-surface-header`   | `surface-raised`     | `bg-surface-header`   | Top app bar.                 |
| `--color-surface-footer`   | `surface`            | `bg-surface-footer`   | Footer band.                 |
| `--color-surface-hover`    | `sand-200`           | `bg-surface-hover`    | Row/item hover.              |
| `--color-surface-active`   | `sand-300`           | `bg-surface-active`   | Pressed surface.             |
| `--color-surface-selected` | `primary-subtle`     | `bg-surface-selected` | Selected nav item / row.     |
| `--color-surface-disabled` | `stone-100`          | `bg-surface-disabled` | Disabled control background. |

---

## 3.4 Text

| Token                     | Value (light) | Tailwind class       | Usage / Rule                           |
| ------------------------- | ------------- | -------------------- | -------------------------------------- |
| `--color-text`            | `stone-900`   | `text-text`          | Default body (~13.5:1, AAA).           |
| `--color-text-muted`      | `stone-600`   | `text-text-muted`    | Secondary text (~5.6:1, AA).           |
| `--color-text-subtle`     | `stone-500`   | `text-text-subtle`   | Placeholders, captions, axis labels.   |
| `--color-text-on-surface` | `text`        | `text-text`          | Alias for text on surfaces.            |
| `--color-text-disabled`   | `stone-400`   | `text-text-disabled` | Disabled text (pair with disabled bg). |
| `--color-text-link`       | `teal-700`    | `text-text-link`     | Inline links; underline on hover.      |
| `--color-text-inverse`    | `white`       | `text-text-inverse`  | Text on dark fills.                    |

---

## 3.5 Lines (borders, dividers, outline)

| Token                     | Value (light) | Tailwind class           | Usage / Rule                      |
| ------------------------- | ------------- | ------------------------ | --------------------------------- |
| `--color-border`          | `sand-300`    | `border-border`          | Default hairline.                 |
| `--color-border-strong`   | `stone-300`   | `border-strong`          | Inputs, emphasis borders.         |
| `--color-divider`         | `sand-200`    | `border-divider`         | Table/list dividers.              |
| `--color-outline`         | `teal-600`    | `border-outline`         | Outline emphasis (≥3:1 non-text). |
| `--color-border-disabled` | `stone-200`   | `border-border-disabled` | Disabled control border.          |

---

## 3.6 State — hover / pressed / selection / disabled

| Token                     | Value (light)      | Tailwind class    | Usage / Rule             |
| ------------------------- | ------------------ | ----------------- | ------------------------ |
| `--color-hover`           | `surface-hover`    | `bg-hover`        | Generic hover surface.   |
| `--color-pressed`         | `surface-active`   | `bg-pressed`      | Generic pressed surface. |
| `--color-selection-bg`    | `primary-subtle`   | `bg-selection`    | Selected background.     |
| `--color-selection-text`  | `primary`          | `text-selection`  | Selected text.           |
| `--color-disabled-bg`     | `surface-disabled` | `bg-disabled`     | Disabled fill.           |
| `--color-disabled-fg`     | `text-disabled`    | `text-disabled`   | Disabled foreground.     |
| `--color-disabled-border` | `border-disabled`  | `border-disabled` | Disabled border.         |

> Disabled controls must also set `aria-disabled`/`disabled` — color is never the only signal.

## 3.7 Focus

| Token                 | Value (light)    | Tailwind / CSS                   | Usage / Rule                                |
| --------------------- | ---------------- | -------------------------------- | ------------------------------------------- |
| `--color-focus`       | `teal-600`       | `ring-focus`                     | `:focus-visible` ring color (~3.6:1, ≥3:1). |
| `--focus-ring-width`  | `border-width-2` | `ring-[var(--focus-ring-width)]` | Ring thickness (4px in high-contrast).      |
| `--focus-ring-offset` | `border-width-2` | `ring-offset-[…]`                | Ring offset.                                |

---

## 3.8 Functional (success / warning / danger / info)

| Token                    | Value         | Tailwind class                | Usage / Rule                                                                  |
| ------------------------ | ------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `--color-success`        | `success-500` | `bg-success` / `text-success` | Confirmations. white on it = AA large/bold; use `success-700` for small text. |
| `--color-success-hover`  | `success-600` | `bg-success-hover`            | Success hover.                                                                |
| `--color-success-subtle` | `success-50`  | `bg-success-subtle`           | Tinted success background.                                                    |
| `--color-on-success`     | `white`       | `text-success-fg`             | On success fill.                                                              |
| `--color-warning`        | `warning-500` | `bg-warning`                  | Caution. **Needs DARK text** (~6.5:1).                                        |
| `--color-warning-hover`  | `warning-600` | `bg-warning-hover`            | Warning hover.                                                                |
| `--color-warning-subtle` | `warning-50`  | `bg-warning-subtle`           | Tinted warning background.                                                    |
| `--color-on-warning`     | `stone-900`   | `text-warning-fg`             | Dark on warning (amber is high-L).                                            |
| `--color-danger`         | `danger-500`  | `bg-danger`                   | Errors / destructive (~4.6:1, kept ≠ rose).                                   |
| `--color-danger-hover`   | `danger-600`  | `bg-danger-hover`             | Danger hover.                                                                 |
| `--color-danger-subtle`  | `danger-50`   | `bg-danger-subtle`            | Tinted danger background.                                                     |
| `--color-on-danger`      | `white`       | `text-danger-fg`              | On danger fill.                                                               |
| `--color-info`           | `info-500`    | `bg-info`                     | Neutral info (~4.8:1).                                                        |
| `--color-info-hover`     | `info-600`    | `bg-info-hover`               | Info hover.                                                                   |
| `--color-info-subtle`    | `info-50`     | `bg-info-subtle`              | Tinted info background.                                                       |
| `--color-on-info`        | `white`       | `text-info-fg`                | On info fill.                                                                 |

> Functional colors are color-blind-safe (distinct in **hue AND lightness**). Pair every one with the
> standard icon: `CheckCircle2` success · `AlertTriangle` warning · `XCircle`/`AlertOctagon` danger ·
> `Info` info (Bible §6.1).

---

## 3.9 Emergency (vivid — life-safety ONLY)

| Token                      | Value           | Tailwind class        | Usage / Rule                                    |
| -------------------------- | --------------- | --------------------- | ----------------------------------------------- |
| `--color-emergency`        | `emergency-500` | `bg-emergency`        | **Only** life-safety alerts (code blue, panic). |
| `--color-emergency-hover`  | `emergency-600` | `bg-emergency-hover`  | Emergency hover.                                |
| `--color-emergency-subtle` | `emergency-50`  | `bg-emergency-subtle` | Emergency tint.                                 |
| `--color-on-emergency`     | `white`         | `text-emergency-fg`   | Text/icon on emergency.                         |

> The single deliberately non-calm family. Never use it for ordinary errors — that is `danger`.
> It stays vivid in dark and high-contrast themes.

---

## 3.10 Queue status (ClinicOS queue lifecycle)

Each status MUST appear with a label + icon. `-subtle` uses the matching `-50` primitive;
`--color-on-status-*` is white (except scheduled/warning-based, which use `stone-900`).

| Token                        | Value         | Tailwind class          | Usage / Rule             |
| ---------------------------- | ------------- | ----------------------- | ------------------------ |
| `--color-status-scheduled`   | `stone-400`   | `bg-status-scheduled`   | Booked, not yet arrived. |
| `--color-status-waiting`     | `info-500`    | `bg-status-waiting`     | Checked in, waiting.     |
| `--color-status-called`      | `warning-500` | `bg-status-called`      | Called to room.          |
| `--color-status-in-progress` | `teal-500`    | `bg-status-in-progress` | In consult.              |
| `--color-status-completed`   | `success-500` | `bg-status-completed`   | Visit done.              |
| `--color-status-no-show`     | `stone-500`   | `bg-status-no-show`     | Did not arrive.          |
| `--color-status-cancelled`   | `danger-500`  | `bg-status-cancelled`   | Cancelled.               |

---

## 3.11 Medical / vitals severity (triage)

Pair with text/icon. Each has a `-subtle` variant.

| Token                    | Value           | Tailwind class      | Usage / Rule                 |
| ------------------------ | --------------- | ------------------- | ---------------------------- |
| `--color-vital-normal`   | `success-500`   | `bg-vital-normal`   | In-range vital.              |
| `--color-vital-low`      | `info-500`      | `bg-vital-low`      | Below range.                 |
| `--color-vital-elevated` | `warning-500`   | `bg-vital-elevated` | Mildly high.                 |
| `--color-vital-high`     | `danger-500`    | `bg-vital-high`     | High / abnormal.             |
| `--color-vital-critical` | `emergency-500` | `bg-vital-critical` | Critical — escalate (vivid). |

---

## 3.12 Notification

| Token                    | Value         | Tailwind class      | Usage / Rule               |
| ------------------------ | ------------- | ------------------- | -------------------------- |
| `--color-notify-info`    | `info-500`    | `bg-notify-info`    | Informational toast/badge. |
| `--color-notify-success` | `success-500` | `bg-notify-success` | Success notice.            |
| `--color-notify-warning` | `warning-500` | `bg-notify-warning` | Warning notice.            |
| `--color-notify-danger`  | `danger-500`  | `bg-notify-danger`  | Error notice.              |
| `--color-notify-unread`  | `primary`     | `bg-notify-unread`  | Unread dot/badge.          |

---

## 3.13 Skeleton / loading

| Token                        | Value (light) | Tailwind class          | Usage / Rule                      |
| ---------------------------- | ------------- | ----------------------- | --------------------------------- |
| `--color-skeleton-base`      | `sand-200`    | `bg-skeleton-base`      | Skeleton placeholder base.        |
| `--color-skeleton-highlight` | `sand-100`    | `bg-skeleton-highlight` | Shimmer highlight.                |
| `--color-loading`            | `primary`     | `text-loading`          | Spinner color (prefer skeletons). |

> Skeletons are `aria-hidden`, match final layout (no shift), and the shimmer stops under reduced motion.

---

## 3.14 Chart (categorical, color-blind-safe)

Eight harmonized hues. Use the **CSS var strings** (not raw hex) so charts re-theme — see
[Motion.md](./Motion.md#js-tokens) for `chartColorVars` in `tokens.ts`.

| Token                | Value         | Tailwind class                | Usage / Rule           |
| -------------------- | ------------- | ----------------------------- | ---------------------- |
| `--color-chart-1`    | `#6b8e8e`     | `text-chart-1` / `bg-chart-1` | Series 1 (teal).       |
| `--color-chart-2`    | `#e87d7d`     | `…chart-2`                    | Series 2 (rose).       |
| `--color-chart-3`    | `#2f73c2`     | `…chart-3`                    | Series 3 (blue).       |
| `--color-chart-4`    | `#d9961a`     | `…chart-4`                    | Series 4 (amber).      |
| `--color-chart-5`    | `#2e9e5b`     | `…chart-5`                    | Series 5 (green).      |
| `--color-chart-6`    | `#7d6ba8`     | `…chart-6`                    | Series 6 (violet).     |
| `--color-chart-7`    | `#827473`     | `…chart-7`                    | Series 7 (stone).      |
| `--color-chart-8`    | `#c2723e`     | `…chart-8`                    | Series 8 (terracotta). |
| `--color-chart-grid` | `divider`     | `border-chart-grid`           | Grid lines.            |
| `--color-chart-axis` | `text-subtle` | `text-chart-axis`             | Axis labels.           |

> Color-blind safety: do not rely on hue alone in charts — add direct labels, patterns, or markers.

---

## Accessibility & usage note

- **Never color alone** — status/vital/notification colors always ship with icon + text.
- Contrast targets are pre-verified in [Bible §9.5](../Frontend-Bible.md#95-color-contrast-with-the-actual-tokens);
  re-check any new pairing against AA before merge.
- Theme behavior (dark/high-contrast remaps, emergency staying vivid) → [Theme.md](./Theme.md).
