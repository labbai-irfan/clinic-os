# ClinicOS Design System — Storybook Guide (Part 9)

> **The Storybook strategy: stories as the living documentation and the interaction-test surface for
> every design-system component.** This is the canonical reference for _what every story must contain_
> and _how the workshop is configured_. To **add** a component, follow
> **[ContributionGuide.md](./ContributionGuide.md)** (this guide is the story half of step 2.2).

Storybook is wired into our real Vite pipeline, so a story renders a component with the **exact** tokens,
themes and aliases as the app. A story is not a demo — it is the component's spec, its prop table, its
a11y check and its interaction test, all from one file.

- **Config:** [`.storybook/main.ts`](../../.storybook/main.ts) · [`.storybook/preview.tsx`](../../.storybook/preview.tsx)
- **Reference story:** [`Button.stories.tsx`](../../src/shared/design-system/components/button/Button.stories.tsx)
- **Run:** `pnpm storybook` (dev, port 6006) · `pnpm build-storybook` (static, runs in CI)

---

## 1. The configuration (read once)

### `.storybook/main.ts`

| Setting                  | Value                                                   | Why                                                                         |
| ------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `framework`              | `@storybook/react-vite`                                 | Reuses our Vite pipeline — one build, one truth.                            |
| `stories`                | `../src/**/*.stories.@(ts\|tsx)`                        | Every co-located `*.stories.tsx` under `src/` is picked up.                 |
| `addons`                 | `@storybook/addon-essentials` + `@storybook/addon-a11y` | Controls/docs/actions/viewport/backgrounds **+ the axe a11y panel**.        |
| `docs.autodocs`          | `'tag'`                                                 | Autodocs are **opt-in per story** via the `autodocs` tag.                   |
| `typescript.reactDocgen` | `react-docgen-typescript`                               | Prop tables are derived from our **TS types + JSDoc** — never hand-written. |
| `viteFinal`              | injects `vite-tsconfig-paths`                           | `@shared/*`, `@app/*` aliases resolve in stories exactly as in the app.     |

### `.storybook/preview.tsx`

- **Imports the single global stylesheet** (`src/app/styles/global.css`) → stories render with the same
  tokens → themes → Tailwind utilities and base reset as the real app.
- **`parameters.layout: 'centered'`** and control matchers (colour/date pickers auto-detected).
- **`parameters.a11y`** scopes axe to `#storybook-root` — the a11y addon runs axe automatically and
  **surfaces** (does not block) violations in the a11y panel.
- **`globalTypes.theme`** adds a **toolbar** to switch `light | dark | high-contrast`.
- **`decorators`** apply the selected theme by setting `data-theme` on `<html>` — the _same hook_ the
  Phase-5 theme engine uses — so you can eyeball every component in every theme without leaving the story.

> Implication: **never** hand-wire a theme provider or import tokens inside a story. The preview already
> gives you tokens + the theme toolbar. Just render the component.

---

## 2. The story format — CSF3 + autodocs

We write **Component Story Format 3** (object stories, not function components) with `tags: ['autodocs']`
so each component gets a generated docs page (description from the component's JSDoc + a props table from
its TS types). The reference is
[`Button.stories.tsx`](../../src/shared/design-system/components/button/Button.stories.tsx):

```tsx
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button', // Components/<Name> — flat, predictable nav.
  component: Button,
  tags: ['autodocs'], // ← opt in to the generated docs page.
  argTypes: {
    // ← drives the controls playground.
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'ghost', 'danger', 'link'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Check in patient', variant: 'primary', size: 'md' }, // sensible defaults.
};
export default meta;

type Story = StoryObj<typeof Button>;
```

**Title convention:** `Components/<PascalName>` (healthcare-specialised ones may live under
`Components/Healthcare/<Name>`). One default export `meta`, one `type Story`.

---

## 3. What every story file MUST include

A component is not "Storybook-done" until the file contains all four:

1. **`Default`** — the component with its default args (often `export const Default: Story = {};`). This
   is the canonical, copy-pasteable example.
2. **Every variant** — one story (or one `render` grid) covering all CVA `variant`s and `size`s. See
   `Variants` and `Sizes` in the reference: a flex grid of every `variant` / every `size`.
3. **Every state** — loading, disabled, error/empty, full-width, icon-start/icon-end, `asChild`, etc. —
   whatever states the component supports. `Button` ships `Loading`, `Disabled`, `FullWidth`,
   `WithIcons`, `AsLink`. **No state may be undocumented.**
4. **A playground** — the controls-driven story. `Default` + the `argTypes`/`args` in `meta` already give
   a live playground (every prop is a control); keep `argTypes` exhaustive so reviewers can drive every
   prop from the Controls panel.

