# ClinicOS — Design System Best Practices (Part 13)

> **The distilled, actionable DOs and DON'Ts for building and consuming ClinicOS components.**
> Part 5–7 (the contract) live in [ComponentStandards.md](./ComponentStandards.md); this is the
> field guide — the rules you actually keep in your head while writing a component.
>
> It does **not** restate the reasoning — that lives in the canon, cross-linked throughout:
> [Frontend-Bible.md](../Frontend-Bible.md) (design/a11y "why"),
> [Coding-Standards.md](../Coding-Standards.md) (React/TS shape),
> [Project-Checklist.md](../Project-Checklist.md) (the DoD gate),
> [README.md](./README.md)/[ColorSystem.md](./ColorSystem.md) (tokens),
> [ComponentRegistry.md](./ComponentRegistry.md) (the catalog).
>
> Examples are the real shipped components under `src/shared/design-system/`.

---

## Table of contents

- [The ten rules (at a glance)](#the-ten-rules-at-a-glance)
- [1. Compose, don't copy](#1-compose-dont-copy)
- [2. Tokens only — no hardcoded styles](#2-tokens-only--no-hardcoded-styles)
- [3. Reuse before create — check the registry](#3-reuse-before-create--check-the-registry)
- [4. Accessible by default](#4-accessible-by-default)
- [5. Localized by default](#5-localized-by-default)
- [6. One component, one responsibility](#6-one-component-one-responsibility)
- [7. Avoid prop explosion — favour composition](#7-avoid-prop-explosion--favour-composition)
- [8. Test the behaviour, not the implementation](#8-test-the-behaviour-not-the-implementation)
- [9. The common-mistakes gallery](#9-the-common-mistakes-gallery)
- [10. Design-system-specific rules](#10-design-system-specific-rules)

---

## The ten rules (at a glance)

| #   | DO                                                          | DON'T                                                       |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | Compose with `children` / compound parts / `asChild`        | Copy-paste a component to tweak one thing                   |
| 2   | Style via CVA + token utilities, merge with `cn`            | Hardcode hex/px/rem (`bg-[#…]`, `p-[17px]`, `style`)        |
| 3   | Search the registry + `@shared/design-system` first         | Create a near-duplicate of an existing component            |
| 4   | Semantic element, focus ring, ARIA, keyboard — by default   | Bolt a11y on later / `div onClick` as a button              |
| 5   | Take all copy as props/children; caller passes `t(...)`     | Hardcode a string or an English `aria-label`                |
| 6   | One job per component (`Switch` toggles, `Badge` labels)    | A mega-component that headers, bodies, footers, and fetches |
| 7   | Add a compound part when you'd add a 3rd structural boolean | Grow a 12-boolean prop matrix                               |
| 8   | Assert behaviour (axe, keyboard, controlled/uncontrolled)   | Assert class names / internal structure                     |
| 9   | Learn the gallery (§9) before review                        | Repeat a known mistake the linter or axe will catch         |
| 10  | Obey the DS contract (forwardRef, displayName, Slot)        | Ship a component without a ref, name, or story              |

---

## 1. Compose, don't copy

Build new UI by **combining** existing components, not by forking them. A copy is a second thing to
keep accessible, localized, tokenized, and tested forever.

✅ **DO** — assemble from shipped primitives + compound parts:

```tsx
// A patient tile = Card (asChild link) + Card parts + StatusBadge + Button — zero new components
<Card interactive asChild>
  <a href={href}>
    <CardHeader>
      <CardTitle>{t('patient.card.title')}</CardTitle>
    </CardHeader>
    <CardContent>
      <StatusBadge status="waiting" label={t('queue.status.waiting')} />
    </CardContent>
    <CardFooter>
      <Button size="sm">{t('common.action.open')}</Button>
    </CardFooter>
  </a>
</Card>
```

❌ **DON'T** — copy `Card.tsx` to `PatientCard.tsx` and change a class. Now two cards drift on tokens,
focus rings, and dark-mode. (Memory: _edit/extend existing files, never duplicate._)

> See [ComponentStandards §6.4](./ComponentStandards.md#64-composition-over-configuration) for the
> Decision Contract behind composition.

---

## 2. Tokens only — no hardcoded styles

Every color/size/space/radius/shadow/duration is a token (Bible §3; Coding-Standards §9;
[DesignGuidelines do/don't gallery](./DesignGuidelines.md#do--dont-gallery-tokens-only)). If a visual
value isn't a token, it doesn't exist.

✅ **DO** — token-mapped Tailwind utilities through CVA, merged with `cn`:

```tsx
// Input.tsx — every value is a semantic token utility; cn() lets the caller's className win last
'block w-full bg-surface-raised text-text rounded-md border border-border h-12 px-4 text-body-md ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50';
```

❌ **DON'T** — hardcode, or reach for a **primitive**:

```tsx
<div className="bg-[#E87D7D] p-[16px] text-[18px]" />          // hardcoded
<div className="bg-[var(--color-rose-500)]" />                  // primitive in a component — banned
<div style={{ padding: 17, boxShadow: '0 4px 12px #0003' }} /> // raw style
```

The layer contract (TSX may read **component + semantic only**) is in [README](./README.md#the-consumption-rule-memorize-this).

---

## 3. Reuse before create — check the registry

Before adding any component, search the **[ComponentRegistry](./ComponentRegistry.md)** and
`@shared/design-system` (Project-Checklist §3.3: "Reuse before create"). 24 components already ship.

✅ **DO**:

- Need a status pill? → `Badge` / `StatusBadge` already exist.
- Need a labelled field? → `FormField` + `Input`/`Switch` already wire `aria-describedby`/`aria-invalid`.
- Need a clickable surface? → `Card interactive asChild`, not a new component.
- Specialize via a thin wrapper (like `StatusBadge` wraps `Badge`), not a fork.

❌ **DON'T** create `MyButton`, `AppCard`, or `StatusChip` when `Button`, `Card`, `Badge` cover it. A
genuinely new primitive follows the governance flow in [Bible §12.2](../Frontend-Bible.md#122-adding-or-changing-a-component)
and lands in the registry.

---

## 4. Accessible by default

A11y is a feature, not a setting (Bible §9, Law 3). It ships **with** the component or the component
doesn't ship.

✅ **DO**:

- Use the **semantic element** (`Switch` is a `<button role="switch">`, not a div).
- Ship the **token focus ring** everywhere: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`.
- Wire **ARIA to real state** and drop it when false: `aria-invalid={invalid || undefined}` (Input),
  `aria-busy={isLoading || undefined}` (Button).
- **Keyboard-operate** custom widgets and **chain** consumer handlers (Switch's `onKeyDown` calls
  `onKeyDown?.(event)` first).
- **Never color alone** — status = color + icon + text (StatusBadge).

❌ **DON'T**: `div onClick`, removed outlines, hardcoded English `aria-label`, `tabindex > 0`, or a
bare colored dot as a status. The full per-component checklist is
[ComponentStandards §5.1–5.7](./ComponentStandards.md#part-5--the-component-quality-checklist);
the audit is [Project-Checklist §5](../Project-Checklist.md#5-accessibility-audit-checklist-wcag-22-aa).

---

## 5. Localized by default

The kit owns **zero** strings (Bible §8.2; Coding-Standards §13). All human-readable text is a
**prop/children**; the caller passes `t(...)`.

✅ **DO**:

```tsx
// FormField takes label/hint/error as props; Button takes a loadingLabel; StatusBadge a label
<FormField label={t('vitals.form.heartRate')} error={errors.heartRate && t(`form.error.${errors.heartRate.type}`)}>
  <Input inputMode="numeric" {...register('heartRate')} />
</FormField>
<Button isLoading loadingLabel={t('common.saving')}>{t('vitals.action.saveContinue')}</Button>
```

- Logical CSS only (`ms-*`/`pe-*`/`text-start`) so RTL (ur) flips for free (Bible §4.4).
- Numbers/dates/currency via `Intl`, never string-built (Coding-Standards §13).

❌ **DON'T**: `<button>Save</button>`, `aria-label="Close"`, string-concatenated sentences, or
`ml-4`/`text-left`. The audit is [Project-Checklist §6](../Project-Checklist.md#6-localization-audit-checklist).

---

## 6. One component, one responsibility

Each component does exactly one job, well (Brain Law 8: simplicity beats cleverness).

✅ **DO**: `Switch` toggles; `Badge` labels; `Input` is a text field; `FormField` wires
label+hint+error to a control; `StatusBadge` maps a queue status to tone+icon+label. None of them fetch
data, own copy, or render unrelated regions.

❌ **DON'T**: a `Field` that also fetches the patient, formats currency, and renders a modal.
Data-wiring belongs in a **container** (Coding-Standards §4.2); copy belongs to the caller; unrelated
regions are **separate** components composed together.

```tsx
// ✅ presentational DS component: props in, JSX out (Coding-Standards §4.2)
export const VitalsReadout = ({ vitals }: { vitals: Vitals }) => {
  /* JSX only */
};
// ❌ a DS component importing a query hook or HttpClient — never (Coding-Standards §8)
```

---

## 7. Avoid prop explosion — favour composition

The moment you'd add a third boolean/enum that changes **structure**, switch to composition
(Coding-Standards §3.5; [ComponentStandards §6.4](./ComponentStandards.md#64-composition-over-configuration)).

✅ **DO** — compound parts and `children`:

```tsx
<Card>
  <CardHeader>
    <CardTitle>{t('vitals.card.title')}</CardTitle>
  </CardHeader>
  <CardContent>
    <VitalsReadout vitals={vitals} />
  </CardContent>
  <CardFooter>
    <Button>{t('common.action.edit')}</Button>
  </CardFooter>
</Card>
```

❌ **DON'T** — configuration soup:

```tsx
<Card hasHeader title="Vitals" headerIcon="heart" footerButtonLabel="Edit" variant="bento" dense />
```

> Keep variants **semantic and few** (CVA): Button has `variant` + `size` + `fullWidth`, not fifteen
> booleans. New structure → new compound part, not new prop.

---

## 8. Test the behaviour, not the implementation

Tests assert what the user/AT experiences, not the DOM shape or class names (Coding-Standards §3;
Project-Checklist §3.11; Bible §12.2).

✅ **DO**:

- **axe** = 0 violations per variant/state.
- **Keyboard**: Space/Enter toggles `Switch`; `Enter`/`Space` activates `Button`.
- **Controlled & uncontrolled** both: `onCheckedChange` fires with the next value; uncontrolled
  `defaultChecked` updates internally.
- **Wiring**: `FormField` sets `aria-describedby` to the hint+error ids and `aria-invalid` on error.
- **Edge cases**: long/expanded strings, RTL, disabled, error.

❌ **DON'T**: assert `expect(el).toHaveClass('bg-primary')` or snapshot internal markup — both break on
a harmless refactor and prove nothing about behaviour.

---

## 9. The common-mistakes gallery

The bugs that fail review/CI most often — learn them once.

| ❌ Mistake                                              | ✅ Fix                                            | Caught by                                     |
| ------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------- | ----------- | -------------------------- |
| `<div onClick>` as a button                             | real `<button>` (or `Slot` + role)                | jsx-a11y, axe (Coding-Standards §12)          |
| Hardcoded hex/px/font (`bg-[#…]`, `p-[17px]`)           | token utility / CVA                               | lint (DesignGuidelines)                       |
| Primitive in a component (`bg-[var(--color-rose-500)]`) | semantic token (`bg-primary`)                     | review ([README](./README.md))                |
| Hardcoded string / English `aria-label`                 | prop/children + `t(...)`                          | i18n lint (Coding-Standards §13)              |
| `ml-4` / `text-left`                                    | `ms-4` / `text-start`                             | RTL break (Bible §4.4)                        |
| Status as a bare colored dot                            | color + icon + text (`StatusBadge`)               | a11y review (Bible §9.6)                      |
| `aria-invalid="false"` always present                   | `aria-invalid={invalid                            |                                               | undefined}` | review (Input.tsx pattern) |
| Missing `forwardRef` / `displayName`                    | add both — RHF/focus need the ref                 | review (Bible §8.2)                           |
| Controlled `value` with no `onChange`                   | dual controlled/uncontrolled (Switch pattern)     | review (Coding-Standards §3.4)                |
| Overwriting consumer `onClick`/`onKeyDown`              | call `props.onX?.(e)` first, then your logic      | review (Switch/Slot pattern)                  |
| `emergency` tone for an ordinary error                  | use `danger`; `emergency` = life-safety only      | review ([ColorSystem §3.9](./ColorSystem.md)) |
| Reflexive `memo` on a cheap leaf                        | memoize only on measured need                     | review (Coding-Standards §3.6)                |
| `useEffect` to sync derived state                       | derive during render                              | review (Coding-Standards §3.8)                |
| DS component imports a query hook / `HttpClient`        | keep DS presentational; wire data in a container  | boundaries lint (Coding-Standards §8)         |
| Copying a component to tweak one style                  | compose / extend / wrap (StatusBadge wraps Badge) | review (rule 1)                               |
| Animation with no `motion-reduce:`                      | `motion-reduce:transition-none` / `animate-none`  | a11y review (Bible §9.7)                      |

---

## 10. Design-system-specific rules

Rules unique to authoring `@shared/design-system` components (Bible §8.2, §12; Coding-Standards §15).

- **`forwardRef` + `displayName` on everything** — the ref reaches the DOM node (or the `asChild`
  element). Shipped on Button/Input/Switch/Card/Badge/FormField/StatusBadge.
- **`asChild` via the local `Slot`** (`lib/slot.tsx`) for polymorphism — `const Comp = asChild ? Slot
: 'button'`. Remember: `Slot` takes **one** child, merges class/style, **chains** handlers, forwards
  ref; `Button` passes `children` through untouched when `asChild`.
- **Variants via CVA**, typed with `VariantProps`, with `defaultVariants`; merge with
  `cn(variants(...), className)` so consumers override cleanly.
- **Tokens only**, semantic tier — never primitives, never raw values (rule 2).
- **i18n-ready, never i18n-aware** — text via props/children only (rule 5).
- **Zero domain knowledge** in `shared/ui`/`@shared/design-system`; the clinical thin-layer
  (`StatusBadge`, planned `VitalBadge`) maps domain meaning onto generic primitives + tokens
  ([ComponentRegistry §healthcare](./ComponentRegistry.md)).
- **Named exports only**, consumed from `@shared/design-system` (no deep imports, no default exports —
  Coding-Standards §15).
- **Every component ships**: file-level + per-prop JSDoc, a Storybook story (all variants/states +
  dark/HC/RTL/Large-Text), a `jest-axe` test, and a keyboard-interaction test (Bible §12.2).
- **Register it** — add to the type-safe registry so it appears in
  [ComponentRegistry.md](./ComponentRegistry.md) (generated; never hand-edited).
- **Governance for change** — new/changed tokens and components follow the ADR + Decision-Contract
  flow ([Bible §12](../Frontend-Bible.md#12-governance)); breaking changes are a major Changeset.

> **One-line DoD** (Bible §12.4): tokens-only · i18n keys (no literals) · CVA variants typed ·
> forwardRef + a11y roles/labels · keyboard + axe tests green · Storybook story (incl. dark/HC/RTL/
> Large-Text) · contrast verified · docs updated.

---

_Status: **Design System Architecture — Best Practices (Part 13)** · Field guide to
[ComponentStandards.md](./ComponentStandards.md) (Parts 5–7) · Canon:
[Frontend-Bible.md](../Frontend-Bible.md) · [Coding-Standards.md](../Coding-Standards.md) ·
[Project-Checklist.md](../Project-Checklist.md) · Catalog: [ComponentRegistry.md](./ComponentRegistry.md)._
