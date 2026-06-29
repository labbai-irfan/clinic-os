# ClinicOS Design System — Contribution Guide (Part 13)

> **How to add or change a design-system component without breaking the canon.**
> This is the step-by-step, copy-pasteable workflow. It assumes you have already read the
> architecture-level rules in **[AI_RULES.md](../architecture/AI_RULES.md)** (the binding operating
> manual) and the Phase-1 Definition of Done in **[Project-Checklist.md](../Project-Checklist.md)**.
> For _what good looks like_ per concern, read the siblings: **[StorybookGuide.md](./StorybookGuide.md)**,
> **[TestingGuide.md](./TestingGuide.md)**, **[MigrationGuide.md](./MigrationGuide.md)**.

ClinicOS is a healthcare Clinic Operating System built for a **10+ year horizon**. A single
duplicated component or a skipped registry update compounds across hundreds of developers. The
**[Component Registry](../../src/shared/design-system/registry/component-registry.ts)** is the
machine-checkable source of truth that stops that drift — and `pnpm ds:registry` _enforces_ it.

---

## 0. The golden rule

> **Check the [Component Registry](./ComponentRegistry.md) FIRST. Never duplicate. Reuse, compose, or extend.**

Every component that ships — and every one that is _planned_ — is tracked in
[`src/shared/design-system/registry/component-registry.ts`](../../src/shared/design-system/registry/component-registry.ts).
If the thing you need already exists, consume it from `@shared/design-system`. If it is _planned_
(status `planned`, `slug: null`), you are building exactly that entry — do **not** invent a new name
for it. If it does not exist at all, surface the gap and add it properly (this guide).

---

## 1. Before you write a line — the pre-flight

