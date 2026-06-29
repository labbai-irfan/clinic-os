# 🧑‍💻 ClinicOS — Coding-Standards.md

> **How we write React + TypeScript day-to-day.**
> This document is the _concrete_ companion to the architecture. The **why** lives in
> [Brain.md](./Brain.md); the **ALWAYS/NEVER rulebook** lives in [Developer-Rules.md](./Developer-Rules.md);
> the **names of things** live in [Naming-Convention.md](./Naming-Convention.md).
> This file shows you the **shape of good code** with side-by-side ✅good / ❌bad pairs.

---

## 1. Purpose & scope

This is the standard every line of ClinicOS frontend code is held to. It is **example-driven on purpose**:
when a reviewer (or an AI agent) is unsure, the ✅/❌ pairs are the tie-breaker.

- **Authoritative tech stack:** React 18, TypeScript 5 (strict), Vite 5, TanStack Query v5, Zustand,
  React Hook Form + Zod, React Router v6, Tailwind + CVA + tailwind-merge, i18next. See [Brain.md §4](./Brain.md).
- **Architecture you must respect:** Feature-Sliced Design layers + the Dependency Rule, and the
  Repository → DTO → Mapper → Model → Service → Query-hook pipeline. See [Brain.md §5](./Brain.md).
- **Visual & content contracts:** design tokens only, WCAG 2.2 AA, every string localized. See [Brain.md §6–8](./Brain.md).

**Sibling documents — read alongside, don't duplicate:**

| Need                                               | Go to                                          |
| -------------------------------------------------- | ---------------------------------------------- |
| The "why" / single source of truth                 | [Brain.md](./Brain.md)                         |
| The ALWAYS / NEVER rulebook + PR blockers          | [Developer-Rules.md](./Developer-Rules.md)     |
| Exact file/folder/symbol names, import order rules | [Naming-Convention.md](./Naming-Convention.md) |

> **Golden rule of this doc:** _If a junior can't read it, rewrite it._ Cleverness is a code smell here.

---

## 2. TypeScript standards

> ClinicOS lives for 10+ years. The type system is our **cheapest, most permanent test suite.** Spend types generously.

### 2.1 Strict config is non-negotiable

`tsconfig.json` runs the full safety set. **Never** loosen these to "make the error go away":

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true, // array[i] is T | undefined — forces you to check
    "exactOptionalPropertyStartTypes": false,
    "exactOptionalPropertyTypes": true, // { x?: number } ≠ { x: number | undefined }
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "useUnknownInCatchVariables": true, // catch (e) is unknown, not any
    "verbatimModuleSyntax": true, // import type stays import type
  },
}
```

If a third-party type forces a loosening, isolate it in `shared/lib` behind a typed wrapper — never leak it into the domain.

### 2.2 `any` is banned — use `unknown` + narrowing

`any` switches the compiler off. `unknown` keeps it on and forces you to prove the shape.

```ts
// ❌ bad — any disables every guarantee downstream
function parsePayload(raw: any) {
  return raw.patient.name.toUpperCase(); // explodes at runtime, silent at compile time
}

// ✅ good — unknown forces narrowing (or, at a boundary, Zod)
function parsePayload(raw: unknown): string {
  const result = PatientPayloadSchema.safeParse(raw);
  if (!result.success) throw new AppError('patient.parse_failed', { cause: result.error });
  return result.data.name.toUpperCase();
}
```

> The **only** sanctioned place to _cross_ an `unknown` boundary is a Zod parse in `api/dto`. See §8.

### 2.3 `type` vs `interface`

- **`type`** for unions, intersections, mapped/conditional types, function types, and anything derived (`z.infer`, `ReturnType`). This is the default in ClinicOS.
- **`interface`** only for object shapes that are genuinely _extended/implemented_ — e.g. the `HttpClient` port, repository interfaces.

```ts
// ✅ interface — a contract that implementations satisfy
export interface PatientRepository {
  getById(id: PatientId): Promise<Patient>;
  search(query: PatientQuery): Promise<readonly Patient[]>;
}

// ✅ type — a domain model, a union, derived data
export type Patient = z.infer<typeof PatientSchema>;
export type QueueStatus = 'waiting' | 'in_room' | 'done';
```

### 2.4 Discriminated unions over enums

`enum` produces runtime artifacts, leaks numeric values, and resists narrowing. Use string-literal **discriminated unions**.

```ts
// ❌ bad — enum: runtime object, awkward narrowing, reverse-mapping foot-guns
enum AppointmentState {
  Scheduled,
  CheckedIn,
  InRoom,
  Done,
}

