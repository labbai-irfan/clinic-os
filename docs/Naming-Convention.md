# 📛 ClinicOS — Naming-Convention.md

> Names are the cheapest documentation we ship. A good name explains intent before a single line of body is read; a bad name lies for ten years.
> This document is the **authoritative** rulebook for **how we name everything** in the ClinicOS frontend — files, folders, symbols, domain models, state, i18n keys, tokens, routes, and git artifacts.

**Read alongside:** [Brain.md](./Brain.md) (§12 _Naming at a glance_ is the summary; this is the full text) · [Folder-Structure.md](./Folder-Structure.md) (where names live) · [Coding-Standards.md](./Coding-Standards.md) (how we write the bodies behind the names).

> If a naming question is not answered here, it is **not yet decided** — propose it, get it ratified, and record it here (per [Brain.md](./Brain.md) §0).

---

## Table of contents

1. [Purpose](#1-purpose)
2. [Guiding principles](#2-guiding-principles)
3. [File naming standards](#3-file-naming-standards)
4. [Folder naming standards](#4-folder-naming-standards)
5. [Symbol naming](#5-symbol-naming)
6. [Domain model naming](#6-domain-model-naming)
7. [React-specific naming](#7-react-specific-naming)
8. [State naming](#8-state-naming)
9. [i18n key naming](#9-i18n-key-naming)
10. [Design token naming](#10-design-token-naming)
11. [CSS / Tailwind / test / aria attributes](#11-css--tailwind--test--aria-attributes)
12. [Routing naming](#12-routing-naming)
13. [Git naming](#13-git-naming)
14. [Approved abbreviations & forbidden names](#14-approved-abbreviations--forbidden-names)
15. [Quick-reference cheat-sheet](#15-quick-reference-cheat-sheet)

---

## 1. Purpose

ClinicOS is the **digital nervous system of a clinic** — it must survive **10+ years without a rewrite** ([Brain.md](./Brain.md) §1). At that horizon, _names outlive code_: implementations are rewritten, but the words `Patient`, `Appointment`, `Vitals`, `Prescription`, `Queue`, and `Billing` will still be on the screen and in the codebase. This document exists to make those words:

- **Predictable** — a developer (or AI agent) can guess a file/symbol name correctly without searching.
- **Domain-true** — names speak the clinic's language (DDD ubiquitous language), not the backend's column names.
- **Lint-enforceable** — conventions are mechanical enough that ESLint, file-name rules, and CI gate them, not opinions in review.
- **Layer-honest** — a name tells you which [FSD layer](./Brain.md#51-layers) and which step of the [Repository → Service → DTO pipeline](./Brain.md#53-backend-independence-pipeline-the-most-important-contract) it belongs to.

This file is the canonical expansion of [Brain.md §12](./Brain.md#12-naming-at-a-glance). Where the two ever disagree, **fix one** — they must never drift. See also [Folder-Structure.md](./Folder-Structure.md) for the canonical tree and [Coding-Standards.md](./Coding-Standards.md) for day-to-day style.

---

## 2. Guiding principles

| #   | Principle                                                                                      | Why                                                                                                                    | ✅ Good                                        | ❌ Bad                                                 |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| P1  | **Descriptive over short**                                                                     | A name is read 100× more than typed. Autocomplete makes length free.                                                   | `appointmentStartTime`                         | `apptT`, `t1`                                          |
| P2  | **Domain language (DDD ubiquitous language)**                                                  | The name must match what a clinician says. The backend's `patient_mrn` becomes `medicalRecordNumber` in the UI domain. | `recordVitals`, `dispensePrescription`         | `submitForm2`, `processData`                           |
| P3  | **Consistency over personal preference**                                                       | A predictable wrong-ish name beats five clever right-ish ones. Follow the table even if you'd choose otherwise.        | every store is `x.store.ts`                    | `authStore.ts`, `auth-store.ts`, `store.auth.ts` mixed |
| P4  | **No abbreviations** (except the [approved list](#14-approved-abbreviations--forbidden-names)) | Abbreviations are private dialects. `appt` means nothing to a new hire or an AI.                                       | `appointment`, `prescription`                  | `appt`, `presc`, `rx` (unless approved)                |
| P5  | **Reveal intent, not mechanism**                                                               | Name the _what/why_, not the _how_.                                                                                    | `isQueueFull`, `selectActivePatient`           | `flagCheck`, `getData2`                                |
| P6  | **Layer- and pipeline-honest**                                                                 | The name encodes role: `Dto` = wire shape, `Model` = domain, `ViewModel` = screen shape.                               | `PatientDto`, `Patient`, `PatientRowViewModel` | one `Patient` type used for wire + domain + UI         |
| P7  | **Searchable & unambiguous**                                                                   | One concept → one word, repo-wide. Don't mix `client`/`customer`/`patient` for the same thing.                         | always `patient`                               | `patient` here, `client` there                         |
| P8  | **No "dumping-ground" names**                                                                  | `utils`, `helpers`, `Manager`, `data` attract junk and hide intent. Name by responsibility.                            | `formatPatientName`, `queue.utils.ts`          | `Helper`, `MiscManager`, `stuff.ts`                    |

> **Litmus test:** _Could a non-technical reviewer guess what this thing does from its name alone, in the clinic's vocabulary?_ If not, rename.

---

## 3. File naming standards

**Casing by kind:** React components are `PascalCase`. Everything else is `kebab-case` for the slug + a **dotted role suffix** (`.store`, `.service`, `.repository`, …) + extension. The role suffix is non-negotiable — it makes files greppable and lets lint enforce "one role per file".

> The `thing` slug is **singular, kebab-case, and domain-named** (`patient`, `appointment`, `book-appointment`), matching the slice. Multi-word slugs stay kebab-case (`medical-record.types.ts`).

| Kind                            | Pattern                          | Real ClinicOS example                                              | Where it lives ([slice anatomy](./Brain.md#52-slice-anatomy-every-featureentity-looks-the-same)) |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Component                       | `PascalCase.tsx`                 | `VitalsCard.tsx`, `AppointmentForm.tsx`, `QueueBoard.tsx`          | `ui/`                                                                                            |
| Hook                            | `useThing.ts`                    | `usePatient.ts`, `useAppointmentSlots.ts`, `useQueuePosition.ts`   | `model/` or `api/`                                                                               |
| Store (Zustand)                 | `thing.store.ts`                 | `auth.store.ts`, `active-clinic.store.ts`, `queue-filter.store.ts` | `model/`                                                                                         |
| Selectors                       | `thing.selectors.ts`             | `queue.selectors.ts`, `billing.selectors.ts`                       | `model/`                                                                                         |
| Service (use-case)              | `thing.service.ts`               | `billing.service.ts`, `book-appointment.service.ts`                | `model/` (or `api/` for thin wrappers)                                                           |
| Repository                      | `thing.repository.ts`            | `patient.repository.ts`, `prescription.repository.ts`              | `api/`                                                                                           |
| Mapper                          | `thing.mapper.ts`                | `patient.mapper.ts`, `vitals.mapper.ts`                            | `api/`                                                                                           |
| DTO                             | `thing.dto.ts`                   | `patient.dto.ts`, `appointment.dto.ts`                             | `api/`                                                                                           |
| Schema (Zod)                    | `thing.schema.ts`                | `appointment.schema.ts`, `vitals-form.schema.ts`                   | `model/` (form) or `api/` (DTO)                                                                  |
| Types                           | `thing.types.ts`                 | `queue.types.ts`, `billing.types.ts`                               | `model/`                                                                                         |
| Query hooks / keys              | `thing.queries.ts`               | `patient.queries.ts`, `appointment.queries.ts`                     | `api/`                                                                                           |
| Endpoints                       | `thing.endpoints.ts`             | `patient.endpoints.ts`                                             | `api/`                                                                                           |
| Constants                       | `thing.constants.ts`             | `queue.constants.ts`, `billing.constants.ts`                       | `config/`                                                                                        |
| Pure utils                      | `thing.utils.ts`                 | `vitals.utils.ts`, `currency.utils.ts`                             | `lib/`                                                                                           |
| Config / flags                  | `thing.config.ts`                | `book-appointment.config.ts`                                       | `config/`                                                                                        |
| Unit/integration test           | `*.test.ts` / `*.test.tsx`       | `VitalsCard.test.tsx`, `patient.mapper.test.ts`                    | next to the file under test                                                                      |
| E2E test                        | `*.spec.ts`                      | `book-appointment.spec.ts`, `patient-journey.spec.ts`              | `e2e/`                                                                                           |
| Storybook story                 | `*.stories.tsx`                  | `VitalsCard.stories.tsx`, `Button.stories.tsx`                     | `ui/`                                                                                            |
| Styles (rare; tokens preferred) | `thing.css` / `thing.module.css` | `print-prescription.css`                                           | next to consumer                                                                                 |
| Public API barrel               | `index.ts`                       | `features/book-appointment/index.ts`                               | slice root **only**                                                                              |
| Internal segment barrel         | `index.ts`                       | `ui/index.ts` (re-export within slice)                             | segment root                                                                                     |

### 3.1 Component file ✅ / ❌

| ✅ Good                | ❌ Bad                     | Why                                                       |
| ---------------------- | -------------------------- | --------------------------------------------------------- |
| `PatientHeader.tsx`    | `patientHeader.tsx`        | Components are `PascalCase`.                              |
| `AppointmentForm.tsx`  | `appointment-form.tsx`     | kebab-case is for non-components.                         |
| `VitalsCard.tsx`       | `VitalsCard.component.tsx` | No redundant `.component` suffix; `.tsx` already says it. |
| `QueueBoard.tsx`       | `Queue.tsx` (a board)      | Name the artifact, not just the noun.                     |
| `PrescriptionList.tsx` | `Prescriptions.tsx`        | Component noun phrase, not a bare plural.                 |

### 3.2 Non-component file ✅ / ❌

| ✅ Good                 | ❌ Bad                                       | Why                                                          |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `patient.repository.ts` | `PatientRepository.ts`                       | Non-components are kebab + dotted role.                      |
| `billing.service.ts`    | `billingService.ts`                          | Use the `.service` role suffix, not camelCase.               |
| `appointment.dto.ts`    | `appointment-dto.ts`                         | Role is a **dotted** suffix, not part of the slug.           |
| `queue.types.ts`        | `queue.type.ts` / `types.ts`                 | Suffix is plural `.types`; never a bare `types.ts`.          |
| `patient.queries.ts`    | `patientQueries.ts` / `usePatientQueries.ts` | File is `.queries`; the hooks inside are `useX`.             |
| `vitals.utils.ts`       | `helpers.ts` / `utils.ts`                    | Must be domain-prefixed; bare `utils.ts` is forbidden (§14). |
| `index.ts`              | `public-api.ts` / `barrel.ts`                | The public surface is always `index.ts`.                     |

### 3.3 Test / story file ✅ / ❌

| ✅ Good                    | ❌ Bad                    | Why                                                               |
| -------------------------- | ------------------------- | ----------------------------------------------------------------- |
| `patient.mapper.test.ts`   | `patient.mapper.spec.ts`  | `.test` = unit/integration (Vitest); `.spec` is reserved for E2E. |
| `book-appointment.spec.ts` | `book-appointment.e2e.ts` | E2E (Playwright) is `.spec.ts`.                                   |
| `VitalsCard.stories.tsx`   | `VitalsCard.story.tsx`    | Plural `.stories`.                                                |
| `VitalsCard.test.tsx`      | `test-VitalsCard.tsx`     | Suffix, never prefix; mirrors the source name.                    |

---

## 4. Folder naming standards

**All folders are `kebab-case`. No exceptions** (no `PascalCase`, no `camelCase`, no `snake_case` folders).

### 4.1 The rule that matters most: **features are verbs, entities are nouns**

This encodes the [FSD layer split](./Brain.md#51-layers): a `feature` is a _user capability_ (something a user **does**), an `entity` is a _domain concept_ (something that **is**).

| Layer        | Part of speech          | ✅ Good                                                                                | ❌ Bad                                            | Note                                                                 |
| ------------ | ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| `features/`  | **verb phrase**         | `book-appointment`, `record-vitals`, `dispense-prescription`, `pay-bill`, `join-queue` | `appointment`, `vitals`, `patient`                | A feature that reads like a noun is probably an entity.              |
| `entities/`  | **singular noun**       | `patient`, `appointment`, `prescription`, `vitals`, `queue`, `invoice`                 | `patients`, `book-appointment`, `vitals-recorder` | Entities are singular nouns; verbs belong in features.               |
| `widgets/`   | **noun (UI block)**     | `patient-summary-panel`, `queue-board`, `billing-sidebar`                              | `do-billing`, `panel1`                            | Self-sufficient UI block, named for what it shows.                   |
| `pages/`     | **noun / screen**       | `patient-profile`, `appointment-calendar`, `pharmacy-queue`                            | `page1`, `view-stuff`                             | Route-level screens; name = the screen.                              |
| `processes/` | **journey verb phrase** | `patient-journey`, `intake-to-consultation`, `checkout-and-billing`                    | `flow`, `process2`                                | Cross-feature orchestration ([Brain.md §5.1](./Brain.md#51-layers)). |
| `shared/`    | **capability noun**     | `ui`, `lib`, `api`, `config`, `i18n`, `design-system`                                  | `utils`, `common`, `misc`                         | Zero domain knowledge here.                                          |

### 4.2 Slice-internal segment folders (fixed vocabulary)

Every feature/entity slice uses the **same** segment folder names ([Brain.md §5.2](./Brain.md#52-slice-anatomy-every-featureentity-looks-the-same)). Do not invent synonyms.

| ✅ Canonical segment | ❌ Forbidden synonyms                     |
| -------------------- | ----------------------------------------- |
| `ui/`                | `components/`, `views/`, `presentation/`  |
| `model/`             | `state/`, `store/`, `logic/`, `domain/`   |
| `api/`               | `data/`, `services/`, `network/`, `http/` |
| `lib/`               | `utils/`, `helpers/`, `common/`           |
| `config/`            | `constants/`, `settings/`, `cfg/`         |

### 4.3 Folder ✅ / ❌ examples

| ✅ Good                      | ❌ Bad                      | Why                                                          |
| ---------------------------- | --------------------------- | ------------------------------------------------------------ |
| `features/book-appointment/` | `features/BookAppointment/` | Folders are kebab-case.                                      |
| `features/record-vitals/`    | `features/vitals/`          | Feature = verb; `vitals` alone is the entity.                |
| `entities/prescription/`     | `entities/prescriptions/`   | Entities are **singular**.                                   |
| `entities/patient/model/`    | `entities/patient/state/`   | Use canonical `model/` segment.                              |
| `widgets/queue-board/`       | `widgets/QueueBoard/`       | kebab-case folder; the component inside is `QueueBoard.tsx`. |
| `processes/patient-journey/` | `processes/flow/`           | Name the journey, not "flow".                                |

---

## 5. Symbol naming

| Symbol kind            | Convention                                | ✅ Good                                                                                | ❌ Bad                                           |
| ---------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Component              | `PascalCase`                              | `VitalsCard`, `AppointmentForm`                                                        | `vitalsCard`, `appointment_form`                 |
| Function / variable    | `camelCase`                               | `formatPatientName`, `appointmentSlots`                                                | `FormatPatientName`, `appt_slots`                |
| Hook                   | `use` + `PascalCase` rest                 | `usePatient`, `useQueuePosition`                                                       | `getPatientHook`, `patientHook`                  |
| Boolean                | `is/has/should/can/did` prefix            | `isQueueFull`, `hasUnpaidInvoice`, `shouldAutoCheckIn`, `canDispense`, `didSyncVitals` | `queueFull`, `unpaid`, `dispenseFlag`            |
| Internal event handler | `handle` + Event                          | `handleSubmit`, `handlePatientSelect`, `handleSlotClick`                               | `onSubmit` (for internal), `submitClicked`       |
| Handler **prop**       | `on` + Event                              | `onAppointmentBooked`, `onVitalsSaved`, `onClose`                                      | `handleClose` (as a prop), `callback`            |
| Async function         | verb phrase (no `Async`/`Promise` suffix) | `bookAppointment`, `fetchPatient`, `dispensePrescription`                              | `bookAppointmentAsync`, `getPatientPromise`      |
| Type / Interface       | `PascalCase`, **no `I` prefix**           | `Patient`, `AppointmentSlot`, `QueueEntry`                                             | `IPatient`, `TAppointment`, `patientType`        |
| Generic param          | meaningful when it helps                  | `TData`, `TError`, `TPatientFilter`; bare `T` only for truly generic 1-param utilities | `T`, `U`, `X` for domain-specific generics       |
| Constant value         | `UPPER_SNAKE_CASE`                        | `MAX_QUEUE_SIZE`, `DEFAULT_VISIT_DURATION_MINUTES`                                     | `maxQueueSize`, `MaxQueue`                       |
| Const-object "enum"    | `PascalCase` object + `as const`          | `AppointmentStatus`, `BillingStatus`                                                   | `enum AppointmentStatus`                         |
| Zod schema             | `xSchema` (camelCase + `Schema`)          | `patientSchema`, `vitalsFormSchema`                                                    | `PatientSchema`, `patientZod`, `validatePatient` |
| Inferred type          | `X = z.infer<typeof xSchema>`             | `type Patient = z.infer<typeof patientSchema>`                                         | hand-writing a type that duplicates the schema   |

### 5.1 Booleans — read like a sentence

```ts
// ✅ reads as a predicate
const isCheckedIn = patient.status === 'checked-in';
const hasAllergies = patient.allergies.length > 0;
const canPrescribe = role === 'doctor' && !appointment.isClosed;
const shouldShowLargeText = settings.largeTextMode;

// ❌ ambiguous — is it a value, a count, a function?
const checkedIn = ...;
const allergies2 = ...;
const prescribe = ...;
```

### 5.2 Handlers — `handleX` inside, `onX` at the boundary

```tsx
// ✅ component receives `onX` props, defines `handleX` internally
function AppointmentForm({ onAppointmentBooked }: AppointmentFormProps) {
  const handleSubmit = async (values: AppointmentFormValues) => {
    const appointment = await bookAppointment(values); // async = verb phrase
    onAppointmentBooked(appointment);                   // prop = onX
  };
  return <form onSubmit={handleSubmit}>…</form>;
}

// ❌ leaking handler names as props / mixing conventions
function AppointmentForm({ handleBooked }: ...) {   // ❌ prop named handleX
  const onSubmit = async () => { … };               // ❌ internal named onX
}
```

### 5.3 No `enum` — use const objects or union types

Per [Brain.md](./Brain.md) tech stack (TS strict, tree-shakeable bundles), TS `enum` is avoided (runtime cost, surprising semantics, poor tree-shaking).

```ts
// ✅ const object + derived union
export const AppointmentStatus = {
  Scheduled: 'scheduled',
  CheckedIn: 'checked-in',
  InConsultation: 'in-consultation',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

// ✅ or a plain union when no runtime object is needed
export type QueuePriority = 'routine' | 'urgent' | 'emergency';

// ❌ avoid
export enum AppointmentStatus {
  Scheduled,
  CheckedIn /* … */,
}
```

### 5.4 Zod schema + inferred type pairing

```ts
// patient.schema.ts — schema is xSchema (camelCase)
export const patientSchema = z.object({
  id: patientIdSchema,
  fullName: z.string().min(1),
  dateOfBirth: z.string().date(),
});

// the domain type is *inferred*, never hand-duplicated
export type Patient = z.infer<typeof patientSchema>;
```

---

## 6. Domain model naming

The [backend-independence pipeline](./Brain.md#53-backend-independence-pipeline-the-most-important-contract) gives each shape a distinct **name suffix** so you always know which side of the boundary you're on. **Never leak backend names into the UI.**

| Suffix / shape                 | Meaning                                                                | Lives in        | ✅ Example                                     | ❌ Anti-pattern                                               |
| ------------------------------ | ---------------------------------------------------------------------- | --------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| `XDto`                         | Raw backend wire shape, Zod-validated at the boundary                  | `api/dto`       | `PatientDto`, `AppointmentDto`                 | using `PatientDto` in a component                             |
| `X` (Model)                    | Stable UI-shaped domain type; what components see                      | `model`         | `Patient`, `Appointment`, `Vitals`             | naming it `PatientModel` (redundant — bare noun is the model) |
| `XEntity`                      | Only if you must distinguish a persisted aggregate from a value object | `model` (rare)  | `PatientEntity` (vs `Address` value object)    | overusing `Entity` everywhere                                 |
| `XViewModel` / `XRowViewModel` | Screen-/row-shaped projection for a specific UI                        | `ui` or `model` | `QueueRowViewModel`, `InvoiceSummaryViewModel` | computing this inline in JSX                                  |
| `XId` (branded)                | Type-safe identifier, not interchangeable with other IDs               | `model`         | `PatientId`, `AppointmentId`, `InvoiceId`      | passing a raw `string` as an id                               |

### 6.1 Don't leak backend names

```ts
// ❌ backend column names leak into the domain — forbidden
type Patient = { patient_first_nm: string; dob_ts: number; mrn: string };

// ✅ DTO mirrors the wire; the Model speaks clinic language; the mapper bridges them
type PatientDto = { patient_first_nm: string; dob_ts: number; mrn: string }; // api/dto
type Patient = { firstName: string; dateOfBirth: Date; medicalRecordNumber: string }; // model

// patient.mapper.ts — the ONLY place that knows both shapes
export const toPatient = (dto: PatientDto): Patient => ({
  firstName: dto.patient_first_nm,
  dateOfBirth: new Date(dto.dob_ts),
  medicalRecordNumber: dto.mrn,
});
```

> Backend renames `patient_first_nm → firstName`? **Change one mapper.** Zero component edits ([Brain.md §5.3](./Brain.md#53-backend-independence-pipeline-the-most-important-contract)).

### 6.2 Branded ID types

```ts
// model/patient.types.ts
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type PatientId = Brand<string, 'PatientId'>;
export type AppointmentId = Brand<string, 'AppointmentId'>;
export type InvoiceId = Brand<string, 'InvoiceId'>;

// ✅ the compiler stops you mixing ids
function getAppointment(id: AppointmentId) {
  /* … */
}
getAppointment(patient.id); // ❌ compile error: PatientId is not AppointmentId
```

| ✅ Good                                        | ❌ Bad                                 |
| ---------------------------------------------- | -------------------------------------- |
| `PatientId`, `AppointmentId`, `PrescriptionId` | `id` typed as bare `string` everywhere |
| `function reschedule(id: AppointmentId)`       | `function reschedule(id: string)`      |
| `toPatient(dto)`, `toPatientDto(model)`        | `convert(dto)`, `map(x)`               |

---

## 7. React-specific naming

### 7.1 Props

| Rule                                          | ✅ Good                                       | ❌ Bad                                      |
| --------------------------------------------- | --------------------------------------------- | ------------------------------------------- |
| Props type = `ComponentNameProps`             | `interface VitalsCardProps {}`                | `interface Props {}`, `VitalsCardPropsType` |
| Boolean props read as predicates              | `isLoading`, `isDisabled`, `hasError`         | `loading2`, `disabledFlag`                  |
| Handler props are `onX`                       | `onSave`, `onPatientSelect`, `onQueueAdvance` | `handleSave` (as prop), `saveCallback`      |
| Render-prop / slot props say what they render | `renderRow`, `renderEmptyState`, `header`     | `children2`, `comp`, `fn`                   |
| Avoid backend leakage in prop names           | `patient`, `appointmentId`                    | `patient_dto`, `pat`                        |

```tsx
interface VitalsCardProps {
  vitals: Vitals; // domain model, not VitalsDto
  isEditable?: boolean; // boolean = is/has/should/can
  onVitalsSaved: (v: Vitals) => void; // handler prop = onX
  renderFooter?: (v: Vitals) => React.ReactNode; // render prop = renderX
}
```

### 7.2 Context, Provider, hook trio

A context ships as a **named trio**: `XContext` / `XProvider` / `useX`.

| ✅ Good                                                           | ❌ Bad                                                |
| ----------------------------------------------------------------- | ----------------------------------------------------- |
| `ActiveClinicContext`, `ActiveClinicProvider`, `useActiveClinic`  | `ClinicCtx`, `ClinicWrapper`, `getClinic`             |
| `QueueContext`, `QueueProvider`, `useQueue`                       | `QueueProviderContext`, `useQueueContext` (redundant) |
| `PrescriptionDraftContext` / `…Provider` / `usePrescriptionDraft` | `RxCtx`, `RxProv`, `useRx`                            |

```tsx
const ActiveClinicContext = createContext<ActiveClinic | null>(null);

export function ActiveClinicProvider({ children }: PropsWithChildren) {
  /* … */
}

export function useActiveClinic(): ActiveClinic {
  const ctx = useContext(ActiveClinicContext);
  if (!ctx) throw new Error('useActiveClinic must be used within <ActiveClinicProvider>');
  return ctx;
}
```

### 7.3 HOCs and refs

| Kind                    | Convention        | ✅ Good                                  | ❌ Bad                       |
| ----------------------- | ----------------- | ---------------------------------------- | ---------------------------- |
| HOC                     | `withX`           | `withPermissionGuard`, `withClinicScope` | `permissionHoc`, `guardWrap` |
| forwardRef display name | matches component | `PatientAvatar`                          | `ForwardRef(Anonymous)`      |
| Ref variable            | `xRef`            | `inputRef`, `dialogRef`, `queueListRef`  | `ref1`, `el`, `theRef`       |
| Imperative handle type  | `XHandle`         | `VitalsFormHandle`                       | `Ref`, `Methods`             |

---

## 8. State naming

### 8.1 Zustand store slices, actions, selectors

| Kind              | Convention       | ✅ Good                                              | ❌ Bad                                 |
| ----------------- | ---------------- | ---------------------------------------------------- | -------------------------------------- |
| Store hook        | `useXStore`      | `useAuthStore`, `useQueueFilterStore`                | `authStore`, `useStore`                |
| Slice state field | `camelCase` noun | `activeClinicId`, `largeTextMode`                    | `acid`, `flag1`                        |
| Action            | **verb**         | `setActiveClinic`, `toggleLargeText`, `advanceQueue` | `activeClinic` (as setter), `doAction` |
| Selector function | `selectX`        | `selectActivePatient`, `selectUnpaidTotal`           | `getPatient`, `activePatientSelector`  |

```ts
// queue-filter.store.ts
interface QueueFilterState {
  priority: QueuePriority | 'all';
  setPriority: (priority: QueuePriority | 'all') => void; // action = verb
  reset: () => void;
}

export const useQueueFilterStore = create<QueueFilterState>((set) => ({
  priority: 'all',
  setPriority: (priority) => set({ priority }),
  reset: () => set({ priority: 'all' }),
}));

// queue.selectors.ts — selectors are selectX, take state, return derived data
export const selectActivePatient = (state: QueueState) =>
  state.entries.find((e) => e.status === 'in-consultation');
```

### 8.2 TanStack Query — typed query-key factory

Query keys are **never** ad-hoc arrays scattered across files. Each entity owns a **typed key factory** named `xKeys`, defined in `thing.queries.ts`.

| ✅ Good                           | ❌ Bad                                      |
| --------------------------------- | ------------------------------------------- |
| `patientKeys.detail(patientId)`   | `['patient', id]` written inline in 5 files |
| `appointmentKeys.list(filters)`   | `['appointments', JSON.stringify(filters)]` |
| `vitalsKeys.byPatient(patientId)` | `['vitals' + patientId]` (string concat)    |

```ts
// patient.queries.ts
export const patientKeys = {
  all: ['patient'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: PatientFilters) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: PatientId) => [...patientKeys.details(), id] as const,
} as const;

// query hooks are useX, named for the data they return
export function usePatient(id: PatientId) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientRepository.getById(id),
  });
}

// mutations: verb-named hook + named mutation fn
export function useBookAppointment() {
  return useMutation({ mutationFn: bookAppointment });
}
```

> Invalidation reads cleanly: `queryClient.invalidateQueries({ queryKey: patientKeys.all })`.

---

## 9. i18n key naming

**Every string is a key** ([Brain.md §8](./Brain.md#8-localization-baseline-always-on)). Keys follow `namespace.area.element`, with a **camelCase leaf**, one **namespace per feature/entity**.

| Rule                                                       | ✅ Good                                                   | ❌ Bad                              |
| ---------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| `namespace.area.element`, camelCase leaf                   | `vitals.form.bloodPressure`                               | `Vitals.Form.BP`, `vitals_form_bp`  |
| One namespace per feature                                  | `appointment.*`, `billing.*`, `queue.*`                   | one giant `common.*` for everything |
| Group by `area` (form, list, dialog, error, action, empty) | `billing.invoice.totalDue`                                | `billing.totalDueOnInvoiceScreen`   |
| Actions under `.action`                                    | `appointment.action.book`, `prescription.action.dispense` | `bookBtnText`                       |
| Errors under `.error`                                      | `vitals.error.outOfRange`                                 | `vitalsErrMsg1`                     |
| aria/labels are keys too                                   | `queue.a11y.advanceButton`                                | hardcoded `aria-label="Advance"`    |

### 9.1 Pluralization (ICU) — suffix the plural family, never concatenate

```jsonc
// queue.json (namespace: "queue")
{
  "summary": {
    // ✅ ICU plural — one key, all forms
    "waitingCount": "{count, plural, =0 {No patients waiting} one {# patient waiting} other {# patients waiting}}",
  },
}
```

```ts
t('queue.summary.waitingCount', { count }); // ✅
```

### 9.2 NEVER build keys dynamically

```ts
// ❌ dynamic key concatenation — unextractable, untranslatable, breaks tooling
t(`appointment.status.${appointment.status}`);
t('billing.' + section + '.title');

// ✅ map status → an explicit, static key
const APPOINTMENT_STATUS_LABEL_KEY: Record<AppointmentStatus, string> = {
  scheduled: 'appointment.status.scheduled',
  'checked-in': 'appointment.status.checkedIn',
  'in-consultation': 'appointment.status.inConsultation',
  completed: 'appointment.status.completed',
  cancelled: 'appointment.status.cancelled',
};
t(APPOINTMENT_STATUS_LABEL_KEY[appointment.status]); // ✅ all keys are statically extractable
```

| ✅ Good                                      | ❌ Bad                        |
| -------------------------------------------- | ----------------------------- |
| `patient.form.dateOfBirth`                   | `patient.form.dob`            |
| `prescription.action.dispense`               | `rx.act.disp`                 |
| `billing.empty.noInvoices`                   | `billing.noStuff`             |
| `t('queue.summary.waitingCount', { count })` | `t('queue.' + n + 'Waiting')` |

---

## 10. Design token naming

Three tiers ([Brain.md §6](./Brain.md#6-design-tokens-the-visual-contract)): **Primitive → Semantic → Component**. Components consume **semantic/component** tokens only.

| Tier                         | Pattern                                                     | ✅ Example                                                                   | Consume in components? |
| ---------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| Primitive (raw scale)        | `--color-{family}-{step}`, `--space-{n}`, `--radius-{size}` | `--color-rose-500`, `--space-4`, `--radius-lg`                               | ❌ never directly      |
| Semantic (intent, themeable) | `--color-{role}`, `--text-{role}`                           | `--color-primary`, `--color-surface`, `--color-danger`, `--color-text-muted` | ✅ yes                 |
| Component (per-component)    | `--{component}-{property}`                                  | `--button-bg`, `--card-radius`, `--queue-row-height`                         | ✅ yes                 |

| Category   | Pattern                              | ✅ Good                                                | ❌ Bad                               |
| ---------- | ------------------------------------ | ------------------------------------------------------ | ------------------------------------ |
| Color      | `--color-{role}`                     | `--color-primary`, `--color-danger`, `--color-success` | `--brand`, `--red`, `--c1`           |
| Spacing    | `--space-{n}`                        | `--space-1` … `--space-12`                             | `--gap-small`, `--m4`, `--padding20` |
| Radius     | `--radius-{size}`                    | `--radius-sm/md/lg/xl/2xl/full`                        | `--rounded`, `--r1`                  |
| Typography | role token                           | `--text-h1`, `--text-body-md`, `--text-caption`        | `--font-18`, `--big-text`            |
| Motion     | `--duration-{role}`, `--ease-{role}` | `--duration-fast`, `--ease-standard`                   | `--ms200`, `--animationSpeed`        |

```css
/* ✅ primitive → semantic → component chain */
:root {
  --color-rose-500: #e87d7d;
} /* primitive */
:root {
  --color-primary: var(--color-rose-500);
} /* semantic */
.button {
  --button-bg: var(--color-primary);
} /* component */

/* ❌ component reaching past semantic to a raw primitive, or hardcoding */
.button {
  background: var(--color-rose-500);
} /* ❌ skips semantic tier */
.button {
  background: #e87d7d;
} /* ❌ hardcoded — forbidden */
```

---

## 11. CSS / Tailwind / test / aria attributes

| Attribute kind         | Convention                         | ✅ Good                                                        | ❌ Bad                                              |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| Test id                | `data-testid="kebab-case"`         | `data-testid="vitals-card"`, `data-testid="queue-row-advance"` | `data-testid="VitalsCard"`, `id="test1"`            |
| State data-attribute   | `data-{state}` (kebab)             | `data-state="checked-in"`, `data-priority="urgent"`            | `data-Status`, `data-isUrgent`                      |
| Variant data-attribute | `data-variant`                     | `data-variant="primary"`                                       | `data-type="p"`                                     |
| aria-\*                | standard ARIA, value from i18n key | `aria-label={t('queue.a11y.advanceButton')}`                   | `aria-label="Advance"` (hardcoded)                  |
| CVA variant keys       | `camelCase` semantic names         | `variant: { primary, danger, ghost }`, `size: { sm, md, lg }`  | `variant: { v1, v2 }`                               |
| Tailwind via tokens    | utilities map to tokens            | `bg-primary`, `text-muted`, `rounded-lg`                       | `bg-[#E87D7D]`, `text-[18px]` (arbitrary/hardcoded) |

```tsx
<button
  data-testid="queue-row-advance"
  data-priority={entry.priority} // ✅ data-{state}, kebab value
  data-variant="primary"
  aria-label={t('queue.a11y.advanceButton')} // ✅ aria value from i18n key
  className="rounded-lg bg-primary" // ✅ token-mapped utilities
/>
```

> Rule of thumb: **`data-testid` is kebab-case and stable** (tests depend on it — treat it like an API). Never key tests off CSS classes or i18n text.

---

## 12. Routing naming

| Kind                   | Convention                                 | ✅ Good                                                                      | ❌ Bad                                           |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| URL path segment       | `kebab-case`, noun, plural for collections | `/patients`, `/patients/:patientId`, `/appointments/book`, `/pharmacy/queue` | `/Patients`, `/bookAppointment`, `/patient_list` |
| Path param             | `camelCase`, branded-id named              | `:patientId`, `:appointmentId`, `:invoiceId`                                 | `:id`, `:pid`, `:p`                              |
| Route id (data router) | `kebab-case`, hierarchical with `.`        | `patient-profile`, `patient-profile.vitals`, `appointment-calendar`          | `route1`, `PatientProfile`                       |
| Loader / action fn     | `xLoader` / `xAction`                      | `patientProfileLoader`, `bookAppointmentAction`                              | `loader`, `getData`                              |

```ts
{
  id: 'patient-profile',                 // ✅ kebab route id
  path: 'patients/:patientId',           // ✅ kebab path, camelCase param
  loader: patientProfileLoader,          // ✅ xLoader
}
```

| ✅ Good URLs                   | ❌ Bad URLs           |
| ------------------------------ | --------------------- |
| `/appointments/book`           | `/appointment/Book`   |
| `/patients/:patientId/vitals`  | `/patient/:id/Vitals` |
| `/billing/invoices/:invoiceId` | `/billing/inv/:i`     |
| `/pharmacy/queue`              | `/pharmacyQueue`      |

---

## 13. Git naming

### 13.1 Branches — `type/short-kebab-summary`

| Type prefix | Use for                                  | ✅ Example                        |
| ----------- | ---------------------------------------- | --------------------------------- |
| `feat/`     | new user-facing capability               | `feat/book-appointment-reminders` |
| `fix/`      | bug fix                                  | `fix/queue-priority-sort`         |
| `chore/`    | tooling, deps, no behavior change        | `chore/bump-vitest-2`             |
| `refactor/` | internal restructure, no behavior change | `refactor/patient-mapper-split`   |
| `docs/`     | documentation only                       | `docs/naming-convention`          |
| `test/`     | tests only                               | `test/billing-service-coverage`   |
| `perf/`     | performance                              | `perf/queue-virtualization`       |

| ✅ Good                            | ❌ Bad                       |
| ---------------------------------- | ---------------------------- |
| `feat/record-vitals-bp-validation` | `feature/VitalsBPValidation` |
| `fix/billing-tax-rounding`         | `Sandeep-fix`                |
| `chore/eslint-boundaries-rule`     | `temp`, `wip2`               |

### 13.2 Commits — Conventional Commits, **scope = slice/layer**

`type(scope): subject` — scope is the **slice or entity name** (kebab), so history maps onto FSD.

| ✅ Good commit                                    | ❌ Bad commit               |
| ------------------------------------------------- | --------------------------- |
| `feat(book-appointment): add slot conflict check` | `added stuff`               |
| `fix(queue): correct priority comparator`         | `bugfix`                    |
| `refactor(patient): brand PatientId type`         | `wip`                       |
| `feat(billing): localize invoice totals`          | `update billing.service.ts` |
| `chore(shared/ui): add Button stories`            | `misc changes`              |

Allowed types: `feat, fix, refactor, perf, docs, test, chore, build, ci, style, revert`.
Allowed scopes: a **slice name** (`book-appointment`, `record-vitals`), an **entity** (`patient`, `appointment`, `vitals`, `prescription`, `queue`, `billing`), or a `shared/*` segment (`shared/ui`, `shared/lib`).

### 13.3 PR titles

PR title = the squash commit. Same Conventional-Commit format; imperative mood; no trailing period.

| ✅ Good                                          | ❌ Bad                  |
| ------------------------------------------------ | ----------------------- |
| `feat(prescription): support split dispensing`   | `Prescription changes`  |
| `fix(queue): stop double check-in on rapid taps` | `fixed the bug finally` |

---

## 14. Approved abbreviations & forbidden names

### 14.1 Approved abbreviations (the **only** ones allowed)

Anything not on this list must be spelled out (Principle [P4](#2-guiding-principles)).

| Abbreviation            | Means                                | Notes                                                                                                    |
| ----------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `id`                    | identifier                           | always lowercase in camelCase: `patientId`                                                               |
| `url`                   | uniform resource locator             | `avatarUrl`                                                                                              |
| `api`                   | application programming interface    | layer/segment name                                                                                       |
| `dto`                   | data transfer object                 | pipeline term ([Brain.md §5.3](./Brain.md#53-backend-independence-pipeline-the-most-important-contract)) |
| `ui`                    | user interface                       | segment name                                                                                             |
| `i18n` / `a11y`         | internationalization / accessibility | established in [Brain.md](./Brain.md)                                                                    |
| `min` / `max`           | minimum / maximum                    | `MAX_QUEUE_SIZE`                                                                                         |
| `db`                    | database                             | infra only, never in domain models                                                                       |
| `vitals`                | vital signs                          | domain term, treated as a full word                                                                      |
| `dob`                   | —                                    | ❌ **NOT approved** — use `dateOfBirth`                                                                  |
| `appt` / `rx` / `presc` | —                                    | ❌ **NOT approved** — use `appointment` / `prescription`                                                 |

> To add an abbreviation: propose it, get it ratified, add a row here ([Brain.md §0](./Brain.md#0-how-to-use-this-brain)).

### 14.2 Forbidden names (reject in review)

| ❌ Forbidden                                                                                    | Why                                                            | ✅ Use instead                                             |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `data`, `info`, `item`, `obj`, `value` (as a real name)                                         | Says nothing.                                                  | `patient`, `appointment`, `invoice`                        |
| `temp`, `tmp`, `foo`, `bar`, `test123`                                                          | Placeholder leaked into code.                                  | the actual domain noun                                     |
| `utils`, `utils2`, `helpers`, `common`, `misc`, `shared-stuff` (as a file/folder)               | Dumping grounds ([P8](#2-guiding-principles)).                 | domain-prefixed: `vitals.utils.ts`, `currency.utils.ts`    |
| `Manager`, `Helper`, `Service` (as a _catch-all_ class), `Util`, `Processor`, `Handler` (vague) | Hides real responsibility.                                     | name by responsibility: `BillingService`, `QueueScheduler` |
| `IPatient`, `TAppointment`                                                                      | Hungarian/`I`-prefix banned ([§5](#5-symbol-naming)).          | `Patient`, `Appointment`                                   |
| `getData`, `doStuff`, `process`, `handleThing`                                                  | Verb without an object.                                        | `fetchPatient`, `dispensePrescription`                     |
| `appt`, `rx`, `presc`, `dob`, `pat`, `cust`                                                     | Unapproved abbreviations.                                      | `appointment`, `prescription`, `dateOfBirth`, `patient`    |
| `client` / `customer` for a patient                                                             | Wrong domain word ([P7](#2-guiding-principles)).               | `patient`                                                  |
| dynamic i18n keys (`t(\`x.${y}\`)`)                                                             | Unextractable ([§9.2](#92-never-build-keys-dynamically)).      | static key map                                             |
| hardcoded `#hex` / `18px` / English strings                                                     | Breaks token & i18n contracts ([Brain.md §6, §8](./Brain.md)). | tokens + i18n keys                                         |

---

## 15. Quick-reference cheat-sheet

| What              | Convention                      | ✅ Example                                              |
| ----------------- | ------------------------------- | ------------------------------------------------------- |
| Component file    | `PascalCase.tsx`                | `VitalsCard.tsx`                                        |
| Hook file         | `useThing.ts`                   | `usePatient.ts`                                         |
| Store file        | `thing.store.ts`                | `auth.store.ts`                                         |
| Service file      | `thing.service.ts`              | `billing.service.ts`                                    |
| Repository file   | `thing.repository.ts`           | `patient.repository.ts`                                 |
| Mapper file       | `thing.mapper.ts`               | `patient.mapper.ts`                                     |
| DTO file          | `thing.dto.ts`                  | `appointment.dto.ts`                                    |
| Schema file       | `thing.schema.ts`               | `vitals-form.schema.ts`                                 |
| Types file        | `thing.types.ts`                | `queue.types.ts`                                        |
| Queries file      | `thing.queries.ts`              | `patient.queries.ts`                                    |
| Constants file    | `thing.constants.ts`            | `queue.constants.ts`                                    |
| Utils file        | `thing.utils.ts`                | `currency.utils.ts`                                     |
| Unit test         | `*.test.ts(x)`                  | `patient.mapper.test.ts`                                |
| E2E test          | `*.spec.ts`                     | `book-appointment.spec.ts`                              |
| Story             | `*.stories.tsx`                 | `VitalsCard.stories.tsx`                                |
| Public API        | `index.ts`                      | `features/book-appointment/index.ts`                    |
| Folder / slice    | `kebab-case`                    | `book-appointment`                                      |
| Feature folder    | verb phrase                     | `record-vitals`                                         |
| Entity folder     | singular noun                   | `prescription`                                          |
| Component symbol  | `PascalCase`                    | `QueueBoard`                                            |
| Function / var    | `camelCase`                     | `formatPatientName`                                     |
| Hook symbol       | `useX`                          | `useQueuePosition`                                      |
| Boolean           | `is/has/should/can/did`         | `isQueueFull`                                           |
| Internal handler  | `handleX`                       | `handleSubmit`                                          |
| Handler prop      | `onX`                           | `onAppointmentBooked`                                   |
| Async fn          | verb phrase                     | `dispensePrescription`                                  |
| Type / interface  | `PascalCase`, no `I`            | `Patient`                                               |
| Generic param     | meaningful                      | `TData`                                                 |
| Const value       | `UPPER_SNAKE_CASE`              | `MAX_QUEUE_SIZE`                                        |
| "Enum"            | const object `as const` / union | `AppointmentStatus`                                     |
| Zod schema        | `xSchema`                       | `patientSchema`                                         |
| Inferred type     | `z.infer<typeof xSchema>`       | `type Patient = z.infer<typeof patientSchema>`          |
| DTO type          | `XDto`                          | `PatientDto`                                            |
| Domain model      | bare noun `X`                   | `Patient`                                               |
| ViewModel         | `XViewModel`                    | `QueueRowViewModel`                                     |
| Branded id        | `XId`                           | `AppointmentId`                                         |
| Context trio      | `XContext`/`XProvider`/`useX`   | `ActiveClinicContext` / `…Provider` / `useActiveClinic` |
| HOC               | `withX`                         | `withPermissionGuard`                                   |
| Ref               | `xRef`                          | `dialogRef`                                             |
| Store hook        | `useXStore`                     | `useQueueFilterStore`                                   |
| Store action      | verb                            | `advanceQueue`                                          |
| Selector          | `selectX`                       | `selectActivePatient`                                   |
| Query-key factory | `xKeys`                         | `patientKeys.detail(id)`                                |
| i18n key          | `namespace.area.element`        | `vitals.form.bloodPressure`                             |
| Primitive token   | `--color-{family}-{step}`       | `--color-rose-500`                                      |
| Semantic token    | `--color-{role}`                | `--color-primary`                                       |
| Component token   | `--{component}-{prop}`          | `--button-bg`                                           |
| Test id           | `data-testid="kebab"`           | `data-testid="vitals-card"`                             |
| Route path        | `kebab-case`                    | `/appointments/book`                                    |
| Route param       | `camelCase` id                  | `:patientId`                                            |
| Route id          | `kebab.hierarchical`            | `patient-profile.vitals`                                |
| Branch            | `type/kebab-summary`            | `feat/book-appointment-reminders`                       |
| Commit            | `type(scope): subject`          | `fix(queue): correct priority comparator`               |

---

_Last updated: 2026-06-27 · Owner: Frontend Architecture · Status: **Foundation v1** · Canonical expansion of [Brain.md](./Brain.md) §12._
