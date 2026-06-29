# 🗂️ ClinicOS — Folder-Structure.md

> **This is THE reference for where every file goes.**
> If you are about to create a file and you are unsure where it belongs, the answer is in this document. If the answer is _not_ here, it is **not yet decided** — propose it, get it ratified, record it here.

**Read first:** [Brain.md](./Brain.md) (the single source of truth) → [Architecture.md](./Architecture.md) (layers, data flow, diagrams).
**Naming rules:** all folder/file casing is governed by [Naming-Convention.md](./Naming-Convention.md).

---

## 1. Purpose

ClinicOS frontend = **Feature-Sliced Design (FSD)** for _structure_ + **Domain-Driven Design** for _language_ + **Clean Architecture** (Repository / Service / DTO) for _decoupling_. This document is the physical manifestation of that architecture on disk.

It exists to answer exactly three questions, every time, the same way:

1. **Where do I put this file?** → §2–§4 trees + §6 decision table.
2. **How do I import it without breaking the build?** → §5 public-API pattern.
3. **How does the structure grow over the next 10 years?** → §11 evolution playbooks.

The structure is not decoration. It is **linted and enforced** (`eslint-plugin-boundaries`, no-deep-import rules, `import/no-restricted-paths`). A PR that violates the tree fails CI. See [Brain.md §5.1 — The Dependency Rule](./Brain.md).

> **The one rule that explains all others:** imports flow **downward only**, and **only through `index.ts`**.
> `app → processes → pages → widgets → features → entities → shared`

---

## 2. Top-level repository tree

```text
clinicos-frontend/
├── .husky/                     # Git hooks — quality gates run BEFORE code enters history
│   ├── pre-commit              #   → lint-staged (eslint --fix + prettier on staged files)
│   ├── commit-msg              #   → commitlint (Conventional Commits enforced)
│   └── pre-push                #   → typecheck + affected unit tests + boundaries lint
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # typecheck · lint · boundaries · test · build · a11y gate
│       └── e2e.yml             # Playwright critical patient-journey flows
│
├── .changeset/                 # Changesets — versioning & changelog (Husk §4 in Brain.md)
│
├── public/                     # Static, served as-is (favicon, manifest.webmanifest, robots)
│   └── locales/                # OPTIONAL: if locales are served statically instead of bundled
│
├── src/                        # ← ALL application code. Expanded in §3.
│
├── .env                        # NEVER committed. Local secrets. (gitignored)
├── .env.example                # Committed. The contract: every key, no values.
├── .env.development            # Committed. Non-secret dev defaults (MSW on, mock API URL).
├── .env.production             # Committed. Non-secret prod flags (MSW off, real API base).
│                               #   Strategy: only VITE_* keys reach the client; secrets stay server-side.
│
├── .eslintrc.cjs               # Flat-config root. Hosts the ARCHITECTURE rules:
│                               #   eslint-plugin-boundaries (layer graph),
│                               #   import/no-restricted-paths (no deep imports past index.ts),
│                               #   jsx-a11y, i18next/no-literal-string, simple-import-sort.
├── .prettierrc                 # Formatting (Prettier owns style; ESLint owns correctness).
├── .gitignore
├── .nvmrc                      # Pinned Node version (reproducible builds).
│
├── package.json                # Scripts, deps, lint-staged config. The authoritative stack (Brain.md §4).
├── pnpm-lock.yaml              # Locked dependency graph (pnpm is the package manager).
│
├── tsconfig.json               # TS5 strict: strict, noUncheckedIndexedAccess,
│                               #   exactOptionalPropertyTypes. Path alias: "@/*" → "src/*".
├── tsconfig.node.json          # Config-file typechecking (vite.config, etc.).
│
├── vite.config.ts              # Vite 5: React plugin, alias @/→src/, vitest config,
│                               #   manualChunks (route-level code split), SW/PWA plugin.
├── vitest.setup.ts             # Global test setup: jest-dom, MSW server start/stop, i18n test init.
├── playwright.config.ts        # E2E config (projects, baseURL, traces).
│
├── tailwind.config.ts          # Tailwind theme reads ONLY from CSS-variable tokens.
│                               #   colors/space/radius map to var(--token). No raw hex/px here.
├── postcss.config.cjs          # Tailwind + autoprefixer pipeline.
│
├── .storybook/                 # Storybook host config (framework, a11y addon, i18n decorator).
│   ├── main.ts
│   └── preview.tsx
│
└── README.md                   # Entry point → points straight at docs/Brain.md.
```

