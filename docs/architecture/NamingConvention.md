# 📛 ClinicOS — NamingConvention.md (Part 5)

> **Phase 2 of the ClinicOS Frontend Engineering Bible — the COMPLETE naming standard.**
> This document **consolidates and extends** Phase 1's [../Naming-Convention.md](../Naming-Convention.md). It is **100% consistent with Phase 1** and **never contradicts it** — every Phase 1 rule (file-suffix conventions, `PascalCase` components, `kebab-case` folders, no `enum`, no `I`-prefix, branded IDs, `xKeys` factories, three-tier tokens, `namespace.area.element` i18n keys) is carried forward verbatim. What is **new** here is naming for the **enterprise concepts introduced at Phase 2** ([architecture/README.md](./README.md)): **modules (bounded contexts), mappers, adapters, DTOs/Models, permissions, guards, middleware, workers, the event bus, ports & adapters (hexagonal), query keys, CODEOWNERS scopes, ADR files, and module `BRAIN.md` notes**.

**Read alongside:**
[../Brain.md](../Brain.md) §12 (Phase 1 naming at a glance) ·
[../Naming-Convention.md](../Naming-Convention.md) (Phase 1 full rulebook — **this doc supersedes nothing in it**) ·
[architecture/README.md](./README.md) (Phase 2 anchor) ·
[FolderStructure.md](./FolderStructure.md) (where names physically live) ·
[FeatureArchitecture.md](./FeatureArchitecture.md) (the module template the names populate).

> **Drift rule (from Phase 1 §1):** Where this doc and Phase 1 ever disagree, that is a **bug** — fix one. They must never drift. New questions are **not decided** until proposed, ratified, and recorded here ([../Brain.md](../Brain.md) §0).

---

## Table of contents

