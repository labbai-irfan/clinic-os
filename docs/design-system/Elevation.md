# Elevation

> Part 7 — the shipped shadow scale and semantic elevation aliases. The Soft-UI rationale
> (low-spread, low-opacity, warm-tinted) lives in
> **[Frontend-Bible.md §3.2](../Frontend-Bible.md#32-tier-1--spacing-radius-elevation-borders-z-index-motion)**.
> Siblings: [README](./README.md) · [DesignTokens](./DesignTokens.md) · [Theme](./Theme.md).

Shadows are **Soft-UI**: low-spread, low-opacity, warm-tinted (`rgba(60,45,42,…)`) — calm, not glossy.

---

## 7.1 Shadow scale (primitives)

| Token            | Value                                                                    | Tailwind class | Use                                |
| ---------------- | ------------------------------------------------------------------------ | -------------- | ---------------------------------- |
| `--shadow-none`  | `none`                                                                   | `shadow-none`  | Flat surfaces, HC theme            |
| `--shadow-xs`    | `0 1px 2px 0 rgba(60,45,42,.04)`                                         | `shadow-xs`    | Buttons, subtle lift               |
| `--shadow-sm`    | `0 1px 3px 0 rgba(60,45,42,.06), 0 1px 2px -1px rgba(60,45,42,.05)`      | `shadow-sm`    | Sticky header, sidebar             |
| `--shadow-md`    | `0 4px 12px -2px rgba(60,45,42,.08), 0 2px 6px -2px rgba(60,45,42,.05)`  | `shadow-md`    | Cards, dropdowns                   |
| `--shadow-lg`    | `0 12px 28px -6px rgba(60,45,42,.1), 0 6px 12px -6px rgba(60,45,42,.06)` | `shadow-lg`    | Popovers                           |
| `--shadow-xl`    | `0 24px 48px -12px rgba(60,45,42,.14)`                                   | `shadow-xl`    | Modals, drawers                    |
| `--shadow-inset` | `inset 0 1px 0 0 rgba(255,255,255,.6)`                                   | `shadow-inset` | Soft-UI inner highlight (optional) |

---

## 7.2 Semantic elevation aliases (reach for these in components)

| Token                  | Maps to       | Used by                | When to use                        |
| ---------------------- | ------------- | ---------------------- | ---------------------------------- |
| `--elevation-card`     | `--shadow-md` | Card, bento tile       | Resting cards on the app surface.  |
| `--elevation-popover`  | `--shadow-lg` | Popover                | Floating, anchored content.        |
| `--elevation-modal`    | `--shadow-xl` | Dialog, drawer         | Top-layer, focus-trapped surfaces. |
| `--elevation-dropdown` | `--shadow-md` | Select, menu, combobox | Dropdown menus.                    |
| `--elevation-sticky`   | `--shadow-sm` | Header                 | Sticky / pinned bars.              |
| `--elevation-sidebar`  | `--shadow-sm` | Sidebar                | Side nav separation.               |

Tailwind exposes these via the component tokens (e.g. `shadow-[var(--elevation-card)]`); prefer the
component's own token (`--card-shadow`) which aliases `--elevation-card`.

---

## 7.3 When to use which level (ladder)

```
none  →  app background, flat lists, high-contrast theme
xs/sm →  buttons, header, sidebar (just enough to separate)
md    →  cards, dropdowns (resting elevation)
lg    →  popovers (floating, anchored)
xl    →  modals & drawers (top layer)
```

Pair elevation with `--z-*` so visual depth matches stacking order (`--z-dropdown` < `--z-modal` <
`--z-popover` < `--z-toast`).

---

## 7.4 Never overuse shadows

- One elevation step per layer. Do **not** stack `shadow-lg` on a card already on a raised surface —
  use surface color separation instead.
- More than ~2 competing elevations on a screen reads as noisy, not calm. Flatten.
- Hover lift is at most one step up (e.g. `md → lg`), and is reduced-motion aware.

---

## 7.5 Dark & high-contrast behavior

- **Dark theme:** Soft-UI shadows nearly vanish on dark backgrounds, so the theme overrides
  `--elevation-card`/`--elevation-popover` to lean on **surface separation** plus a faint top highlight
  (`0 1px 0 0 rgba(255,255,255,.04)`). See [Theme.md](./Theme.md) and `themes.css`.
- **High-contrast theme:** shadows are removed entirely (`--elevation-card: none`); depth comes from
  **borders**, not shadows. Cards get a solid black/white border instead.

---

## Accessibility & usage note

Shadow is decorative — it is **never** the only signal of interactivity or grouping. Provide a border,
background change, or label as well (borders are the depth cue in high-contrast). Reduced-motion users
get no animated lift; the resting elevation still applies.