Run [AI_RULES §3 pre-flight](../architecture/AI_RULES.md#3-mandatory-pre-flight-checklist-run-before-writing-code), then specifically for a DS component:

1. **Search the registry + the barrel.** `getComponentEntry('X')` and grep `components/`. Is there a
   `stable`/`beta` component you can reuse or compose? A `planned` entry you are now fulfilling?
2. **Confirm placement.** A DS component lives in `shared/design-system` and knows **zero domain**.
   Anything clinical/domain-aware belongs in a module — _not here_. (StatusBadge is the line: it is a
   generic tone+icon+text badge specialised for queue lifecycle, composing `Badge` — still domain-free.)
3. **Confirm tokens exist.** Every colour/size/space/radius/shadow/duration → a semantic or component
   **token** must already exist (see [DesignTokens.md](./DesignTokens.md)). Never hardcode. If a token
   is missing, add it at the right tier first and update the Theme Registry.
4. **Confirm a11y contract.** Roles/ARIA, `:focus-visible` ring, ≥44px target, no colour-alone,
   RTL-safe logical properties. Write the one-line a11y contract you will register.
5. **Pick the category + status.** One primary [`ComponentCategory`](../../src/shared/design-system/registry/component-registry.ts)
   and a starting [`ComponentStatus`](./MigrationGuide.md#2-the-status-lifecycle) (`experimental` for new
   surfaces, `stable` only once tested + documented + reviewed).

---

## 2. Scaffold `components/<kebab>/`

Create the folder in kebab-case (`icon-button`, `status-badge`). Components that compose together live
in **one** folder (Card + its subcomponents; RadioGroup + Radio; BentoGrid + BentoItem). Every shipped
component folder has exactly these four files:

```
src/shared/design-system/components/<kebab>/
├── <Component>.tsx          # implementation: cva + forwardRef + displayName
├── <Component>.stories.tsx  # Storybook: Default + variants + states + playground
├── <Component>.test.tsx     # Vitest + RTL + vitest-axe (behaviour + a11y)
└── index.ts                 # named re-exports (component + its prop types)
```

### 2.1 `<Component>.tsx` — the canonical shape

Mirror the reference component
[`components/button/Button.tsx`](../../src/shared/design-system/components/button/Button.tsx). Every
component is: **CVA for variants → tokens only → `forwardRef` → `displayName`**.

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn'; // tailwind-merge wrapper — the ONLY class composer

// 1) Variants via CVA. Base + variant maps reference ONLY token-backed Tailwind utilities
//    (bg-primary, text-primary-fg, ring-focus, h-12 …). No raw hex/px. No primitives.
const widget = cva(
  'inline-flex items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-focus',
  {
    variants: {
      variant: { primary: 'bg-primary text-primary-fg', ghost: 'bg-transparent text-text' },
      size: { sm: 'h-10 px-4 text-body-sm', md: 'h-12 px-5 text-body-md' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

// 2) Props extend the native element + VariantProps. No `any`. Document each prop with JSDoc.
export interface WidgetProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof widget> {}

// 3) forwardRef to the underlying element so consumers can focus/measure it.
export const Widget = forwardRef<HTMLButtonElement, WidgetProps>(function Widget(
  { className, variant, size, ...props },
  ref,
) {
  return <button ref={ref} className={cn(widget({ variant, size }), className)} {...props} />;
});

// 4) displayName — required (clean DevTools + Storybook docgen names).
Widget.displayName = 'Widget';
```

**Hard rules for the implementation** (from [AI_RULES §5/§6](../architecture/AI_RULES.md#5-hard-never-list-enterprise)):

- **Tokens only.** No hardcoded colour/size/space/radius/shadow/duration/font. Tailwind utility mapped
  to a token first; a semantic CSS var second; **never** a primitive or a literal. (See the consumption
  rule in [README.md](./README.md).)
- **No domain, no literals.** `shared` knows zero domain. The component takes already-translated strings
  or i18n keys from the consumer — **never** hardcodes human-readable copy.
- **A11y is not optional.** Semantic HTML first, ARIA to fill gaps, token-driven `:focus-visible` ring,
  ≥44px targets, no colour-alone signalling, logical (RTL-safe) properties, reduced-motion honoured.
- **`asChild` where polymorphism is needed** — use the shared `Slot` (`../../lib/slot`) so the styling
  can render onto a child (`<a>` / router `Link`), exactly as `Button` does.

### 2.2 `<Component>.stories.tsx`

CSF3 + `tags: ['autodocs']`, with **Default + every variant + every state + a controls playground**.
Full recipe and the a11y/theme-toolbar contract: **[StorybookGuide.md](./StorybookGuide.md)**. Model it
on [`Button.stories.tsx`](../../src/shared/design-system/components/button/Button.stories.tsx).

### 2.3 `<Component>.test.tsx`

Co-located Vitest + RTL + `vitest-axe`. **Behaviour, not implementation**, plus a `toHaveNoViolations`
axe assertion. Which tests are mandatory and how to write them: **[TestingGuide.md](./TestingGuide.md)**.
Model it on [`Button.test.tsx`](../../src/shared/design-system/components/button/Button.test.tsx).

### 2.4 `index.ts` — the folder barrel

Named re-exports only — the component and its prop types. No default export, no side effects (keeps the
kit tree-shakeable). Exactly like
[`button/index.ts`](../../src/shared/design-system/components/button/index.ts):

```ts
export type { WidgetProps } from './Widget';
export { Widget } from './Widget';
```

---

## 3. Export from the package barrel

Add the folder to the design-system public barrel
[`src/shared/design-system/index.ts`](../../src/shared/design-system/index.ts), in its category block,
alphabetically:

```ts
export * from './components/widget';
```

Consumers import **only** from `@shared/design-system` (`import { Widget } from '@shared/design-system'`)
— never reach into a component folder directly. `ds:registry` fails the build if a shipped folder is not
exported here.

---

## 4. Register it in the Component Registry — non-negotiable

Add a single-line entry to
[`src/shared/design-system/registry/component-registry.ts`](../../src/shared/design-system/registry/component-registry.ts)
in the matching category block. **A component added without registering it fails `pnpm ds:registry`.**

```ts
{ name: 'Widget', category: 'form', status: 'experimental', since: V1, slug: 'widget',
  composes: ['Icon'], hasStories: true, hasTests: true,
  a11y: 'keyboard-operable; focus ring; aria-* contract in one line',
  description: 'One-line purpose.' },
```

Field rules:

| Field         | Rule                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | PascalCase public export name — must match the barrel export exactly.                                                                     |
| `category`    | One primary [`ComponentCategory`](../../src/shared/design-system/registry/component-registry.ts).                                         |
| `status`      | Lifecycle — see [MigrationGuide §2](./MigrationGuide.md#2-the-status-lifecycle). New ⇒ `experimental`.                                    |
| `since`       | Foundation version it ships in (`V1` = `0.6.0`). Use the existing const; bump per [SemVer](./MigrationGuide.md).                          |
| `slug`        | The kebab folder name. `null` only for `planned`.                                                                                         |
| `composes`    | Other DS components it composes/re-exports (optional).                                                                                    |
| `hasStories`  | `true` once the story file exists. Every shipped component **must** have stories.                                                         |
| `hasTests`    | `true` once `*.test.tsx` exists. See [TestingGuide](./TestingGuide.md#3-which-component-must-have-which-tests) for which components MUST. |
| `a11y`        | One-line accessibility contract (what AT sees / how it is keyboard-operable).                                                             |
| `description` | One-line purpose.                                                                                                                         |

> Fulfilling a `planned` entry? **Edit it in place** — flip `status`/`slug`/`since`/`hasStories`/
> `hasTests`, never add a second row. (See the memory note: extend, don't duplicate.)

---

## 5. Run `pnpm ds:registry` — validate + regenerate the catalog

```bash
pnpm ds:registry
```

[`scripts/ds-registry.mjs`](../../scripts/ds-registry.mjs) does two things from the single source:

1. **Validates** (exit 1 on any mismatch) that:
   - every `components/<slug>/` folder is **registered**,
   - every registered non-planned slug **has a folder**,
   - every registered non-planned slug is **exported from the barrel**.
2. **Regenerates** the human catalog [`ComponentRegistry.md`](./ComponentRegistry.md) — _generated, do
   not hand-edit_.

If it fails, it prints exactly which of {registered, folder, barrel-export} is missing. Fix the source of
truth, not the generated file.

---

## 6. Run the full gate

```bash
pnpm verify        # typecheck → lint → format:check → test (the standing gate)
pnpm ds:registry   # registry ↔ folders ↔ barrel consistent + catalog regenerated
pnpm build-storybook   # stories compile as living docs (or `pnpm storybook` locally)
```

Everything must be green. `pnpm verify` is defined in `package.json` as
`typecheck && lint && format:check && test`. CI runs the same gate plus the registry check; a red gate
blocks the merge (see [Project-Checklist §3.13](../Project-Checklist.md)).

---

## 7. Update the docs + the Brain (same change — never "later")

Per [AI_RULES §4 post-work workflow](../architecture/AI_RULES.md#4-the-post-work-update-workflow-the-heart-of-part-8):

- **Component Registry** entry added/updated (done in step 4) — and the **Theme / Localization / Asset**
  registries if you touched tokens, strings, or assets.
- **Changelog** — one dated entry: what changed and why (see [MigrationGuide §5](./MigrationGuide.md#5-announcing-changes-changelog--codemods)).
- **PROJECT_BRAIN.md §22** (the live Component Registry mirror) — keep it in lock-step.
- **These design-system docs** — if you introduced a new pattern, link it from [README.md](./README.md).

> Rule of thumb: **if a reviewer would have to read your diff to know the component exists, you have not
> finished — register it.** Registry + docs ship in the _same_ diff as the code.

---

## 8. Changing an existing component

- **Additive (new variant/prop, default unchanged):** minor bump. Update the story (new variant), the
  test, the registry `a11y`/`description` if the contract shifted, and the Changelog.
- **Breaking (renamed/removed prop, changed default, changed DOM/role):** follow
  **[MigrationGuide.md](./MigrationGuide.md)** — deprecation window, `deprecated` status, CHANGELOG +
  codemod guidance, major bump. Never silently break a consumer.

---

## 9. The Design-System AI Rules (Part 13) — pin these

These extend [AI_RULES.md](../architecture/AI_RULES.md) for design-system work specifically:

1. **Never duplicate a component.** Check the registry first; reuse, compose, or extend — never re-invent
   (`StatusBadge` composes `Badge`; `EmptyState`/`ErrorState` compose `Button`).
2. **Never hardcode styles.** Tokens only — Tailwind-utility-mapped-to-token first, semantic CSS var
   second, never a primitive or a literal value.
3. **Always check the registry** before adding, naming, or "rebuilding" anything — including `planned`
   entries you must fulfil rather than rename.
4. **Always reuse / compose / extend** the `shared` version; `shared/design-system` knows zero domain.
5. **Always update Storybook + docs + Brain + Registry** in the _same_ change — stories (all variants +
   states), the four design-system guides, PROJECT_BRAIN, and the registry. The change is the code
   **plus the memory of the code**.

See also: **[StorybookGuide.md](./StorybookGuide.md)** · **[TestingGuide.md](./TestingGuide.md)** ·
**[MigrationGuide.md](./MigrationGuide.md)** · **[ComponentRegistry.md](./ComponentRegistry.md)** ·
the registry source [`component-registry.ts`](../../src/shared/design-system/registry/component-registry.ts)

- validator [`ds-registry.mjs`](../../scripts/ds-registry.mjs).

---

_Part 13 · Extends [AI_RULES.md](../architecture/AI_RULES.md) · Governed by the
[Component Registry](../../src/shared/design-system/registry/component-registry.ts) +
[`pnpm ds:registry`](../../scripts/ds-registry.mjs) · Status: **Foundation v1**_