> The mapping to the registry: a component with a story file flips `hasStories: true` in the
> [Component Registry](../../src/shared/design-system/registry/component-registry.ts). `pnpm ds:registry`
> does not parse story coverage, so **completeness is a review gate** — a reviewer blocks a story missing
> a variant or a state.

### Authoring rules

- **Tokens + i18n only**, even in stories — story copy is illustrative UI text, never a hardcoded
  product string that should be an i18n key. Decorative icons get `aria-hidden` (see `WithIcons`).
- **Use `render` for grids**, `args` for single-config stories — match the reference.
- **Show `asChild`/polymorphism** where the component supports it (`AsLink` renders a real `<a>`).
- **Check all three themes** via the toolbar before you call it done (light / dark / high-contrast).

---

## 4. Interaction tests with `@storybook/test`

For behaviour that is best shown _and_ verified in the browser (focus order, open/close, keyboard nav,
form submit), add a **`play` function** using `@storybook/test` (`userEvent` + `expect` + `within`). The
story doubles as an interaction test that runs in `build-storybook` / the test-runner:

```tsx
import { expect, userEvent, within } from '@storybook/test';

export const OpensOnClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /add patient/i }));
    await expect(canvas.getByRole('dialog')).toBeVisible();
  },
};
```

**Division of labour with Vitest** (full detail in [TestingGuide.md](./TestingGuide.md)):

- **Vitest + RTL + `vitest-axe`** (`*.test.tsx`) — the _required_ behaviour + a11y gate; runs in
  `pnpm verify`.
- **Storybook `play`** — interaction flows that are clearer as a visible, theme-rendered scenario
  (overlays, roving focus, multi-step forms). Complementary, not a replacement for the unit test.

---

## 5. Stories as living documentation

Because `autodocs` derives the description from JSDoc and the props table from TS types, **the docs can
never drift from the code** — there is no second copy to update. This is why:

- Every public prop carries a JSDoc line in the component (see `ButtonProps` in
  [`Button.tsx`](../../src/shared/design-system/components/button/Button.tsx)) — it becomes the props-table
  description.
- The component's top-of-file JSDoc becomes the autodocs intro.
- The `a11y` and `description` lines you register in the
  [Component Registry](../../src/shared/design-system/registry/component-registry.ts) are the one-line
  catalog summary that links back to Storybook for the full surface.

The generated catalog [`ComponentRegistry.md`](./ComponentRegistry.md) closes the loop: its legend points
readers to `pnpm storybook` for full props/a11y per component.

---

## 6. The a11y addon

`@storybook/addon-a11y` runs **axe-core** on the rendered story and reports violations in the **a11y
panel**. It is a fast feedback loop while authoring — but it is **non-blocking** in Storybook. The
_blocking_ a11y check is the `vitest-axe` `toHaveNoViolations` assertion in the co-located test (see
[TestingGuide §2](./TestingGuide.md#22-accessibility-tests-vitest-axe)). Use both: the panel to catch
issues live across the theme toolbar, the unit test to gate the merge.

---

## 7. Visual-regression — a future option

Storybook already produces a deterministic, theme-aware render of every state, which is the ideal input
for **visual-regression** snapshots (Chromatic, or Playwright screenshots against `build-storybook`).
This is **planned, not yet wired** — when adopted it runs against the static build in CI across the three
themes. Until then, do not add ad-hoc image snapshots; rely on the unit/interaction tests and reviewer
eyeballing across the theme toolbar.

---

## 8. Checklist (paste into the PR)

```text
[ ] CSF3 meta with title `Components/<Name>` + tags: ['autodocs']
[ ] argTypes cover every prop (controls playground is exhaustive)
[ ] Default story present
[ ] Every CVA variant + every size shown
[ ] Every state shown (loading/disabled/error/empty/icons/asChild as applicable)
[ ] Verified in light / dark / high-contrast via the theme toolbar
[ ] a11y panel clean; decorative icons aria-hidden; no hardcoded product strings
[ ] play() interaction test added where behaviour is overlay/keyboard/form-shaped
[ ] hasStories: true set in the Component Registry; pnpm build-storybook green
```

See also: **[ContributionGuide.md](./ContributionGuide.md)** ·
**[TestingGuide.md](./TestingGuide.md)** · **[MigrationGuide.md](./MigrationGuide.md)** ·
**[ComponentRegistry.md](./ComponentRegistry.md)** · config
[`.storybook/main.ts`](../../.storybook/main.ts) + [`.storybook/preview.tsx`](../../.storybook/preview.tsx).

---

_Part 9 · Governed by [AI_RULES.md](../architecture/AI_RULES.md) +
[Project-Checklist.md](../Project-Checklist.md) · Status: **Foundation v1**_