// ✅ good — discriminated union: zero runtime cost, narrows perfectly
type Appointment =
  | { status: 'scheduled'; scheduledFor: string }
  | { status: 'checked_in'; checkedInAt: string }
  | { status: 'in_room'; roomId: RoomId }
  | { status: 'done'; completedAt: string };

function nextLabelKey(a: Appointment): string {
  switch (a.status) {
    case 'scheduled':
      return 'appointment.action.checkIn';
    case 'checked_in':
      return 'appointment.action.callIn';
    case 'in_room':
      return 'appointment.action.complete';
    case 'done':
      return 'appointment.action.viewSummary';
  }
}
```

### 2.5 Exhaustive `switch` with `never`

Make adding a new variant a **compile error** everywhere it matters.

```ts
function assertNever(x: never): never {
  throw new AppError('app.unreachable', { context: { value: x } });
}

function color(status: QueueStatus): string {
  switch (status) {
    case 'waiting':
      return 'var(--color-warning)';
    case 'in_room':
      return 'var(--color-primary)';
    case 'done':
      return 'var(--color-success)';
    default:
      return assertNever(status); // adding a 4th status fails the build here
  }
}
```

### 2.6 `as const`, `readonly`, immutability

```ts
// ✅ as const → narrow literal types + readonly tuple
export const QUEUE_STATUSES = ['waiting', 'in_room', 'done'] as const;
export type QueueStatus = (typeof QUEUE_STATUSES)[number];

// ✅ readonly everywhere data is not meant to mutate
interface Vitals {
  readonly heartRate: number;
  readonly takenAt: string;
}
function summarize(records: readonly Vitals[]): number {
  /* … */
}
```

```ts
// ❌ bad — mutating shared/props data
function bump(list: number[]) {
  list.push(0);
} // mutates caller's array
// ✅ good — return a new value
function bump(list: readonly number[]): number[] {
  return [...list, 0];
}
```

### 2.7 Branded types for IDs

A `PatientId` must never be assignable to an `AppointmentId` or a raw `string`. Brand them.

```ts
// shared/lib/types/branded.ts
declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type PatientId = Brand<string, 'PatientId'>;
export type AppointmentId = Brand<string, 'AppointmentId'>;

export const asPatientId = (s: string): PatientId => s as PatientId; // single sanctioned cast
```

```ts
// ❌ bad — strings interchange silently; this compiles and ships a bug
function openChart(patientId: string) {}
openChart(appointment.id); // wrong id, no error

// ✅ good — the compiler rejects the mix-up
function openChart(patientId: PatientId) {}
openChart(appointment.id); // ❌ Type 'AppointmentId' is not assignable to 'PatientId'
```

### 2.8 Avoid the non-null assertion `!`

`!` is a silent `any` about `null`. Narrow instead. (`noUncheckedIndexedAccess` makes this matter for arrays too.)

```ts
// ❌ bad
const first = patients.find(p => p.isActive)!;        // crashes if none active
const name = map.get(id)!.name;                        // crashes if missing

// ✅ good — narrow and handle the absence
const first = patients.find(p => p.isActive);
if (!first) return <EmptyState messageKey="patients.empty.noActive" />;

const entry = map.get(id);
const name = entry?.name ?? t('patient.unknownName');
```

> Sole exceptions: ref access _after_ a mount guard, and `process.env` in build config — keep them rare and commented.

### 2.9 Zod-inferred types at boundaries

Define the schema once at the boundary; **infer** the type. Never hand-write a type that duplicates a schema.

```ts
// api/dto/patient.dto.ts
export const PatientDtoSchema = z.object({
  patient_id: z.string(),
  first_nm: z.string(),
  dob: z.string(),
});
export type PatientDto = z.infer<typeof PatientDtoSchema>; // ✅ single source of truth
```

> Validate **inputs** (network, URL params, localStorage) at the edge; trust your domain types inside.

---

## 3. React standards

### 3.1 Function components only

No class components anywhere (error boundaries are the single exception — React requires a class there, so we wrap one once in `shared/ui` and never write another).

```tsx
// ✅ the only component style we ship
export function VitalsCard({ vitals }: VitalsCardProps) {
  const { t } = useTranslation('vitals');
  return <section aria-label={t('card.title')}>{/* … */}</section>;
}
```

### 3.2 Rules of Hooks (enforced by ESLint)

- Call hooks at the **top level** only — never in conditions, loops, or after an early `return`.
- Hooks run only in components or other hooks.
- `react-hooks/exhaustive-deps` is **error**, not warning.

```tsx
// ❌ bad — conditional hook
if (patientId) {
  const { data } = usePatient(patientId);
}