**Why these live at the root and not in `src/`:** they configure the _tooling that builds and guards_ `src/`. They are the perimeter; `src/` is the city.

---

## 3. The `src/` tree (full ClinicOS slice names)

Top-to-bottom = the dependency graph. **Anything may import from something printed _below_ it; nothing may import from _above_ it; nothing imports _sideways_ except through a layer above.**

```text
src/
├── main.tsx                     # Bootstrap: createRoot, mount <App/>, register SW, start MSW (dev).
├── App.tsx                      # (lives in app/, re-exported) — see app/ below.
│
├── app/                         # ── LAYER 1 · composition root. Knows the whole app. Imported by nobody.
│   ├── App.tsx                  #   Root component: wraps providers + router.
│   ├── providers/               #   ALL global context providers, composed in one place.
│   │   ├── index.tsx            #     <AppProviders> — single nesting point.
│   │   ├── QueryProvider.tsx    #     TanStack Query client + persistence (IndexedDB).
│   │   ├── ThemeProvider.tsx    #     light/dark/high-contrast + Large-Text-Mode token swap.
│   │   ├── I18nProvider.tsx     #     i18next init + Suspense for lazy locale bundles.
│   │   └── AuthProvider.tsx     #     hydrates auth session into the auth store.
│   ├── router/
│   │   ├── index.tsx            #     createBrowserRouter — the route TREE (lazy route imports).
│   │   ├── routes.tsx           #     Route objects → pages (code-split per route).
│   │   └── guards.tsx           #     <RequireAuth>, <RequirePermission> route gates.
│   ├── error-boundary/
│   │   ├── RootErrorBoundary.tsx#     App-level boundary → Sentry + localized fallback screen.
│   │   └── index.ts
│   ├── styles/
│   │   └── global.css           #     @tailwind base/components/utilities + imports shared tokens/themes.
│   ├── app-config/
│   │   └── index.ts             #     reads shared/config/env → typed runtime app config object.
│   └── index.ts                 #   public API of app (exports <App/>).
│
├── processes/                   # ── LAYER 2 · cross-feature journeys. Orchestrate MANY features.
│   ├── patient-journey/         #   The spine: Appointment→Check-In→Vitals→Queue→Consult→Rx→Pharmacy→Billing→Follow-Up.
│   │   ├── ui/                  #     stepper/journey-shell that sequences feature screens.
│   │   ├── model/               #     journey state machine (which step, allowed transitions).
│   │   └── index.ts
│   ├── auth-flow/               #   Login → OTP → tenant/clinic select → session establish.
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   └── onboarding/              #   First-run clinic setup wizard (staff, rooms, services).
│       ├── ui/
│       ├── model/
│       └── index.ts
│
├── pages/                       # ── LAYER 3 · route-level screens. Thin. COMPOSE widgets + features.
│   ├── dashboard/               #   Owner/clinic KPIs (bento). page = layout + data wiring only.
│   │   ├── ui/DashboardPage.tsx
│   │   └── index.ts
│   ├── appointments/            #   Calendar/list + book-appointment feature.
│   ├── consultation/            #   Doctor screen: patient-header + vitals-panel + write-prescription.
│   ├── pharmacy/                #   Dispense queue + dispense-medicine feature.
│   ├── billing/                 #   Invoices + create-invoice feature.
│   ├── patient-records/         #   Lifetime medical record timeline.
│   └── settings/                #   Profile, clinic, language, accessibility toggles.
│       └── (each: ui/<Name>Page.tsx + index.ts)
│
├── widgets/                     # ── LAYER 4 · large, self-sufficient UI blocks. Reusable across pages.
│   ├── app-shell/               #   Sidebar + topbar + content outlet + offline/sync indicator.
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   ├── patient-header/          #   Patient identity banner (avatar, name, age, allergies, tags).
│   ├── queue-board/             #   Live queue columns (waiting/in-progress/done) — uses manage-queue.
│   └── vitals-panel/            #   Read view of latest vitals + entry point to record-vitals.
│       └── (each: ui/ · model/ · index.ts)
│
├── features/                    # ── LAYER 5 · user capabilities = VERBS. One feature = one user intent.
│   ├── book-appointment/        #   Schedule a slot for a patient.
│   ├── check-in/                #   Mark patient arrived → enters queue.
│   ├── record-vitals/           #   Capture BP/temp/SpO₂/weight.  ★ FULLY EXPANDED in §4.1
│   ├── manage-queue/            #   Reorder/call-next/skip in the queue.
│   ├── write-prescription/      #   Compose Rx (drug, dose, frequency, duration).
│   ├── dispense-medicine/       #   Pharmacist fulfills an Rx, decrements stock.
│   ├── create-invoice/          #   Generate a bill from consultation + items.
│   ├── schedule-follow-up/      #   Book the next visit from consultation.
│   ├── switch-language/         #   Runtime locale switch (en/hi/mr/ur), no reload.
│   └── toggle-large-text/       #   Large-Text-Mode accessibility toggle.
│       └── (each: index.ts · ui/ · model/ · api/ · lib/ · config/)
│
├── entities/                    # ── LAYER 6 · domain NOUNS. The shared vocabulary of the clinic.
│   ├── patient/                 #   ★ FULLY EXPANDED in §4.2
│   ├── appointment/
│   ├── vitals/
│   ├── prescription/
│   ├── medicine/
│   ├── invoice/
│   ├── doctor/
│   └── clinic/
│       └── (each: index.ts · ui/ · model/ · api/ · lib/ · config/)
│
└── shared/                      # ── LAYER 7 · zero domain knowledge. The toolbox. Imported by all.
    ├── ui/                      #   THE UI-KIT (design-system primitives). No clinic concepts here.
    │   ├── button/              #     Button.tsx · Button.stories.tsx · Button.test.tsx · index.ts
    │   ├── input/
    │   ├── card/
    │   ├── dialog/
    │   ├── select/
    │   ├── toast/
    │   ├── skeleton/            #     loading-state primitive (Brain.md §11).
    │   ├── empty-state/         #     empty-state primitive.
    │   ├── icon/                #     lucide wrapper (consistent stroke/size tokens).
    │   └── index.ts             #     barrel: re-exports every primitive.
    ├── lib/                     #   FRAMEWORK-AGNOSTIC utilities (no domain, no React-coupling required).
    │   ├── http/                #     HttpClient interface + fetch impl + interceptors.
    │   ├── query/               #     query-key factory helpers, retry/backoff policy.
    │   ├── i18n/                #     i18next instance, ICU config, namespace loader.
    │   ├── telemetry/           #     Sentry/OTel/analytics ports (vendor-agnostic).
    │   ├── storage/             #     IndexedDB (idb) wrapper + Outbox queue primitive.
    │   └── date/                #     Intl-based locale-aware date/number/currency helpers.
    ├── api/                     #   GENERIC data-access scaffolding (no specific endpoints).
    │   ├── http-client.ts       #     concrete HttpClient (baseURL, auth header, error mapping).
    │   ├── base-repository.ts   #     abstract Repository (CRUD + Zod-parse + toModel hook).
    │   └── query-client.ts      #     configured TanStack QueryClient (+ persister).
    ├── config/                  #   CONSTANTS & contracts (no logic).
    │   ├── env.ts               #     Zod-validated import.meta.env → typed `env`.
    │   ├── routes.ts            #     ROUTE path constants (single source of route strings).
    │   ├── permissions.ts       #     permission/role enum matrix (Brain.md §3).
    │   └── tokens.ts            #     TS mirror of token names (for CVA variants, type-safe).
    ├── hooks/                   #   GENERIC React hooks (useMediaQuery, useDebounce, useOnlineStatus).
    ├── types/                   #   GLOBAL types (AppError, ApiResult, Brand<T>, Nullable<T>).
    ├── styles/
    │   ├── tokens.css           #     3-tier tokens: primitive → semantic → component (Brain.md §6).
    │   └── themes/              #     light.css · dark.css · high-contrast.css · large-text.css
    ├── assets/                  #     logos, illustrations, fonts (Plus Jakarta Sans, Inter).
    └── test/                    #   TEST infrastructure (shared by all layers).
        ├── msw/
        │   ├── server.ts        #     setupServer (node, for Vitest).
        │   ├── browser.ts       #     setupWorker (browser, for dev/Storybook).
        │   └── handlers/        #     per-entity handler files (patient.handlers.ts, …).
        ├── test-utils.tsx       #     renderWithProviders (Query+Theme+I18n+Router wrappers).
        └── fixtures/            #     reusable domain fixtures (a fake patient, appointment…).
```

