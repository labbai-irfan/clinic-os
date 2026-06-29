# Spacing

> Part 5 — the shipped 8-point spacing grid and its usage per context. The rationale (calm, generous
> whitespace) lives in **[Frontend-Bible.md §3.2](../Frontend-Bible.md#32-tier-1--spacing-radius-elevation-borders-z-index-motion)**.
> Siblings: [README](./README.md) · [DesignTokens](./DesignTokens.md) · [DesignGuidelines](./DesignGuidelines.md).

4px base, 8-point rhythm. `rem`-based, so it scales with the root and with Large Text Mode. Spacing
maps to tokens — never ad-hoc px.

---

## 5.1 The scale (primitives)

| Token        | rem     | px  | Tailwind class (p/m/gap) | Typical use                                        |
| ------------ | ------- | --- | ------------------------ | -------------------------------------------------- |
| `--space-0`  | 0       | 0   | `p-0` `gap-0`            | Reset                                              |
| `--space-1`  | 0.25rem | 4   | `p-1` `gap-1`            | Icon ↔ text gap, hairline insets                   |
| `--space-2`  | 0.5rem  | 8   | `p-2` `gap-2`            | Tight gaps, badge padding, min gap between targets |
| `--space-3`  | 0.75rem | 12  | `p-3` `gap-3`            | Table cell padding-y, compact stacks               |
| `--space-4`  | 1rem    | 16  | `p-4` `gap-4`            | Default gap, card gap, input padding-x             |
| `--space-5`  | 1.25rem | 20  | `p-5` `gap-5`            | Button padding-x                                   |
| `--space-6`  | 1.5rem  | 24  | `p-6` `gap-6`            | Card padding, page padding, grid gutter            |
| `--space-7`  | 1.75rem | 28  | `p-7` `gap-7`            | In-between section rhythm (NEW)                    |
| `--space-8`  | 2rem    | 32  | `p-8` `gap-8`            | Section spacing, large card padding                |
| `--space-10` | 2.5rem  | 40  | `p-10` `gap-10`          | Avatar size, generous stacks                       |
| `--space-12` | 3rem    | 48  | `p-12` `gap-12`          | Control height (≥44px target)                      |
| `--space-16` | 4rem    | 64  | `p-16` `gap-16`          | Header height, Large-Text target, section breaks   |
| `--space-20` | 5rem    | 80  | `p-20` `gap-20`          | Large vertical rhythm                              |
| `--space-24` | 6rem    | 96  | `p-24` `gap-24`          | Page-section separation                            |
| `--space-32` | 8rem    | 128 | `p-32` `gap-32`          | Hero / landing rhythm (NEW)                        |
| `--space-40` | 10rem   | 160 | `p-40` `gap-40`          | Max page rhythm (NEW)                              |

Logical Tailwind utilities (`ps-*`/`pe-*`/`ms-*`/`me-*`, `start-*`/`end-*`) are used for RTL safety —
never physical `pl-/pr-/ml-/mr-` (Bible §4.4).

---

## 5.2 Usage per context

| Context               | Token(s)                                                                  | Rule                                                                                                    |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Padding** (control) | `--space-4` / `--space-5`                                                 | Input padding-x = `space-4`; button padding-x = `space-5`.                                              |
| **Margin / stacks**   | `--space-2` → `--space-6`                                                 | Use the smallest step that reads as separate. Prefer `gap` on a flex/grid parent over per-child margin. |
| **Gap** (flex/grid)   | `--space-4` default                                                       | Card content gap = `space-4`; tight icon+text = `space-1`/`space-2`.                                    |
| **Section**           | `--space-8` → `--space-16`                                                | Between major sections on a page.                                                                       |
| **Card**              | padding `--space-6`, gap `--space-4`                                      | Matches `--card-padding`.                                                                               |
| **Grid**              | gutter `--space-6` (`--grid-gutter`)                                      | 12-col layout gutter; bento gap `--space-4` (`--bento-gap`).                                            |
| **Form**              | field gap `--space-2`, group gap `--space-6`                              | Label↔control = `space-2`; field↔field = `space-6`.                                                     |
| **Table**             | cell padding-x `--space-4`, padding-y `--space-3`                         | Comfortable default; compact density drops one step but never below 44px row target.                    |
| **Dashboard**         | page padding `--space-6` (`--layout-page-padding`), bento gap `--space-4` | Consistent rhythm across tiles.                                                                         |

---

## Accessibility & usage note

- **Adjacent interactive targets** keep ≥ `--space-2` (8px) between them; the targets themselves stay
  ≥ 44px (≥ 56px in Large Text Mode) — see [DesignGuidelines](./DesignGuidelines.md) and Bible §9.8.
- Because spacing is `rem`-based, Large Text Mode and the user's root font-size scale layout naturally —
  do not hardcode px to "compensate".
- Never use arbitrary values (`p-[17px]`, `gap-[13px]`) — lint-blocked. Pick the nearest scale step.
