# Design Guidelines

> Part 9 (grid / bento) + Part 10 (icons) + the token consumption rules and a do/don't gallery. The
> layout rationale (mobile-first, One Screen · One Task) and iconography reasoning live in
> **[Frontend-Bible.md §6](../Frontend-Bible.md#6-iconography-imagery--illustration)** and
> **[§7](../Frontend-Bible.md#7-layout-system)**. Siblings: [README](./README.md) ·
> [Spacing](./Spacing.md) · [Theme](./Theme.md).

---

## Part 9 — Grid, breakpoints & bento

### 9.1 Breakpoints (primitives)

| Token              | Value  | Tailwind screen | Target                   |
| ------------------ | ------ | --------------- | ------------------------ |
| `--breakpoint-sm`  | 640px  | `sm:`           | Large phone              |
| `--breakpoint-md`  | 768px  | `md:`           | Tablet / reception kiosk |
| `--breakpoint-lg`  | 1024px | `lg:`           | Laptop                   |
| `--breakpoint-xl`  | 1280px | `xl:`           | Desktop                  |
| `--breakpoint-2xl` | 1536px | `2xl:`          | Large / wall display     |

Mobile-first: design the phone layout, then enhance upward. `breakpoints` is also exported from
`shared/theme/tokens.ts` for JS consumers.

### 9.2 Container & 12-column grid

| Token             | Value  | Tailwind class        | Use                                 |
| ----------------- | ------ | --------------------- | ----------------------------------- |
| `--container-xl`  | 1200px | `max-w-container`     | Default centered content max-width  |
| `--container-2xl` | 1440px | `max-w-container-2xl` | Wide dashboards                     |
| `--container-max` | 1200px | `max-w-container`     | Alias of the default cap            |
| `--grid-columns`  | 12     | `grid-cols-12`        | The 12-col base                     |
| `--grid-gutter`   | 1.5rem | `gap-6`               | Column gutter                       |
| `--grid-margin`   | 1rem   | `px-4`                | Outer page margin (grows to `px-8`) |

Centered container, side padding `--space-4` → `--space-8` responsive. The single primary CTA sits
bottom-right of the primary surface on desktop, and pinned as a full-width sticky footer button
(≥56px) on mobile (Bible §7.2).

### 9.3 Bento grid

Self-contained tiles of varying span on a uniform 12-col grid — at-a-glance dashboards. Each tile is a
`Card`/`Bento` with one job.

| Token              | Value         | Tailwind / use               |
| ------------------ | ------------- | ---------------------------- |
| `--bento-gap`      | `--space-4`   | `gap-4` between tiles        |
| `--bento-radius`   | `--radius-xl` | `rounded-xl` tile corners    |
| `--bento-tile-min` | `16rem`       | Min tile width before reflow |

```tsx
// Tiles declare span via tokens/classes, never px.
<div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
  <Bento className="md:col-span-3 lg:col-span-4" />
  <Bento className="md:col-span-3 lg:col-span-4" />
  <Bento className="md:col-span-6 lg:col-span-8" />
</div>
```

**Bento rules:** one job per tile · uniform gap (`--bento-gap`) · spans via `col-span-*`/`row-span-*`,
never px · `--elevation-card` resting elevation · skeletons that match the final tile layout.

### 9.4 Dashboard layout

Page padding `--layout-page-padding` (`--space-6`); content capped at `--layout-content-max`
(`--container-xl`); sidebar `--layout-sidebar-width` (17rem, collapsed `4.5rem`); header
`--layout-header-height` (`--space-16`). Comfortable density by default; `data-density="compact"` maps
to tighter spacing tokens but never drops below the 44px target.

### 9.5 Radius, border-width, z-index (supporting primitives)

| Group        | Tokens                                                                                        | Tailwind                              |
| ------------ | --------------------------------------------------------------------------------------------- | ------------------------------------- |
| Radius       | `--radius-{none,sm,md,lg,xl,2xl,full}` + aliases `--radius-{control,card,surface,field,pill}` | `rounded-{sm,md,lg,xl,2xl,full,pill}` |
| Border width | `--border-width-{0,1,2,4}`                                                                    | `border`, `border-2`, `border-4`      |
| Z-index      | `--z-{base,raised,dropdown,sticky,overlay,modal,popover,toast}`                               | `z-{base…toast}`                      |

---

## Part 10 — Icons

Single library: **`lucide-react`**, consistent stroke. Icons inherit `currentColor` so they re-theme
automatically.

### 10.1 Sizes & stroke (primitives)

| Token                | Value   | px  | Tailwind / use         |
| -------------------- | ------- | --- | ---------------------- |
| `--icon-size-xs`     | 1rem    | 16  | Inline with small text |
| `--icon-size-sm`     | 1.25rem | 20  | Dense UI               |
| `--icon-size-md`     | 1.5rem  | 24  | Default (buttons, nav) |
| `--icon-size-lg`     | 2rem    | 32  | Emphasis               |
| `--icon-size-xl`     | 2.5rem  | 40  | Empty states, hero     |
| `--icon-stroke`      | 2       | —   | Default stroke width   |
| `--icon-stroke-bold` | 2.5     | —   | Emphasis stroke        |

`iconSizes`/`iconStroke` are also exported from `shared/theme/tokens.ts`.

### 10.2 Color & consistency rules

- Icons inherit `currentColor` — **never hardcode an icon color**; set text color via a token utility.
- One stroke weight across the app (`--icon-stroke`), one library, one size token per context.
- **Decorative** icons: `aria-hidden="true"`. **Meaningful** icons need an accessible name (visible
  label or `aria-label` via i18n key).
- **Always pair icon + word** in primary actions and statuses (elderly/low-literacy; never-color-alone).
- Status icon vocabulary (consistent app-wide): `CheckCircle2` success · `AlertTriangle` warning ·
  `XCircle`/`AlertOctagon` danger · `Info` info · `Clock` pending/queue.
- Directional icons (chevrons, arrows) flip under RTL; non-directional (clock, user) never flip.

---

## The consumption rules

> **Tailwind utility first → semantic CSS var second → NEVER a primitive or a hardcoded value.**

| Layer         | May read                            | Must NOT read                   |
| ------------- | ----------------------------------- | ------------------------------- |
| Primitive     | nothing (literals only)             | —                               |
| Semantic      | primitives                          | components                      |
| Component     | semantic (+ primitives for spacing) | other components                |
| TSX component | **component + semantic only**       | raw hex/px, primitives-as-color |

---

## Do / Don't gallery (tokens-only)

| Concern    | ✅ Do                                                           | ❌ Don't                                                  |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| Color      | `className="bg-primary text-primary-fg"`                        | `bg-[#e87d7d]` · `bg-[var(--color-rose-500)]` (primitive) |
| Spacing    | `p-6 gap-4`                                                     | `p-[17px]` · `style={{ padding: 17 }}`                    |
| Type       | `text-h2` · `text-title`                                        | `text-[28px]` · `style={{ fontSize: '1.75rem' }}`         |
| Radius     | `rounded-card` (`--radius-card`)                                | `rounded-[13px]`                                          |
| Shadow     | `shadow-[var(--card-shadow)]`                                   | `shadow-[0_4px_12px_#0003]`                               |
| Icon color | `<Check aria-hidden className="text-success" />`                | `<Check color="#2e9e5b" />`                               |
| Status     | color **+** `<AlertTriangle/>` **+** text label                 | a bare colored dot as the only signal                     |
| Direction  | `ms-4 pe-2 start-0` (logical)                                   | `ml-4 pr-2 left-0` (physical — breaks RTL)                |
| Disabled   | `disabled` + `bg-disabled text-disabled`                        | color change only, no `disabled`/`aria-disabled`          |
| Motion     | `transition-colors duration-fast motion-reduce:transition-none` | unconditional looping animation on data                   |

---

## Accessibility & usage note

- Targets ≥ 44px (≥ 56px Large Text), gaps ≥ `--space-2` between adjacent targets.
- Never color alone; never icon-only for primary flows; always an accessible name from an i18n key.
- Arbitrary Tailwind values (`w-[37px]`, `text-[17px]`) are lint-blocked — pick the nearest token.
- Full a11y checklist: [Frontend-Bible.md §9](../Frontend-Bible.md#9-accessibility-guide).