> **Reading the indentation as law:** `features/record-vitals` may import `entities/vitals`, `entities/patient`, and anything in `shared`. It may **NOT** import `features/check-in`, any `widget`, any `page`, or any `process`. To combine two features, do it in a `page` or a `process`.

---

## 4. Detailed slice anatomy

Every feature and every entity has the **same six-part anatomy** (Brain.md §5.2):
`index.ts` (public API) · `ui/` · `model/` · `api/` · `lib/` · `config/`.
Not every slice needs all six — but the _names never change_, so any developer can navigate any slice blind.

### 4.1 Feature, fully expanded — `features/record-vitals/`

A _capability_: "the receptionist/nurse records a patient's vitals." It **owns the form and the mutation**; it **borrows** the domain shape from `entities/vitals` and `entities/patient`.

```text
features/record-vitals/
├── index.ts                         # PUBLIC API. Exports ONLY: <RecordVitalsForm/>, useRecordVitals.
│
├── ui/
│   ├── RecordVitalsForm.tsx         # Container: wires RHF+Zod, calls the mutation, renders fields.
│   ├── VitalsFields.tsx             # Presentational: BP/temp/SpO₂/weight inputs (tokens + i18n only).
│   ├── RecordVitalsForm.test.tsx    # Behavior test (co-located): fills form → asserts mutation called.
│   └── RecordVitalsForm.stories.tsx # Storybook states: empty / filled / submitting / error.
│
├── model/
│   ├── record-vitals.types.ts       # Form-model types (RecordVitalsInput) — UI-shaped, not DTO.
│   ├── record-vitals.store.ts       # Zustand: ONLY transient UI state (e.g. "unit = °C/°F"). Not server data.
│   └── record-vitals.mapper.ts      # Maps validated form input → entities/vitals domain Model.
│
├── api/
│   ├── record-vitals.dto.ts         # Outbound request DTO (the raw backend write shape).
│   ├── record-vitals.schema.ts      # Zod schemas: form-input schema + response DTO schema (boundary parse).
│   ├── record-vitals.repository.ts  # createVitals(): HttpClient → Zod-parse → mapper → returns Vitals Model.
│   └── record-vitals.queries.ts     # useRecordVitals() = useMutation + cache invalidation of vitals/patient.
│
├── lib/
│   └── compute-bmi.ts               # Slice-local pure helper (weight+height → BMI). No domain leakage.
│
└── config/
    └── vitals-ranges.ts             # Slice constants: normal/warning thresholds, default units.
```