// ✅ good — hook always runs; the *query* is what's conditional
const { data } = usePatient(patientId, { enabled: Boolean(patientId) });
```

### 3.3 Props typing

```tsx
// ✅ explicit, readonly-friendly props; children typed only when used
interface VitalsCardProps {
  vitals: Vitals;
  onEdit?: (id: VitalsId) => void;
  className?: string;
}

// ❌ bad — React.FC (implicit children, awkward generics), inline anonymous props
const VitalsCard: React.FC<{ vitals: any }> = ({ vitals }) => null;
```

Prefer **specific** props over `...rest` spreads into DOM. If you must forward, pick a known element type (`ComponentPropsWithoutRef<'button'>`).

### 3.4 Controlled vs uncontrolled

- **Forms:** uncontrolled via React Hook Form (performance + fewer re-renders). See §7.
- **One-off interactive widgets:** controlled `useState` is fine.
- Never mix: a single input is either RHF-registered or `value`+`onChange`, not both.

### 3.5 Composition over configuration

Boolean/enum prop explosions are a smell. Compose with children and slots.

```tsx
// ❌ bad — configuration soup
<Card hasHeader title="Vitals" headerIcon="heart" footerButtonLabel="Edit" variant="bento" dense />

// ✅ good — composition; each piece is obvious and reusable
<Card>
  <Card.Header icon={<HeartIcon />}>{t('vitals.card.title')}</Card.Header>
  <Card.Body><VitalsReadout vitals={vitals} /></Card.Body>
  <Card.Footer><Button onClick={onEdit}>{t('common.action.edit')}</Button></Card.Footer>
</Card>
```

### 3.6 When to `memo` (and when NOT)

Memoize on **measured** need, not reflex. `React.memo`/`useMemo`/`useCallback` cost memory and complexity.

**Do** memoize: components in long virtualized lists (queue rows), expensive pure computations, and callbacks/objects passed to memoized children or hook deps.

**Don't** memoize: cheap leaf components, values recomputed trivially, or "just in case."

```tsx
// ✅ worth it — a row rendered 300× in the queue
export const QueueRow = memo(function QueueRow({ entry }: { entry: QueueEntry }) {
  return <li>{entry.patientName}</li>;
});

// ❌ pointless — premature memo on a trivial component; adds noise, saves nothing
export const Badge = memo(({ label }: { label: string }) => <span>{label}</span>);
```

### 3.7 Keys

Use **stable domain IDs**. Never the array index (it corrupts state on reorder/insert).

```tsx
// ❌ bad
{
  queue.map((e, i) => <QueueRow key={i} entry={e} />);
}
// ✅ good
{
  queue.map((e) => <QueueRow key={e.id} entry={e} />);
}
```

### 3.8 Effects discipline — _derive, don't sync_

Effects are a **last resort**. Most "effects" are really derived state or event handlers in disguise.

```tsx
// ❌ bad — effect syncing derived state (extra render, drift risk)
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// ✅ good — derive during render
const fullName = `${first} ${last}`;
```

```tsx
// ❌ bad — fetching in an effect (no caching, races, no retry; violates the data layer)
useEffect(() => {
  fetch(`/patients/${id}`)
    .then((r) => r.json())
    .then(setPatient);
}, [id]);

// ✅ good — server data comes from a Query hook (see §6, §8)
const { data: patient } = usePatient(id);
```

Legitimate effects: subscriptions (websocket/SW), imperative focus, syncing to a non-React system. Always return a cleanup.

### 3.9 Refs

For imperative DOM access (focus, scroll, measure), never to store render-affecting data.

```tsx
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []); // focus on mount
```

### 3.10 Suspense & error boundaries

- Wrap route-level screens in an **error boundary** (typed `AppError` → localized fallback) and a **Suspense** boundary (skeleton fallback). Both are provided by `shared/ui`.
- Every async surface ships all four states — Loading / Empty / Error / Success (see [Brain.md §11](./Brain.md)).

```tsx
<RouteErrorBoundary fallbackKey="patients.error.load">
  <Suspense fallback={<PatientListSkeleton />}>
    <PatientList />
  </Suspense>
