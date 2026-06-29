# ClinicOS Design System — Testing Guide (Part 10)

> **The testing architecture for design-system components: what to test, with what, and which components
> MUST have which tests.** To _add_ a component, follow **[ContributionGuide.md](./ContributionGuide.md)**
> (this guide is the test half of step 2.3). For the Storybook interaction layer, see
> **[StorybookGuide.md](./StorybookGuide.md)**.

We test **behaviour, not implementation**. A design-system test asserts what a user (and assistive tech)
experiences — roles, names, states, keyboard — never internal class names, refs, or call counts. The
reference is [`Button.test.tsx`](../../src/shared/design-system/components/button/Button.test.tsx).

- **Stack:** Vitest + React Testing Library (RTL) + `vitest-axe` + `@testing-library/user-event`.
- **Run:** `pnpm test` (= `vitest run`) · `pnpm test:watch` · `pnpm coverage`. Part of `pnpm verify`.

---

## 1. The five test kinds (and when to reach for each)

| Kind                 | Tool                                                | What it asserts                                                                                  | When                         |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| **Unit / behaviour** | Vitest + RTL                                        | Renders correct role + accessible name; props change behaviour; states (disabled/loading/error). | **Every** shipped component. |
| **Accessibility**    | `vitest-axe` `toHaveNoViolations`                   | Zero axe violations in the rendered output.                                                      | **Every** shipped component. |
| **Interaction**      | `@testing-library/user-event` (or Storybook `play`) | Keyboard + pointer flows: focus, activation, roving, open/close, submit.                         | Anything interactive.        |
| **Snapshot**         | Vitest inline/file snapshot                         | Stable serialized output.                                                                        | **Sparingly** — see §2.4.    |
| **Performance**      | render-count assertions / `React.Profiler`          | No needless re-renders; stable identities.                                                       | Guidance only — see §2.5.    |

---

## 2. How to write each

### 2.1 Unit / behaviour (Vitest + RTL)

Query by **role + accessible name** (`getByRole`), the way AT sees the UI. Assert outcomes, not
internals. From the reference:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders a button with its accessible name from children', () => {
    render(<Button>Check in patient</Button>);
    expect(screen.getByRole('button', { name: 'Check in patient' })).toBeInTheDocument();
  });

  it('is disabled and marked busy while loading', () => {
    render(
      <Button isLoading loadingLabel="Saving">
        Save
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /save/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('renders as a child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="#queue">Go to queue</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Go to queue' })).toBeInTheDocument();
  });
});
```

Rules:

- **`getByRole` first**, then `getByLabelText` / `getByText`. Avoid `getByTestId` and **never** query by
  class name or DOM structure.
- **Assert the contract**, not the styling — `toBeDisabled()`, `aria-busy`, `aria-invalid`,
  `role="switch"` + `aria-checked`, not `toHaveClass('bg-primary')`.
- **One behaviour per `it`**; a clear `describe(ComponentName)` block.

### 2.2 Accessibility tests (`vitest-axe`)

Every shipped component renders into a container and asserts **zero violations**. This is the _blocking_
a11y gate (the Storybook a11y panel is the non-blocking live one — see
[StorybookGuide §6](./StorybookGuide.md#6-the-a11y-addon)).

```tsx
import { axe } from 'vitest-axe';