**Flow inside the slice (Brain.md §5.3):**
`VitalsFields` (RHF) → `record-vitals.schema` validates → `record-vitals.mapper` → `record-vitals.repository` (parses response DTO, returns `Vitals` Model) → `record-vitals.queries` invalidates `entities/vitals` cache → `vitals-panel` widget re-renders. **No component ever touches HTTP or a DTO.**

### 4.2 Entity, fully expanded — `entities/patient/`

A _noun_: the canonical `Patient`. It owns **the model, the mapper, the read repository/queries, and the small reusable display pieces** of a patient. It owns **no** workflow — features do.

```text
entities/patient/
├── index.ts                       # PUBLIC API. Exports: Patient type, usePatient, PatientAvatar,
│                                  #   PatientName, patientKeys (query-key factory), toPatient mapper.
│
├── ui/
│   ├── PatientAvatar.tsx          # Tiny reusable: initials/photo. Used by patient-header, queue-board.
│   ├── PatientName.tsx            # Name + honorific, locale-aware ordering.
│   ├── PatientAvatar.stories.tsx
│   └── PatientName.test.tsx
│
├── model/
│   ├── patient.types.ts           # THE domain Model: Patient (stable, UI-shaped, backend-independent).
│   ├── patient.store.ts           # Zustand: e.g. "currently-active patient id" UI selection. (Optional.)
│   └── patient.mapper.ts          # toPatient(dto)→Model · toPatientDto(model)→DTO. The ONLY shape-bridge.
│
├── api/
│   ├── patient.dto.ts             # Raw backend shape (e.g. patient_first_nm). Never leaves api/.
│   ├── patient.schema.ts          # Zod schema validating the DTO at the boundary.
│   ├── patient.repository.ts      # getById/list/search: HttpClient → parse → mapper → Patient Model.
│   └── patient.queries.ts         # usePatient(id), usePatients(filter) + patientKeys factory.
│
├── lib/
│   └── format-patient-age.ts      # Pure: DOB → localized age string. Reused everywhere a patient shows.
│
└── config/
    └── patient.constants.ts       # Enums: gender options, ID-type list, age-band thresholds.
```