</RouteErrorBoundary>
```

### 3.11 Server data via Query hooks, never `useEffect` + fetch

This is a hard line. Components consume `useX()` query hooks from a slice's public API. No `fetch`/`axios`/`HttpClient` in components, ever. See §6 and §8.

---

## 4. Component anatomy

### 4.1 Standard order inside a component file

One component per file (helpers may share if private). Top-to-bottom:

```tsx
// 1. imports (ordered — see §15)
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';
import { usePatient } from '@/entities/patient';
import type { PatientId } from '@/shared/lib/types';

// 2. types / props
interface PatientHeaderProps {
  patientId: PatientId;
}

// 3. local constants (UPPER_SNAKE_CASE)
const AVATAR_SIZE = 'var(--size-avatar-lg)';

// 4. the component
export function PatientHeader({ patientId }: PatientHeaderProps) {
  // 4a. hooks first, in a stable order: i18n → router → query → store → local state → refs
  const { t } = useTranslation('patient');
  const { data: patient, isPending, isError } = usePatient(patientId);

  // 4b. derived values (no effects needed)
  const displayName = patient ? `${patient.firstName} ${patient.lastName}` : '';

  // 4c. handlers
  const handlePrint = () => window.print();

  // 4d. guard clauses for the four states
  if (isPending) return <PatientHeaderSkeleton />;
  if (isError || !patient) return <ErrorInline messageKey="patient.error.load" />;

  // 4e. happy-path JSX
  return <header aria-label={t('header.region')}>{displayName}</header>;
}

// 5. private subcomponents / helpers (not exported)
function PatientHeaderSkeleton() {
  /* … */
}
```

### 4.2 Container vs presentational split

- **Presentational** (`ui/`): props in, JSX out. No query hooks, no stores. Trivially testable and Storybook-able.
- **Container** (`ui/`): wires data (query hooks, store selectors) and passes plain props down.

```tsx
// ✅ presentational — pure, reusable, easy to story
export function VitalsReadout({ vitals }: { vitals: Vitals }) {
  /* JSX only */
}

// ✅ container — owns the data wiring
export function VitalsCard({ patientId }: { patientId: PatientId }) {
  const { data } = useLatestVitals(patientId);
  return data ? <VitalsReadout vitals={data} /> : <VitalsSkeleton />;
}
```

### 4.3 How a feature composes entities + shared

Layer discipline (Dependency Rule, [Brain.md §5](./Brain.md)): a **feature** uses **entity** components and **shared/ui**, never another feature directly.

```tsx
// features/record-vitals/ui/RecordVitalsForm.tsx
import { Button, Field } from '@/shared/ui'; // shared (design system)
import { PatientChip } from '@/entities/patient'; // entity noun
import { useRecordVitals } from '../model/useRecordVitals'; // slice-local

export function RecordVitalsForm({ patientId }: { patientId: PatientId }) {
  // composes shared UI + entity UI + slice logic — never imports another feature
}
```

---

## 5. Hooks

### 5.1 Conventions

- Name `useThing`; one responsibility; live in the slice that owns them (`model/` for logic, `api/` for query hooks). See [Naming-Convention.md](./Naming-Convention.md).
- Return a **stable, named object** (not a positional tuple once you exceed two values).
- Memoize returned objects/callbacks so consumers don't re-render needlessly.

```ts
// ✅ stable, documented return shape
export function useQueueActions(queueId: QueueId) {
  const callNext = useCallback(() => {
    /* … */
  }, [queueId]);
  const skip = useCallback(() => {
    /* … */
  }, [queueId]);
  return useMemo(() => ({ callNext, skip }), [callNext, skip]);
}
```

```ts
// ❌ bad — new object every render → breaks memo/deps downstream
export function useQueueActions(queueId: QueueId) {
  return { callNext: () => {}, skip: () => {} }; // fresh refs each render
}
```

### 5.2 Where hooks live per slice

| Hook kind                                                         | Location           |
| ----------------------------------------------------------------- | ------------------ |
| Server-data query/mutation hook (`usePatient`, `useRecordVitals`) | slice `api/`       |
| Domain/UI logic hook (`useQueueActions`, `useVitalsForm`)         | slice `model/`     |
| Cross-cutting, domain-free hook (`useDebounce`, `useMediaQuery`)  | `shared/lib/hooks` |

All hooks are re-exported through the slice `index.ts` — consumers import from the public API only (§8, §15).

---

## 6. State management

> **Match the data to its home** — this mirrors [Brain.md §9](./Brain.md). Don't duplicate the table; obey it.

| Data                                               | Tool                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| Server data                                        | **TanStack Query** (single source of truth — never copy into Zustand) |
| Global UI/app (theme, locale, active clinic, auth) | **Zustand** slices                                                    |
| Form state                                         | **React Hook Form**                                                   |
| URL state (filters, tabs, pagination)              | **Router search params**                                              |
| Ephemeral component state                          | `useState` / `useReducer`                                             |

### 6.1 TanStack Query — query key factory

Centralize keys per entity. Never scatter string arrays.

```ts
// entities/patient/api/patient.keys.ts
export const patientKeys = {
  all: ['patient'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (q: PatientQuery) => [...patientKeys.lists(), q] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: PatientId) => [...patientKeys.details(), id] as const,
};
```

```ts
// ❌ bad — magic key arrays, impossible to invalidate consistently
useQuery({ queryKey: ['patients', id], queryFn: () => fetchPatient(id) });