1. [Guiding principles](#1-guiding-principles)
2. [Master table — files & symbols by category](#2-master-table--files--symbols-by-category)
3. [Carried-forward Phase 1 conventions (quick confirm)](#3-carried-forward-phase-1-conventions-quick-confirm)
4. [Modules & routes](#4-modules--routes)
5. [Domain modeling — Dto · Model · ViewModel · Entity · branded IDs · mappers](#5-domain-modeling--dto--model--viewmodel--entity--branded-ids--mappers)
6. [Ports, adapters & services (the hexagonal bits)](#6-ports-adapters--services-the-hexagonal-bits)
7. [Permissions, guards, middleware](#7-permissions-guards-middleware)
8. [Workers & the event bus](#8-workers--the-event-bus)
9. [Query keys](#9-query-keys)
10. [i18n keys & design tokens](#10-i18n-keys--design-tokens)
11. [Governance artifacts — CODEOWNERS · ADR files · module BRAIN.md](#11-governance-artifacts--codeowners--adr-files--module-brainmd)
12. [Consolidated cheat-sheet](#12-consolidated-cheat-sheet)

---

## 1. Guiding principles

These extend — and never replace — Phase 1 principles **P1–P8** ([../Naming-Convention.md](../Naming-Convention.md) §2). The litmus test is unchanged: _could a non-technical reviewer guess what this thing does from its name alone, in the clinic's vocabulary?_

| #       | Principle                                                                | Why                                                                                                                                                                                            | ✅ Good                                      | ❌ Bad                                                     |
| ------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| P1      | **Descriptive over short** (Phase 1)                                     | Read 100× more than typed; autocomplete makes length free.                                                                                                                                     | `appointmentStartTime`                       | `apptT`, `t1`                                              |
| P2      | **DDD ubiquitous language** (Phase 1)                                    | The name must match what a clinician says, not a backend column.                                                                                                                               | `recordVitals`, `dispensePrescription`       | `submitForm2`, `processData`                               |
| P3      | **Consistency over preference** (Phase 1)                                | A predictable name beats five clever ones.                                                                                                                                                     | every store is `x.store.ts`                  | `authStore.ts`, `store.auth.ts` mixed                      |
| P4      | **No abbreviations** except the [approved list](#approved-abbreviations) | Abbreviations are private dialects, opaque to new hires and AI.                                                                                                                                | `appointment`, `prescription`                | `appt`, `presc`, `rx`                                      |
| P5      | **Reveal intent, not mechanism** (Phase 1)                               | Name the _what/why_, not the _how_.                                                                                                                                                            | `isQueueFull`, `selectActivePatient`         | `flagCheck`, `getData2`                                    |
| P6      | **Layer- & pipeline-honest** (Phase 1)                                   | The suffix encodes role: `Dto`=wire, `Model`=domain, `ViewModel`=screen, `Port`=contract, `Adapter`=impl.                                                                                      | `PatientDto`, `Patient`, `AnalyticsPort`     | one `Patient` for wire+domain+UI                           |
| P7      | **Searchable & unambiguous** (Phase 1)                                   | One concept → one word, repo-wide.                                                                                                                                                             | always `patient`                             | `client`/`customer` for the same thing                     |
| P8      | **No dumping-ground names** (Phase 1)                                    | `utils`/`helpers`/`Manager`/`data` hide intent.                                                                                                                                                | `formatPatientName`, `queue.utils.ts`        | `Helper`, `MiscManager`, `stuff.ts`                        |
| **P9**  | **Bounded-context truth (NEW)**                                          | A **module** folder is named for the **bounded context** from the patient journey, not for a screen, team, or backend service.                                                                 | `modules/appointments/`, `modules/pharmacy/` | `modules/calendar/`, `modules/team-a/`, `modules/apptSvc/` |
| **P10** | **Contract before implementation (NEW)**                                 | A **port** is named for the capability (`AnalyticsPort`); the **adapter** is named for the concrete vendor (`SegmentAnalyticsAdapter`). The UI depends on the port name, never the adapter.    | `LoggerPort` + `SentryLoggerAdapter`         | `Logger` doing both; `SegmentService` in a component       |
| **P11** | **Patient-journey domain names (NEW)**                                   | Module, permission, route, and i18n namespaces are drawn from the journey: `appointment → check-in → vitals → queue → consultation → prescription → pharmacy → billing → follow-up → records`. | `queue:advance`, `consultation.start`        | `process2:do`, `screen3.go`                                |

> **Patient-journey source of truth** ([../Brain.md](../Brain.md) §1): `Appointment → Check-In → Vitals → Queue → Consultation → Prescription → Pharmacy → Billing → Follow-Up → Recovery → Lifetime Medical Record`. Every module, permission key, route, and i18n namespace must trace back to a noun on this line.

### <a id="approved-abbreviations"></a>Approved abbreviations (Phase 1 §14.1 — unchanged, restated)

Only these may be abbreviated; everything else is spelled out (P4).

`id` · `url` · `api` · `dto` · `ui` · `i18n` · `a11y` · `min` · `max` · `db` (infra only) · `vitals` (full domain word) · **(Phase 2 additions, ratified here)** `rbac` (role-based access control, infra/permissions only) · `adr` (architecture decision record, docs only).

❌ Still **forbidden**: `appt`, `rx`, `presc`, `dob`, `pat`, `cust`, `mgr`, `cfg`, `svc`, `repo` (as a _name_ — the **file suffix** `.repository.ts` stays spelled out).

---

## 2. Master table — files & symbols by category

The authoritative **Pattern → ✅ Example → ❌ Anti-example** table for **every** category the standard governs. File **slugs are singular, kebab-case, domain-named**; the **role is a dotted suffix** (Phase 1 §3). React components are `PascalCase.tsx`.

### 2.1 Files (dotted role suffixes)

| Category                     | Pattern                                         | ✅ ClinicOS example                                                   | ❌ Anti-example                                         |
| ---------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| Component                    | `PascalCase.tsx`                                | `VitalsCard.tsx`, `AppointmentForm.tsx`                               | `vitalsCard.tsx`, `VitalsCard.component.tsx`            |
| Hook                         | `use-thing.ts` _(file)_ → `useThing` _(symbol)_ | `use-patient.ts`, `use-appointment-slots.ts`                          | `usePatient.TS`, `patient-hook.ts`                      |
| Store (Zustand)              | `thing.store.ts`                                | `auth.store.ts`, `queue-filter.store.ts`                              | `authStore.ts`, `store.auth.ts`                         |
| Selectors                    | `thing.selectors.ts`                            | `queue.selectors.ts`                                                  | `queueSelectors.ts`                                     |
| Service (use-case)           | `thing.service.ts`                              | `billing.service.ts`, `book-appointment.service.ts`                   | `billingService.ts`, `BillingService.ts`                |
| Repository                   | `thing.repository.ts`                           | `patient.repository.ts`                                               | `PatientRepository.ts`, `patient.repo.ts`               |
| Mapper                       | `thing.mapper.ts`                               | `patient.mapper.ts`, `appointment.mapper.ts`                          | `patientMapper.ts`, `patient.map.ts`                    |
| DTO                          | `thing.dto.ts`                                  | `patient.dto.ts`, `appointment.dto.ts`                                | `appointment-dto.ts`, `PatientDTO.ts`                   |
| Model / types                | `thing.types.ts`                                | `queue.types.ts`, `medical-record.types.ts`                           | `queue.type.ts`, `types.ts`                             |
| Schema (Zod)                 | `thing.schema.ts`                               | `appointment.schema.ts`, `vitals-form.schema.ts`                      | `appointmentSchema.ts`, `appointment.zod.ts`            |
| Validator                    | `thing.validators.ts`                           | `prescription.validators.ts`, `npi.validators.ts`                     | `validate.ts`, `prescriptionValidator.ts`               |
| Query hooks / keys           | `thing.queries.ts`                              | `patient.queries.ts`, `appointment.queries.ts`                        | `patientQueries.ts`, `use-patient-queries.ts`           |
| Endpoints                    | `thing.endpoints.ts`                            | `patient.endpoints.ts`                                                | `patientApi.ts`, `urls.ts`                              |
| Constants                    | `thing.constants.ts`                            | `queue.constants.ts`                                                  | `consts.ts`, `queueConstants.ts`                        |
| Pure utils                   | `thing.utils.ts`                                | `vitals.utils.ts`, `currency.utils.ts`                                | `utils.ts`, `helpers.ts`                                |
| Config / flags               | `thing.config.ts`                               | `book-appointment.config.ts`                                          | `cfg.ts`, `settings.ts`                                 |
| **Adapter (NEW)**            | `thing.adapter.ts`                              | `segment-analytics.adapter.ts`, `sentry-logger.adapter.ts`            | `analytics.ts`, `segmentService.ts`                     |
| **Port (NEW)**               | `thing.port.ts`                                 | `analytics.port.ts`, `logger.port.ts`, `monitoring.port.ts`           | `analytics.interface.ts`, `IAnalytics.ts`               |
| **Permissions (NEW)**        | `permissions.ts` (per module)                   | `modules/appointments/permissions.ts`                                 | `acl.ts`, `roles.ts`, `perm.ts`                         |
| **Guard (NEW)**              | `thing.guard.ts`                                | `permission.guard.ts`, `auth.guard.ts`, `clinic-scope.guard.ts`       | `guard.ts`, `authGuard.ts`, `protect.ts`                |
| **Middleware (NEW)**         | `thing.middleware.ts`                           | `auth.middleware.ts`, `tenant.middleware.ts`, `logging.middleware.ts` | `mw.ts`, `interceptor.ts` (use the precise role)        |
| **Worker (NEW)**             | `thing.worker.ts`                               | `vitals-aggregation.worker.ts`, `outbox-sync.worker.ts`               | `worker.ts`, `bg.ts`, `sync-worker.js`                  |
| **Event map (NEW)**          | `thing.events.ts`                               | `appointment.events.ts`, `queue.events.ts`                            | `events.ts`, `eventBus.ts` (bus lives in `shared/core`) |
| **Routes subtree (NEW)**     | `routes.tsx` (per module)                       | `modules/appointments/routes.tsx`                                     | `router.tsx`, `Routes.tsx`                              |
| **Module public API (NEW)**  | `index.ts` (module root)                        | `modules/appointments/index.ts`                                       | `public-api.ts`, `barrel.ts`                            |
| **Module README (NEW)**      | `README.md`                                     | `modules/appointments/README.md`                                      | `readme.txt`, `OVERVIEW.md`                             |
| **Module Brain Notes (NEW)** | `BRAIN.md` (uppercase)                          | `modules/appointments/BRAIN.md`                                       | `brain.md`, `notes.md`, `Brain.md`                      |
| Unit/integration test        | `*.test.ts(x)`                                  | `patient.mapper.test.ts`, `VitalsCard.test.tsx`                       | `patient.mapper.spec.ts` (`.spec` is E2E)               |
| E2E test                     | `*.spec.ts`                                     | `book-appointment.spec.ts`, `patient-journey.spec.ts`                 | `book-appointment.e2e.ts`                               |
| Storybook story              | `*.stories.tsx`                                 | `VitalsCard.stories.tsx`                                              | `VitalsCard.story.tsx`                                  |
| **ADR file (NEW)**           | `NNNN-kebab-title.md`                           | `docs/adr/0002-analytics-port.md`                                     | `adr-analytics.md`, `ADR2.MD`                           |

> **Hook file casing:** Phase 1's at-a-glance table shows the symbol form `useThing.ts`. For the **file on disk** ClinicOS uses `use-patient.ts` (kebab slug) **for non-component files**, and the **exported symbol** is `usePatient` — exactly as Phase 1 §3.2 mandates for `.queries`/`.utils` (file kebab, symbols camel/Pascal). Components remain `PascalCase.tsx`. Either way, the **symbol** is `useX`; never deviate on the symbol.

### 2.2 Symbols (casing + role)

| Category                        | Pattern                                                              | ✅ ClinicOS example                                     | ❌ Anti-example                                    |
| ------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| Component                       | `PascalCase`                                                         | `VitalsCard`, `QueueBoard`                              | `vitalsCard`, `appointment_form`                   |
| Function / variable             | `camelCase`                                                          | `formatPatientName`, `appointmentSlots`                 | `FormatPatientName`, `appt_slots`                  |
| Hook                            | `useX`                                                               | `usePatient`, `useQueuePosition`                        | `getPatientHook`, `patientHook`                    |
| Boolean                         | `is/has/should/can/did` prefix                                       | `isQueueFull`, `hasUnpaidInvoice`, `canDispense`        | `queueFull`, `dispenseFlag`                        |
| Internal handler                | `handleX`                                                            | `handleSubmit`, `handlePatientSelect`                   | `onSubmit` (internal), `submitClicked`             |
| Handler prop                    | `onX`                                                                | `onAppointmentBooked`, `onClose`                        | `handleClose` (as prop), `callback`                |
| Async function                  | verb phrase (no `Async`/`Promise` suffix)                            | `bookAppointment`, `dispensePrescription`               | `bookAppointmentAsync`, `getPatientPromise`        |
| Type / Interface                | `PascalCase`, **no `I` prefix**                                      | `Patient`, `AppointmentSlot`                            | `IPatient`, `TAppointment`                         |
| "Enum"                          | `PascalCase` const-object `as const` **or** union — **never `enum`** | `AppointmentStatus`, `QueuePriority`                    | `enum AppointmentStatus {}`                        |
| Constant value                  | `UPPER_SNAKE_CASE`                                                   | `MAX_QUEUE_SIZE`, `DEFAULT_VISIT_DURATION_MINUTES`      | `maxQueueSize`, `MaxQueue`                         |
| Zod schema                      | `xSchema` (camelCase)                                                | `patientSchema`, `vitalsFormSchema`                     | `PatientSchema`, `validatePatient`                 |
| Inferred type                   | `z.infer<typeof xSchema>`                                            | `type Patient = z.infer<typeof patientSchema>`          | hand-duplicated type                               |
| Store hook                      | `useXStore`                                                          | `useAuthStore`, `useQueueFilterStore`                   | `authStore`, `useStore`                            |
| Selector                        | `selectX`                                                            | `selectActivePatient`, `selectUnpaidTotal`              | `getPatient`, `activePatientSelector`              |
| Query-key factory               | `xKeys`                                                              | `patientKeys.detail(id)`                                | inline `['patient', id]`                           |
| Context trio                    | `XContext` / `XProvider` / `useX`                                    | `ActiveClinicContext` / `…Provider` / `useActiveClinic` | `ClinicCtx`, `useQueueContext`                     |
| Provider (standalone)           | `XProvider`                                                          | `AnalyticsProvider`, `PermissionsProvider`              | `AnalyticsWrapper`, `PermProv`                     |
| HOC                             | `withX`                                                              | `withPermissionGuard`, `withClinicScope`                | `permissionHoc`, `guardWrap`                       |
| Ref                             | `xRef`                                                               | `inputRef`, `dialogRef`                                 | `ref1`, `el`                                       |
| **DTO type (NEW emphasis)**     | `XDto`                                                               | `PatientDto`, `AppointmentDto`                          | `PatientData`, `Patient` (for wire)                |
| **Domain Model (NEW emphasis)** | bare noun `X`                                                        | `Patient`, `Appointment`, `Vitals`                      | `PatientModel`, `PatientEntity` (unless aggregate) |
| **ViewModel (NEW emphasis)**    | `XViewModel` / `XRowViewModel`                                       | `QueueRowViewModel`, `InvoiceSummaryViewModel`          | computing it inline in JSX                         |
| **Entity (aggregate) (NEW)**    | `XEntity` (only to distinguish from a value object)                  | `PatientEntity` vs `Address` value object               | `Entity` on every type                             |
| **Branded ID (NEW emphasis)**   | `XId`                                                                | `PatientId`, `AppointmentId`, `InvoiceId`               | raw `string` id                                    |
| **Mapper fn (NEW)**             | `toX` / `toXDto`                                                     | `toAppointment`, `toAppointmentDto`                     | `convert`, `map`, `transform`                      |
| **Port interface (NEW)**        | `XPort`                                                              | `AnalyticsPort`, `LoggerPort`, `MonitoringPort`         | `IAnalytics`, `AnalyticsService`                   |
| **Adapter class (NEW)**         | `VendorXAdapter`                                                     | `SegmentAnalyticsAdapter`, `SentryLoggerAdapter`        | `AnalyticsImpl`, `SegmentService`                  |
| **Permission key (NEW)**        | `resource:action` (kebab resource)                                   | `appointments:create`, `prescriptions:dispense`         | `CREATE_APPT`, `canCreate`                         |
| **Permission constant (NEW)**   | `XPermissions` const-object `as const`                               | `AppointmentPermissions.Create`                         | loose magic strings                                |
| **Guard component (NEW)**       | `XGuard` / `<Can>`                                                   | `<PermissionGuard>`, `<Can permission="...">`           | `<Protected>`, `<Auth>`                            |
| **Middleware fn (NEW)**         | `xMiddleware`                                                        | `authMiddleware`, `tenantMiddleware`                    | `mw`, `intercept`                                  |
| **Worker entry (NEW)**          | `xWorker` / `createXWorker`                                          | `outboxSyncWorker`, `createVitalsAggregationWorker`     | `worker`, `runBg`                                  |
| **Event name (NEW)**            | `Resource<PastTense>` (PascalCase const value)                       | `AppointmentBooked`, `VitalsRecorded`, `QueueAdvanced`  | `apptEvent`, `event1`, `onBooked`                  |
| **Event payload type (NEW)**    | `XEvent`                                                             | `AppointmentBookedEvent`                                | `AppointmentBookedPayloadData`                     |
| **Module route id (NEW)**       | kebab, hierarchical with `.`                                         | `appointments.book`, `patients.profile.vitals`          | `route1`, `BookAppt`                               |
| **Route id constant (NEW)**     | `XRouteIds` const-object `as const`                                  | `AppointmentRouteIds.Book`                              | scattered string literals                          |

---

## 3. Carried-forward Phase 1 conventions (quick confirm)

These are **unchanged**; listed so reviewers can confirm Phase 2 did not silently alter them.

- **Folders:** all `kebab-case`, no exceptions. **Features = verb phrases** (`book-appointment`), **entities = singular nouns** (`patient`). Slice segments use the fixed vocabulary `ui/ model/ api/ lib/ config/` — at Phase 2 the **module** template adds the named segments in §4, but the Phase 1 slice vocabulary still governs slices inside a module ([../Naming-Convention.md](../Naming-Convention.md) §4).
- **No `enum`** — const-object `as const` or union (Phase 1 §5.3). Restated and applied to permission keys, route ids, and event names below.
- **No `I`/`T` Hungarian prefix** on types/interfaces (Phase 1 §5). A **port** is `AnalyticsPort`, never `IAnalytics`.
- **Constants** `UPPER_SNAKE_CASE`; **Zod schema** `xSchema` + `z.infer`.
- **Contexts/Providers/Services/Repositories/Validators/Schemas** keep their Phase 1 symbol + file rules; Phase 2 only adds new neighbors (ports, adapters, guards…), it does not change them.
- **Icons & Assets** (Phase 1 design-system): icons are `lucide-react` components referenced in `PascalCase`; asset files are `kebab-case` under `assets/{fonts,icons,images,animations}/` (e.g. `assets/images/empty-queue.svg`, ❌ `EmptyQueue.SVG`).

---

## 4. Modules & routes

### 4.1 Module (bounded-context) folder names

A **module** = one bounded context = ideally one team (CODEOWNERS). Folder name is **kebab-case, a domain noun from the patient journey** (P9, P11). The canonical set is fixed by [architecture/README.md](./README.md) §2.

| Pattern                                                             | ✅ Example                                                                                                                                                                                           | ❌ Anti-example                                                                                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `modules/<context>/` kebab domain noun                              | `modules/patients/`, `modules/appointments/`, `modules/queue/`, `modules/consultation/`, `modules/prescriptions/`, `modules/pharmacy/`, `modules/billing/`, `modules/follow-up/`, `modules/records/` | `modules/Patients/`, `modules/appointmentModule/`, `modules/calendar/` (screen, not context), `modules/team-cardio/` (team, not domain) |
| Module is plural when the context is a collection of a journey noun | `appointments`, `prescriptions`, `patients`                                                                                                                                                          | `appointment` (that's the **entity** in `entities/`, not the module)                                                                    |

> **Module vs entity:** `entities/patient/` (Phase 1, singular noun, the cross-module domain type) is **different** from `modules/patients/` (the bounded context that _owns patient screens, services, repositories_). The entity is the shared noun; the module is the team-owned capability area. Both are legal and intentional.

### 4.2 Inside a module — segment folder names

The module template ([architecture/README.md](./README.md) §2) uses these **fixed** segment names. All `kebab-case`; do not invent synonyms.

| ✅ Canonical segment | Layer (Clean Arch)         | ❌ Forbidden synonyms                                            |
| -------------------- | -------------------------- | ---------------------------------------------------------------- |
| `pages/`             | Presentation               | `screens/`, `views/`                                             |
| `components/`        | Presentation               | `ui/` _(at module level)_, `widgets/`                            |
| `hooks/`             | Presentation ⇄ Application | `use/`, `composables/`                                           |
| `services/`          | Application                | `use-cases/`, `logic/`, `domain/`                                |
| `repositories/`      | Infrastructure             | `data/`, `dao/`, `gateways/`                                     |
| `api/`               | Infrastructure             | `network/`, `http/`                                              |
| `mappers/`           | Infra→Domain               | `transformers/`, `converters/`                                   |
| `adapters/`          | Infrastructure             | `integrations/`, `clients/`                                      |
| `types/`             | Domain                     | `models/`, `interfaces/`                                         |
| `schemas/`           | Domain                     | `validation/`, `zod/`                                            |
| `validators/`        | Domain                     | `rules/`, `checks/`                                              |
| `constants/`         | Domain                     | `consts/`, `enums/`                                              |
| `store/`             | Presentation (UI state)    | `state/`, `redux/`                                               |
| `config/`            | Domain/config              | `settings/`, `cfg/`                                              |
| `tests/`             | —                          | `__tests__/` _(co-locate units; module-integration in `tests/`)_ |

### 4.3 Route paths, params, route ids, loaders

Carried from Phase 1 §12; the new pieces are the **module route subtree file** (`routes.tsx`) and **route id constants**.

| Kind                          | Convention                                     | ✅ Example                                                                   | ❌ Anti-example                                  |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| URL path segment              | `kebab-case`, noun, plural for collections     | `/patients`, `/patients/:patientId`, `/appointments/book`, `/pharmacy/queue` | `/Patients`, `/bookAppointment`, `/patient_list` |
| Path param                    | `camelCase`, branded-id named                  | `:patientId`, `:appointmentId`, `:invoiceId`                                 | `:id`, `:pid`                                    |
| Route id (data router)        | kebab, hierarchical with `.`                   | `appointments.book`, `patients.profile.vitals`                               | `route1`, `PatientProfile`                       |
| **Route id constant (NEW)**   | `XRouteIds` const-object `as const`            | `AppointmentRouteIds = { Book: 'appointments.book' } as const`               | inline string in 5 files                         |
| Loader / action fn            | `xLoader` / `xAction`                          | `patientProfileLoader`, `bookAppointmentAction`                              | `loader`, `getData`                              |
| **Module subtree file (NEW)** | `routes.tsx` at module root, exports `xRoutes` | `appointmentRoutes` in `modules/appointments/routes.tsx`                     | `Routes.tsx`, `router.tsx`                       |
| **Global manifest (NEW)**     | `src/routes/` path constants registry          | `AppRoutes.patientProfile(patientId)`                                        | hardcoded strings app-wide                       |

```ts
// modules/appointments/routes.tsx
export const AppointmentRouteIds = {
  Calendar: 'appointments.calendar',
  Book: 'appointments.book',
  Detail: 'appointments.detail',
} as const;
export type AppointmentRouteId = (typeof AppointmentRouteIds)[keyof typeof AppointmentRouteIds];

export const appointmentRoutes: RouteObject[] = [
  { id: AppointmentRouteIds.Book, path: 'appointments/book', loader: bookAppointmentLoader },
];
```

---

## 5. Domain modeling — Dto · Model · ViewModel · Entity · branded IDs · mappers

Unchanged in spirit from Phase 1 §6 — each shape gets a distinct **suffix** so you always know which side of the boundary you are on. **Never leak backend names into the UI** ([../Brain.md](../Brain.md) §5.3).

| Shape                          | Meaning                                                          | Lives in                          | ✅ Example                                     | ❌ Anti-pattern                                           |
| ------------------------------ | ---------------------------------------------------------------- | --------------------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| `XDto`                         | Raw backend wire shape, Zod-validated at the boundary            | `schemas/`, `types/` (Infra side) | `PatientDto`, `AppointmentDto`                 | using `PatientDto` in a component                         |
| `X` (Model)                    | Stable UI-shaped domain type; what components see                | `types/` (Domain)                 | `Patient`, `Appointment`, `Vitals`             | naming it `PatientModel` (the bare noun **is** the model) |
| `XViewModel` / `XRowViewModel` | Screen/row projection for one UI                                 | `components/` or `types/`         | `QueueRowViewModel`, `InvoiceSummaryViewModel` | computing it inline in JSX                                |
| `XEntity`                      | Persisted **aggregate** distinguished from a value object (rare) | `types/`                          | `PatientEntity` (vs `Address` value object)    | `Entity` on everything                                    |
| `XId` (branded)                | Type-safe identifier, not interchangeable                        | `types/`                          | `PatientId`, `AppointmentId`                   | passing raw `string` as id                                |

### 5.1 Branded IDs

```ts
// modules/patients/types/patient.types.ts
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type PatientId = Brand<string, 'PatientId'>;
export type AppointmentId = Brand<string, 'AppointmentId'>;

function reschedule(id: AppointmentId) {
  /* … */
}
reschedule(patient.id); // ❌ compile error: PatientId is not AppointmentId  ✅ caught at compile time
```

### 5.2 Mapper function names — `toX` / `toXDto`

The mapper is the **only** place that knows both shapes. Functions are **directional verbs**, named for the _target_.

| ✅ Good                                                     | ❌ Bad                          | Why                                                                       |
| ----------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| `toAppointment(dto: AppointmentDto): Appointment`           | `mapAppointment(x)`             | Name the **target** Model; `map`/`convert` are dumping-ground verbs (P8). |
| `toAppointmentDto(model: Appointment): AppointmentDto`      | `serialize(a)`                  | Inbound is `toX`, outbound is `toXDto` — symmetric and greppable.         |
| `toQueueRowViewModel(entry: QueueEntry): QueueRowViewModel` | `format(entry)`                 | ViewModel projection also uses `toXViewModel`.                            |
| `toPatient`, `toVitals`, `toInvoice`                        | `convert`, `transform`, `parse` | One verb pair, repo-wide (P7).                                            |

```ts
// modules/appointments/mappers/appointment.mapper.ts — the ONLY place that knows both shapes
export const toAppointment = (dto: AppointmentDto): Appointment => ({
  id: dto.appt_id as AppointmentId,
  patientId: dto.patient_id as PatientId,
  startTime: new Date(dto.start_ts),
  status: dto.status, // already a domain union value
});

export const toAppointmentDto = (model: Appointment): AppointmentDto => ({
  appt_id: model.id,
  patient_id: model.patientId,
  start_ts: model.startTime.getTime(),
  status: model.status,
});
```

> Backend renames `start_ts → startAt`? **Change one mapper.** Zero component edits — exactly Phase 1's promise.

---

## 6. Ports, adapters & services (the hexagonal bits)

Phase 2 introduces explicit **Ports & Adapters** for cross-cutting infrastructure (analytics, logging, monitoring) — see [architecture/README.md](./README.md) §`shared/` (`analytics/`, `logger/`, `monitoring/`). The naming makes the hexagon obvious:

- **Port** = the capability **contract** the app depends on → `XPort` interface, in `x.port.ts`.
- **Adapter** = a **concrete vendor** implementation → `VendorXAdapter` class, in `vendor-x.adapter.ts`.
- **Service** = a **use-case** orchestrating repositories/ports → `XService`, in `x.service.ts` (Phase 1, unchanged).

| Concept                   | Pattern                                                                  | ✅ Example                                                       | ❌ Anti-example                                            |
| ------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Analytics port            | `AnalyticsPort`                                                          | `interface AnalyticsPort { track(event: AnalyticsEvent): void }` | `IAnalytics`, `AnalyticsService` (a port is not a service) |
| Analytics adapter         | `SegmentAnalyticsAdapter`                                                | `class SegmentAnalyticsAdapter implements AnalyticsPort`         | `SegmentService`, `AnalyticsImpl`                          |
| Logger port / adapter     | `LoggerPort` / `SentryLoggerAdapter`, `ConsoleLoggerAdapter`             | `class SentryLoggerAdapter implements LoggerPort`                | `Logger` doing both contract + impl                        |
| Monitoring port / adapter | `MonitoringPort` / `OtelMonitoringAdapter`, `WebVitalsMonitoringAdapter` | `class OtelMonitoringAdapter implements MonitoringPort`          | `Sentry` imported directly in a component                  |
| HTTP port / adapter       | `HttpClient` (Phase 1 interface) / `FetchHttpClient`, `AxiosHttpClient`  | `class FetchHttpClient implements HttpClient`                    | `axios` imported in `ui/`                                  |
| Storage port / adapter    | `StoragePort` / `IndexedDbStorageAdapter`, `LocalStorageAdapter`         | `class IndexedDbStorageAdapter implements StoragePort`           | `localStorage` in a component                              |
| Service (use-case)        | `XService` / `x.service.ts`                                              | `BillingService`, `BookAppointmentService`                       | `BillingManager`, `BillingHelper` (P8)                     |

```ts
// shared/analytics/analytics.port.ts — the CONTRACT (UI depends on this name only)
export interface AnalyticsPort {
  track(event: AnalyticsEvent): void;
  identify(userId: UserId, traits?: AnalyticsTraits): void;
}

// shared/analytics/segment-analytics.adapter.ts — one concrete vendor
export class SegmentAnalyticsAdapter implements AnalyticsPort {
  track(event: AnalyticsEvent) {
    /* segment SDK call */
  }
  identify(userId: UserId, traits?: AnalyticsTraits) {
    /* … */
  }
}
```

> **Rule (P10):** components and services type against `AnalyticsPort`. The vendor name (`Segment*`) appears **only** at the composition root (`app/`) where the adapter is bound to the port. Swapping Segment → Amplitude = add `AmplitudeAnalyticsAdapter`, rebind once. Zero component edits.

---

## 7. Permissions, guards, middleware

### 7.1 Permission keys — `resource:action`

Permission keys follow **`resource:action`** where `resource` is a **kebab domain noun** (matching the module/journey, P11) and `action` is a **verb**. Defined per module in `permissions.ts`, surfaced through a `shared/permissions` catalog.

| Pattern                          | ✅ Example                                                                                                                                   | ❌ Anti-example                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `resource:action` lowercase      | `appointments:create`, `appointments:cancel`, `prescriptions:dispense`, `queue:advance`, `billing:refund`, `vitals:record`, `records:export` | `CREATE_APPT`, `canCreate`, `appointment.Create`, `perm1` |
| Const-object `as const` for keys | `AppointmentPermissions = { Create: 'appointments:create', Cancel: 'appointments:cancel' } as const`                                         | scattered magic strings                                   |
| Resource matches module noun     | `pharmacy:dispense` (module `pharmacy`)                                                                                                      | `rx:disp` (unapproved abbr)                               |

```ts
// modules/appointments/permissions.ts
export const AppointmentPermissions = {
  Create: 'appointments:create',
  Reschedule: 'appointments:reschedule',
  Cancel: 'appointments:cancel',
} as const;
export type AppointmentPermission =
  (typeof AppointmentPermissions)[keyof typeof AppointmentPermissions];
```

### 7.2 Guards — `XGuard` / `<Can>`

A **guard** gates rendering or navigation on a permission/session. Component guards are `XGuard` or the declarative `<Can>`; the route/permission **guard file** is `x.guard.ts`; the HOC form is `withXGuard` (Phase 1 `withX`).

| Kind            | Pattern                    | ✅ Example                                                                                         | ❌ Anti-example              |
| --------------- | -------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| Guard file      | `thing.guard.ts`           | `permission.guard.ts`, `auth.guard.ts`, `clinic-scope.guard.ts`                                    | `guard.ts`, `protect.ts`     |
| Guard component | `XGuard` / `<Can>`         | `<PermissionGuard permission={AppointmentPermissions.Create}>`, `<Can permission="queue:advance">` | `<Protected>`, `<Auth>`      |
| Guard HOC       | `withXGuard`               | `withPermissionGuard`, `withClinicScope`                                                           | `permissionHoc`, `guardWrap` |
| Permission hook | `usePermission` / `useCan` | `useCan('billing:refund')`                                                                         | `checkPerm`, `hasAccess2`    |

### 7.3 Middleware — `xMiddleware` / `x.middleware.ts`

**Middleware** intercepts requests/responses or router transitions (auth, tenant scoping, logging). File `x.middleware.ts`, symbol `xMiddleware`.

| Pattern                               | ✅ Example                                                                                                                          | ❌ Anti-example                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `thing.middleware.ts` → `xMiddleware` | `auth.middleware.ts` → `authMiddleware`, `tenant.middleware.ts` → `tenantMiddleware`, `logging.middleware.ts` → `loggingMiddleware` | `mw.ts`, `intercept.ts`, `Middleware1`        |
| Name by the cross-cutting concern     | `retryMiddleware`, `correlationIdMiddleware`                                                                                        | `doStuffMiddleware` (verb without object, P5) |

---

## 8. Workers & the event bus

### 8.1 Web workers — `x.worker.ts` / `xWorker`

Heavy compute and background sync run in **workers** (`shared/workers/`, `shared/offline/`). File `x.worker.ts`; the entry symbol is `xWorker` or a `createXWorker` factory.

| Pattern                  | ✅ Example                                                                         | ❌ Anti-example                                           |
| ------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `thing.worker.ts`        | `outbox-sync.worker.ts`, `vitals-aggregation.worker.ts`, `report-export.worker.ts` | `worker.ts`, `bg.js`, `sw.ts` (that's the service worker) |
| Worker entry symbol      | `outboxSyncWorker`, `createVitalsAggregationWorker`                                | `worker`, `runBg`, `doWork`                               |
| Service worker (Workbox) | `service-worker.ts` / `sw.ts` (build-tool convention)                              | `myWorker.ts`                                             |

### 8.2 Event bus — events are `Resource<PastTense>`

The **event bus** lives in `shared/core` (Phase 2 `shared/core` kernel). Event **names are past-tense facts** in `PascalCase` (something that **happened**), grouped per module in `x.events.ts`. Payload types are `XEvent`.

| Pattern                                   | ✅ Example                                                                                     | ❌ Anti-example                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Event name = `Resource` + past-tense verb | `AppointmentBooked`, `VitalsRecorded`, `QueueAdvanced`, `PrescriptionDispensed`, `InvoicePaid` | `bookAppointment` (that's a command), `apptEvent`, `onBooked`, `event1` |
| Event name registry                       | `AppointmentEvents = { Booked: 'appointment.booked' } as const`                                | scattered string literals                                               |
| Payload type                              | `XEvent` → `AppointmentBookedEvent`                                                            | `AppointmentBookedPayloadDataType`                                      |
| Bus symbol                                | `eventBus` (single shared instance in `shared/core`)                                           | `EventBus2`, `bus`, `emitter`                                           |
| Publish / subscribe verbs                 | `eventBus.publish(...)`, `eventBus.subscribe(...)`                                             | `eventBus.do(...)`, `fire()`                                            |

```ts
// modules/appointments/appointment.events.ts
export const AppointmentEvents = {
  Booked: 'appointment.booked',
  Cancelled: 'appointment.cancelled',
} as const;

export interface AppointmentBookedEvent {
  type: typeof AppointmentEvents.Booked;
  appointmentId: AppointmentId;
  patientId: PatientId;
}
```

---

## 9. Query keys

Unchanged from Phase 1 §8.2, restated because Phase 2 modules each own a `xKeys` factory in `thing.queries.ts`. **Never** ad-hoc arrays.

| ✅ Good                                 | ❌ Bad                                      |
| --------------------------------------- | ------------------------------------------- |
| `appointmentKeys.detail(appointmentId)` | `['appointment', id]` inline in 5 files     |
| `appointmentKeys.list(filters)`         | `['appointments', JSON.stringify(filters)]` |
| `vitalsKeys.byPatient(patientId)`       | `['vitals' + patientId]` (string concat)    |

```ts
// modules/appointments/api/appointment.queries.ts
export const appointmentKeys = {
  all: ['appointment'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: AppointmentFilters) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: AppointmentId) => [...appointmentKeys.details(), id] as const,
} as const;
```

> Invalidation stays readable: `queryClient.invalidateQueries({ queryKey: appointmentKeys.all })`.

---

## 10. i18n keys & design tokens

### 10.1 i18n keys — module-namespaced `namespace.area.element`

Unchanged from Phase 1 §9. At Phase 2 the **namespace = the module/bounded-context noun**, giving one catalog per module under `src/locales/<lang>/<namespace>.json`. Leaf is `camelCase`; **never build keys dynamically**.

| Rule                                       | ✅ Example                                                                            | ❌ Anti-example                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `namespace.area.element`, module namespace | `appointments.book.submit`, `vitals.form.bloodPressure`, `queue.summary.waitingCount` | `Appointments.Book.Submit`, `vitals_form_bp`, one giant `common.*` |
| Actions under `.action` / submit phrasing  | `appointments.book.submit`, `prescriptions.action.dispense`                           | `bookBtnText`                                                      |
| Errors under `.error`                      | `vitals.error.outOfRange`                                                             | `vitalsErrMsg1`                                                    |
| aria/labels are keys too                   | `queue.a11y.advanceButton`                                                            | hardcoded `aria-label="Advance"`                                   |
| Plurals via ICU (one key)                  | `t('queue.summary.waitingCount', { count })`                                          | `t('queue.' + n + 'Waiting')`                                      |
| Static keys only                           | `APPOINTMENT_STATUS_LABEL_KEY[status]` map                                            | ``t(`appointment.status.${status}`)``                              |

### 10.2 Design tokens — three tiers (semantic vs primitive)

Unchanged from Phase 1 §10. Components consume **semantic/component** tokens only; **never primitives**, **never hardcoded** values.

| Tier                         | Pattern                                                     | ✅ Example                                                          | Consume in components? |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------- |
| Primitive (raw scale)        | `--color-{family}-{step}`, `--space-{n}`, `--radius-{size}` | `--color-rose-500`, `--space-4`, `--radius-lg`                      | ❌ never               |
| Semantic (intent, themeable) | `--color-{role}`, `--text-{role}`                           | `--color-primary`, `--color-surface`, `--color-danger`, `--text-h1` | ✅ yes                 |
| Component (per-component)    | `--{component}-{property}`                                  | `--button-bg`, `--card-radius`, `--queue-row-height`                | ✅ yes                 |

```css
:root {
  --color-rose-500: #e87d7d;
} /* primitive */
:root {
  --color-primary: var(--color-rose-500);
} /* semantic — components use THIS */
.button {
  --button-bg: var(--color-primary);
} /* component */

.button {
  background: var(--color-rose-500);
} /* ❌ skips semantic tier */
.button {
  background: #e87d7d;
} /* ❌ hardcoded — forbidden */
```

---

## 11. Governance artifacts — CODEOWNERS · ADR files · module BRAIN.md

### 11.1 CODEOWNERS scopes — one module ≈ one team

CODEOWNERS paths map **module folder → owning team handle**. Path is the module folder (kebab); owner is a `@org/team-kebab` handle. ([architecture/README.md](./README.md) §0: "one module ≈ one team".)

| Pattern                              | ✅ Example                                              | ❌ Anti-example                                               |
| ------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------- |
| `/<path>/  @org/<team-kebab>`        | `/src/modules/appointments/  @clinicos/scheduling-team` | `/src/modules/appointments/  @sandeep` (a person, not a team) |
| Shared/cross-cutting → platform team | `/src/shared/  @clinicos/platform-team`                 | unowned (no fallback)                                         |
| Entity owned by domain stewards      | `/src/entities/patient/  @clinicos/patient-domain`      | `* @clinicos/everyone` only                                   |
| Team handle is kebab, domain-named   | `@clinicos/pharmacy-team`, `@clinicos/billing-team`     | `@clinicos/teamA`, `@clinicos/grp1`                           |

### 11.2 ADR files — `NNNN-kebab-title.md`

Architecture Decision Records live in `docs/adr/`, **zero-padded 4-digit sequence + kebab title**, matching ADR-0001 referenced in [architecture/README.md](./README.md) §0.

| Pattern                           | ✅ Example                                                                       | ❌ Anti-example                                       |
| --------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `docs/adr/NNNN-kebab-title.md`    | `docs/adr/0001-modules-by-bounded-context.md`, `docs/adr/0002-analytics-port.md` | `adr-analytics.md`, `ADR2.MD`, `decision-final-v2.md` |
| In-doc id reference               | `ADR-0001`, `ADR-0002`                                                           | `adr1`, `the analytics ADR`                           |
| Title is a noun phrase / decision | `0003-branded-id-types.md`                                                       | `0003-stuff.md`                                       |

### 11.3 Module Brain Notes — `BRAIN.md` (uppercase, per module)

Each module ships a `BRAIN.md` (uppercase, distinct from the **root** `Brain.md`) holding module-local decisions, registries, TODOs, and debt ([architecture/README.md](./README.md) §2).

| Pattern                                  | ✅ Example                                                          | ❌ Anti-example                                         |
| ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| `modules/<context>/BRAIN.md` (uppercase) | `modules/appointments/BRAIN.md`                                     | `modules/appointments/brain.md`, `notes.md`, `Brain.md` |
| Root brain stays Title-case              | `docs/Brain.md` (Phase 1) / `docs/brain/PROJECT_BRAIN.md` (Phase 2) | renaming root to `BRAIN.md`                             |
| Module README is `README.md`             | `modules/appointments/README.md`                                    | `readme.md`, `OVERVIEW.md`                              |

---

## 12. Consolidated cheat-sheet

> Phase 1 rows are marked **(P1)**; Phase 2 additions are marked **(P2)**. Nothing in this table contradicts [../Naming-Convention.md](../Naming-Convention.md).

| What                         | Convention                                                                                                                      | ✅ Example                                                           | Source |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------ |
| Component file/symbol        | `PascalCase(.tsx)`                                                                                                              | `VitalsCard.tsx` / `VitalsCard`                                      | P1     |
| Hook                         | file `use-x.ts`, symbol `useX`                                                                                                  | `use-patient.ts` / `usePatient`                                      | P1     |
| Store                        | `thing.store.ts` / `useXStore`                                                                                                  | `auth.store.ts` / `useAuthStore`                                     | P1     |
| Selector                     | `thing.selectors.ts` / `selectX`                                                                                                | `selectActivePatient`                                                | P1     |
| Service                      | `thing.service.ts` / `XService`                                                                                                 | `billing.service.ts` / `BillingService`                              | P1     |
| Repository                   | `thing.repository.ts`                                                                                                           | `patient.repository.ts`                                              | P1     |
| Mapper file                  | `thing.mapper.ts`                                                                                                               | `appointment.mapper.ts`                                              | P1     |
| **Mapper fn**                | `toX` / `toXDto`                                                                                                                | `toAppointment` / `toAppointmentDto`                                 | **P2** |
| DTO                          | `thing.dto.ts` / `XDto`                                                                                                         | `patient.dto.ts` / `PatientDto`                                      | P1     |
| Model                        | `thing.types.ts` / bare noun `X`                                                                                                | `Patient`                                                            | P1     |
| ViewModel                    | `XViewModel`                                                                                                                    | `QueueRowViewModel`                                                  | P1     |
| Entity (aggregate)           | `XEntity` (rare)                                                                                                                | `PatientEntity`                                                      | P1     |
| Branded id                   | `XId`                                                                                                                           | `AppointmentId`                                                      | P1     |
| Schema                       | `thing.schema.ts` / `xSchema`                                                                                                   | `appointment.schema.ts` / `appointmentSchema`                        | P1     |
| Validator                    | `thing.validators.ts`                                                                                                           | `prescription.validators.ts`                                         | P1     |
| Types file                   | `thing.types.ts`                                                                                                                | `queue.types.ts`                                                     | P1     |
| Queries file / keys          | `thing.queries.ts` / `xKeys`                                                                                                    | `appointment.queries.ts` / `appointmentKeys`                         | P1     |
| Constants                    | `thing.constants.ts` / `UPPER_SNAKE_CASE`                                                                                       | `MAX_QUEUE_SIZE`                                                     | P1     |
| "Enum"                       | const-object `as const` / union (never `enum`)                                                                                  | `AppointmentStatus`                                                  | P1     |
| Context trio                 | `XContext`/`XProvider`/`useX`                                                                                                   | `ActiveClinicContext` / `…Provider` / `useActiveClinic`              | P1     |
| Provider                     | `XProvider`                                                                                                                     | `AnalyticsProvider`                                                  | P1     |
| HOC                          | `withX`                                                                                                                         | `withPermissionGuard`                                                | P1     |
| Boolean                      | `is/has/should/can/did`                                                                                                         | `isQueueFull`                                                        | P1     |
| Internal handler / prop      | `handleX` / `onX`                                                                                                               | `handleSubmit` / `onAppointmentBooked`                               | P1     |
| Async fn                     | verb phrase (no `Async`)                                                                                                        | `dispensePrescription`                                               | P1     |
| Icons                        | `lucide-react`, `PascalCase` ref                                                                                                | `<CalendarPlus />`                                                   | P1     |
| Assets                       | `kebab-case` under `assets/{…}`                                                                                                 | `assets/images/empty-queue.svg`                                      | P1     |
| i18n key                     | `namespace.area.element`, module namespace                                                                                      | `appointments.book.submit`                                           | P1/P2  |
| Primitive token              | `--color-{family}-{step}`                                                                                                       | `--color-rose-500`                                                   | P1     |
| Semantic token               | `--color-{role}`                                                                                                                | `--color-primary`                                                    | P1     |
| Component token              | `--{component}-{prop}`                                                                                                          | `--button-bg`                                                        | P1     |
| Test id                      | `data-testid="kebab"`                                                                                                           | `data-testid="vitals-card"`                                          | P1     |
| Unit test / E2E / story      | `*.test.ts(x)` / `*.spec.ts` / `*.stories.tsx`                                                                                  | `patient.mapper.test.ts`                                             | P1     |
| Route path / param / id      | kebab / `:camelId` / `kebab.hierarchical`                                                                                       | `/appointments/book` / `:patientId` / `appointments.book`            | P1     |
| Branch / commit              | `type/kebab` / `type(scope): subject`                                                                                           | `feat/book-appointment-reminders` / `fix(queue): correct comparator` | P1     |
| **Module folder**            | `modules/<context>/` kebab journey noun                                                                                         | `modules/appointments/`, `modules/pharmacy/`                         | **P2** |
| **Module segments**          | fixed `pages components hooks services repositories api mappers adapters types schemas validators constants store config tests` | `modules/appointments/services/`                                     | **P2** |
| **Module public API**        | `index.ts` (root)                                                                                                               | `modules/appointments/index.ts`                                      | **P2** |
| **Module route subtree**     | `routes.tsx` / `xRoutes`                                                                                                        | `appointmentRoutes`                                                  | **P2** |
| **Route id constant**        | `XRouteIds` const-object                                                                                                        | `AppointmentRouteIds.Book`                                           | **P2** |
| **Adapter**                  | `vendor-x.adapter.ts` / `VendorXAdapter`                                                                                        | `segment-analytics.adapter.ts` / `SegmentAnalyticsAdapter`           | **P2** |
| **Port**                     | `x.port.ts` / `XPort`                                                                                                           | `analytics.port.ts` / `AnalyticsPort`                                | **P2** |
| **Logger / Monitoring port** | `LoggerPort` / `MonitoringPort`                                                                                                 | `SentryLoggerAdapter`, `OtelMonitoringAdapter`                       | **P2** |
| **Permission key**           | `resource:action`                                                                                                               | `appointments:create`, `queue:advance`                               | **P2** |
| **Permission constant**      | `XPermissions` const-object                                                                                                     | `AppointmentPermissions.Create`                                      | **P2** |
| **Guard**                    | `x.guard.ts` / `XGuard` / `<Can>`                                                                                               | `permission.guard.ts` / `<PermissionGuard>`                          | **P2** |
| **Middleware**               | `x.middleware.ts` / `xMiddleware`                                                                                               | `auth.middleware.ts` / `authMiddleware`                              | **P2** |
| **Worker**                   | `x.worker.ts` / `xWorker`                                                                                                       | `outbox-sync.worker.ts` / `outboxSyncWorker`                         | **P2** |
| **Event name**               | `Resource<PastTense>` const value                                                                                               | `AppointmentBooked`, `VitalsRecorded`                                | **P2** |
| **Event payload type**       | `XEvent`                                                                                                                        | `AppointmentBookedEvent`                                             | **P2** |
| **Event bus**                | `eventBus` (single, `shared/core`)                                                                                              | `eventBus.publish(...)`                                              | **P2** |
| **CODEOWNERS scope**         | `/path/  @org/<team-kebab>`                                                                                                     | `/src/modules/appointments/  @clinicos/scheduling-team`              | **P2** |
| **ADR file**                 | `docs/adr/NNNN-kebab-title.md`                                                                                                  | `0001-modules-by-bounded-context.md`                                 | **P2** |
| **Module Brain Notes**       | `BRAIN.md` (uppercase, per module)                                                                                              | `modules/appointments/BRAIN.md`                                      | **P2** |

---

**Cross-links:** [../Naming-Convention.md](../Naming-Convention.md) (Phase 1, consolidated + extended here) · [architecture/README.md](./README.md) (Phase 2 anchor) · [FolderStructure.md](./FolderStructure.md) · [FeatureArchitecture.md](./FeatureArchitecture.md) · [DependencyRules.md](./DependencyRules.md).

_Phase 2 · Part 5 · Foundation v2 · 2026-06-27 · Owner: Frontend Architecture · Status: **Ratified** · Consolidates + extends [../Naming-Convention.md](../Naming-Convention.md)._