it('has no axe violations', async () => {
  const { container } = render(<Button>Check in patient</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```

Run axe over the **states that change semantics** too — e.g. the error state (`aria-invalid`), the
loading state (`aria-busy`), the icon-only variant (must carry an `aria-label`). One clean default plus
the semantically-distinct states.

### 2.3 Interaction (`user-event`)

Drive real keyboard + pointer with `userEvent` and assert the resulting role/state. Prefer keyboard paths
(`Tab`, `Enter`, `Space`, arrows) — they are the a11y contract.

```tsx
import userEvent from '@testing-library/user-event';

it('toggles on Space and exposes aria-checked', async () => {
  const user = userEvent.setup();
  render(<Switch aria-label="Notifications" />);
  const sw = screen.getByRole('switch');
  await user.click(sw);
  expect(sw).toHaveAttribute('aria-checked', 'true');
  sw.focus();
  await user.keyboard(' ');
  expect(sw).toHaveAttribute('aria-checked', 'false');
});
```

Overlay/roving-focus/multi-step flows that read better _visibly_ can live as a Storybook `play` test
instead (see [StorybookGuide §4](./StorybookGuide.md#4-interaction-tests-with-storybooktest)) — they are
complementary; the unit a11y + behaviour test is still required.

### 2.4 Snapshot (sparingly)

Snapshots catch _unintended_ markup change but are brittle and reviewer-blind. Use them **only** for
output that is stable and hard to assert otherwise (e.g. an SVG icon's structure), and prefer small
**inline** snapshots over large file snapshots. **Never** snapshot a whole component to avoid writing real
behaviour assertions — a snapshot is not a substitute for a role/name/state test.

### 2.5 Performance (render-count guidance)

Performance is _guidance_, not a standing gate, but for components used in long lists / hot paths:

- Assert **no needless re-renders** with a render-count spy or `React.Profiler` when a parent re-renders
  but props are referentially stable.
- Verify **`forwardRef` + stable identities** (memoised callbacks, CVA result not recomputed pointlessly).
- Keep these tests few and targeted; do not micro-benchmark in unit tests.

---

## 3. Which component MUST have which tests

The [Component Registry](../../src/shared/design-system/registry/component-registry.ts) tracks
**`hasTests`** per component. The contract:

- **Every shipped (`slug !== null`) component MUST have** a `*.test.tsx` with at least: one
  role/name render test, the relevant state/behaviour tests, and a **`vitest-axe` `toHaveNoViolations`**
  assertion. When it does, set `hasTests: true`.
- **Interactive components** (anything with state/keyboard: `Switch`, `Checkbox`, `Radio`, `Select`,
  `Tooltip`, overlays) **MUST** additionally have interaction coverage (`user-event` and/or a Storybook
  `play`).
- **Composing components** (`StatusBadge`→`Badge`, `EmptyState`/`ErrorState`→`Button`) test their _own_
  added behaviour and a11y; they trust the composed component's own tests — do not re-test `Button`
  inside `EmptyState`.

> `hasTests: true` is a **promise**: the file exists and covers behaviour + axe. Today `Button`, `Input`,
> `Checkbox`, `Switch`, `Card`, `Badge`, `Alert`, `EmptyState` carry it; components currently `false`
> (e.g. `IconButton`, `Textarea`, `Tooltip`) are the standing backlog — adding their tests is a
> registry-flipping change. `pnpm ds:registry` validates the folder/barrel wiring, **not** test
> coverage, so honesty of `hasTests` is a **review gate**: never set it `true` without the file.

---

## 4. Conventions

- **Co-location.** The test lives next to the component as `<Component>.test.tsx` inside
  `components/<kebab>/` — never a separate `__tests__` tree. (Same folder as the component + its story +
  `index.ts`; see [ContributionGuide §2](./ContributionGuide.md#2-scaffold-componentskebab).)
- **No `any`, strict TS.** Tests honour the same strict config as `src/`.
- **Behaviour over implementation**, always — if a refactor that preserves the user-facing contract
  breaks a test, the test was wrong.
- **Deterministic.** No real timers/network; fake timers where needed; `userEvent.setup()` per test.
- **Reduced-motion / RTL aware.** Where a component branches on `prefers-reduced-motion` or logical
  direction, assert the degraded/flipped behaviour too.

---

## 5. Checklist (paste into the PR)

```text
[ ] <Component>.test.tsx co-located in components/<kebab>/
[ ] Renders correct role + accessible name (getByRole)
[ ] State/behaviour tests (disabled/loading/error/checked …) assert the contract, not classes
[ ] vitest-axe toHaveNoViolations on the default + semantically-distinct states
[ ] Interaction (user-event / Storybook play) for keyboard + pointer if interactive
[ ] Snapshots only where justified; no whole-component snapshot in place of assertions
[ ] hasTests set truthfully in the Component Registry; pnpm test (pnpm verify) green
```

See also: **[ContributionGuide.md](./ContributionGuide.md)** ·
**[StorybookGuide.md](./StorybookGuide.md)** · **[MigrationGuide.md](./MigrationGuide.md)** ·
the reference test [`Button.test.tsx`](../../src/shared/design-system/components/button/Button.test.tsx) ·
[Project-Checklist §3.5 / §3.11](../Project-Checklist.md) for the broader a11y + quality gates.

---

_Part 10 · Governed by [AI_RULES.md](../architecture/AI_RULES.md) +
[Project-Checklist.md](../Project-Checklist.md) · Status: **Foundation v1**_