> **The decoupling payoff (Brain.md §5.3):** backend renames `patient_first_nm → firstName`? Edit **one file** — `patient.mapper.ts`. Zero edits in `ui/`, zero in any feature, widget, or page. _That_ is "10 years without a rewrite."

---

## 5. The `index.ts` public-API pattern

Every slice exposes a **single legal import surface**: its `index.ts` (the barrel). Everything else inside the slice is **private**.

### 5.1 Example — `entities/patient/index.ts`

```ts
// entities/patient/index.ts — the ONLY things the rest of the app may import from this slice.

// Domain model (type-only export — DTOs are NEVER exported)
export type { Patient } from './model/patient.types';

// Mapper (sometimes needed by features composing writes)
export { toPatient } from './model/patient.mapper';

// Read hooks + query-key factory
export { usePatient, usePatients, patientKeys } from './api/patient.queries';

// Reusable UI atoms
export { PatientAvatar } from './ui/PatientAvatar';
export { PatientName } from './ui/PatientName';

// ❌ Intentionally NOT exported: patient.dto.ts, patient.schema.ts,
//    patient.repository.ts, patient.store.ts — these are slice-private.
```

### 5.2 Legal vs illegal imports

```ts
// ✅ LEGAL — import from the public API only
import { usePatient, type Patient } from '@/entities/patient';

// ❌ ILLEGAL — deep import past index.ts (CI fails this line)
import { PatientDto } from '@/entities/patient/api/patient.dto';
import { toPatient } from '@/entities/patient/model/patient.mapper'; // bypasses barrel
```

### 5.3 Why deep imports are banned

- **Encapsulation / refactor safety.** The internal file layout of a slice is free to change as long as `index.ts` keeps its contract. Deep imports would freeze internals into the public API.
- **Enforces the layer graph.** Boundaries can only be policed at the slice edge. If anyone can reach `entities/patient/api/...`, the DTO leaks upward and the Clean-Architecture pipeline (Brain.md §5.3) is broken.
- **DTO containment.** DTOs and Zod schemas must never escape `api/`. The barrel is the membrane that keeps raw backend shapes out of components.
- **One obvious place to look.** New devs and AI agents read one file to know a slice's capabilities.

### 5.4 How it is enforced (lint, not vibes)

```js
// .eslintrc.cjs (excerpt) — architecture is LINTED (Brain.md §4)
rules: {
  // 1) No reaching past a slice's index.ts
  'import/no-internal-modules': ['error', {
    allow: ['@/shared/**'], // shared sub-paths are addressable; domain slices are not
  }],
  // 2) The layer dependency graph (eslint-plugin-boundaries)
  'boundaries/element-types': ['error', {
    default: 'disallow',
    rules: [
      { from: 'app',      allow: ['processes','pages','widgets','features','entities','shared'] },
      { from: 'processes',allow: ['pages','widgets','features','entities','shared'] },
      { from: 'pages',    allow: ['widgets','features','entities','shared'] },
      { from: 'widgets',  allow: ['features','entities','shared'] },
      { from: 'features', allow: ['entities','shared'] },           // ❌ not other features
      { from: 'entities', allow: ['shared'] },                      // ❌ not other entities
      { from: 'shared',   allow: ['shared'] },                      // ❌ no domain knowledge
    ],
  }],
}
```

> Two guarantees: (1) you cannot import upward, (2) you cannot import sideways or past a barrel. The structure defends itself.

---

## 6. Decision table — "I'm building X → it belongs in Y because Z"

