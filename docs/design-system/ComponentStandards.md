# ClinicOS — Component Standards (Parts 5–7)

> **Design System Architecture, not implementation.** This document is the _contract every
> ClinicOS component must satisfy_ before it is allowed into `@shared/design-system`. It is the
> design-system expansion of [Frontend-Bible §8](../Frontend-Bible.md#8-component-library) (the
> component library) and [§9](../Frontend-Bible.md#9-accessibility-guide) (accessibility), made
> **checkable** and grounded in the **real shipped components**.
>
> It does **not** restate the rules it builds on — read these first and assume them here:
>
> - **The "why":** [Frontend-Bible.md](../Frontend-Bible.md) (§8 component contract, §9 a11y, §10 motion, §11 voice).
> - **Day-to-day React/TS shape:** [Coding-Standards.md](../Coding-Standards.md) (§3 React, §9 styling, §12 a11y, §13 i18n).
> - **The DoD gate:** [Project-Checklist.md](../Project-Checklist.md) (§3.3–3.12, §5 a11y audit, §9 reviewer gate).
> - **The token reference:** [README.md](./README.md) · [ColorSystem.md](./ColorSystem.md) · [DesignTokens.md](./DesignTokens.md).
> - **The catalog (reuse-before-create):** [ComponentRegistry.md](./ComponentRegistry.md).
>
> Real components cited throughout: `Button`, `Input`, `FormField`, `Switch`, `Card`, `Badge`,
> `StatusBadge`, and the `Slot` primitive — all under `src/shared/design-system/`.

---

## Table of contents

- [Part 5 — The Component Quality Checklist](#part-5--the-component-quality-checklist)
- [Part 6 — Component API Design Standards](#part-6--component-api-design-standards)
- [Part 7 — Healthcare Component Standards](#part-7--healthcare-component-standards)

---

# Part 5 — The Component Quality Checklist

> **Every** component in `@shared/design-system` MUST satisfy all twelve sections below. This is the
> per-component expansion of the [Frontend-Bible §12.4 design-system DoD](../Frontend-Bible.md#124-definition-of-done-design-system-pr)
> and [Project-Checklist §3.3](../Project-Checklist.md#33-ui--components-). Each row gives the **real
> pattern** from a shipped component — copy that pattern, don't reinvent it.

Use this as a literal PR checklist. 🔴 = merge blocker.

### 5.1 Accessibility ♿ 🔴

Accessibility is written into the component, not bolted on (Bible §9; Coding-Standards §12). The full
WCAG 2.2 AA checklist lives in [Bible §9.1](../Frontend-Bible.md#91-wcag-22-aa-checklist-per-screen--pr)
— this is the component-author's slice of it.

- [ ] **Semantic element first**, ARIA only to fill gaps. `Switch` is a real `<button>` with
      `role="switch"` + `aria-checked`, not a `div`.
- [ ] **State exposed to AT** via the right ARIA: `aria-busy` (Button loading), `aria-invalid`
      (Input/FormField), `aria-checked` (Switch), `aria-describedby` (FormField wiring).
- [ ] **Never color alone** — every status pairs color **+** icon **+** text (`StatusBadge`, §7.2).
- [ ] **axe = 0 violations** in the component's `jest-axe` test (Bible §9.9).

```tsx
// ✅ Switch.tsx — semantic button + role + state, keyboard-operable, focus ring (all real)
<button
  type="button"
  role="switch"
  aria-checked={isChecked}
  data-state={isChecked ? 'checked' : 'unchecked'}
  className={cn('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus … …')}
/>
```

```tsx
// ❌ a div pretending to be a control — no role, no keyboard, no focus, fails axe
<div onClick={toggle} className="switch" />
```

### 5.2 Localization 🌐 🔴

**Components never hardcode copy.** All human-readable text (labels, `aria-label`, errors, loading
labels) arrives as **props/children**; the caller passes `t(...)` (Bible §8.2; Coding-Standards §13).
The kit is i18n-_ready_, never i18n-_aware_ — it owns zero strings.

- [ ] No string literal renders as UI text or as an `aria-*` value inside the component.
- [ ] Every human-readable value is a **prop or `children`** (`Button` loadingLabel, `FormField`
      label/hint/error, `StatusBadge` label).
- [ ] Direction-safe: logical utilities only (`ms-*`/`pe-*`/`text-start`), never `ml-*`/`text-left`
      (Bible §4.4; Coding-Standards §9.3). Verified under `dir="rtl"`.

```tsx
// ✅ FormField.tsx — every word is a caller-supplied prop; nothing is hardcoded
export interface FormFieldProps {
  label: string; // caller passes t('vitals.form.bloodPressure')
  hint?: string; // t(...)
  error?: string; // t(...)
  requiredHint?: string; // t('common.required')
}
// caller:
<FormField
  label={t('vitals.form.heartRate')}
  error={errors.heartRate && t(`form.error.${errors.heartRate.type}`)}
>
  <Input inputMode="numeric" {...register('heartRate')} />
</FormField>;
```

```tsx
// ❌ a component that bakes in English — untranslatable, fails the i18n lint
<button>{isLoading ? 'Saving…' : 'Save'}</button>
```

### 5.3 Responsive behavior 🟡

Mobile-first; the component reads at a glance on a phone and enhances upward (Bible §7;
[DesignGuidelines §9](./DesignGuidelines.md)).

- [ ] **Token-driven sizing**, never px. `Button` sizes are `h-12`/`h-16` (token-mapped), not `h-[48px]`.
- [ ] Layout uses logical, fluid utilities; `fullWidth` exists for the mobile sticky CTA (Bible §7.2).
- [ ] No fixed widths that clip translated/expanded text (Localization audit, Project-Checklist §6).
- [ ] Large Text Mode just works — sizes derive from `rem`/tokens, so the root scale grows the
      component (Bible §4.3). No per-component media queries needed.

```tsx
// ✅ Button.tsx — fullWidth flag for the mobile sticky footer CTA; token heights scale with the root
fullWidth: { true: 'w-full', false: '' }
// <Button fullWidth size="lg">{t('vitals.action.saveContinue')}</Button>  // mobile ≥56px CTA
```

### 5.4 The states (loading · empty · error · disabled · read-only · focus) 🔴

A component must define how it looks in **every** state it can occupy. Container-level Loading/Empty/
Error/Success are the four async states (Bible §2.1, Project-Checklist §3.4); control-level
disabled/read-only/focus live on the control itself.

| State         | Real pattern                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**   | `Button` `isLoading` → spinner + `aria-busy` + `disabled`; sr-only `loadingLabel`. Surfaces use `Skeleton` (no shift).                                                          |
| **Empty**     | Use `EmptyState` (illustration + line + one CTA) — never a blank node (Bible §6.3, §2.1).                                                                                       |
| **Error**     | `FormField` renders `error` in `role="alert"`; surfaces use `ErrorState` (localized `AppError` + retry).                                                                        |
| **Disabled**  | Native `disabled` attribute **+** `disabled:opacity-50 disabled:pointer-events-none` (Button) / `disabled:cursor-not-allowed` (Input/Switch). Color change alone is not enough. |
| **Read-only** | Native `readOnly` on text controls (spread via `...props`); visually distinct from disabled (still focusable, still copyable).                                                  |
| **Focus**     | Token-driven `:focus-visible` ring on **every** interactive element (§5.7).                                                                                                     |

```tsx
// ✅ Button.tsx — loading is a real, announced, non-interactive state
<Comp disabled={disabled || isLoading} aria-busy={isLoading || undefined} {...props}>
  {isLoading ? (
    <Loader2 aria-hidden className="animate-spin motion-reduce:animate-none" />
  ) : (
    iconStart
  )}
  {isLoading && loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
  {children}
</Comp>
```

```tsx
// ❌ "disabled" by color only — still clickable, still focusable, lies to AT
<button className="opacity-50" onClick={save}>
  {label}
</button>
```

### 5.5 Keyboard navigation ♿ 🔴

Everything operable by pointer is operable by keyboard (Bible §9.3; Coding-Standards §12). Prefer
real `<button>`/`<a>` (keyboard for free); for custom widgets, handle `Enter`/`Space` explicitly.

- [ ] Real semantic element where possible (Button, Input get keyboard for free).
- [ ] Custom widgets handle the documented keys (Bible §9.3 table) and **chain**, never clobber,
      consumer handlers.

```tsx
// ✅ Switch.tsx — explicit Space/Enter handling, and it calls the consumer's handler first
onKeyDown={(event) => {
  onKeyDown?.(event);                 // consumer handler runs first
  if (event.defaultPrevented) return; // respect their preventDefault
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    toggle();
  }
}}
```

```tsx
// ❌ overwrites the consumer's onKeyDown and only handles the mouse
<div role="switch" onClick={toggle} />
```

### 5.6 ARIA correctness ♿ 🔴

Name, Role, Value must be right (WCAG 4.1.2; Bible §9.4). ARIA reflects **real** state and is
**removed when false** (`|| undefined`) so AT never hears a stale attribute.

- [ ] Roles/states match reality (`role="switch"` + live `aria-checked`; `aria-invalid` only when invalid).
- [ ] Relationships wired by id (`aria-describedby` → hint/error, `htmlFor` → control) — see `FormField`.
- [ ] Booleans collapse to `undefined` when off, not `="false"`, unless the false value is meaningful.

```tsx
// ✅ FormField.tsx — describedby/invalid/required are computed and injected onto the control
const describedBy = cn(hintId, errorId) || undefined;
const injected: InjectedControlProps = { id };
if (describedBy !== undefined) injected['aria-describedby'] = describedBy;
if (error) {
  injected.invalid = true;
  injected['aria-invalid'] = true;
}
if (required) injected['aria-required'] = true;
```

```tsx
// ✅ Input.tsx — aria-invalid present only when actually invalid
<input aria-invalid={invalid || undefined} … />
// ❌ aria-invalid="false" shipped always → noise; or a hardcoded English aria-label
```

### 5.7 Focus management ♿ 🔴

Visible, token-driven `:focus-visible` on every focusable element; never remove an outline without a
replacement; never `tabindex > 0` (Bible §9.2).

- [ ] `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus` (the shipped pattern
      in Button, Input, Switch, Card) — `ring-focus` maps to `--color-focus` and thickens in
      high-contrast.
- [ ] Overlays (Dialog/Drawer) trap + restore focus and close on `Esc` (Bible §9.2) — out of scope
      for leaf controls but required for the planned overlay set.

```tsx
// ✅ shared focus contract — identical token ring across Button / Input / Switch / Card
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';
// Card additionally exposes focus-within for the whole interactive surface:
'focus-within:ring-2 focus-within:ring-focus';
```

### 5.8 Performance & memoization 🟡

Memoize on **measured** need, not reflex (Coding-Standards §3.6, §11). Leaf DS components are cheap —
don't wrap them in `memo` "just in case".

- [ ] No reflexive `memo`/`useMemo`/`useCallback` on cheap leaves (none of Button/Input/Badge are memoized — correct).
- [ ] Controlled/uncontrolled state is local and minimal (`Switch` keeps one `useState`, no effects).
- [ ] Heavy/virtualized composites (queue rows, tables) memoize the **row**, and stabilize callbacks
      passed to memoized children (Coding-Standards §3.6).
- [ ] No `useEffect` for derived values — derive in render (Coding-Standards §3.8).

```tsx
// ✅ worth it — a row rendered 300× in the queue (Coding-Standards §3.6)
export const QueueRow = memo(function QueueRow({ entry }: { entry: QueueEntry }) {
  /* … */
});
// ❌ pointless — premature memo on a trivial DS leaf
export const Badge = memo(({ label }: { label: string }) => <span>{label}</span>);
```

### 5.9 Documentation 🟡

Every public surface is documented (Coding-Standards §14; Bible §12.2).

- [ ] **File-level JSDoc** stating purpose, a11y contract, i18n stance, and the governing spec — every
      shipped component has this header (see `Button.tsx`, `StatusBadge.tsx`).
- [ ] **Per-prop JSDoc** on the props interface (e.g. `Button.loadingLabel`, `Switch.onCheckedChange`).
- [ ] Listed in the [ComponentRegistry](./ComponentRegistry.md) (generated) and behavior-noted in
      [Bible §8.6](../Frontend-Bible.md#86-per-component-behavior-notes-the-rest).

```tsx
/**
 * Button — the primary action control for ClinicOS.
 * Token-only styling via CVA; forwardRef; full a11y (focus ring, busy state).
 * No hardcoded copy — all text comes from props/children.
 * Governed by: docs/Frontend-Bible.md §8.3, Phase 6 design-system spec (Button).
 */
```

### 5.10 Tests 🔴

A component is not done without tests (Project-Checklist §3.11, Bible §12.2).

- [ ] **`jest-axe`** test asserts 0 violations (every variant/state).
- [ ] **Keyboard-interaction** test (e.g. Space/Enter toggles `Switch`; `Enter`/`Space` activates Button).
- [ ] **Behavior, not implementation**: controlled vs uncontrolled both covered; `onCheckedChange`
      fires with the next value; `FormField` wires `aria-describedby`/`aria-invalid`.
- [ ] Edge cases: long/expanded strings, RTL, disabled, error (Project-Checklist §3.11).

### 5.11 Examples (Storybook) 🔴

Storybook is the living catalog (Bible §12.3).

- [ ] A story per component covering **all variants/sizes/states**.
- [ ] Rendered in **dark / high-contrast / RTL / Large-Text** (the a11y modes compose via token swap — Bible §4).
- [ ] Controls for every prop; usage snippet shows the `t(...)` call (never a literal).

### 5.12 Tokens-only styling 🔴

The visual contract: no hardcoded color/size/space/radius/shadow/duration (Bible §3; Coding-Standards
§9; [DesignGuidelines do/don't gallery](./DesignGuidelines.md#do--dont-gallery-tokens-only)).

- [ ] Styling via CVA + token-mapped Tailwind utilities, merged with `cn` (clsx + tailwind-merge) so
      caller `className` wins last.
- [ ] No `bg-[#…]`, `p-[17px]`, `text-[17px]`, primitives-as-color, or `style={{…}}` visual values.

```tsx
// ✅ Input.tsx — every value is a token utility; cn() lets the caller override
const input = cva('block w-full bg-surface-raised text-text rounded-md border border-border h-12 px-4 text-body-md … focus-visible:ring-focus …');
return <input className={cn(input({ invalid }), className)} … />;
// ❌ <input className="bg-[#fff] border-[#ccc] h-[48px] text-[16px]" />
```

> **Checklist contract:** a DS PR is blocked if any 🔴 box is unticked. The 60-second reviewer pass is
> [Project-Checklist §9](../Project-Checklist.md#9-pr-reviewer-quick-gate-60-second-blockers).

---

# Part 6 — Component API Design Standards

> A component's **API is a 10-year contract** (Bible §8.2). These standards make every ClinicOS
> component feel like one author wrote it. Each rule carries ✅/❌ from the real components, and the
> load-bearing ones carry a **Decision Contract** (Why · Benefits · Trade-offs · Alternatives ·
> Future · Enterprise — the [Bible §3.5 / Brain §14](../Frontend-Bible.md) format) so the choice is
> auditable, not folklore.

### 6.1 Props naming

Consistent, predictable, boolean-positive.

- **Booleans read as state:** `isLoading`, `disabled`, `interactive`, `required`, `fullWidth`,
  `asChild`, `invalid` — positive phrasing, no `notEnabled`.
- **Handlers are `onX` / `onXChange`:** `onCheckedChange` (Switch), DOM `onClick`/`onKeyDown` kept native.
- **Text-bearing props say what they are:** `label`, `hint`, `error`, `loadingLabel`, `requiredHint`.
- **Omit conflicting native props** rather than fight them: `Input` does `Omit<…, 'size'>` so the CVA
  `size`-style space is clean; `Switch` omits `onChange | type | value`.

```tsx
// ✅ Switch.tsx — positive booleans, onXChange handler, native props omitted to avoid collision
export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'type' | 'value'
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
```

```tsx
// ❌ negative boolean + ambiguous handler + leaking a colliding native prop
interface BadProps {
  notDisabled: boolean;
  change: () => void;
  type: string;
}
```

### 6.2 Children vs configuration props

Pass **content** as `children`; pass **behavior/variant** as props. If a prop's value is UI text or
markup, it should almost always be `children`.

- `Button`, `Badge`, `Card*` take their visible content as `children` (presentational, no hardcoded copy).
- Exception: `FormField`/`StatusBadge` take `label`/`hint`/`error` as **string props** because the
  component must _wire_ them (to an `id`, a `role="alert"`, an icon) — the string is data, not free markup.

```tsx
// ✅ content is children; the component owns structure, not copy
<Card><CardHeader><CardTitle>{t('vitals.card.title')}</CardTitle></CardHeader><CardContent>…</CardContent></Card>
// ❌ stuffing content through a prop the component then dumps verbatim
<Card title="Vitals" body="…" footerLabel="Edit" />   // configuration soup (Coding-Standards §3.5)
```

### 6.3 Variants via CVA

All visual variation goes through `class-variance-authority`, with typed variants and
`defaultVariants` (Bible §8.2; Coding-Standards §9.2).

- [ ] Variant names are **semantic**, not visual: `variant: primary | secondary | accent | ghost |
danger | link`; `tone: neutral | primary | success | warning | danger | info | emergency`.
- [ ] `VariantProps<typeof x>` feeds the props interface — variants are type-safe and self-documenting.
- [ ] `cn(variants(...), className)` merges so the consumer's `className` always wins (tailwind-merge).

```tsx
// ✅ Badge.tsx — semantic tones, typed via VariantProps, defaulted
const badge = cva(['inline-flex items-center gap-1 rounded-pill …'], {
  variants: {
    tone: {
      neutral: '…',
      success: 'bg-success-subtle text-success',
      emergency: 'bg-emergency-subtle text-emergency',
    },
  },
  defaultVariants: { tone: 'neutral' },
});
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}
```

```tsx
// ❌ ad-hoc conditional class soup — unmergeable, untyped, purge-unsafe
<span className={'badge ' + (kind === 'ok' ? 'green' : 'gray')} />
```

> **Decision Contract — CVA for variants.**
> **Why:** one typed source of truth for every visual variant; selecting between tokens, never raw values.
> **Benefits:** `VariantProps` gives free, exhaustive prop types; `defaultVariants` removes prop-drilling defaults; tailwind-merge lets consumers override without specificity wars.
> **Trade-offs:** a small learning curve and a build-time class list (acceptable; purge-safe).
> **Alternatives:** prop-driven `style` (no theming, no merge), bespoke `cn` ladders (untyped, drift).
> **Future:** a new variant is one CVA entry + one token alias — no call-site churn.
> **Enterprise:** variants are auditable in one place; white-label re-skin is a token re-alias, not an API change.

### 6.4 Composition over configuration

Boolean/enum prop explosions are a smell; compose with children, slots, and compound parts
(Coding-Standards §3.5).

- `Card` is `Card` + `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter` — not a
  20-prop mega-component.
- Reach for composition the moment you'd add a 3rd boolean that toggles structure.

```tsx
// ✅ composition — each piece obvious, reusable, individually testable
<Card interactive asChild>
  <a href={href}>
    <CardHeader>
      <CardTitle>{t('patient.card.title')}</CardTitle>
    </CardHeader>
    <CardContent>{t('patient.card.summary')}</CardContent>
  </a>
</Card>
// ❌ <Card hasHeader title=… headerIcon=… footerButtonLabel=… variant="bento" dense />
```

> **Decision Contract — composition over configuration.**
> **Why:** clinical UIs vary per role/screen; a fixed prop matrix can't cover them and grows unbounded.
> **Benefits:** smaller APIs, reusable parts, obvious call-sites, trivially Storybook-able/testable.
> **Trade-offs:** slightly more JSX at the call-site (worth it for clarity).
> **Alternatives:** config props (combinatorial explosion), render-prop everything (harder to read).
> **Future:** new layouts compose existing parts — no new props.
> **Enterprise:** consistent surfaces across 8 clinical domains without per-feature variants of the same component.

### 6.5 Controlled vs uncontrolled

Support **both**, the React-idiomatic way: `value`/`checked` + `onXChange` (controlled) or
`defaultValue`/`defaultChecked` (uncontrolled). Never mix on one instance (Coding-Standards §3.4).

```tsx
// ✅ Switch.tsx — the canonical controlled/uncontrolled pattern
const isControlled = checked !== undefined;
const [internalChecked, setInternalChecked] = useState(defaultChecked);
const isChecked = isControlled ? checked : internalChecked;
const toggle = () => {
  const next = !isChecked;
  if (!isControlled) setInternalChecked(next); // only own state when uncontrolled
  onCheckedChange?.(next); // always notify
};
```

```tsx
// ❌ controlled value with no onChange (frozen input) — or owning state while controlled (drift)
<input value={value} /> // read-only by accident
```

> **Decision Contract — dual controlled/uncontrolled.**
> **Why:** RHF-registered fields are uncontrolled (perf); one-off widgets want controlled state (Coding-Standards §3.4, §7).
> **Benefits:** one component serves both; predictable; matches React/Radix conventions developers expect.
> **Trade-offs:** a few lines of `isControlled` bookkeeping per stateful component.
> **Alternatives:** controlled-only (forces parent state everywhere), uncontrolled-only (can't drive from store).
> **Future:** form library swaps don't touch the component.
> **Enterprise:** the same control works in RHF forms, Zustand-driven UIs, and Storybook unchanged.

### 6.6 Polymorphism — `asChild` via the real `Slot`

Change the rendered element without wrapper soup using the design-system `Slot`
(`src/shared/design-system/lib/slot.tsx`) — a minimal, strictly-typed Radix-style primitive.

- `const Comp = asChild ? Slot : 'button'` is the shipped idiom (Button, Card).
- `Slot` expects **exactly one** element child, merges className/style, **chains** event handlers
  (child first, then slot), and forwards the ref.

```tsx
// ✅ Button.tsx — render Button's styling onto a router Link, no extra DOM node
const Comp = asChild ? Slot : 'button';
return (
  <Comp ref={ref} className={cn(button({ variant, size, fullWidth }), className)} {...props}>
    {children}
  </Comp>
);
// caller: <Button asChild><Link to="/queue">{t('nav.queue')}</Link></Button>
```

```tsx
// ❌ a wrapper anchor around a button — nested interactives, broken semantics & a11y
<a href="/queue">
  <button>{label}</button>
</a>
```

> **Note (real constraint):** because `Slot` merges onto an arbitrary single child, `Button` deliberately
> forwards `children` **untouched** when `asChild` is set (its icon/loading wrappers can't compose with an
> unknown element). That's an intentional API contract, documented in `Button.tsx`.

> **Decision Contract — `asChild`/Slot polymorphism.**
> **Why:** buttons-as-links, cards-as-anchors are constant in a navigable clinical app; wrappers break a11y and styling.
> **Benefits:** zero extra DOM, correct single semantic element, ref + handlers + classes merged correctly.
> **Trade-offs:** the merge has rules (single child; children passed through untouched on Button) authors must respect.
> **Alternatives:** an `as` prop (weaker typing, prop collisions), wrapper elements (nested interactives — an a11y bug).
> **Future:** any element can host any component's styling without new props.
> **Enterprise:** router-, anchor-, and `<button>`-hosted variants stay consistent and audited.

### 6.7 `forwardRef` + `displayName`

Every component forwards its ref to the underlying DOM node (or the `asChild` element) and sets a
`displayName` (Bible §8.2). Non-negotiable — focus management, RHF `register`, and measurement all
need the ref.

```tsx
// ✅ the shipped contract on every component (Button/Input/Switch/Card/Badge/FormField/StatusBadge)
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(input({ invalid }), className)}
      {...props}
    />
  );
});
Input.displayName = 'Input';
```

```tsx
// ❌ no ref → RHF can't focus the first error, dialogs can't restore focus
export function Input(props: InputProps) {
  return <input {...props} />;
}
```

### 6.8 Slots / compound components (`Card.*`)

When a surface has named regions, ship them as **sibling compound parts**, each `forwardRef`'d and
token-styled, rather than as configuration props.

```tsx
// ✅ Card.tsx exports the family; each part is a forwardRef'd, token-styled primitive
export const CardHeader = forwardRef<…>(…);   // 'flex flex-col gap-1'
export const CardTitle = forwardRef<…>((p, ref) => <h3 className="font-heading text-h4 text-text" …/>);
export const CardFooter = forwardRef<…>(…);   // 'mt-4 flex items-center gap-3'
```

- Parts spread `...props` and merge `className` (`cn`), so consumers extend them freely.
- `CardTitle` is a real `<h3>` (heading semantics), not a styled `<div>` — preserves document outline.

### 6.9 Render-props guidance 🟡

Default to **children + compound parts**. Reach for a render prop **only** when the consumer must
render against component-owned internal state that can't be lifted (e.g. a virtualized list exposing
the active descendant, a future `Combobox` exposing highlighted option).

- ✅ Render prop when: state is genuinely internal _and_ the consumer needs it to render an item.
- ❌ Render prop when: composition/`children`/`asChild` already solves it (most cases) — it's harder to read.
- None of the current shipped leaf components need one; this is guidance for the planned
  `Combobox`/`Table`/`DatePicker` ([ComponentRegistry](./ComponentRegistry.md)).

### 6.10 Custom hooks

Component logic that's reusable or testable in isolation belongs in a hook, named `useThing`,
returning a **stable named object** (Coding-Standards §5).

- ✅ Extract a hook when logic is shared across components or needs unit tests apart from JSX.
- ✅ Stabilize the returned object/callbacks (`useMemo`/`useCallback`) so memoized consumers don't churn.
- ❌ Don't extract a hook for a single `useState` (Switch keeps its toggle inline — correct).
- DS hooks stay **domain-free** (`shared/lib/hooks`: `useDebounce`, `useMediaQuery`); domain logic
  lives in feature/entity slices (Coding-Standards §5.2).

```tsx
// ✅ stable, named return (Coding-Standards §5.1) — for a real multi-value hook
return useMemo(() => ({ callNext, skip }), [callNext, skip]);
// ❌ new object every render → breaks downstream memo/deps
return { callNext: () => {}, skip: () => {} };
```

---

# Part 7 — Healthcare Component Standards

> ClinicOS is a **Clinic Operating System** (Brain §1). Components are not generic widgets — they
> carry clinical meaning to people under time pressure. This Part adds the healthcare-specific bar on
> top of Parts 5–6. The token tables it references are the implemented ones in
> [ColorSystem.md](./ColorSystem.md) — this document **does not redefine tokens**, it governs how
> components consume them.

### 7.1 Who the components serve

Every clinical component is designed for a specific role's task, primary CTA, and reading conditions
(Brain §3; Bible §1). The component stays generic and token-driven; the **domain slice** supplies the
data, the `t(...)` strings, and the permission gate (Coding-Standards §4.3, §8; Project-Checklist §7.2).

| Role / area      | What the components must do                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Doctors**      | Dense but ≥44px targets; `Card`/`Table` for charts; vitals via vital-severity tokens (§7.3); fast keyboard paths.                 |
| **Patients**     | Large type (`body-lg`), icon **+** word, plain language, one CTA; mobile sticky `Button fullWidth size="lg"`.                     |
| **Reception**    | Queue at a glance — `StatusBadge` per row (§7.2); large scannable tiles; kiosk/tablet breakpoints (Bible §7.1).                   |
| **Pharmacy**     | Unambiguous medication/dose; never color-alone for alerts; `danger` for interactions, `emergency` only life-safety.               |
| **Billing**      | `Intl`-formatted currency (Coding-Standards §13), tabular alignment, status via `Badge` + text, no PHI in labels.                 |
| **Appointments** | Queue-lifecycle `StatusBadge` (scheduled→cancelled); `DatePicker` locale + RTL aware (planned).                                   |
| **Records**      | Read-only states (§5.4), clinician-review markers (§7.5), masked-by-default PHI (Project-Checklist §7.1).                         |
| **Analytics**    | `Chart` consumes color-blind-safe `--color-chart-*` with direct labels — never hue alone ([ColorSystem §3.14](./ColorSystem.md)). |

> Components live in `@shared/design-system` (zero domain knowledge). The **healthcare** group of the
> registry (`StatusBadge`, planned `VitalBadge`) is the thin clinical layer — see
> [ComponentRegistry §healthcare](./ComponentRegistry.md).

### 7.2 Medical status indicators

Clinical status is **always color + icon + text** (Bible §9.6; [ColorSystem §3.10](./ColorSystem.md)).
`StatusBadge` is the reference: it maps each queue-lifecycle state to a `Badge` tone **and** a lucide
icon, and **requires** a localized `label`.

```tsx
// ✅ StatusBadge.tsx — status → tone + icon; the localized label is a required prop
const STATUS_META: Record<QueueStatus, { tone: BadgeProps['tone']; icon: LucideIcon }> = {
  scheduled: { tone: 'neutral', icon: CalendarClock },
  waiting: { tone: 'info', icon: Hourglass },
  called: { tone: 'warning', icon: PhoneCall },
  'in-progress': { tone: 'primary', icon: Stethoscope },
  completed: { tone: 'success', icon: CheckCircle2 },
  'no-show': { tone: 'neutral', icon: UserX },
  cancelled: { tone: 'danger', icon: AlertTriangle },
};
// <StatusBadge status="waiting" label={t('queue.status.waiting')} />  → colour + Hourglass + text
```

- **Tones** map to the queue-status intent of the `--color-status-*` tokens (waiting=info,
  called=warning, in-progress=teal/primary, completed=success, cancelled=danger). The component reads
  semantic tones; the **tokens** carry the meaning across themes ([ColorSystem §3.10](./ColorSystem.md)).
- **Vital severity** (planned `VitalBadge`) follows the same shape against `--color-vital-*`
  (normal→critical, [ColorSystem §3.11](./ColorSystem.md)): `bg-vital-elevated`, `bg-vital-critical`, etc.

```tsx
// ❌ a bare colored dot — the #1 clinical a11y bug (color-blind staff, low-vision, print)
<span className="text-status-cancelled">●</span>
```

### 7.3 Emergency states

There is exactly **one** deliberately non-calm color family: `emergency`
([ColorSystem §3.9](./ColorSystem.md), [DesignTokens](./DesignTokens.md)). It is **vivid on purpose**
and stays vivid in dark and high-contrast themes ([Theme.md](./Theme.md)).

- **`emergency` is life-safety ONLY** — code blue, panic, `--color-vital-critical`. Ordinary errors
  use `danger` (the calm red). Misusing `emergency` for a failed save is a review block.
- The `Badge`/`StatusBadge` family already exposes the `emergency` tone (`bg-emergency-subtle
text-emergency`); pair it with an icon + text like any other status (never color alone).
- Emergency surfaces should announce assertively (`aria-live="assertive"` for the alerting container —
  Bible §9.4), since the information is time-critical.

```tsx
// ✅ life-safety only — vivid emergency tone + icon + text, assertive announcement at the container
<Badge tone="emergency">
  <AlertOctagon aria-hidden /> {t('alert.codeBlue')}
</Badge>
// ❌ tone="emergency" for a 500 on save → cry-wolf; use danger / ErrorState instead
```

### 7.4 Accessibility & localization for clinical data

Clinical data raises the a11y/i18n bar from Parts 5.1–5.2, it does not lower it.

- **Never color alone, always** — color-blindness and monochrome printouts are routine in clinics
  (Bible §9.6). Every status/vital indicator ships icon + text.
- **Numbers, dates, currency via `Intl`** — vitals units, dose times, and billing amounts are
  locale-formatted, never string-built (Coding-Standards §13; Bible §11.3). Avoids decimal/grouping
  errors that are clinically dangerous.
- **Plain language + icon + word** for patient-facing components; `body-lg` default for elderly users
  (Bible §5.2). Medical abbreviations only where the role expects them.
- **All clinical copy is `t(...)`** — labels, vital names, status, alerts in en/hi/mr/ur, RTL-verified
  for ur (Project-Checklist §6). The component owns none of it (§5.2).
- **Contrast is pre-verified** for status/vital/emergency pairings in
  [Bible §9.5](../Frontend-Bible.md#95-color-contrast-with-the-actual-tokens) — re-check any new pairing.

### 7.5 Clinician-review markers

Records and orders frequently need a "needs clinician review / reviewed by" state. Standardize it on
the existing primitives — don't invent a new color:

- Render as a `Badge`/`StatusBadge`-style indicator: **tone + icon + localized text** (e.g.
  `warning` + `AlertTriangle` + `t('record.needsReview')`; `success` + `CheckCircle2` +
  `t('record.reviewedBy', { name })`).
- Pair with the **read-only** state (§5.4) until reviewed; expose the review action as the screen's
  single primary `Button` (Law 1).
- Never gate clinical safety on color alone, and never put PHI (reviewer/patient identifiers) into a
  place the security audit forbids — labels are fine, logs/analytics/URLs are not
  (Project-Checklist §7.1).

```tsx
// ✅ review marker on the existing Badge family — tone + icon + localized text, beside a read-only field
<Badge tone="warning"><AlertTriangle aria-hidden /> {t('record.needsReview')}</Badge>
<Input readOnly value={reading} aria-describedby={reviewId} />
// ❌ a yellow background on the row as the only "needs review" signal — color alone, fails §7.4
```

---

_Status: **Design System Architecture — Component Standards (Parts 5–7)** · Companion to
[Frontend-Bible.md](../Frontend-Bible.md) §8–9, [Coding-Standards.md](../Coding-Standards.md),
[Project-Checklist.md](../Project-Checklist.md) · Reuse-before-create catalog:
[ComponentRegistry.md](./ComponentRegistry.md) · Token reference: [README.md](./README.md)._