// ✅ good — factory keys + service call + sensible staleTime
export function usePatient(id: PatientId) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientService.getById(id), // goes through the data layer (§8)
    staleTime: 60_000, // patient detail is not high-churn
  });
}
```

### 6.2 Invalidation

Invalidate by the **narrowest** factory key that covers the change.

```ts
const qc = useQueryClient();
// after editing one patient → refresh that detail + any lists
await qc.invalidateQueries({ queryKey: patientKeys.detail(id) });
await qc.invalidateQueries({ queryKey: patientKeys.lists() });
```

### 6.3 Optimistic updates

```ts
export function useToggleFlag(id: PatientId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => patientService.toggleFlag(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: patientKeys.detail(id) });
      const prev = qc.getQueryData<Patient>(patientKeys.detail(id));
      qc.setQueryData<Patient>(patientKeys.detail(id), (p) => p && { ...p, flagged: !p.flagged });
      return { prev }; // rollback context
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(patientKeys.detail(id), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: patientKeys.detail(id) }),
  });
}
```

### 6.4 The Outbox (offline writes)

Mutations that must survive offline go through the **Outbox** ([Brain.md §10](./Brain.md)): queue locally, sync when online, apply the conflict policy. Use the shared `useOutboxMutation` wrapper rather than a raw `useMutation` for any write that must not be lost (vitals, prescriptions, billing).

```ts
// ✅ resilient write — queued offline, replayed on reconnect
const recordVitals = useOutboxMutation({
  mutationFn: (input) => vitalsService.record(input),
  outboxKey: 'vitals.record',
  invalidate: [vitalsKeys.list(patientId)],
});
```

### 6.5 Zustand — slice pattern with selectors + shallow

```ts
// app or shared store slice — small, typed, selector-driven
interface ThemeSlice {
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (t: ThemeSlice['theme']) => void;
}
export const useThemeStore = create<ThemeSlice>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
```

```tsx
// ❌ bad — selecting the whole store re-renders on every unrelated change
const store = useThemeStore();

// ✅ good — narrow selector; shallow for multi-field selects
const theme = useThemeStore((s) => s.theme);
const { theme, setTheme } = useThemeStore(
  useShallow((s) => ({ theme: s.theme, setTheme: s.setTheme })),
);
```

### 6.6 Avoid prop drilling **and** over-globalizing

- More than ~2 hand-offs of the same prop → use **composition** (children/slots) or a small **context**, not global state.
- Don't lift truly local state to Zustand "to be safe." Global state is shared mutable surface area; keep it minimal (theme, locale, active clinic, auth session — and little else).

---

## 7. Forms — React Hook Form + Zod

One schema, one resolver, field components, i18n errors, accessible by construction.

```tsx
// model/vitalsForm.schema.ts
export const VitalsFormSchema = z.object({
  heartRate: z.coerce.number().int().min(20).max(300),
  systolic: z.coerce.number().int().min(40).max(300),
});
export type VitalsFormValues = z.infer<typeof VitalsFormSchema>;
```

```tsx
// ui/RecordVitalsForm.tsx
export function RecordVitalsForm({ patientId }: { patientId: PatientId }) {
  const { t } = useTranslation('vitals');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VitalsFormValues>({
    resolver: zodResolver(VitalsFormSchema),
  });
  const record = useRecordVitals(patientId);

  return (
    <form onSubmit={handleSubmit((v) => record.mutate(v))} noValidate>
      <Field
        label={t('form.heartRate')}
        error={errors.heartRate && t(`form.error.${errors.heartRate.type}`)}
        {...register('heartRate')}
      />
      <Button type="submit" disabled={isSubmitting}>
        {t('form.submit')}
      </Button>
    </form>
  );
}
```

**Form accessibility (always):** every input has a `<label htmlFor>`; errors use `aria-describedby` + `role="alert"`; invalid fields set `aria-invalid`; focus moves to the first error on submit. The shared `<Field>` wires all of this — use it.

```tsx
// ❌ bad — placeholder as label, hardcoded English error, no association
<input placeholder="Heart rate" />;
{
  errors.heartRate && <span>Required</span>;
}
```

> Validation messages are **i18n keys keyed by error type**, never literal strings. See §13.

---

## 8. Data-layer usage (the hard boundary)

Components consume **services and query hooks via a slice's public API**. They **never** import `HttpClient`, DTOs, mappers, or repositories.

```
Component → useX() query hook → Service → Repository → HttpClient
                                   ▲
                          DTO (Zod) → Mapper → Model