| I'm building…                                                                          | It belongs in             | Because                                                                                      |
| -------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| A generic `Button`, `Dialog`, `Skeleton` with **no clinic meaning**                    | `shared/ui` (ui-kit)      | Reusable primitive, zero domain knowledge; themeable via tokens only.                        |
| A `PatientAvatar`, `InvoiceBadge`, `MedicineLabel` — a **noun displayed/read**         | `entities/<noun>/ui`      | It renders a domain entity and is reused by many features/widgets.                           |
| A **verb / single user intent** ("record vitals", "dispense medicine")                 | `features/<verb>`         | One capability = one feature; owns its form, mutation, and slice store.                      |
| A **large composite block** combining several features/entities, reusable across pages | `widgets/<block>`         | Self-sufficient UI assembly (e.g. `queue-board`) bigger than a feature, smaller than a page. |
| A **route-level screen** at a URL                                                      | `pages/<screen>`          | Thin composition + data wiring of widgets/features; one page per route.                      |
| A **multi-feature journey / orchestration** spanning many screens                      | `processes/<journey>`     | Coordinates features that may not import each other (e.g. `patient-journey`).                |
| A **pure helper** used by only one slice                                               | that slice's `lib/`       | Co-located; not promoted until a second slice needs it.                                      |
| A **pure helper** used by 2+ slices, no domain                                         | `shared/lib`              | Generic utility; promotion target (see §11.4).                                               |
| A **domain type** (the `Patient` model)                                                | `entities/<noun>/model`   | The stable, UI-shaped contract every layer above consumes.                                   |
| A **raw backend shape + Zod schema**                                                   | `entities                 | features/<slice>/api`                                                                        | DTOs are boundary-only; must never escape `api/`. |
| A **global provider / router / boundary**                                              | `app/`                    | Composition root; the only place that wires the whole tree.                                  |
| A **route path string**                                                                | `shared/config/routes.ts` | Single source of route strings; no magic strings in components.                              |

**The 3-question disambiguator when stuck:**

1. _Does it have clinic-domain meaning?_ No → `shared`. Yes → continue.
2. _Is it a noun (thing) or a verb (action)?_ Noun → `entities`. Verb → `features`.
3. _Does it combine multiple features/entities?_ Across one screen → `widgets`/`pages`. Across many screens → `processes`.

---

## 7. Where cross-cutting things live

| Cross-cutting concern                            | Canonical home                                                     | Notes                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Design tokens** (primitive→semantic→component) | `shared/styles/tokens.css` (+ `shared/config/tokens.ts` TS mirror) | Single token source; Tailwind reads these via `var(--token)`. Brain.md §6.              |
| **Themes** (light/dark/high-contrast/large-text) | `shared/styles/themes/*.css`                                       | Re-map the _semantic_ tier; components never change.                                    |
| **i18n locale files**                            | `shared/lib/i18n/locales/{en,hi,mr,ur}/{namespace}.json`           | Namespaced per area; lazy-loaded; keys `namespace.area.element`. See below.             |
| **MSW handlers**                                 | `shared/test/msw/handlers/<entity>.handlers.ts`                    | `server.ts` (Vitest), `browser.ts` (dev/Storybook) compose them.                        |
| **Storybook stories**                            | **next to the component** (`Button.stories.tsx`)                   | Co-located, never a separate stories tree. `.storybook/` holds host config only.        |
| **Unit/integration tests**                       | **next to the source** (`*.test.tsx`)                              | Co-location rule (§8). Shared helpers in `shared/test/`.                                |
| **E2E tests**                                    | `e2e/` at repo root (or `src/__e2e__`)                             | Playwright journey specs; cross-cuts the whole app, so it sits outside the layer graph. |
| **Global types**                                 | `shared/types/`                                                    | `AppError`, `ApiResult<T>`, `Brand<T>`. Domain types stay in their entity.              |
| **Assets** (logos, fonts, illustrations)         | `shared/assets/`                                                   | Slice-only assets may co-locate in the slice; shared/brand assets here.                 |
| **Permissions / roles**                          | `shared/config/permissions.ts`                                     | Consumed by `app/router/guards.tsx`.                                                    |

**i18n locale layout (concrete):**

```text
shared/lib/i18n/locales/
├── en/
│   ├── common.json          # shared/ui-kit strings, generic actions (save/cancel)
│   ├── vitals.json          # keys: vitals.form.bloodPressure, vitals.unit.celsius …
│   ├── appointments.json
│   ├── pharmacy.json
│   └── billing.json
├── hi/  (same namespaces)
├── mr/  (same namespaces)
└── ur/  (same namespaces, dir: rtl)
```

