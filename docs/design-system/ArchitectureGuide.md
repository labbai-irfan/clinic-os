# ClinicOS — Design System Architecture Guide

> **The engineering blueprint for the design-system package itself.** Part 2 catalogs every folder in
> `shared/design-system` (what exists today + the planned subfolders). Part 3 fixes the ONE architecture
> every component follows. Part 11 sets the performance contract (tree-shaking, lazy-loading, memo,
> context, bundle).
>
> **Read first:** [DesignSystem.md](./DesignSystem.md) (philosophy + layered model + categories) ·
> [Frontend-Bible §8](../Frontend-Bible.md#8-component-library) (component contract + Button/Card/Field) ·
> [architecture/FolderStructure.md](../architecture/FolderStructure.md) (the `shared/design-system` 7-field
> contract in the wider tree) · [architecture/FeatureArchitecture.md](../architecture/FeatureArchitecture.md)
> (how modules consume the kit) · [Coding-Standards.md](../Coding-Standards.md) (TS/React/styling rules).
>
> **Siblings:** [ComponentRegistry.md](./ComponentRegistry.md) ·
> [DesignTokens.md](./DesignTokens.md) / [Theme.md](./Theme.md) (token + theme source — not restated here).
>
> _This guide does not restate token values or per-component props. It documents structure, contracts, and
> the rules that keep the package coherent._

---

## Table of contents

- [Part 2 — Folder structure](#part-2--folder-structure)
- [Part 3 — Component architecture](#part-3--component-architecture)
- [Part 11 — Performance](#part-11--performance)

---

## Part 2 — Folder structure

### 2.0 The reconciliation (what the design-system owns vs composes)

The design-system is **one layer** ([DesignSystem.md → layered model](./DesignSystem.md#the-layered-model)).
It **owns components**; it **composes** tokens, themes, and assets that live elsewhere:

| Concern                                                  | Lives in                                                       | The design-system…                                                                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Tokens** (CSS variables, 3 tiers)                      | [`src/shared/styles/`](../../src/shared/styles/)               | **consumes** via Tailwind utilities / `var(--token)` — never re-defines ([DesignTokens.md](./DesignTokens.md))            |
| **Themes** (semantic re-maps + switch logic + JS mirror) | [`src/shared/theme/`](../../src/shared/theme/)                 | **consumes** (`tokens.ts` for JS libs) — never owns ([Theme.md](./Theme.md))                                              |
| **Illustrations / fonts / icon source**                  | [`src/assets/`](../../src/assets/)                             | **references** for empty-state art, brand marks — never embeds ([FolderStructure §6](../architecture/FolderStructure.md)) |
| **Components / primitives / patterns / templates**       | [`src/shared/design-system/`](../../src/shared/design-system/) | **owns**                                                                                                                  |

> Restated for reviewers: a component that hardcodes a hex, redefines a theme, or inlines an SVG that
> belongs in `assets/` is a bug — it has reached past its layer.

### 2.1 The tree — today + planned

```text
src/shared/design-system/
├── index.ts                 # PUBLIC BARREL — the only legal import surface (named exports, no side effects)
│
│   ── EXISTS TODAY ──
├── components/              # one folder per component: components/<kebab>/ (see Part 3)
│   ├── button/  input/  checkbox/  radio/  switch/  select/  textarea/  label/  form-field/
│   ├── icon-button/  card/  bento-grid/  divider/  badge/  avatar/  status-badge/
│   ├── alert/  empty-state/  error-state/  spinner/  skeleton/  tooltip/
│   └── icon/  visually-hidden/
├── icons/                   # the semantic Icon REGISTRY (registry.ts + index.ts) — vendor-decoupled glyphs
├── registry/               # the COMPONENT REGISTRY (component-registry.ts + index.ts) — machine-checkable catalog
├── lib/                    # design-system-internal primitives: cn-less helpers, Slot, shared component types
│
│   ── PLANNED (reserved; add when first needed, do NOT pre-create empty) ──
├── foundations/            # token MIRRORS/maps for JS consumers + a11y primitives not owned by tokens
├── layouts/                # design-system layout primitives (Stack, Cluster, Grid, Container, Spacer)
├── patterns/               # composed multi-component blocks (Form, Toolbar, BentoDashboard, DataList)
├── templates/              # page scaffolds (PageLayout, AppShell, AuthLayout) — compose layouts + patterns
├── hooks/                  # design-system-scoped hooks (useControllableState, useDisclosure, useFocusTrap)
├── providers/              # design-system providers (TooltipProvider, ToastProvider portal root)
├── animations/             # motion presets/variants (token-driven, reduced-motion aware)
├── utilities/              # presentational utilities (Portal, Slot helpers, polymorphic helpers)
├── validators/             # presentational prop validators / dev-time invariant guards
└── testing/                # design-system test harness (render-with-theme, axe helper, story smoke)
```

> **`lib/` vs `utilities/`:** `lib/` is the tiny, always-present internal kernel (`Slot`, the shared
> `Size`/`Tone`/`AsChildProps` vocabulary in [`lib/component.types.ts`](../../src/shared/design-system/lib/component.types.ts)).
> `utilities/` is the **planned** home for larger presentational helpers (Portal, polymorphic `as`).
> The shared `cn` merge helper lives at `@shared/lib/cn` (a `shared/lib` concern), **not** in the kit —
> see the barrel note in [`index.ts`](../../src/shared/design-system/index.ts).

### 2.2 Per-folder contract

Each folder below uses the 7-field shape from [FolderStructure §0](../architecture/FolderStructure.md):
**Purpose · Responsibilities · Allowed imports · Forbidden imports · Future scalability · Example.**
All folders inherit the `shared/design-system` hard rule from
[FolderStructure §4](../architecture/FolderStructure.md): **domain-free, token-only, no upward imports**
(`entities`/`modules`/`processes`/`app` are forbidden everywhere in this package).

#### `index.ts` — the public barrel (EXISTS)

- **Purpose** — The single legal import surface: `import { Button } from '@shared/design-system'`.
- **Responsibilities** — Re-export every component + its prop types, the icon registry, and the component
  registry. All **named** exports, **no** side effects (so the kit stays tree-shakeable —
  [Part 11](#part-11--performance)).
- **Allowed imports** — `./components/*`, `./icons`, `./registry`, `./lib`.
- **Forbidden imports** — Anything that triggers a side effect at import time; deep consumer reach-in.
- **Future scalability** — New components/categories add one `export *` line; consumers never change paths.
- **Example** — [`src/shared/design-system/index.ts`](../../src/shared/design-system/index.ts).

#### `components/` — the component folders (EXISTS)

- **Purpose** — One bounded folder per component, `components/<kebab>/`. The home of every visual atom.
- **Responsibilities** — Hold the component, its stories, its tests, its barrel (the architecture in
  [Part 3](#part-3--component-architecture)). Compound components (Card + its parts, RadioGroup + Radio,
  BentoGrid + BentoItem) live in **one** folder.
- **Allowed imports** — tokens (via Tailwind), `../../lib`, `../<other-component>` only when it genuinely
  `composes` it (declared in the registry), `lucide-react` **only** via the icon registry, `@shared/lib/cn`,
  i18n is **not** imported (text is passed in).
- **Forbidden imports** — domain layers; raw hex/px; hardcoded copy; another component's internals past
  its `index.ts`.
- **Future scalability** — Hundreds of components coexist; each is independently code-split, tested, owned.
- **Example** — [`components/button/`](../../src/shared/design-system/components/button/) (the exemplar).

#### `icons/` — the Icon Registry (EXISTS)

- **Purpose** — The single, curated, **semantic** icon source; the product never imports `lucide-react`
  directly in feature code.
- **Responsibilities** — Map named concepts → glyphs in closed maps
  (`icons.medical.consultation`, `icons.status.success`, …), rendered through the `<Icon>` wrapper which
  applies `--icon-size-*`/`--icon-stroke` tokens.
- **Allowed imports** — `lucide-react` (the one place it's allowed), `LucideIcon` type.
- **Forbidden imports** — domain layers; hardcoded icon colors (icons inherit `currentColor`).
- **Future scalability** — Swap lucide → a custom pack by editing **only this file** (vendor independence);
  categories are the extension points for future packs.
- **Example** — [`icons/registry.ts`](../../src/shared/design-system/icons/registry.ts) ·
  rules in [DesignGuidelines §10](./DesignGuidelines.md).

#### `registry/` — the Component Registry (EXISTS)

- **Purpose** — The machine-checkable catalog of every component (overview in
  [DesignSystem Part 8](./DesignSystem.md#part-8--the-component-registry-overview)).
- **Responsibilities** — Hold the typed `COMPONENT_REGISTRY`, the `ComponentCategory`/`ComponentStatus`
  unions, and lookup helpers; drive `pnpm ds:registry` (validate folders/exports + generate
  [ComponentRegistry.md](./ComponentRegistry.md)).
- **Allowed imports** — none (it is pure data + types).
- **Forbidden imports** — runtime component code (it describes, it doesn't render).
- **Future scalability** — Every new/planned component is one entry; tooling stays the same.
- **Example** — [`registry/component-registry.ts`](../../src/shared/design-system/registry/component-registry.ts).

#### `lib/` — internal primitives (EXISTS)

- **Purpose** — The tiny, dependency-free kernel shared **across** components.
- **Responsibilities** — `Slot` (the `asChild` polymorphism primitive) and the shared type vocabulary
  (`Size`, `Tone`, `AsChildProps`) so the catalog stays consistent (one scale, one palette).
- **Allowed imports** — React, type-only helpers.
- **Forbidden imports** — domain layers; anything stateful or vendor-coupled.
- **Future scalability** — Grows only with truly cross-component primitives; stays small on purpose.
- **Example** — [`lib/slot.tsx`](../../src/shared/design-system/lib/slot.tsx) ·
  [`lib/component.types.ts`](../../src/shared/design-system/lib/component.types.ts).

#### `foundations/` — token mirrors + a11y primitives (PLANNED)

- **Purpose** — JS-side mirrors/maps of tokens for components that need values in TS (CVA edge cases,
  motion), plus low-level a11y primitives not owned by the token layer.
- **Responsibilities** — Re-export the relevant slice of [`shared/theme/tokens.ts`](../../src/shared/theme/);
  host focus-ring/`sr-only` helpers if they outgrow `lib/`.
- **Allowed imports** — `shared/theme` (JS token mirror), `lib/`.
- **Forbidden imports** — `shared/styles` CSS at runtime; domain layers; **never re-define token values**
  (it mirrors, never authors — authoring is [DesignTokens.md](./DesignTokens.md)).
- **Future scalability** — The seam where chart/motion libs read numeric tokens without coupling to CSS.
- **Example** — `foundations/tokens.ts` re-exporting `iconSizes`, `breakpoints`, `durations` for JS.

#### `layouts/` — layout primitives (PLANNED)

- **Purpose** — Token-driven layout atoms below "patterns": `Stack`, `Cluster`, `Grid`, `Container`, `Spacer`.
- **Responsibilities** — Encode spacing/gap/breakpoint tokens as composable layout components (so screens
  never hand-roll fl/grid with arbitrary values).
- **Allowed imports** — tokens (Tailwind), `lib/`, `components/` primitives.
- **Forbidden imports** — domain layers; data fetching; raw px gaps.
- **Future scalability** — New responsive primitives slot in; `BentoGrid` is the first member, already shipped.
- **Example** — `layouts/Stack.tsx` (`gap` maps to `--space-*`).

#### `patterns/` — composed blocks (PLANNED)

- **Purpose** — Multi-component, reusable, **still domain-free** blocks: `Form`, `Toolbar`,
  `BentoDashboard`, `DataList`, the four-async-state wrapper.
- **Responsibilities** — Compose components into recurring shapes; carry no business rules (a `Form`
  pattern wires layout + a11y, not a specific clinic form — that's a module `component/`).
- **Allowed imports** — `components/`, `layouts/`, `hooks/`, tokens.
- **Forbidden imports** — domain layers; module-specific copy or logic.
- **Future scalability** — Promotes recurring module compositions upward (rule-of-three) without leaking domain.
- **Example** — `patterns/AsyncBoundary.tsx` rendering Loading/Empty/Error/Success
  ([Frontend-Bible §2.1](../Frontend-Bible.md#2-design-principles-do--dont)).

#### `templates/` — page scaffolds (PLANNED)

- **Purpose** — Whole-page skeletons: `PageLayout`, `AppShell`, `AuthLayout` (the design-system source
  that [`app/layouts`](../../src/app/layouts/) composes/mounts).
- **Responsibilities** — Header + sidebar + content outlet + skip-link + the One-CTA placement
  ([Frontend-Bible §7.2](../Frontend-Bible.md#7-layout-system)); presentational only.
- **Allowed imports** — `patterns/`, `layouts/`, `components/`, tokens.
- **Forbidden imports** — domain data/fetching; module internals.
- **Future scalability** — New device targets (kiosk, wall display) add template variants without touching pages.
- **Example** — `templates/PageLayout.tsx` (consumed by every module page).

#### `hooks/` — design-system hooks (PLANNED)

- **Purpose** — Presentational, reusable hooks the components themselves need.
- **Responsibilities** — `useControllableState` (controlled/uncontrolled), `useDisclosure`, `useFocusTrap`,
  `useId`-style helpers — the headless logic behind overlays/forms.
- **Allowed imports** — React, `lib/`, `@shared/hooks` generic primitives.
- **Forbidden imports** — domain layers; server-data hooks (those are module/entity `api/`).
- **Future scalability** — `Dialog`/`Drawer`/`Combobox` (planned) lean on these; added as those land.
- **Example** — `hooks/useControllableState.ts`.

#### `providers/` — design-system providers (PLANNED)

- **Purpose** — Cross-component context providers the kit owns (e.g. a `TooltipProvider`, a toast portal root).
- **Responsibilities** — Provide shared overlay context / portal targets; domain-agnostic.
- **Allowed imports** — React, `hooks/`, `lib/`.
- **Forbidden imports** — domain layers; global app providers (those compose in [`app/providers`](../../src/app/)).
- **Future scalability** — Composed once by `app/providers`; new overlay families register here.
- **Example** — `providers/TooltipProvider.tsx`.

#### `animations/` — motion presets (PLANNED)

- **Purpose** — Token-driven, **reduced-motion-aware** motion variants/presets.
- **Responsibilities** — Enter/exit variants for overlays, skeleton shimmer, toast slide — all gated on
  `prefers-reduced-motion` ([Frontend-Bible §10](../Frontend-Bible.md#10-motion) · [Motion.md](./Motion.md)).
- **Allowed imports** — `foundations/` (JS motion tokens), `lib/`.
- **Forbidden imports** — domain layers; hardcoded durations/eases (use `--duration-*`/`--ease-*`).
- **Future scalability** — Framer-motion or a successor swaps behind these presets.
- **Example** — `animations/overlay.variants.ts`.

#### `utilities/` — presentational utilities (PLANNED)

- **Purpose** — Larger presentational helpers that outgrow `lib/`.
- **Responsibilities** — `Portal`, polymorphic `as`/`Slot` helpers, render-prop utilities.
- **Allowed imports** — React, `lib/`.
- **Forbidden imports** — domain layers; stateful/business logic.
- **Future scalability** — Absorbs reusable rendering plumbing as the kit grows.
- **Example** — `utilities/Portal.tsx`.

#### `validators/` — dev-time invariant guards (PLANNED)

- **Purpose** — Presentational **prop** validators / dev-only invariants (e.g. warn if an icon-only
  `IconButton` is missing `aria-label`).
- **Responsibilities** — Fail loudly in dev when an a11y/usage contract is broken; tree-shaken out of prod.
- **Allowed imports** — `lib/`, `@shared/core` (Result, if used).
- **Forbidden imports** — domain layers; runtime cost in production paths.
- **Future scalability** — Hardens the never-color-alone / aria-label contracts mechanically.
- **Example** — `validators/assertIconButtonLabel.ts`.

#### `testing/` — design-system test harness (PLANNED)

- **Purpose** — Kit-scoped test utilities (distinct from the app-wide [`src/testing`](../architecture/FolderStructure.md)).
- **Responsibilities** — `renderWithTheme` (mount under each `data-theme`), the axe helper, story smoke-runner.
- **Allowed imports** — `components/`, `providers/`, test libs, `@shared/theme`.
- **Forbidden imports** — production runtime importing it; domain fixtures.
- **Future scalability** — Visual-regression + per-theme matrices extend here.
- **Example** — `testing/render-with-theme.tsx`.

---

## Part 3 — Component architecture

**There is exactly one architecture every component follows.** Predictability is the point: a developer
(or agent) who has built one component has built them all. The exemplar is the real
[`Button`](../../src/shared/design-system/components/button/Button.tsx) — referenced throughout, not
re-pasted.

### 3.1 The folder shape

```text
components/<kebab>/            # e.g. components/button/
├── <Pascal>.tsx              # the component: JSDoc header + cva + forwardRef + displayName
├── <Pascal>.stories.tsx      # Storybook: every variant/size/state + dark/HC/RTL/Large-Text
├── <Pascal>.test.tsx         # Vitest + RTL + jest-axe (0 violations) + keyboard behavior
└── index.ts                  # barrel: `export { X } from './X'; export type { XProps } from './X';`
```

Compound components add their parts in the **same** folder and export them from the same `index.ts`
(`Card` + `CardHeader/Title/Description/Content/Footer`; `RadioGroup` + `Radio`; `BentoGrid` + `BentoItem`).

### 3.2 File / responsibility breakdown

| File                   | Responsibility                                                                                                                                                                                                                                                                                                                                                                         | The real Button shows                                                                                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Pascal>.tsx`         | **The component.** A `cva()` recipe (tokens-only base + `variants` + `defaultVariants`); a `ButtonHTMLAttributes & VariantProps` props interface; `forwardRef` to the DOM node (or the `asChild` element via `Slot`); `cn(...)` merge so consumer `className` wins; `...props` spread for `aria-*`/`data-*`/handlers; `displayName`. **No hardcoded copy** — text is `children`/props. | [`Button.tsx`](../../src/shared/design-system/components/button/Button.tsx) — `cva` with `primary/secondary/accent/ghost/danger/link` × `sm/md/lg`; `forwardRef`; `aria-busy` on load; `Slot` for `asChild`; `Button.displayName`. |
| `<Pascal>.stories.tsx` | **The living catalog.** One story per variant/size/state, plus dark / high-contrast / RTL / Large-Text renderings; controls for every prop.                                                                                                                                                                                                                                            | [`Button.stories.tsx`](../../src/shared/design-system/components/button/Button.stories.tsx).                                                                                                                                       |
| `<Pascal>.test.tsx`    | **The gate.** Render-and-assert behavior + keyboard interaction + `jest-axe` `toHaveNoViolations()`.                                                                                                                                                                                                                                                                                   | [`Button.test.tsx`](../../src/shared/design-system/components/button/Button.test.tsx).                                                                                                                                             |
| `index.ts`             | **The local barrel.** Named exports of the component + its `Props` type only. Re-exported by the package barrel.                                                                                                                                                                                                                                                                       | [`button/index.ts`](../../src/shared/design-system/components/button/index.ts).                                                                                                                                                    |

> Conventions that are **non-negotiable** (from [Coding-Standards §3, §9, §15](../Coding-Standards.md) and
> [Frontend-Bible §8.2](../Frontend-Bible.md#8-component-library)): function components only; `forwardRef`
>
> - `displayName`; CVA + `tailwind-merge` for variants; **named exports** (no default); **tokens-only**
>   styling; logical properties for RTL; i18n text passed in, never baked.

### 3.3 The registry entry (part of "done")

A component is not done until it is **registered**. Add a `ComponentEntry` to
[`component-registry.ts`](../../src/shared/design-system/registry/component-registry.ts) with `name`,
`category` ([Part 4](./DesignSystem.md#part-4--component-categories)), `status`, `since`, `slug` (the
kebab folder), `composes`, `hasStories`, `hasTests`, the one-line `a11y` contract, and `description`.
`pnpm ds:registry` then validates the folder + export exist and regenerates
[ComponentRegistry.md](./ComponentRegistry.md). **An unregistered folder fails the check.**

### 3.4 The lifecycle (single source of truth, mermaid)

```mermaid
flowchart LR
    P["planned (slug=null)"] --> X["experimental"] --> B["beta"] --> S["stable"]
    S --> D["deprecated"]
    classDef a fill:#6B8E8E,stroke:#827473,color:#fff;
    classDef s fill:#2E9E5B,stroke:#134628,color:#fff;
    classDef d fill:#CF3A3A,stroke:#5f1616,color:#fff;
    class P,X,B a; class S s; class D d;
```

`planned` reserves a name/category so it is never re-invented; `deprecated` keeps one minor cycle with a
JSDoc `@deprecated` + Storybook note before removal ([Frontend-Bible §12.3](../Frontend-Bible.md#12-governance)).

### 3.5 Future extension points (per component, without breaking the contract)

- **More variants/sizes** → extend the `cva` map + `defaultVariants`; additive, type-safe.
- **Polymorphism** → already covered by `asChild`/`Slot` ([`lib/slot.tsx`](../../src/shared/design-system/lib/slot.tsx)).
- **Controlled/uncontrolled** → adopt the planned `hooks/useControllableState` when state-bearing.
- **Compound growth** → add parts in the same folder + barrel (the `Card` pattern).
- **New a11y mode** → handled at the **theme** layer (semantic-token swap), so the component never changes
  ([DesignSystem §1.8](./DesignSystem.md#18-accessibility-first)).

> **Decision (one identical component architecture) — Why/Benefits/Trade-offs/Alternatives/Future/Enterprise**
> **Why:** With hundreds of components, "how is a component built?" must have **one** answer enforceable by
> folder + lint + `ds:registry`. **Benefits:** zero-ramp mobility, mechanical review, contained blast radius
> behind each `index.ts`, independent code-splitting. **Trade-offs:** four files + a registry entry for even
> a tiny component (the consistency tax — worth it). **Alternatives:** per-component bespoke shape (drift,
> ownership guesswork) — rejected. **Future:** the uniform shape is the precondition for extracting
> `@clinicos/ui`. **Enterprise:** one component ≈ one owner ≈ one SemVer unit; audit boundaries are crisp.

---

## Part 11 — Performance

> Performance is a **design-system contract**, not a per-screen afterthought. The kit must add only what a
> screen imports, and heavy/rare components must never tax the common path. Aligns with
> [Coding-Standards §3.6 + §11](../Coding-Standards.md).

### 11.1 Tree-shaking — named exports + `sideEffects`

- **Named exports only, no default** — across the kit and the [barrel](../../src/shared/design-system/index.ts)
  (a default export defeats some bundlers' dead-code elimination). Enforced by
  [Coding-Standards §15](../Coding-Standards.md).
- **No import-time side effects** in the package — the barrel only re-exports. This lets the bundler drop
  any component a screen doesn't reference.
- **`"sideEffects": false`** in the package's `package.json` (when extracted to `@clinicos/ui`) tells the
  bundler the modules are pure and freely shakeable; CSS/asset entries, if any, are listed explicitly so
  they are **not** dropped.
- **Result:** importing `{ Button }` pulls Button (+ its `cva`/`Slot` deps) and nothing else — the other 23
  components stay out of the bundle.

### 11.2 Lazy-loading heavy components

- Heavy/rare components — the planned `Chart` (analytics), `Table`/`DataGrid`, `DatePicker`, `Dialog`/`Drawer`
  — are **`React.lazy` + `Suspense`** behind a `Skeleton`/`Spinner` fallback, so their (and any vendor lib's)
  weight loads on demand, not on first paint.
- Routes are already lazy ([Coding-Standards §11](../Coding-Standards.md)); component-level lazy-loading is the
  finer grain for in-page heavy widgets.
- Charting/date vendors are isolated behind the component so a `Chart` import never pulls a chart lib into a
  screen that has no chart.

### 11.3 Memoization guidance

- **Memoize on measured need, not reflex** ([Coding-Standards §3.6](../Coding-Standards.md)). Cheap leaf
  components (`Badge`, `Divider`, `Label`) are **not** memoized — `memo` costs memory + comparison.
- **Do** memoize: rows rendered en masse (a future `Table`/virtualized queue row), expensive pure renders,
  and callbacks/objects passed into memoized children or hook deps.
- Components that take a `style`/`className` are fine unmemoized; `cn()` is cheap. Don't wrap the whole kit
  in `memo` "to be safe."

### 11.4 Context optimization

- Design-system providers (planned `providers/`, e.g. `TooltipProvider`) keep context **small and stable** —
  split contexts by concern so an unrelated update doesn't re-render every consumer.
- Prefer **composition/slots** over a context when a value travels ≤2 hops
  ([Coding-Standards §6.6](../Coding-Standards.md)); a context whose value changes often must memoize that
  value, or consumers re-render on every provider render.
- The kit holds **no server data** and **no global app state** — theme/locale live in `shared/store`
  ([FolderStructure §4](../architecture/FolderStructure.md)); the kit only reads the resulting CSS variables.

### 11.5 Bundle strategy

- **Per-component code-splitting** is structural: each `components/<kebab>/` is an independent module, so
  bundlers split naturally and the registry's lazy/heavy components stay out of the common chunk.
- **Tokens are CSS variables**, not JS — theming adds **zero** JS bundle weight and switches at runtime with
  no rebuild ([DesignTokens.md](./DesignTokens.md)).
- **Icons** are referenced by concept through the [icon registry](../../src/shared/design-system/icons/registry.ts);
  `lucide-react` is tree-shakeable per-glyph, so only used icons ship.
- **Fonts** are self-hosted, subset, `font-display: swap`, with only the critical weight preloaded
  ([Frontend-Bible §5.3](../Frontend-Bible.md#5-typography)).
- **Future:** extracted as `@clinicos/ui` with `sideEffects: false` + per-component entry points, the kit is
  consumable à-la-carte by multiple apps with minimal bundle impact.

> **Decision (tree-shakeable, lazy-by-default kit) — Why/Benefits/Trade-offs/Alternatives/Future/Enterprise**
> **Why:** a kit that ships all of itself on every page does not scale to hundreds of components.
> **Benefits:** bundle weight ∝ usage; heavy widgets and vendors load on demand; theming is free (CSS vars).
> **Trade-offs:** discipline (named exports, no side effects, explicit lazy boundaries) and a small Suspense
> ergonomics cost. **Alternatives:** a monolithic barrel with side effects (unshakeable) — rejected; eager
> chart/table imports (bloat every screen) — rejected. **Future:** `@clinicos/ui` package with per-entry
> exports. **Enterprise:** predictable, measurable bundle budgets per screen; Web-Vitals stay green at scale.

---

_Foundation blueprint · Owner: Design System / Frontend Architecture · Extends [Frontend-Bible.md](../Frontend-Bible.md)_
_and [architecture/FolderStructure.md](../architecture/FolderStructure.md); contradicts nothing._
_Siblings: [DesignSystem.md](./DesignSystem.md) · [ComponentRegistry.md](./ComponentRegistry.md)._