```

```tsx
// ❌ bad — component reaches into the data plumbing
import { HttpClient } from '@/shared/api/http';
import { PatientDto } from '@/entities/patient/api/dto/patient.dto'; // deep import + DTO leak!
const dto: PatientDto = await HttpClient.get(`/patients/${id}`);

// ✅ good — component depends only on the slice's public surface
import { usePatient } from '@/entities/patient'; // index.ts re-exports the hook
const { data: patient } = usePatient(id); // `patient` is a domain Model, never a DTO
```

Rules:

- **DTOs never leave `api/`.** They are parsed and mapped to Models inside the slice; components see Models only.
- **`HttpClient` is imported only by repositories** (in `shared/api` or a slice's `api/`), never by UI.
- **Import only from `index.ts`.** Deep imports past the public API are linted and blocked ([Brain.md §5.2](./Brain.md)).

---

## 9. Styling — Tailwind + tokens

> **Every color/size/space/radius/shadow/duration is a token.** No hardcoded hex or px. Ever. ([Brain.md §6](./Brain.md))

### 9.1 Tokens only

```tsx
// ❌ bad — hardcoded color + pixel spacing + raw font size
<div className="bg-[#E87D7D] p-[16px] text-[18px]" />

// ✅ good — semantic token-mapped utilities
<div className="bg-primary p-4 text-body-lg" />
```

### 9.2 CVA for variants + tailwind-merge

```ts
// shared/ui/Button/button.variants.ts
export const button = cva('inline-flex items-center justify-center rounded-md font-medium', {
  variants: {
    intent: { primary: 'bg-primary text-on-primary', ghost: 'bg-transparent text-primary' },
    size: { sm: 'h-9 px-3 text-body-sm', md: 'h-11 px-4 text-body-md' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});
```

```tsx
// merge so caller overrides win without specificity wars
import { twMerge } from 'tailwind-merge';
export function Button({ intent, size, className, ...rest }: ButtonProps) {
  return <button className={twMerge(button({ intent, size }), className)} {...rest} />;
}
```

### 9.3 RTL — logical properties

```tsx
// ❌ bad — physical direction breaks in Arabic/Urdu
<div className="ml-4 text-left" />
// ✅ good — logical properties flip automatically
<div className="ms-4 text-start" />
```

### 9.4 Conditional classes

```tsx
import { cn } from '@/shared/lib/cn'; // clsx + tailwind-merge wrapper
<li
  className={cn('px-4 py-2', isActive && 'text-on-primary bg-primary', isDone && 'opacity-60')}
/>;
```

> Never build class strings with `+`/template literals containing dynamic Tailwind fragments — they break purge. Use `cn`/CVA.

---

## 10. Async & errors

### 10.1 Typed `AppError`

All thrown errors in app code are `AppError` carrying an **i18n message key** + structured context — never a bare `Error('text')`.

```ts
export class AppError extends Error {
  constructor(
    public readonly messageKey: string, // e.g. 'patient.error.load'
    public readonly options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super(messageKey, { cause: options?.cause });
    this.name = 'AppError';
  }
}
```

### 10.2 Never swallow errors

```ts
// ❌ bad — silent failure, no signal, no telemetry
try {
  await save();
} catch {}

// ✅ good — surface (localized) + report; rethrow or return a typed failure
try {
  await save();
} catch (e) {
  reportError(e); // Sentry behind abstraction (Brain §4)
  throw new AppError('vitals.error.save', { cause: e });
}
```

### 10.3 Result vs throw

- **Throw `AppError`** for exceptional/unexpected failures → caught by Query (`isError`) or an error boundary.
- **Return a `Result`** for _expected_ domain outcomes that callers branch on (e.g. validation, conflict on sync).

```ts
type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };

function applyOutboxEntry(e: OutboxEntry): Result<Patient> {
  if (e.conflict) return { ok: false, error: new AppError('outbox.conflict') };
  return { ok: true, value: merge(e) };
}
```

> In the UI, lean on Query's `isError`/`error` + error boundaries; don't hand-roll try/catch in components.

---

## 11. Performance coding patterns

- **Route-level code splitting** — every page is lazy.

```tsx
const QueueScreen = lazy(() => import('@/pages/queue'));
// <Route path="/queue" element={<Suspense fallback={<QueueSkeleton />}><QueueScreen /></Suspense>} />
```

- **Virtualize long lists/queues** (queue, patient search, audit log) with `@tanstack/react-virtual` — never render 500 DOM rows.
- **Stable callbacks/objects** with `useCallback`/`useMemo` _when passed to memoized children or hook deps_ (not reflexively — §3.6).
- **Avoid unnecessary re-renders:** narrow Zustand selectors (§6.5), split contexts, push state down to the smallest component.
- **Images/fonts:** responsive `srcset` + lazy `loading="lazy"`; subset & `font-display: swap` for Inter / Plus Jakarta Sans; preload only the critical weight.
- **Measure first:** React Profiler / Web Vitals before optimizing. No guesswork micro-opts.

---

## 12. Accessibility in code

> WCAG 2.2 AA is the floor ([Brain.md §7](./Brain.md)). Accessibility is written into the component, not bolted on later.

```tsx
// ❌ bad — div-as-button: no role, no keyboard, no focus, label is hardcoded English
<div onClick={callNext}>Call next</div>

// ✅ good — semantic element, i18n label, keyboard + focus for free
<button type="button" onClick={callNext}>{t('queue.action.callNext')}</button>
```

- **Semantic elements first** (`button`, `nav`, `main`, `ul/li`, `header`); ARIA only to fill genuine gaps.
- **Labels via i18n** — `aria-label={t(...)}`, never a hardcoded string.
- **Focus management:** dialogs trap & restore focus; move focus to first error on form submit; skip-to-content link per page.
- **Keyboard handlers:** anything clickable is operable by keyboard (use real `button`/`a`; for custom widgets handle `Enter`/`Space` and set `tabIndex`).
- **Never signal by color alone** — pair with icon/text/shape.

---

## 13. Localization in code

> No hardcoded human-readable strings — including `aria-label`, titles, and errors ([Brain.md §8](./Brain.md)). Linted.

```tsx
const { t } = useTranslation('vitals'); // namespace = feature/entity area
<h2>{t('card.title')}</h2>;
```

```tsx
// ❌ bad — concatenation: untranslatable, wrong word order in other languages
<p>{t('queue.waiting')} {count} {t('queue.patients')}</p>

// ✅ good — interpolation + ICU plurals (one key handles all plural forms)
<p>{t('queue.waitingCount', { count })}</p>
// queue.waitingCount = "{count, plural, one {# patient waiting} other {# patients waiting}}"
```

- **Namespaces:** `feature.area.element` keys ([Brain.md §12](./Brain.md)); group keys by slice.
- **Formatting via `Intl`** — dates, numbers, currency are locale-aware, never manual.

```ts
const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
fmt.format(new Date(appointment.scheduledFor));
```

- **RTL:** never assume LTR; pair with logical CSS properties (§9.3).

---

## 14. Comments & self-documenting code

- **Code reads as the _what_; comments explain the _why_ (and the _why-not_).**
- **JSDoc** on every **public API** surface (anything exported from a slice `index.ts`, services, ports).
- **TODO/FIXME** must carry an owner + ticket: `// TODO(WTI-123): …`. A bare `// TODO` fails review.

```ts
// ❌ bad — restates the code; adds nothing
// increment the counter
count += 1;

// ✅ good — explains a non-obvious decision (the why-not)
// We intentionally do NOT debounce here: the receptionist scans barcodes faster than
// the debounce window, and dropped scans cause double check-ins. See WTI-204.
processScan(code);
```

```ts
/**
 * Records a vitals reading for a patient.
 * Queues via the Outbox when offline; resolves once accepted locally.
 * @throws {AppError} `vitals.error.save` when the schema rejects the reading.
 */
export function recordVitals(input: VitalsInput): Promise<Vitals> {
  /* … */
}
```

---

## 15. Imports & exports

- **Named exports only.** No `export default` (better refactors, consistent names, tree-shaking). Lazy route modules are the single tolerated exception.
- **Import only from a slice's public API (`index.ts`).** No deep imports (linted, [Brain.md §5.2](./Brain.md)).
- **Path aliases** (`@/…`), never long relative chains (`../../../`).
- **`import type`** for type-only imports (`verbatimModuleSyntax`).
- **Import order** (auto-sorted by ESLint): ① node/builtin → ② external → ③ aliased internal by layer (`shared` → `entities` → `features` → …) → ④ relative → ⑤ styles/assets. Types may be grouped last.

```ts
// ✅ good
import { useMemo } from 'react'; // external
import { Button } from '@/shared/ui'; // internal: shared
import { usePatient } from '@/entities/patient'; // internal: entity
import { useQueueActions } from '../model'; // relative (same slice)
import type { PatientId } from '@/shared/lib/types';
```

```ts
// ❌ bad — default export + deep import + relative climb
import Button from '../../../shared/ui/Button/Button';
```

> Exact ordering groups and alias map: [Naming-Convention.md](./Naming-Convention.md).

---

## 16. Linting & formatting

**ESLint + Prettier are law.** CI fails on any error; pre-commit fixes what it can.

- **Prettier** owns formatting (no style debates in review).
- **ESLint** enforces: `@typescript-eslint` (no `any`, no floating promises, exhaustive switch), `react-hooks` (rules + exhaustive-deps as **error**), `eslint-plugin-boundaries` (the Dependency Rule + no deep imports), `jsx-a11y`, an **i18n** rule (no literal JSX/`aria-label` strings), and `import`/`simple-import-sort` for ordering.
- **Husky + lint-staged** run `eslint --fix` + `prettier --write` on staged files pre-commit; CI re-runs the full gate. See [Developer-Rules.md](./Developer-Rules.md) and [Brain.md §4](./Brain.md).
- **Never** add blanket `// eslint-disable` to silence the architecture. A disable needs a single-rule scope, a reason comment, and reviewer sign-off.

---

## 17. Anti-patterns gallery

| ❌ Forbidden                               | ✅ Do instead                           | Why                                             |
| ------------------------------------------ | --------------------------------------- | ----------------------------------------------- |
| `any`                                      | `unknown` + narrowing / Zod             | Keeps the compiler on (§2.2)                    |
| `enum`                                     | Discriminated union / `as const`        | Zero runtime cost, narrows (§2.4)               |
| Non-null `!`                               | Narrow & handle absence                 | No silent null crashes (§2.8)                   |
| `useEffect` + `fetch` for server data      | Query hook (`useX`)                     | Caching, retries, the data layer (§3.8, §6)     |
| Caching server data in Zustand             | Leave it in TanStack Query              | One source of truth (§6)                        |
| `key={index}`                              | `key={item.id}`                         | Stable identity on reorder (§3.7)               |
| `React.FC` / default exports               | Typed props + named exports             | Refactor-safe, no implicit children (§3.3, §15) |
| Component imports `HttpClient`/DTO         | Consume service/query hook              | Backend-independence (§8)                       |
| Deep import past `index.ts`                | Import from slice public API            | Dependency Rule (§8, §15)                       |
| Hardcoded hex/px/font-size                 | Token utilities + CVA                   | Visual contract (§9)                            |
| `ml-4` / `text-left`                       | `ms-4` / `text-start`                   | RTL safety (§9.3)                               |
| Hardcoded UI string / English `aria-label` | `t('namespace.key')`                    | Localization law (§13)                          |
| String concatenation for sentences         | ICU interpolation/plurals               | Translatable, correct order (§13)               |
| `div onClick` as a button                  | `<button>`                              | A11y + keyboard (§12)                           |
| Empty `catch {}`                           | Report + typed `AppError`               | Never swallow (§10.2)                           |
| Reflexive `memo`/`useMemo` everywhere      | Memoize on measured need                | Avoid noise & memory (§3.6)                     |
| Effect syncing derived state               | Derive during render                    | Fewer renders, no drift (§3.8)                  |
| Blanket `eslint-disable`                   | Fix the cause (scoped disable + reason) | Architecture is linted (§16)                    |
| Bare `// TODO`                             | `// TODO(WTI-123): …`                   | Traceable (§14)                                 |

---

_Last updated: 2026-06-27 · Owner: Frontend Architecture · Status: **Foundation v1** · Companion to [Brain.md](./Brain.md)_