> **Namespace = the feature/area, not the layer.** A string used by `record-vitals` lives in `vitals.json`. Each namespace bundle is lazy-loaded on demand (Brain.md §8), so switching language never reloads the app.

---

## 8. Co-location rules

**Default: things that change together live together.** A component, its test, and its story are siblings.

```text
shared/ui/button/
├── Button.tsx
├── Button.test.tsx        # ✅ test beside source
├── Button.stories.tsx     # ✅ story beside source
└── index.ts
```

**Rules:**

- **Tests** (`*.test.tsx` / `*.spec.ts`) sit **next to** the file they test. Never a parallel `__tests__` mirror tree.
- **Stories** (`*.stories.tsx`) sit **next to** the component.
- **Slice-local helpers** start in the slice's `lib/` — do **not** pre-emptively put them in `shared`.
- **Fixtures/mocks** that are slice-specific co-locate; cross-slice ones live in `shared/test/`.

**When to extract to `shared` (the Rule of Two/Three):**

1. A second slice needs the same component/helper → consider promoting.
2. A third slice needs it → **promote it** (don't copy-paste a third time).
3. Promotion target: generic & domain-free → `shared/ui` or `shared/lib`; domain-bearing → the relevant `entity`.

> Premature promotion is as harmful as duplication. Keep code in the slice until reuse is _proven_, then promote deliberately (see §11.4).

---

## 9. Folder naming

**All folders and non-component files are `kebab-case`.** Components are `PascalCase.tsx`.

| Thing                                                  | Casing            | Example                             |
| ------------------------------------------------------ | ----------------- | ----------------------------------- |
| Slice / folder                                         | `kebab-case`      | `record-vitals/`, `patient-header/` |
| Component file                                         | `PascalCase.tsx`  | `RecordVitalsForm.tsx`              |
| Hook                                                   | `useThing.ts`     | `usePatient.ts`                     |
| Store / service / repo / mapper / dto / schema / types | `thing.<role>.ts` | `patient.repository.ts`             |
| Barrel                                                 | `index.ts`        | always                              |

> Full, authoritative rules (symbols, imports/exports, constants, i18n keys): **[Naming-Convention.md](./Naming-Convention.md)** and the table in [Brain.md §12](./Brain.md).

---

## 10. Decision: why Feature-Sliced Design

> Per the decision contract in [Brain.md §14](./Brain.md), every architectural decision states: **Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations.**

**Why.** ClinicOS must survive **10+ years without a rewrite** while a domain (the patient journey) grows continuously. We need a structure where _the cost of adding/changing a feature is constant_, the **blast radius of any change is bounded to one slice**, and the architecture is **machine-checkable** (humans and AI agents both edit this repo). FSD encodes the domain into the folder graph and makes the dependency direction a lint rule.

**Benefits.**

- **Bounded change.** A new capability is a new `features/<verb>` slice; it touches nothing else.
- **Enforced decoupling.** The layer graph is linted — illegal coupling can't merge.
- **Backend independence.** DTO→mapper→model pipeline is contained per slice (Brain.md §5.3).
- **Discoverability.** Identical slice anatomy + single public API = predictable navigation.
- **Parallel teams.** Slices are ownership units; few merge conflicts across feature teams.
- **AI-friendliness.** Agents follow one rule (downward, via `index.ts`) and stay safe.

**Trade-offs.**

- **More upfront ceremony.** Even a tiny feature gets a slice + barrel.
- **Learning curve.** "feature vs widget vs process" needs the §6 decision table.
- **Indirection.** DTO/mapper/model layering is more files than a direct fetch.
  → Mitigation: this doc + generators (§11) + lint make the ceremony cheap and automatic.

**Alternatives considered.**

- **By-type** (`/components`, `/hooks`, `/services`, `/utils`): trivial to start, but a single feature smears across every top-level folder; change blast radius is the whole app. **Rejected** — does not scale past a few features.
- **By-feature (flat)** (`/features/*` only, no layers): better cohesion, but no rule preventing feature↔feature spaghetti and no place for cross-feature journeys or shared domain nouns. **Rejected** — coupling becomes unbounded.
- **FSD (chosen):** by-feature **plus** a strict layer graph **plus** shared domain entities **plus** an orchestration layer (`processes`). Gets cohesion _and_ enforced decoupling.

**Future scalability.** New journeys → new `processes`. New verbs → new `features`. New domain nouns → new `entities`. The toolbox (`shared`) grows independently. Nothing forces a cross-cutting refactor; the graph stays acyclic by construction.

**Enterprise considerations.** Multi-tenant role/permission gating lives at `app/router/guards.tsx` + `shared/config/permissions.ts`; auditability and ownership map cleanly to slices; the linted boundary graph is a _governance_ control, not a style preference; offline/Outbox, i18n, and a11y are first-class layers, not patches. This is what makes the structure defensible to a 10-year roadmap and a compliance review.

---

## 11. How the structure evolves

### 11.1 Add a new **feature** (e.g. `features/cancel-appointment`)

1. `mkdir src/features/cancel-appointment` → add `index.ts · ui/ · model/ · api/ · config/` (+ `lib/` if needed).
2. **Model:** define the input type in `model/cancel-appointment.types.ts`; add a slice store only for transient UI state.
3. **API:** add `*.dto.ts`, `*.schema.ts` (Zod boundary parse), `*.repository.ts` (returns a domain Model), `*.queries.ts` (`useMutation` + invalidate the affected `entities/appointment` keys).
4. **UI:** build the container + presentational components; tokens + i18n keys only (add keys to `locales/*/appointments.json`).
5. **Public API:** export _only_ the component(s) + hook(s) from `index.ts`. Nothing else.
6. **Wire it up:** import the feature into the relevant `page`/`widget`/`process` (never into another feature).
7. **Tests/stories** co-located; **MSW handler** added under `shared/test/msw/handlers/`.
8. CI runs boundaries lint → if it passes, the slice is correctly placed.

### 11.2 Add a new **entity** (e.g. `entities/lab-result`)

1. `mkdir src/entities/lab-result` → `index.ts · ui/ · model/ · api/ · lib/ · config/`.
2. **Model first:** `model/lab-result.types.ts` = the stable domain shape (UI-facing).
3. **Boundary:** `api/lab-result.dto.ts` + `*.schema.ts`; `model/lab-result.mapper.ts` bridges DTO↔Model.
4. **Access:** `api/lab-result.repository.ts` (extends `shared/api/base-repository`) + `api/lab-result.queries.ts` with a `labResultKeys` factory.
5. **Reusable atoms:** small display components in `ui/` (e.g. `LabResultBadge`).
6. **Public API:** export the type, hooks, query-key factory, mapper (if needed), and UI atoms. **Never export the DTO/schema/repository.**
7. Features now consume `@/entities/lab-result`; entity itself imports nothing but `shared`.

### 11.3 Add a new **shared component** (e.g. `shared/ui/tooltip`)

1. `mkdir src/shared/ui/tooltip` → `Tooltip.tsx · Tooltip.stories.tsx · Tooltip.test.tsx · index.ts`.
2. Build it **domain-free**, styled **only** via tokens (`var(--token)` / CVA variants from `shared/config/tokens.ts`).
3. A11y + i18n: keyboard/ARIA correct; any text via `common.json` keys.
4. Re-export from `shared/ui/index.ts` (the ui-kit barrel).
5. Add a Storybook story for every state; it becomes part of the design-system docs.

### 11.4 Promote a feature-local component to **shared**

Trigger: a third slice needs the same domain-free component (Rule of Three, §8).

1. **Confirm it's domain-free.** If it carries clinic meaning, it belongs in an `entity`, not `shared/ui`.
2. **Move** the folder from `features/<x>/ui/Thing/` → `shared/ui/thing/` (kebab-case folder).
3. **Strip** any feature-specific props/strings; generalize the API; replace literals with tokens + i18n keys.
4. **Add** a story + test if missing; export from `shared/ui/index.ts`.
5. **Update imports** in the original feature to `@/shared/ui` and delete the local copy.
6. Run boundaries lint + the full test suite; a clean run confirms the promotion is safe.

---

_Last updated: 2026-06-27 · Owner: Frontend Architecture · Status: **Foundation v1** · Governed by [Brain.md](./Brain.md)._
