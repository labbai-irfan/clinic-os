# ClinicOS — Enterprise Folder Catalog (Phase 2)

> **Phase 2 · Part 2 of the ClinicOS Frontend Engineering Bible.**
> This document is the **authoritative, exhaustive catalog of every folder** in the ClinicOS frontend. It **extends** and never contradicts [Phase 1 · Brain.md](../Brain.md) and the [Phase 2 architecture anchor](./README.md).
>
> **Read order:** [Brain.md](../Brain.md) (Phase 1 laws) → [architecture/README.md](./README.md) (Phase 2 trees) → **this file** (per-folder contracts).
> **Phase 1 folder reference (not duplicated here):** [../Folder-Structure.md](../Folder-Structure.md) — the canonical Phase 1 FSD tree, slice anatomy, public-API pattern, and evolution playbooks. This Phase 2 catalog is the _enterprise superset_; where Phase 1 spoke of flat `features/widgets/pages/entities`, Phase 2 organizes those slices **inside `modules/<context>/`** per [ADR-0001](./README.md#0-relationship-to-phase-1-read-this-before-anything).
>
> **Sibling Phase 2 docs (cross-linked throughout):**
> [DependencyRules.md](./DependencyRules.md) · [FeatureArchitecture.md](./FeatureArchitecture.md) · [NamingConvention.md](./NamingConvention.md)

---

## 0. How to read this catalog

This is a **reference document**, not a narrative. Jump to the folder you care about. Every folder is documented with an identical **7-field contract block** so you can scan any folder the same way:

| Field                      | Question it answers                          |
| -------------------------- | -------------------------------------------- |
| **Purpose**                | What is it?                                  |
| **Responsibilities**       | What does it do? (bullets)                   |
| **Rules**                  | What MUST / NEVER go inside it?              |
| **Allowed dependencies**   | Which layers/folders MAY it import from?     |
| **Forbidden dependencies** | What must it NEVER import?                   |
| **Example usage**          | A concrete ClinicOS file path / tiny snippet |
| **Future scalability**     | How it survives 10+ years                    |

> **The one law that explains every "Allowed/Forbidden" field below** (Phase 1 §5.1, restated for Phase 2 in [README §1](./README.md#1-authoritative-top-level-structure-src)):
> Imports flow **downward only**, and **only through `index.ts`**.
> Top level: `app → processes → modules → entities → shared`.
> Inside a module: `Presentation → Application → Domain ← Infrastructure`.
> Full matrix and enforcement: [DependencyRules.md](./DependencyRules.md).

---

## 1. Annotated full tree (reproduced from the Phase 2 anchor)

This is the **authoritative tree** from [architecture/README.md §1–§2](./README.md#1-authoritative-top-level-structure-src), reproduced verbatim in structure and annotated. It is the map for the entire catalog.

```text
src/
├── app/                  # L1 · Composition root: providers, router, layouts, store, config, styles, bootstrap
├── processes/            # L2 · Cross-MODULE journeys — the Patient Journey state machine spanning modules
├── modules/              # L3 · Domain BOUNDED CONTEXTS — self-contained, identically structured (see §5)
│   └── <module-name>/    #      one bounded context ≈ one team (CODEOWNERS)
│       ├── index.ts          # PUBLIC API — the ONLY legal import surface for other modules / app / processes
│       ├── routes.tsx        # Module route subtree (lazy-loaded)
│       ├── permissions.ts    # Module permission definitions (RBAC)
│       ├── README.md         # Module overview, owners, public API, dependencies
│       ├── BRAIN.md          # Module Brain Notes (decisions, registries, TODOs, debt)
│       ├── pages/            # Route-level screens — composition only           (Presentation)
│       ├── components/       # Module-local presentational components            (Presentation)
│       ├── hooks/            # Module-local hooks                                 (Presentation ⇄ Application)
│       ├── services/         # Use-cases / business logic — orchestrate repos    (Application)
│       ├── repositories/     # Data access: interface + impl, returns Models     (Infrastructure)
│       ├── api/              # Endpoints + Query/mutation hooks + http calls      (Infrastructure)
│       ├── mappers/          # DTO ⇄ Model pure mapping                          (Infra→Domain boundary)
│       ├── adapters/         # Adapt 3rd-party / cross-module contracts          (Infrastructure)
│       ├── types/            # Module domain Models + DTO types                   (Domain)
│       ├── schemas/          # Zod schemas: DTO validation + form schemas         (Domain)
│       ├── validators/       # Domain validation rules                           (Domain)
│       ├── constants/        # Module constants                                  (Domain)
│       ├── utils/            # Module pure utilities
│       ├── store/            # Module-local Zustand store (UI state only)
│       ├── config/           # Module config + feature flags
│       └── tests/            # Module integration tests (units co-located)
├── entities/             # L4 · GLOBAL domain entities shared across modules (patient, clinic, doctor, user, tenant)
├── shared/               # L5 · Non-domain cross-cutting reuse — zero domain knowledge (see §4)
│   ├── design-system/    #   UI Kit: tokenized components, primitives, CVA variants, stories
│   ├── core/             #   Framework-agnostic kernel: Result, AppError base, DI container, event bus, ports
│   ├── ui/               #   (Phase 1 alias of design-system primitives — see §4)
│   ├── api/              #   HttpClient interface + impl, base repository, query client, interceptors
│   ├── lib/              #   i18n, query, telemetry, storage, date, currency wrappers
│   ├── hooks/            #   Generic reusable hooks (useDebounce, useMediaQuery, useOnlineStatus)
│   ├── providers/        #   Domain-agnostic React providers
│   ├── contexts/         #   Domain-agnostic React contexts
│   ├── store/            #   Global UI stores (theme, locale, session, layout)
│   ├── config/           #   env, route registry, permissions catalog, feature flags
│   ├── constants/        #   Global constants
│   ├── types/            #   Global shared types
│   ├── schemas/          #   Global shared Zod schemas
│   ├── validators/       #   Reusable validators
│   ├── utils/            #   Pure utilities
│   ├── helpers/          #   Domain-agnostic composed helpers
│   ├── guards/           #   Route/permission guards
│   ├── middleware/       #   Request/response + router middleware
│   ├── theme/            #   Theme definitions + switching logic
│   ├── styles/           #   tokens.css, themes, global styles, mixins
│   ├── localization/     #   i18next setup + locale loaders
│   ├── permissions/      #   RBAC engine, <Can>, permission checks
│   ├── notifications/    #   Toast/notification system
│   ├── analytics/        #   Analytics port + adapters
│   ├── logger/           #   Logging port + adapters
│   ├── errors/           #   AppError taxonomy, error-boundary components, error mapping
│   ├── monitoring/       #   Sentry / OTel / Web-Vitals behind ports
│   ├── workers/          #   Web workers (heavy compute, sync)
│   ├── offline/          #   Outbox + sync engine
│   └── cache/            #   Cache strategies, query persistence config
├── assets/               # fonts/ icons/ images/ animations/
│   ├── fonts/            #   Plus Jakarta Sans, Inter (self-hosted)
│   ├── icons/            #   SVG icon source (lucide overrides, brand marks)
│   ├── images/           #   Raster/SVG illustrations, logos, empty-state art
│   └── animations/       #   Lottie/JSON motion assets (reduced-motion aware)
├── routes/               # Global route manifest (path constants, route metadata) [may live under shared/config]
├── testing/              # Test utilities, render helpers, fixtures, a11y harness
├── mock/                 # MSW handlers, seed data, mock server
└── locales/              # i18n catalogs: en/ hi/ mr/ ur/ <namespace>.json

# Repo root (outside src/, govern the build — see Phase 1 ../Folder-Structure.md §2)
docs/                     # The ClinicOS canon (Phase 1 + Phase 2 architecture docs)
docs/brain/               # PROJECT_BRAIN.md — permanent project memory + live registries
scripts/                  # Repo automation: generators, codemods, CI helpers
```

### Legend

| Symbol / term                                            | Meaning                                                                                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `L1…L5`                                                  | Top-level dependency layer; lower number imports from higher number, **never** the reverse                                    |
| **Presentation / Application / Domain / Infrastructure** | The four Clean-Architecture rings **inside** every module ([README §2](./README.md#each-module-is-a-mini-clean-architecture)) |
| `index.ts`                                               | The **public API** barrel — the only legal import surface of a slice/module                                                   |
| **Port**                                                 | An interface (contract) that hides a vendor/impl behind it (e.g. `LoggerPort`)                                                |
| **Adapter**                                              | A concrete implementation of a port                                                                                           |
| **DTO**                                                  | Raw backend shape; Zod-validated at the boundary; **never** escapes `api/`+`mappers/`                                         |
| **Model**                                                | Stable, UI-shaped domain type; the only shape the UI ever sees                                                                |
| ✅ / ❌                                                  | Allowed / Forbidden                                                                                                           |

---

## 2. Top-level folders

> Top-level dependency order (downward-only): `app → processes → modules → entities → shared`.
> `modules` may also use `entities` and `shared`. `shared`/`entities` know **nothing** about modules; `shared` knows **nothing** about the domain.

---

### `src/app/` — Composition root (Layer 1)

- **Purpose** — The single bootstrap/composition root that wires the entire application together: providers, router, layouts, global stores, runtime config, and global styles. It _is_ the app; nothing imports it.
- **Responsibilities**
  - Mount React, compose all global providers in one nesting point, assemble the router from module route subtrees.
  - Host the **root error boundary**, global layouts/shells, and the global style entry (`@tailwind` + token import).
  - Read validated `env` and expose a typed runtime app-config object.
- **Rules**
  - MUST contain only composition and wiring — **no business logic, no domain rules, no data fetching**.
  - MUST import module routes only via each module's `index.ts`.
  - NEVER export anything for other layers to consume — `app` is a sink, not a source.
- **Allowed dependencies** — `processes`, `modules` (via `index.ts`), `entities`, `shared`.
- **Forbidden dependencies** — Nothing may import _from_ `app`; `app` must not reach into a module's internals (deep paths past `index.ts`).
- **Example usage** — `src/app/providers/index.tsx` composes `<QueryProvider><ThemeProvider><I18nProvider><AuthProvider>…`; `src/app/router/index.tsx` calls `createBrowserRouter([...patientsModule.routes, ...billingModule.routes])`.
- **Future scalability** — As modules multiply, `app` only grows by appending route subtrees and providers; it never accumulates domain logic, so its complexity stays flat. Sub-folders (`providers/ router/ layouts/ store/ config/ styles/`) are catalogued in §3.

---

### `src/processes/` — Cross-module journeys (Layer 2)

- **Purpose** — Orchestration of **multi-module** user journeys — the long-running Patient Journey state machine that spans modules which may not import one another.
- **Responsibilities**
  - Encode journey state machines (which step, allowed transitions): `Appointment → Check-In → Vitals → Queue → Consult → Rx → Pharmacy → Billing → Follow-Up`.
  - Sequence screens from multiple modules into one flow; own the `auth-flow` and first-run `onboarding` wizards.
- **Rules**
  - MUST coordinate modules **only via their `index.ts`**; the journey owns transition logic, modules own their own screens.
  - NEVER duplicate a module's business rules — call into the module's public API.
  - A process MUST NOT be imported by a module (that would invert the layer order).
- **Allowed dependencies** — `modules` (via `index.ts`), `entities`, `shared`.
- **Forbidden dependencies** — `app`; another process's internals; any module's deep internals.
- **Example usage** — `src/processes/patient-journey/model/journey.machine.ts` (state machine) + `src/processes/patient-journey/ui/JourneyShell.tsx` sequencing `consultation` then `pharmacy` module screens.
- **Future scalability** — New end-to-end journeys (e.g. tele-consult, lab-order) are new process slices; existing modules are reused untouched. Journeys are the only place that grows when the _workflow_ (not the domain) changes.

---

### `src/modules/` — Domain bounded contexts (Layer 3)

- **Purpose** — The home of all domain features. Each child is a **bounded context** packaged as an internally-layered Clean Architecture module with the identical template ([README §2](./README.md#2-authoritative-module-template-every-module-is-identical)). Catalogued folder-by-folder in §5.
- **Responsibilities**
  - Contain everything for one domain area: pages, components, hooks, services, repositories, api, mappers, types, schemas, store, etc.
  - Expose a curated public API (`index.ts`), routes (`routes.tsx`), and permissions (`permissions.ts`).
  - Map ~1:1 to a team via CODEOWNERS.
- **Rules**
  - A module MUST expose exactly one public surface: its root `index.ts`. All cross-module access goes through it.
  - A module MUST NOT import another module's internals — **only** its `index.ts`.
  - NO circular module dependencies (enforced by `eslint-plugin-boundaries` + `import/no-cycle`).
  - Shared domain → promote to `entities/`. Shared non-domain → `shared/`. Never duplicate across modules.
- **Allowed dependencies** — other modules **via `index.ts` only**, `entities`, `shared`.
- **Forbidden dependencies** — `app`, `processes`, another module's deep internals.
- **Example usage** — Canonical set: `patients · appointments · queue · consultation · prescriptions · pharmacy · billing · follow-up · records · analytics · settings · doctor · reception · admin`. e.g. `src/modules/prescriptions/index.ts`.
- **Future scalability** — A module can be lazy-loaded, extracted to its own package/repo, or served as a Module-Federation remote with **zero import changes**, because all cross-module access already flows through `index.ts`. New domains = new modules; blast radius stays module-local. See [FeatureArchitecture.md](./FeatureArchitecture.md).

---

### `src/entities/` — Global domain entities (Layer 4)

- **Purpose** — Domain **nouns shared across modules**: the canonical vocabulary every module agrees on (`patient`, `clinic`, `doctor`, `user`, `tenant`).
- **Responsibilities**
  - Own the **stable domain Model**, its mapper (DTO↔Model), read repository/queries, query-key factory, and small reusable display atoms for each global noun.
  - Provide one authoritative shape so two modules never disagree on what a `Patient` is.
- **Rules**
  - MUST hold only **cross-module** nouns. A noun used by a single module stays in that module's `types/`.
  - NEVER export a DTO or Zod schema across the barrel; DTOs are boundary-only.
  - Owns models and display, NOT workflows — workflows (verbs) live in modules.
- **Allowed dependencies** — `shared` only.
- **Forbidden dependencies** — `app`, `processes`, `modules`, another entity's internals.
- **Example usage** — `src/entities/patient/model/patient.types.ts` (the `Patient` Model), `entities/patient/index.ts` exporting `Patient`, `usePatient`, `PatientAvatar`, `patientKeys`, `toPatient`.
- **Future scalability** — When a noun graduates from "one module's concern" to "many modules' concern," it is promoted here once and reused everywhere (Rule of Three). Entities are deliberately thin so they rarely need rewriting; backend renames are absorbed in one mapper (Phase 1 §5.3).

---

### `src/shared/` — Non-domain cross-cutting toolbox (Layer 5)

- **Purpose** — The foundation toolbox with **zero domain knowledge**: design system, infrastructure ports, utilities, providers, config. Imported by everyone; imports nothing above it. Catalogued in §4.
- **Responsibilities**
  - Provide the UI kit, HTTP/query scaffolding, i18n/theme/permissions engines, logging/analytics/monitoring ports, offline/cache/worker infrastructure.
  - Define global types, constants, schemas, validators, and pure utilities.
- **Rules**
  - NEVER reference a clinic concept (no `Patient`, no `Invoice`) anywhere under `shared/`. If it knows the domain, it does not belong here.
  - MUST stay framework-light in `core/`/`utils/` and vendor-agnostic behind ports.
- **Allowed dependencies** — only other `shared/` sub-folders (and external libraries).
- **Forbidden dependencies** — `app`, `processes`, `modules`, `entities` — i.e. **any domain or upper layer**.
- **Example usage** — `src/shared/design-system/button/Button.tsx`, `src/shared/api/http-client.ts`, `src/shared/logger/logger.port.ts`.
- **Future scalability** — `shared` can be extracted into a versioned internal package (`@clinicos/ui`, `@clinicos/core`) consumed by many apps; its domain-free contract makes it reusable beyond ClinicOS. Each sub-folder evolves independently behind its barrel.

---

### `src/assets/` — Static design assets

- **Purpose** — Static, non-code design assets bundled into the app: fonts, icons, images, animations. Sub-folders catalogued in §6.
- **Responsibilities** — Hold brand fonts, icon SVGs, illustrations/logos, and Lottie/motion files; be importable by the design system and modules for display.
- **Rules**
  - MUST contain only static assets — **no logic, no TS modules with behavior**.
  - Slice-only assets MAY co-locate in a module; brand/shared assets live here.
  - NEVER embed human-readable text baked into images that needs localization — prefer text + token styling.
- **Allowed dependencies** — None (leaf). Assets are _imported by_ layers, they import nothing.
- **Forbidden dependencies** — All code layers (assets are inert).
- **Example usage** — `src/assets/fonts/PlusJakartaSans-Variable.woff2`, `src/assets/animations/sync-success.lottie.json`.
- **Future scalability** — New themes/brands add asset variants without code changes; assets can move to a CDN or an asset package; per-locale or per-tenant asset sets slot in under the same structure.

---

### `src/routes/` — Global route manifest

- **Purpose** — The single source of route **path constants** and route **metadata** (titles, permissions, breadcrumbs) for the whole app. _(May alternatively live under `shared/config/` — see [README §1](./README.md#1-authoritative-top-level-structure-src).)_
- **Responsibilities**
  - Declare every URL path as a typed constant (no magic strings in components).
  - Carry per-route metadata: required permission, page title i18n key, layout, breadcrumb.
  - Be composed by `app/router/` with each module's `routes.tsx`.
- **Rules**
  - MUST hold path constants/metadata only — **no JSX, no React elements, no loaders**.
  - NEVER hardcode a path in a component; reference these constants.
- **Allowed dependencies** — `shared` (types/constants). It is data, not behavior.
- **Forbidden dependencies** — `app`, `processes`, `modules`, `entities` (it must be importable by all of them).
- **Example usage** — `src/routes/paths.ts`: `export const ROUTES = { patientDetail: (id: string) => \`/patients/${id}\` } as const;`
- **Future scalability** — Centralized paths make global URL refactors, deep-link audits, and permission-to-route mapping a one-file change; supports versioned route schemes and tenant-scoped paths over time.

---

### `src/testing/` — Test infrastructure

- **Purpose** — Shared test utilities, render helpers, fixtures, and the accessibility test harness used across all layers.
- **Responsibilities**
  - Provide `renderWithProviders` (Query + Theme + I18n + Router wrappers), domain fixtures, and `axe`/jest-axe a11y helpers.
  - Host cross-cutting test setup invoked by Vitest.
- **Rules**
  - MUST contain test-only code; **never shipped in the production bundle**.
  - Unit tests stay **co-located** with source (`*.test.tsx`); only _shared_ helpers/fixtures live here.
  - MAY import domain types for fixtures, but MUST NOT contain product business logic.
- **Allowed dependencies** — `shared`, `entities`, `modules` (via `index.ts`) for typed fixtures; test libraries.
- **Forbidden dependencies** — Production runtime code must not import `testing/`.
- **Example usage** — `src/testing/render.tsx` (provider-wrapped render), `src/testing/fixtures/patient.fixture.ts`, `src/testing/a11y/axe.ts`.
- **Future scalability** — Centralized harness keeps thousands of tests consistent as modules grow; contract-test and visual-regression harnesses extend here without touching product code.

---

### `src/mock/` — MSW mock server

- **Purpose** — Mock Service Worker handlers, seed data, and the mock server that enables **backend independence** in dev and tests.
- **Responsibilities**
  - Per-entity request handlers, seed/factory data, and `server.ts` (Vitest) / `browser.ts` (dev, Storybook) setup.
  - Let the frontend run and be tested with **no real backend**.
- **Rules**
  - MUST mirror DTO shapes (the backend contract), validated by the same schemas the app uses.
  - NEVER ship in production; gated by env (`VITE_ENABLE_MSW`).
  - Handlers MUST be organized per entity/module, not in one monolith.
- **Allowed dependencies** — `shared`, `entities`, `modules` (schemas/types via `index.ts`); MSW.
- **Forbidden dependencies** — Production runtime must not depend on `mock/` at build time.
- **Example usage** — `src/mock/handlers/patient.handlers.ts`, `src/mock/seed/clinic.seed.ts`, `src/mock/server.ts`.
- **Future scalability** — Mocks scale to full scenario simulation (offline, error, latency), power contract testing against an OpenAPI source of truth, and let new modules develop ahead of backend availability.

---

### `src/locales/` — i18n catalogs

- **Purpose** — The translation catalogs: per-language, per-namespace JSON message files (`en/ hi/ mr/ ur/ <namespace>.json`).
- **Responsibilities**
  - Hold every human-readable string keyed `namespace.area.element` with ICU plural/gender forms.
  - Provide lazy-loadable per-namespace bundles so runtime language switch needs no reload; carry `dir: rtl` for Urdu.
- **Rules**
  - MUST contain **only** message data — no code.
  - Every string in the app MUST resolve to a key here; **no hardcoded human-readable text anywhere** (Phase 1 Law 4).
  - Namespace = the **feature/area**, not the layer (e.g. `vitals.json`, not `record-vitals-form.json`).
- **Allowed dependencies** — None (pure data). Loaded by `shared/localization/`.
- **Forbidden dependencies** — All code layers (data only).
- **Example usage** — `src/locales/en/vitals.json` → `{ "form": { "bloodPressure": "Blood pressure" } }`; mirrored in `hi/ mr/ ur/`.
- **Future scalability** — New languages are new sibling folders; unlimited languages, per-tenant overrides, and translation-management-system (TMS) sync all slot in without code changes.

---

### Repo-root: `docs/`, `docs/brain/`, `scripts/`

- **Purpose** — Governance and automation living **outside `src/`** (they describe and build the app, they are not shipped in it).
- **Responsibilities**
  - `docs/` — the ClinicOS canon: Phase 1 docs ([Brain.md](../Brain.md), [Folder-Structure.md](../Folder-Structure.md), …) and Phase 2 architecture docs (this folder).
  - `docs/brain/` — `PROJECT_BRAIN.md`: permanent project memory + all live registries (modules, permissions, tokens, decisions); maintenance rules in [BrainRules.md](./BrainRules.md).
  - `scripts/` — repo automation: slice/module generators, codemods, CI helpers, doc validators.
- **Rules**
  - `docs/` MUST stay the single source of truth; every ratified decision carries the Decision Contract (Phase 1 §14).
  - `scripts/` MUST NOT be imported by `src/` runtime code; it is build/dev tooling only.
  - `docs/brain/PROJECT_BRAIN.md` MUST be updated whenever structure or a registry changes (AI + human workflow).
- **Allowed dependencies** — `scripts/` may read the repo (FS, AST); `docs/` is prose. Neither is part of the layer graph.
- **Forbidden dependencies** — `src/` runtime must not import from `scripts/` or `docs/`.
- **Example usage** — `scripts/generate-module.ts` scaffolds a full module template; `docs/brain/PROJECT_BRAIN.md` records the module registry.
- **Future scalability** — Generators keep the identical module template enforceable as the module count explodes; PROJECT_BRAIN keeps institutional memory across a 10-year, multi-team lifespan.

---

## 3. `app/*` — Composition-root sub-folders

> All of these are **wiring only**. None contains domain logic. Allowed/Forbidden deps inherit from `app` (§2): may use `processes`, `modules` via `index.ts`, `entities`, `shared`; imported by nobody.

---

### `app/providers/`

- **Purpose** — The single nesting point for all global React context providers.
- **Responsibilities** — Compose `<QueryProvider>`, `<ThemeProvider>`, `<I18nProvider>`, `<AuthProvider>`, offline/notification providers into one `<AppProviders>`.
- **Rules** — MUST only compose providers; each provider's _logic_ lives in `shared/providers` or the relevant `shared/*` engine. NEVER put data fetching or domain state here.
- **Allowed dependencies** — `shared/providers`, `shared/*` engines, `entities`/`modules` only for session hydration via public API.
- **Forbidden dependencies** — module internals; business logic.
- **Example usage** — `src/app/providers/index.tsx` → `<AppProviders>` wrapping the router.
- **Future scalability** — New cross-cutting concerns (e.g. real-time socket provider) are added in one ordered place; provider order is explicit and reviewable.

### `app/router/`

- **Purpose** — Assemble the application route tree from module route subtrees and apply route guards.
- **Responsibilities** — `createBrowserRouter`, lazy route imports, mount `<RequireAuth>`/`<RequirePermission>` gates, error/loader wiring.
- **Rules** — MUST build routes only from each module's exported `routes.tsx` (via `index.ts`). NEVER define a module's screens here.
- **Allowed dependencies** — `modules` (routes via `index.ts`), `shared/guards`, `shared/config`/`routes`.
- **Forbidden dependencies** — module internals; domain logic.
- **Example usage** — `src/app/router/index.tsx` composing `patientsModule.routes`, `billingModule.routes`.
- **Future scalability** — Lazy, code-split routes per module support hundreds of routes; remote module routes can be federated in with no structural change.

### `app/layouts/`

- **Purpose** — Global page shells/scaffolds (app shell, auth layout, blank layout) that pages render inside.
- **Responsibilities** — Sidebar + topbar + content outlet + offline/sync indicator; responsive shell; skip-to-content link.
- **Rules** — MUST be presentational composition only; tokens + i18n keys only. NEVER fetch domain data.
- **Allowed dependencies** — `shared/design-system`, `shared/*`; module pages plug into the outlet.
- **Forbidden dependencies** — module internals; domain logic.
- **Example usage** — `src/app/layouts/AppShell.tsx`, `src/app/layouts/AuthLayout.tsx`.
- **Future scalability** — New device targets (tablet kiosk, future mobile) add layout variants without touching pages.

### `app/store/`

- **Purpose** — Bootstrap/compose the **global** app store at the root (hydration, persistence wiring).
- **Responsibilities** — Initialize and hydrate global Zustand stores from `shared/store` (theme, locale, session, layout); wire persistence.
- **Rules** — MUST only assemble stores defined in `shared/store`; **never** hold server data (that lives in TanStack Query — Phase 1 §9). NEVER define domain stores here.
- **Allowed dependencies** — `shared/store`, `shared/config`.
- **Forbidden dependencies** — module internals; server-data caching.
- **Example usage** — `src/app/store/index.ts` hydrating `useSessionStore` on boot.
- **Future scalability** — Centralized store bootstrap supports persistence migrations and store versioning over a decade.

### `app/config/`

- **Purpose** — Produce the typed **runtime application config** object from validated env.
- **Responsibilities** — Read `shared/config/env` → expose a typed `appConfig` (API base, feature-flag defaults, build info).
- **Rules** — MUST be derived/typed config only; **no secrets** (only `VITE_*` reach the client — Phase 1 folder doc §2). NEVER hardcode environment values.
- **Allowed dependencies** — `shared/config`.
- **Forbidden dependencies** — module internals; domain logic.
- **Example usage** — `src/app/config/app-config.ts` → `export const appConfig = { apiBase: env.VITE_API_BASE, … }`.
- **Future scalability** — Runtime config supports per-tenant/per-environment overrides and remote config without rebuilds.

### `app/styles/`

- **Purpose** — The global style entry point that pulls in tokens, themes, and Tailwind layers.
- **Responsibilities** — `@tailwind base/components/utilities` + import `shared/styles/tokens.css` and theme files; set global resets and root font.
- **Rules** — MUST only import/compose styles; **no component CSS** here (those co-locate). NEVER hardcode colors/sizes — tokens only (Phase 1 Law 5).
- **Allowed dependencies** — `shared/styles`, `shared/theme`.
- **Forbidden dependencies** — module styles; raw hex/px values.
- **Example usage** — `src/app/styles/global.css`.
- **Future scalability** — The single style entry makes theme/token system upgrades global and atomic.

---

## 4. `shared/*` — Cross-cutting toolbox sub-folders

> **Every folder below inherits `shared`'s hard rule:** zero domain knowledge; may import only other `shared/*` and external libs; may be imported by all layers; must NEVER import `app`/`processes`/`modules`/`entities`. Per-folder Forbidden lists below additionally call out **sideways** restrictions where they matter. Full matrix: [DependencyRules.md](./DependencyRules.md).

> **Note on `design-system` vs `ui`:** Phase 1 called the UI kit `shared/ui`; Phase 2 renames it `shared/design-system` ([README §1](./README.md#shared-expansion-where-the-phase-2-folder-list-lives)). `shared/ui` is documented as the **Phase 1 alias** that re-exports from `design-system` for backward compatibility.

---

### `shared/design-system/`

- **Purpose** — **The UI Kit.** Tokenized, domain-free presentational components, primitives, and CVA variants — the visual building blocks of the whole app.
- **Responsibilities**
  - Provide `Button`, `Input`, `Card`, `Dialog`, `Select`, `Toast`, `Skeleton`, `EmptyState`, `Icon`, etc., each token-styled, accessible, and with Storybook stories + tests co-located.
  - Encode the design contract: components consume **semantic/component tokens only**.
- **Rules** — Components MUST be **domain-free** (no clinic concepts) and styled **only** via tokens/CVA. Every component MUST be keyboard/ARIA correct and use i18n keys for any text. MUST ship a story per state.
- **Allowed dependencies** — `shared/lib`, `shared/hooks`, `shared/config` (token mirror), `shared/styles`, `shared/theme`, `shared/localization`.
- **Forbidden dependencies** — `entities`, `modules`, `processes`, `app`; any hardcoded color/size; any domain string.
- **Example usage** — `src/shared/design-system/button/Button.tsx` (+ `.stories.tsx`, `.test.tsx`, `index.ts`).
- **Future scalability** — Extractable as `@clinicos/ui`; new themes/brands re-map tokens with zero component edits; can be consumed by future apps. See [FeatureArchitecture.md](./FeatureArchitecture.md) for how modules consume it.

### `shared/core/`

- **Purpose** — The **framework-agnostic kernel**: pure TypeScript primitives every layer relies on.
- **Responsibilities** — `Result<T,E>` type, `AppError` base, dependency-injection container, event bus, and the **port interfaces** (Logger/Analytics/Http/Storage contracts).
- **Rules** — MUST be **framework-agnostic** (no React, ideally no DOM). MUST define contracts (interfaces), not vendor implementations. NEVER import any other layer.
- **Allowed dependencies** — Nothing internal (only language/std libs); the deepest leaf.
- **Forbidden dependencies** — React, vendor SDKs, all upper layers, even other `shared/*` with framework coupling.
- **Example usage** — `src/shared/core/result.ts`, `src/shared/core/event-bus.ts`, `src/shared/core/ports/logger.port.ts`.
- **Future scalability** — Portable across any runtime (web, worker, future RN); the DI/ports kernel lets vendors be swapped app-wide via one binding.

### `shared/ui/` (Phase 1 alias)

- **Purpose** — Backward-compatible alias of the UI kit; re-exports primitives from `shared/design-system`.
- **Responsibilities** — Preserve Phase 1 import paths (`@/shared/ui`) while the canonical home is `design-system`.
- **Rules** — MUST only re-export from `design-system`; NEVER add new components here.
- **Allowed dependencies** — `shared/design-system`.
- **Forbidden dependencies** — domain layers; original component definitions.
- **Example usage** — `src/shared/ui/index.ts` → `export * from '@/shared/design-system';`
- **Future scalability** — Provides a deprecation seam; can be removed via codemod once all imports migrate.

### `shared/api/`

- **Purpose** — Generic data-access scaffolding (no specific endpoints): the HTTP client and base repository every module builds on.
- **Responsibilities** — `HttpClient` interface + concrete impl (baseURL, auth header, error mapping), `BaseRepository` (CRUD + Zod-parse + `toModel` hook), configured TanStack `QueryClient` + persister, interceptors.
- **Rules** — MUST be endpoint-agnostic and domain-free. The `HttpClient` MUST be swappable (fetch/axios) behind its interface and **never imported in UI** (Phase 1 §4). NEVER reference a clinic entity.
- **Allowed dependencies** — `shared/core` (ports), `shared/lib`, `shared/config`, `shared/errors`.
- **Forbidden dependencies** — `entities`, `modules` (no concrete endpoints), UI components.
- **Example usage** — `src/shared/api/http-client.ts`, `src/shared/api/base-repository.ts`, `src/shared/api/query-client.ts`.
- **Future scalability** — Backend transport (REST→GraphQL→gRPC-web) changes behind the interface; modules' repositories extend `BaseRepository` unchanged.

### `shared/lib/`

- **Purpose** — Framework-light wrapper libraries around third-party tools.
- **Responsibilities** — Wrappers/config for i18n, query, telemetry, storage (IndexedDB/idb), date/number/currency (Intl), retry/backoff.
- **Rules** — MUST wrap vendors behind small surfaces so they are swappable. MUST be domain-free. NEVER leak a raw vendor type across the wrapper boundary.
- **Allowed dependencies** — `shared/core`, `shared/config`, external libs.
- **Forbidden dependencies** — `entities`, `modules`, UI/domain.
- **Example usage** — `src/shared/lib/date/format-date.ts`, `src/shared/lib/query/query-keys.ts`.
- **Future scalability** — Vendor migrations (e.g. date lib swap) are one-folder changes; wrappers keep the rest of the app stable.

### `shared/hooks/`

- **Purpose** — Generic, reusable, **domain-free** React hooks.
- **Responsibilities** — `useDebounce`, `useMediaQuery`, `useOnlineStatus`, `useLocalStorage`, `useIntersection`, etc.
- **Rules** — MUST be domain-free and reusable anywhere. NEVER fetch domain data or hold domain state.
- **Allowed dependencies** — `shared/lib`, `shared/core`, React.
- **Forbidden dependencies** — `entities`, `modules`, domain hooks.
- **Example usage** — `src/shared/hooks/useOnlineStatus.ts` (drives offline UI signal — Phase 1 §10).
- **Future scalability** — Generic hooks library can be packaged and reused; grows additively.

### `shared/providers/`

- **Purpose** — Domain-agnostic React providers (the _implementations_ composed by `app/providers`).
- **Responsibilities** — Query, Theme, I18n, Notification, Offline providers — the reusable provider components themselves.
- **Rules** — MUST be domain-agnostic. NEVER hydrate domain/session state directly (that belongs to a domain provider composed in `app`).
- **Allowed dependencies** — `shared/lib`, `shared/store`, `shared/theme`, `shared/localization`, `shared/core`.
- **Forbidden dependencies** — `entities`, `modules`.
- **Example usage** — `src/shared/providers/ThemeProvider.tsx`.
- **Future scalability** — New cross-cutting providers slot in; `app` just composes them.

### `shared/contexts/`

- **Purpose** — Domain-agnostic React contexts (the context objects + hooks, separate from provider wiring).
- **Responsibilities** — Define low-level contexts (e.g. layout density, breakpoint, feature-flag context) and their `useX` accessors.
- **Rules** — MUST be domain-agnostic; MUST expose a typed accessor hook (no raw `useContext`). NEVER store server data.
- **Allowed dependencies** — React, `shared/core`.
- **Forbidden dependencies** — `entities`, `modules`, domain state.
- **Example usage** — `src/shared/contexts/breakpoint.context.ts`.
- **Future scalability** — Stable context primitives underpin providers; additive growth.

### `shared/store/`

- **Purpose** — The **global UI** Zustand stores.
- **Responsibilities** — Theme, locale, session, and layout slices — small, selector-based, persisted where needed.
- **Rules** — MUST hold **UI/app state only**. NEVER cache server data here (TanStack Query is the only home — Phase 1 §9). MUST be sliced and selector-based. Domain-free.
- **Allowed dependencies** — `shared/lib` (storage), `shared/core`, `shared/config`.
- **Forbidden dependencies** — `entities`, `modules`, server data.
- **Example usage** — `src/shared/store/session.store.ts`, `src/shared/store/theme.store.ts`.
- **Future scalability** — Store versioning + persistence migrations supported; module stores stay separate so global state stays small.

### `shared/config/`

- **Purpose** — Constants and contracts (no logic): env, route registry, permissions catalog, feature flags, token mirror.
- **Responsibilities** — Zod-validated `env`, route path constants, RBAC permission/role enums, feature-flag definitions, TS token mirror for CVA.
- **Rules** — MUST be data/contracts only — **no behavior**. `env` MUST be Zod-validated; only `VITE_*` exposed. NEVER scatter magic strings.
- **Allowed dependencies** — `shared/core`, `shared/types`, Zod.
- **Forbidden dependencies** — `entities`, `modules`, runtime side effects.
- **Example usage** — `src/shared/config/env.ts`, `src/shared/config/permissions.ts`, `src/shared/config/tokens.ts`.
- **Future scalability** — Central contracts make global config/permission/flag changes one-file edits; supports remote/feature-flag services.

### `shared/constants/`

- **Purpose** — Truly global, domain-free constant values.
- **Responsibilities** — App-wide constants: breakpoints, z-index scale, default page sizes, regex, time constants.
- **Rules** — MUST be domain-free and immutable (`as const`, `UPPER_SNAKE_CASE`). NEVER include domain values (those go in a module/entity `constants/`).
- **Allowed dependencies** — None (leaf data).
- **Forbidden dependencies** — all upper layers; domain constants.
- **Example usage** — `src/shared/constants/breakpoints.ts`, `src/shared/constants/z-index.ts`.
- **Future scalability** — Single source for global magic numbers; trivially auditable.

### `shared/types/`

- **Purpose** — Global, domain-free TypeScript types.
- **Responsibilities** — `AppError`, `ApiResult<T>`, `Brand<T>`, `Nullable<T>`, pagination/sort types.
- **Rules** — MUST be domain-free utility/contract types. Domain Models MUST live in their `entity`/`module` `types/`, not here. NEVER import runtime code.
- **Allowed dependencies** — `shared/core` (type-only).
- **Forbidden dependencies** — `entities`, `modules`, runtime.
- **Example usage** — `src/shared/types/api-result.ts`, `src/shared/types/brand.ts`.
- **Future scalability** — Stable type vocabulary the whole codebase shares; rarely churns.

### `shared/schemas/`

- **Purpose** — Reusable, domain-free Zod schemas.
- **Responsibilities** — Generic schemas: pagination params, ID/email/phone, ISO-date, money — composed by module/entity schemas.
- **Rules** — MUST be generic/domain-free. Domain DTO/form schemas live in their module/entity. NEVER encode clinic-specific shapes here.
- **Allowed dependencies** — Zod, `shared/types`, `shared/validators`.
- **Forbidden dependencies** — `entities`, `modules`.
- **Example usage** — `src/shared/schemas/pagination.schema.ts`, `src/shared/schemas/phone.schema.ts`.
- **Future scalability** — Building blocks keep domain schemas DRY; one place to harden validation globally.

### `shared/validators/`

- **Purpose** — Reusable validation **functions** (predicates/refinements) usable inside schemas or directly.
- **Responsibilities** — `isValidPhone`, `isStrongPassword`, `isValidICUKey`, Zod refinements.
- **Rules** — MUST be pure and domain-free. NEVER embed clinic business rules (those are module `validators/`).
- **Allowed dependencies** — `shared/utils`, `shared/constants`.
- **Forbidden dependencies** — `entities`, `modules`.
- **Example usage** — `src/shared/validators/is-valid-phone.ts`.
- **Future scalability** — Shared validation logic stays consistent across forms; testable in isolation.

### `shared/utils/`

- **Purpose** — Pure, generic utility functions.
- **Responsibilities** — `cn` (tailwind-merge), array/object/string helpers, `formatBytes`, `clamp`, `groupBy`.
- **Rules** — MUST be **pure** (no side effects, no React, no domain). One responsibility per file. NEVER read globals or fetch.
- **Allowed dependencies** — `shared/constants`, `shared/types`, std/external pure libs.
- **Forbidden dependencies** — React, `entities`, `modules`, anything stateful.
- **Example usage** — `src/shared/utils/cn.ts`, `src/shared/utils/group-by.ts`.
- **Future scalability** — Pure functions are infinitely reusable and trivially testable; the safest folder to grow.

### `shared/helpers/`

- **Purpose** — Domain-agnostic **composed** helpers (orchestrate several utils; may touch browser APIs) — a notch above `utils/`.
- **Responsibilities** — `downloadBlob`, `copyToClipboard`, `buildQueryString`, `scrollIntoViewIfNeeded`.
- **Rules** — MUST be domain-free; MAY use DOM/browser APIs (unlike pure `utils`). NEVER embed domain logic.
- **Allowed dependencies** — `shared/utils`, `shared/constants`, browser APIs.
- **Forbidden dependencies** — `entities`, `modules`, domain.
- **Example usage** — `src/shared/helpers/download-blob.ts`.
- **Future scalability** — Browser-API quirks centralized; swap or polyfill in one place.

### `shared/guards/`

- **Purpose** — Route/permission guard components and predicates.
- **Responsibilities** — `<RequireAuth>`, `<RequirePermission>`, `<RequireTenant>` and guard predicates consumed by `app/router`.
- **Rules** — MUST guard via the `shared/permissions` engine, not ad-hoc checks. NEVER encode a specific module's rules; guards are generic.
- **Allowed dependencies** — `shared/permissions`, `shared/store` (session), `shared/design-system` (fallback UI).
- **Forbidden dependencies** — `modules`, `entities` internals.
- **Example usage** — `src/shared/guards/RequirePermission.tsx`.
- **Future scalability** — New gate types (tenant, plan, feature-flag) added once and reused across all routes.

### `shared/middleware/`

- **Purpose** — Request/response and router middleware (cross-cutting interception).
- **Responsibilities** — HTTP interceptors (auth refresh, retry, error mapping, trace propagation), router middleware (analytics page-view, title sync).
- **Rules** — MUST be generic and ordered; MUST attach to `shared/api`/router, not call modules. NEVER contain domain logic.
- **Allowed dependencies** — `shared/api`, `shared/logger`, `shared/monitoring`, `shared/core`.
- **Forbidden dependencies** — `entities`, `modules`.
- **Example usage** — `src/shared/middleware/auth-refresh.interceptor.ts`.
- **Future scalability** — Cross-cutting policies (rate-limit, idempotency keys) are inserted centrally without touching call sites.

### `shared/theme/`

- **Purpose** — Theme definitions and the theme-switching logic.
- **Responsibilities** — Define light/dark/high-contrast/large-text themes (the semantic-tier re-maps) and the runtime switch + `prefers-*` detection.
- **Rules** — Themes MUST re-map only the **semantic token tier**; components never change (Phase 1 §6). MUST gate motion by `prefers-reduced-motion`. NEVER hardcode component colors.
- **Allowed dependencies** — `shared/styles` (token files), `shared/store` (theme slice), `shared/core`.
- **Forbidden dependencies** — `entities`, `modules`; component-level overrides.
- **Example usage** — `src/shared/theme/themes.ts`, `src/shared/theme/apply-theme.ts`.
- **Future scalability** — Unlimited themes (seasonal, per-tenant brand, accessibility) by adding a semantic map — no component rewrites.

### `shared/styles/`

- **Purpose** — The token and global CSS source.
- **Responsibilities** — `tokens.css` (3-tier: primitive→semantic→component), theme CSS files, global resets, CSS mixins/logical-property utilities.
- **Rules** — The **single token source**; Tailwind reads these via `var(--token)`. MUST use **logical properties** for RTL (`margin-inline-start`). NEVER place raw hex/px in components — only here as primitives.
- **Allowed dependencies** — None (CSS leaf), referenced by `shared/theme`, `app/styles`.
- **Forbidden dependencies** — code layers.
- **Example usage** — `src/shared/styles/tokens.css`, `src/shared/styles/themes/dark.css`.
- **Future scalability** — Token-driven styling lets a 10-year visual refresh happen in token files; new platforms read the same tokens.

### `shared/localization/`

- **Purpose** — i18next setup and locale loaders (the engine; catalogs live in `src/locales`).
- **Responsibilities** — Initialize i18next + ICU, lazy-load namespace bundles, configure RTL, expose `t`/formatters, runtime language switch without reload.
- **Rules** — MUST load from `src/locales`; MUST support lazy per-namespace loading and `dir` switching. NEVER inline strings; never bundle all locales eagerly.
- **Allowed dependencies** — `shared/lib` (i18n wrapper), `shared/config`, `src/locales` (data).
- **Forbidden dependencies** — `entities`, `modules`, hardcoded text.
- **Example usage** — `src/shared/localization/i18n.ts`, `src/shared/localization/load-namespace.ts`.
- **Future scalability** — Scales to unlimited languages, TMS integration, and per-tenant overrides; runtime switch keeps UX seamless.

### `shared/permissions/`

- **Purpose** — The RBAC engine: permission checks and the `<Can>` gate.
- **Responsibilities** — Evaluate role/permission matrix, provide `<Can permission="…">`, `useCan()`, and `can()` predicate; consume the catalog from `shared/config/permissions`.
- **Rules** — MUST be the single authority for "may the user do X." Modules declare permissions in their `permissions.ts`; this engine evaluates them. NEVER scatter ad-hoc role checks in components.
- **Allowed dependencies** — `shared/config` (catalog), `shared/store` (session), `shared/core`.
- **Forbidden dependencies** — `modules` internals, `entities`.
- **Example usage** — `src/shared/permissions/Can.tsx`, `src/shared/permissions/use-can.ts`.
- **Future scalability** — Supports attribute-based access control (ABAC), multi-tenant scoping, and policy-as-data without UI changes.

### `shared/notifications/`

- **Purpose** — The toast/notification system (UI feedback channel).
- **Responsibilities** — Toast queue, `notify()` API, notification provider/portal, success/error/info variants (token-styled, a11y live-region).
- **Rules** — MUST be domain-free and i18n-keyed. MUST use live regions for screen readers. NEVER embed domain messages (callers pass keys/params).
- **Allowed dependencies** — `shared/design-system`, `shared/store`, `shared/localization`, `shared/core`.
- **Forbidden dependencies** — `entities`, `modules`.
- **Example usage** — `src/shared/notifications/notify.ts` (success after `record-vitals` save — feedback is generic, message is a key).
- **Future scalability** — One channel extends to push/in-app/email-style centers; consistent feedback across the app.

### `shared/analytics/`

- **Purpose** — The provider-agnostic analytics **port** + adapters.
- **Responsibilities** — Define `AnalyticsPort` (`track`, `page`, `identify`) and vendor adapters; expose `analytics` used app-wide.
- **Rules** — MUST keep **no vendor SDK in components** (Phase 1 §4). Components call the port; adapters are wired once. NEVER track PII without policy; never bypass the port.
- **Allowed dependencies** — `shared/core` (port), `shared/logger`, `shared/config`.
- **Forbidden dependencies** — `entities`, `modules`; direct vendor imports outside adapters.
- **Example usage** — `src/shared/analytics/analytics.port.ts`, `src/shared/analytics/segment.adapter.ts`.
- **Future scalability** — Swap/dual-write vendors via adapters; consent and PII policy enforced in one place.

### `shared/logger/`

- **Purpose** — The logging **port** + adapters.
- **Responsibilities** — `LoggerPort` (`debug/info/warn/error`), console/remote adapters, log levels, redaction.
- **Rules** — MUST be used instead of raw `console.*`. MUST redact sensitive fields. NEVER import a vendor logger outside an adapter.
- **Allowed dependencies** — `shared/core` (port), `shared/config`.
- **Forbidden dependencies** — `entities`, `modules`.
- **Example usage** — `src/shared/logger/logger.ts` (port), `src/shared/logger/console.adapter.ts`.
- **Future scalability** — Logging backends change behind the port; structured logging and sampling added centrally.

### `shared/errors/`

- **Purpose** — The error taxonomy, error boundaries, and error mapping.
- **Responsibilities** — `AppError` hierarchy (network/validation/auth/domain), `mapToAppError`, `<ErrorBoundary>`, localized error UI mapping (Phase 1 §11 error state).
- **Rules** — Every error surfaced to the UI MUST be a typed `AppError` with a **localized** human message and a retry path. NEVER show raw exceptions/stack traces to users.
- **Allowed dependencies** — `shared/core` (AppError base), `shared/localization`, `shared/design-system`, `shared/monitoring`.
- **Forbidden dependencies** — `entities`, `modules` (mapping is generic; domain errors extend the base in their module).
- **Example usage** — `src/shared/errors/app-error.ts`, `src/shared/errors/ErrorBoundary.tsx`, `src/shared/errors/map-error.ts`.
- **Future scalability** — A consistent error contract lets new error classes and recovery flows plug into existing boundaries app-wide.

### `shared/monitoring/`

- **Purpose** — Observability behind ports: Sentry, OpenTelemetry-web, Web Vitals.
- **Responsibilities** — Init monitoring, capture exceptions/traces/vitals via a port, correlate with logs.
- **Rules** — MUST sit behind an abstraction (Phase 1 §4). MUST respect privacy/consent. NEVER import a vendor SDK in components.
- **Allowed dependencies** — `shared/core` (ports), `shared/logger`, `shared/config`.
- **Forbidden dependencies** — `entities`, `modules`; vendor imports outside adapters.
- **Example usage** — `src/shared/monitoring/sentry.adapter.ts`, `src/shared/monitoring/web-vitals.ts`.
- **Future scalability** — Vendors swap behind ports; tracing/profiling deepen without code-wide changes; SLO instrumentation added centrally.

### `shared/workers/`

- **Purpose** — Web Workers for heavy compute and background sync.
- **Responsibilities** — Off-main-thread work: large list virtualization prep, CSV/PDF generation, crypto, the sync worker driving the Outbox.
- **Rules** — MUST be self-contained, message-passing modules (no DOM). MUST be domain-light (operate on plain data passed in). NEVER block the main thread for heavy work.
- **Allowed dependencies** — `shared/core`, `shared/lib`, `shared/offline`.
- **Forbidden dependencies** — React, DOM, `modules`/`entities` UI.
- **Example usage** — `src/shared/workers/sync.worker.ts`, `src/shared/workers/pdf.worker.ts`.
- **Future scalability** — More compute offloads to workers as data volumes grow; keeps the UI at 60fps over a decade of feature growth.

### `shared/offline/`

- **Purpose** — The offline-first engine: Outbox + sync.
- **Responsibilities** — Queue mutations locally (Outbox pattern), sync when online with a conflict policy, expose online/offline + sync status (Phase 1 §10).
- **Rules** — Writes MUST go through the Outbox when offline; **never silent data loss**. MUST surface explicit sync state. NEVER bypass the queue for offline mutations.
- **Allowed dependencies** — `shared/lib` (storage/idb), `shared/api`, `shared/workers`, `shared/core`, `shared/cache`.
- **Forbidden dependencies** — `entities`, `modules` (modules enqueue via shared API, not vice-versa).
- **Example usage** — `src/shared/offline/outbox.ts`, `src/shared/offline/sync-engine.ts`.
- **Future scalability** — Conflict-resolution strategies (LWW→CRDT) evolve behind the engine; the offline contract stays stable as more modules become offline-capable.

### `shared/cache/`

- **Purpose** — Cache strategies and query persistence configuration.
- **Responsibilities** — TanStack Query persistence to IndexedDB, cache TTL/GC policy, stale-while-revalidate config, cache busting on version change.
- **Rules** — MUST configure caching generically; module query-keys define _what_ is cached, this defines _how_. NEVER cache server data outside Query (Phase 1 §9).
- **Allowed dependencies** — `shared/lib` (query/storage), `shared/api` (query client), `shared/core`.
- **Forbidden dependencies** — `entities`, `modules`.
- **Example usage** — `src/shared/cache/persist-query-client.ts`, `src/shared/cache/cache-policy.ts`.
- **Future scalability** — Persistence backends and eviction policies tune centrally; supports large offline datasets and cache versioning across releases.

---

## 5. Module template folders (`modules/<name>/*`)

> Every module is **identical** in shape ([README §2](./README.md#2-authoritative-module-template-every-module-is-identical)) and is a **mini Clean Architecture**:
> `Presentation (pages, components, hooks, store) → Application (services) → Domain (types, schemas, validators, constants) ← Infrastructure (api, repositories, mappers, adapters)`.
> **Intra-module rule:** Presentation never imports Infrastructure directly — it goes through `services`/`hooks`. Infrastructure depends on Domain interfaces, never the reverse. This _is_ the Phase 1 backend-independence pipeline, localized. Worked example: [FeatureArchitecture.md](./FeatureArchitecture.md). Naming: [NamingConvention.md](./NamingConvention.md).
>
> **Module-level deps (inherited by all folders below):** a module MAY import other modules **via `index.ts` only**, plus `entities` and `shared`. It MUST NOT import `app`, `processes`, or another module's internals.

---

### `modules/<name>/index.ts` — Public API

- **Purpose** — The **single legal import surface** of the module; the membrane that hides every internal file.
- **Responsibilities** — Re-export the module's public components, hooks, types (Models, type-only), `routes`, and `permissions`. Nothing else.
- **Rules** — MUST export **only** what other modules/app/processes legitimately need. MUST NEVER export DTOs, schemas, repositories, or internal stores. Deep-importing past this file is forbidden and linted.
- **Allowed dependencies** — Re-exports from within its own module only.
- **Forbidden dependencies** — Re-exporting another module's internals; exporting Infrastructure types.
- **Example usage** — `src/modules/prescriptions/index.ts` → `export { WritePrescription } from './pages/WritePrescriptionPage'; export { usePrescription } from './hooks/use-prescription'; export type { Prescription } from './types/prescription.types'; export { prescriptionRoutes } from './routes'; export { prescriptionPermissions } from './permissions';`
- **Future scalability** — Because all access is through this one file, the module's internals can be totally refactored — or the module extracted to a remote — with zero changes for consumers. See [DependencyRules.md](./DependencyRules.md).

### `modules/<name>/routes.tsx` — Route subtree

- **Purpose** — The module's lazy-loaded route subtree, composed by `app/router`.
- **Responsibilities** — Declare route objects (path + lazy `pages` element + guards + metadata) for this module.
- **Rules** — MUST lazy-load pages (code-split per route). MUST reference path constants from `routes`/`shared/config`. NEVER import another module's pages.
- **Allowed dependencies** — own `pages`, `permissions`, `shared/guards`, `routes`/`shared/config`.
- **Forbidden dependencies** — other modules' pages; `app` internals.
- **Example usage** — `src/modules/appointments/routes.tsx` exporting `appointmentRoutes`.
- **Future scalability** — Route-level splitting keeps initial bundle small as modules multiply; federated remotes contribute routes the same way.

### `modules/<name>/permissions.ts` — RBAC definitions

- **Purpose** — Declare the module's permissions (the RBAC vocabulary it introduces).
- **Responsibilities** — Define permission constants/enums (e.g. `prescriptions.write`) consumed by `shared/permissions` and guards.
- **Rules** — MUST declare, not evaluate (evaluation is `shared/permissions`). MUST use the global permission naming scheme. NEVER hardcode role checks in components.
- **Allowed dependencies** — `shared/config` (permission types), `shared/core`.
- **Forbidden dependencies** — other modules; evaluation logic.
- **Example usage** — `src/modules/prescriptions/permissions.ts` → `export const prescriptionPermissions = { write: 'prescriptions.write' } as const;`
- **Future scalability** — Per-module permission registries aggregate into the global catalog; supports fine-grained, tenant-scoped RBAC growth.

### `modules/<name>/README.md` — Module overview

- **Purpose** — Human-facing overview of the module.
- **Responsibilities** — State the module's purpose, owners (CODEOWNERS), public API summary, and its dependencies.
- **Rules** — MUST be kept current with the public API. MUST name owners. NEVER let it drift from `index.ts`.
- **Allowed dependencies** — n/a (docs).
- **Forbidden dependencies** — n/a.
- **Example usage** — `src/modules/billing/README.md`.
- **Future scalability** — Onboarding stays module-local; new team members read one file to be productive in a context.

### `modules/<name>/BRAIN.md` — Module brain notes

- **Purpose** — The module's permanent local memory: decisions, registries, TODOs, tech debt.
- **Responsibilities** — Record module-local ADRs/decisions, local registries (entities, flags), known debt, and follow-ups; feeds the global PROJECT_BRAIN.
- **Rules** — MUST be updated when a module decision/structure changes (AI + human workflow, see [BrainRules.md](./BrainRules.md)). NEVER store secrets.
- **Allowed dependencies** — n/a (docs).
- **Forbidden dependencies** — n/a.
- **Example usage** — `src/modules/pharmacy/BRAIN.md` (records the dispense conflict policy decision).
- **Future scalability** — Distributed memory scales institutional knowledge across many teams and a 10-year lifespan without one giant unreadable doc.

---

#### Presentation ring

### `modules/<name>/pages/`

- **Purpose** — Route-level screens for the module — **composition only**.
- **Responsibilities** — Lay out and wire the module's `components`, call `hooks` for data/state, define the 4 async states (loading/empty/error/success — Phase 1 §11).
- **Rules** — MUST be thin: composition + wiring, **no business logic, no direct data access**. MUST get data via `hooks`/`services`, never repositories/api directly. One page per route.
- **Allowed dependencies** — own `components`, `hooks`, `store`, `config`; `entities`, `shared/design-system`; other modules via `index.ts`.
- **Forbidden dependencies** — own `repositories`/`api`/`mappers` directly; another module's internals.
- **Example usage** — `src/modules/consultation/pages/ConsultationPage.tsx`.
- **Future scalability** — Thin pages mean UI re-skins and layout changes are cheap; routes split lazily.

### `modules/<name>/components/`

- **Purpose** — Module-local **presentational** components (domain-aware but feature-specific).
- **Responsibilities** — Render module UI (forms, panels, cards) using the design system + tokens + i18n keys; emit events upward.
- **Rules** — MUST be presentational (logic flows in via props/hooks). MUST use `shared/design-system` primitives, tokens, and i18n keys only. NEVER fetch data or call repositories.
- **Allowed dependencies** — `shared/design-system`, `shared/*`, own `hooks`/`types`, `entities` display atoms.
- **Forbidden dependencies** — own `repositories`/`api`/`services` directly; another module's internals; hardcoded strings/colors.
- **Example usage** — `src/modules/consultation/components/VitalsPanel.tsx`.
- **Future scalability** — Components reusable across the module's pages; promotable to `entities`/`design-system` when reuse is proven (Rule of Three).

### `modules/<name>/hooks/`

- **Purpose** — Module-local React hooks bridging Presentation and Application.
- **Responsibilities** — Expose data/state to components by calling `services` (and Query hooks via `api`), manage local view-models and side effects.
- **Rules** — Hooks are the **legal bridge** from UI to logic. MUST call `services` (or own `api` Query hooks), never repositories directly for writes/business rules. NEVER embed business rules (those live in `services`).
- **Allowed dependencies** — own `services`, `api` (Query hooks), `store`, `types`; `shared/hooks`; `entities` hooks.
- **Forbidden dependencies** — own `repositories`/`mappers` directly; another module's internals.
- **Example usage** — `src/modules/prescriptions/hooks/use-write-prescription.ts`.
- **Future scalability** — Hooks insulate components from how data is produced; service/infrastructure refactors don't touch UI.

### `modules/<name>/store/`

- **Purpose** — Module-local Zustand store for **UI state only**.
- **Responsibilities** — Hold transient view state (active tab, selected row, wizard step, draft toggles).
- **Rules** — MUST hold **UI state only** — **never server data** (TanStack Query is the only home — Phase 1 §9). MUST be slice/selector-based. NEVER duplicate Query cache.
- **Allowed dependencies** — `shared/store` helpers, `shared/core`, own `types`.
- **Forbidden dependencies** — server data; another module's store; `repositories`/`api`.
- **Example usage** — `src/modules/queue/store/queue-ui.store.ts` (selected lane filter).
- **Future scalability** — Local UI state stays small and contained; global state isn't polluted as modules grow.

---

#### Application ring

### `modules/<name>/services/`

- **Purpose** — **Use-cases / business logic** — the application layer that orchestrates repositories to fulfill an intent.
- **Responsibilities** — Encode business rules and workflows (e.g. "dispense medicine = validate stock, decrement, record"), orchestrate one or more repositories, return Models/Results.
- **Rules** — MUST be **framework-agnostic** (no React, no JSX). MUST depend on repository **interfaces** (Domain contracts), not concrete impls. NEVER touch HTTP/DTOs directly or import UI.
- **Allowed dependencies** — own `repositories` (via interface), `mappers`, `types`, `validators`, `constants`, `adapters`; `entities`; `shared/core`/`lib`.
- **Forbidden dependencies** — own `pages`/`components`/`hooks` (no upward); React; raw `api` HTTP details.
- **Example usage** — `src/modules/pharmacy/services/dispense.service.ts`.
- **Future scalability** — Business rules are testable in isolation and independent of UI/transport; the stable place where domain behavior accrues over a decade.

---

#### Domain ring (the stable core)

### `modules/<name>/types/`

- **Purpose** — The module's **domain Models** (and DTO types) — the stable, UI-shaped contracts.
- **Responsibilities** — Define `Prescription`, `DispenseRecord` Models (UI-facing, backend-independent) and the DTO types used at the boundary.
- **Rules** — Models MUST be stable and UI-shaped; DTO types stay confined to the boundary (api/mappers). NEVER leak DTOs through the public API. Type-only.
- **Allowed dependencies** — `shared/types`, `entities` types.
- **Forbidden dependencies** — runtime code; another module's internals.
- **Example usage** — `src/modules/prescriptions/types/prescription.types.ts`.
- **Future scalability** — Backend reshapes are absorbed in mappers; Models barely change — this is the heart of "10 years without a rewrite" (Phase 1 §5.3).

### `modules/<name>/schemas/`

- **Purpose** — Zod schemas: **DTO validation** (boundary parse) + **form schemas** (RHF resolver).
- **Responsibilities** — Validate raw responses at the boundary and validate form input before submit.
- **Rules** — DTO schemas MUST parse at the boundary (in `api`/`mappers`) and **never escape** the module. Form schemas pair with RHF. NEVER skip boundary validation.
- **Allowed dependencies** — Zod, `shared/schemas`/`validators`, own `types`.
- **Forbidden dependencies** — UI; another module's schemas.
- **Example usage** — `src/modules/prescriptions/schemas/prescription.schema.ts`.
- **Future scalability** — Schema-as-contract catches backend drift early; shared building blocks keep validation DRY as the module grows.

### `modules/<name>/validators/`

- **Purpose** — **Domain** validation rules (business invariants beyond shape).
- **Responsibilities** — Enforce clinic rules (e.g. "max dose for age", "no duplicate active Rx"), usable by services and forms.
- **Rules** — MUST encode domain invariants (not generic format checks — those are `shared/validators`). MUST be pure. NEVER reach into UI/HTTP.
- **Allowed dependencies** — own `types`, `constants`; `entities`; `shared/validators`/`utils`.
- **Forbidden dependencies** — UI, `api`, another module's internals.
- **Example usage** — `src/modules/prescriptions/validators/max-dose.validator.ts`.
- **Future scalability** — Business rules live in one place, versioned and tested; regulatory changes are localized edits.

### `modules/<name>/constants/`

- **Purpose** — Module-scoped domain constants.
- **Responsibilities** — Enums/thresholds specific to the module (e.g. dispense statuses, default durations).
- **Rules** — MUST be domain-specific and immutable (`as const`). Generic constants belong in `shared/constants`. NEVER duplicate global constants.
- **Allowed dependencies** — own `types`; `shared/constants`.
- **Forbidden dependencies** — UI, `api`, other modules.
- **Example usage** — `src/modules/queue/constants/queue.constants.ts` (`MAX_QUEUE_SIZE`).
- **Future scalability** — Tunable domain parameters localized; easy to audit and adjust per policy.

---

#### Infrastructure ring

### `modules/<name>/repositories/`

- **Purpose** — Data access: repository **interface + implementation**, returning domain **Models** (never DTOs).
- **Responsibilities** — Implement reads/writes by calling `api`, Zod-parsing responses, and using `mappers` to return Models; depend on `shared/api`'s `HttpClient`/`BaseRepository`.
- **Rules** — MUST return **Models**, never DTOs. MUST define an interface (Domain contract) that `services` depend on. NEVER expose HTTP details upward; never import UI.
- **Allowed dependencies** — own `api`, `mappers`, `schemas`, `types`; `shared/api`/`core`/`errors`; `entities` (Models/keys).
- **Forbidden dependencies** — own `pages`/`components`/`hooks`/`services` (no upward); another module's internals; UI.
- **Example usage** — `src/modules/prescriptions/repositories/prescription.repository.ts`.
- **Future scalability** — Transport/endpoint changes are absorbed here; services and UI never notice. Swappable impls enable testing and federation.

### `modules/<name>/api/`

- **Purpose** — Endpoints + TanStack Query/mutation hooks + raw HTTP calls.
- **Responsibilities** — Define endpoint paths, build typed requests via `shared/api` HttpClient, expose Query/mutation hooks + query-key factory, parse DTOs with `schemas`.
- **Rules** — DTOs/raw shapes MUST stay confined here (and `mappers`). Query hooks MUST be consumed via module `hooks`, not directly by components. NEVER let a DTO cross the public API; never call another module's api.
- **Allowed dependencies** — `shared/api`, own `schemas`/`types`/`mappers`; `shared/lib` (query).
- **Forbidden dependencies** — UI components; another module's api; exporting DTOs through `index.ts`.
- **Example usage** — `src/modules/prescriptions/api/prescription.queries.ts`, `…/prescription.endpoints.ts`.
- **Future scalability** — Endpoint surface evolves with the backend behind the repository; Query keys enable precise cache invalidation as data grows.

### `modules/<name>/mappers/`

- **Purpose** — Pure **DTO ⇄ Model** mapping — the only place that knows both shapes.
- **Responsibilities** — `toModel(dto)` and `toDto(model)`; the single bridge between backend and domain shapes.
- **Rules** — MUST be **pure** functions. MUST be the **only** place both DTO and Model are referenced together. NEVER contain business logic, fetching, or React.
- **Allowed dependencies** — own `types` (Model + DTO), `schemas`; `entities` mappers; `shared/utils`.
- **Forbidden dependencies** — UI, `services`, network calls.
- **Example usage** — `src/modules/prescriptions/mappers/prescription.mapper.ts` (backend `rx_items` → Model `items`).
- **Future scalability** — A backend rename = one mapper edit, zero component edits — the concrete mechanism of backend independence (Phase 1 §5.3).

### `modules/<name>/adapters/`

- **Purpose** — Adapt **third-party** or **cross-module** contracts into the module's expected shape.
- **Responsibilities** — Wrap an external SDK or another module's public API into a local interface the services depend on (anti-corruption layer).
- **Rules** — MUST isolate foreign contracts behind a local interface. Cross-module access MUST go through the other module's `index.ts`. NEVER let a foreign type leak into services/domain.
- **Allowed dependencies** — other modules via `index.ts`, `entities`, `shared/*`, external SDKs (wrapped).
- **Forbidden dependencies** — another module's internals; leaking vendor types into Domain.
- **Example usage** — `src/modules/billing/adapters/payment-gateway.adapter.ts` (wraps a Stripe-like SDK); `…/patient.adapter.ts` (adapts `entities/patient`).
- **Future scalability** — Vendor or cross-module contract changes are absorbed in the adapter (anti-corruption layer), keeping the domain pristine for a decade.

---

#### Module support folders

### `modules/<name>/utils/`

- **Purpose** — Module-scoped **pure** utilities.
- **Responsibilities** — Small helpers used across the module (formatting specific to this domain, derivations).
- **Rules** — MUST be pure and module-specific. Generic helpers belong in `shared/utils`. NEVER hold state or call services/api.
- **Allowed dependencies** — own `types`/`constants`; `shared/utils`.
- **Forbidden dependencies** — `services`, `api`, UI, other modules.
- **Example usage** — `src/modules/billing/utils/calc-line-total.ts`.
- **Future scalability** — Stays local until proven reusable, then promotes to `shared` (Rule of Three) — avoids premature abstraction.

### `modules/<name>/config/`

- **Purpose** — Module configuration and feature flags.
- **Responsibilities** — Module-local flags, defaults, tunables; read from `shared/config` where global.
- **Rules** — MUST be config/contracts only — no behavior. Global config stays in `shared/config`. NEVER hardcode env values.
- **Allowed dependencies** — `shared/config`, own `constants`/`types`.
- **Forbidden dependencies** — behavior, other modules.
- **Example usage** — `src/modules/queue/config/queue.flags.ts`.
- **Future scalability** — Per-module flags enable safe progressive rollout and experimentation as the module evolves.

### `modules/<name>/tests/`

- **Purpose** — Module **integration** tests (unit tests stay co-located with source).
- **Responsibilities** — Test cross-folder flows within the module (service + repository + mapper against MSW), and key user flows on pages.
- **Rules** — MUST test behavior via the public surface where possible; use `src/testing` helpers and `src/mock` handlers. NEVER ship in production. Unit tests stay beside their source file.
- **Allowed dependencies** — own module (via internals for white-box integration), `src/testing`, `src/mock`, test libs.
- **Forbidden dependencies** — production bundle inclusion.
- **Example usage** — `src/modules/prescriptions/tests/write-prescription.integration.test.tsx`.
- **Future scalability** — Module-scoped integration suites give fast, parallel, ownership-aligned confidence as the module count scales.

---

## 6. `assets/*` — Static asset sub-folders

> All inherit `assets` rules (§2): static only, no logic, imported-by but importing-nothing.

| Folder               | Purpose                 | Responsibilities                                                                    | Rules                                                                                                                                                              | Allowed deps | Forbidden deps | Example                                          | Future scalability                                                                            |
| -------------------- | ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | -------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `assets/fonts/`      | Self-hosted brand fonts | Hold Plus Jakarta Sans (headings) + Inter (body) web fonts; subset/variable formats | MUST be self-hosted (privacy/perf); MUST match typography tokens (Phase 1 §6.3); NEVER load fonts from third-party CDNs at runtime                                 | none (leaf)  | code layers    | `src/assets/fonts/Inter-Variable.woff2`          | New scripts (Devanagari, Arabic for ur) add font files for full multilingual rendering        |
| `assets/icons/`      | Icon SVG source         | Brand marks + any lucide overrides as SVG source                                    | MUST be optimized SVG; consumed via the `Icon` design-system wrapper (consistent stroke/size tokens); NEVER inline raw `<svg>` with hardcoded colors in components | none (leaf)  | code layers    | `src/assets/icons/logo-mark.svg`                 | Icon set grows additively; can be packaged or sprite-built; theming via `currentColor`/tokens |
| `assets/images/`     | Raster/SVG imagery      | Logos, illustrations, empty-state art, onboarding imagery                           | MUST be optimized (compressed, responsive); MUST NOT bake in localizable text; prefer SVG for crispness                                                            | none (leaf)  | code layers    | `src/assets/images/empty-appointments.svg`       | Per-tenant/brand image sets and CDN offload slot in without code changes                      |
| `assets/animations/` | Motion assets           | Lottie/JSON animations (sync success, loaders, celebratory micro-interactions)      | MUST be gated by `prefers-reduced-motion` at the consumer; MUST be lightweight; NEVER autoplay distracting motion (Phase 1 calm-by-default)                        | none (leaf)  | code layers    | `src/assets/animations/sync-success.lottie.json` | Motion library grows additively; reduced-motion fallbacks keep a11y intact at scale           |

---

## 7. Testing, mock, locales, docs, brain (consolidated)

These top-level folders are fully catalogued in §2 (`testing/`, `mock/`, `locales/`, and repo-root `docs/`, `docs/brain/`, `scripts/`). Summary of where each cross-cutting artifact lives, harmonized with the Phase 1 co-location rules ([../Folder-Structure.md §7–§8](../Folder-Structure.md)):

| Artifact                           | Home                                                     | Rule                                            |
| ---------------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| Unit / integration test (per file) | **co-located** `*.test.tsx` beside source                | Never a parallel mirror tree                    |
| Module integration test            | `modules/<name>/tests/`                                  | Cross-folder flows within the module            |
| Shared render/a11y/fixtures        | `src/testing/`                                           | Reused by all layers; test-only                 |
| MSW handlers + seed + server       | `src/mock/`                                              | Enables backend independence; env-gated         |
| Storybook story                    | **co-located** `*.stories.tsx` beside component          | Host config in `.storybook/`                    |
| i18n message catalogs              | `src/locales/<lang>/<namespace>.json`                    | Namespace = area; lazy-loaded                   |
| i18n engine/setup                  | `shared/localization/`                                   | Loads catalogs; runtime switch                  |
| Design tokens                      | `shared/styles/tokens.css` (+ `shared/config/tokens.ts`) | Single token source                             |
| Permissions catalog / engine       | `shared/config/permissions.ts` / `shared/permissions/`   | Declare vs evaluate                             |
| Project memory                     | `docs/brain/PROJECT_BRAIN.md` + per-module `BRAIN.md`    | Maintained per [BrainRules.md](./BrainRules.md) |
| Automation / generators            | `scripts/`                                               | Not imported by `src/` runtime                  |

---

## 8. Master decision table — "I'm building X → it belongs in Y because Z"

Use this when you are unsure where a new file or folder goes. (Extends the Phase 1 table in [../Folder-Structure.md §6](../Folder-Structure.md); full import legality in [DependencyRules.md](./DependencyRules.md).)

| I'm building…                                                       | It belongs in                                       | Because                                                  |
| ------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- | ------ | ------------ | ---------------------- |
| A generic `Button`/`Dialog`/`Skeleton` with **no clinic meaning**   | `shared/design-system/`                             | Domain-free, token-styled primitive; reusable everywhere |
| A backward-compatible re-export of a primitive                      | `shared/ui/` (alias)                                | Preserves Phase 1 `@/shared/ui` paths                    |
| A pure helper with **no domain**, used app-wide                     | `shared/utils/`                                     | Pure, reusable; promote here on Rule of Three            |
| A composed helper that touches **browser APIs**, no domain          | `shared/helpers/`                                   | One notch above utils; centralizes DOM quirks            |
| A generic React hook (`useDebounce`)                                | `shared/hooks/`                                     | Domain-free, reusable                                    |
| The `HttpClient` / base repository                                  | `shared/api/`                                       | Endpoint-agnostic transport scaffolding                  |
| A vendor wrapper (date lib, telemetry)                              | `shared/lib/`                                       | Swappable behind a small surface                         |
| A framework-agnostic primitive (`Result`, event bus, a **port**)    | `shared/core/`                                      | The kernel; no React, no vendor                          |
| A logging/analytics/monitoring **port + adapter**                   | `shared/logger` / `analytics` / `monitoring/`       | Vendor stays out of components (Phase 1 §4)              |
| A theme / token / global style                                      | `shared/theme/` + `shared/styles/`                  | Single token source; semantic re-map only                |
| The RBAC engine / `<Can>`                                           | `shared/permissions/`                               | Single authority for "may the user do X"                 |
| Toast/notification system                                           | `shared/notifications/`                             | Generic feedback channel, i18n-keyed                     |
| Outbox / sync engine                                                | `shared/offline/`                                   | Offline-first writes, never silent loss                  |
| Query persistence / cache policy                                    | `shared/cache/`                                     | Configures _how_ server data is cached                   |
| Web worker (heavy compute / sync)                                   | `shared/workers/`                                   | Off-main-thread, keeps UI at 60fps                       |
| HTTP interceptor / router middleware                                | `shared/middleware/`                                | Cross-cutting interception, ordered                      |
| A **global domain noun** used by many modules (`Patient`, `Clinic`) | `entities/<noun>/`                                  | One authoritative cross-module Model                     |
| A **domain noun used by only one module**                           | `modules/<name>/types/`                             | Module-local; promote to `entities` only when shared     |
| A **user capability / workflow** in one domain (verb)               | `modules/<name>/` (pages/components/hooks/services) | Bounded context owns its verbs                           |
| The **business rule** for a use-case                                | `modules/<name>/services/`                          | Application ring; framework-agnostic                     |
| **Data access** returning a Model                                   | `modules/<name>/repositories/`                      | Infrastructure; returns Models, never DTOs               |
| **Endpoints + Query hooks**                                         | `modules/<name>/api/`                               | DTOs confined here; consumed via `hooks`                 |
| **DTO ⇄ Model mapping**                                             | `modules/<name>/mappers/`                           | The only place both shapes meet (Phase 1 §5.3)           |
| **Wrap a 3rd-party SDK / another module**                           | `modules/<name>/adapters/`                          | Anti-corruption layer keeps domain clean                 |
| **UI-only state** (active tab, wizard step)                         | `modules/<name>/store/` or `shared/store/`          | Zustand for UI state; never server data (Phase 1 §9)     |
| **Server data** (patients, appointments)                            | TanStack Query (via `api/` Query hooks)             | The only home for remote state (Phase 1 §9)              |
| A **multi-module journey** (check-in→vitals→queue)                  | `processes/<journey>/`                              | Modules can't import each other; processes orchestrate   |
| A **global provider / router / layout / boundary**                  | `app/providers` / `router` / `layouts`              | Composition root; wires the whole tree                   |
| A **route path string**                                             | `routes/` (or `shared/config/routes.ts`)            | Single source of route strings                           |
| A **translation string**                                            | `locales/<lang>/<namespace>.json`                   | No hardcoded text, ever (Phase 1 Law 4)                  |
| A **brand font / icon / illustration / animation**                  | `assets/fonts                                       | icons                                                    | images | animations/` | Static asset, no logic |
| **MSW handlers / seed data**                                        | `mock/`                                             | Backend independence in dev + tests                      |
| **Shared render/a11y/fixtures**                                     | `testing/`                                          | Test-only infra, reused by all layers                    |

**The disambiguator (when still stuck):**

1. _Does it have clinic-domain meaning?_ No → `shared/*` (pick the sub-folder by concern). Yes → continue.
2. _Is it shared across modules?_ Yes & it's a noun → `entities/`. No → it lives **inside one module**.
3. _Inside a module, which ring?_ Screen/visual → Presentation (`pages`/`components`/`hooks`/`store`). Business rule → Application (`services`). Stable shape/rule → Domain (`types`/`schemas`/`validators`/`constants`). Data/transport/mapping → Infrastructure (`api`/`repositories`/`mappers`/`adapters`).
4. _Does it span multiple modules across screens?_ → `processes/`.

---

## 9. Cross-references

| Need                                                                               | Document                                           |
| ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| Phase 1 laws, tech stack, tokens, state rules                                      | [../Brain.md](../Brain.md)                         |
| Phase 1 canonical FSD tree, slice anatomy, public-API pattern, evolution playbooks | [../Folder-Structure.md](../Folder-Structure.md)   |
| Phase 2 architecture anchor (authoritative trees + ADR-0001)                       | [./README.md](./README.md)                         |
| Full import matrix, layer boundaries, anti-God / anti-coupling rules               | [DependencyRules.md](./DependencyRules.md)         |
| Module template responsibilities + worked end-to-end example                       | [FeatureArchitecture.md](./FeatureArchitecture.md) |
| Naming standards for files, folders, symbols, imports/exports                      | [NamingConvention.md](./NamingConvention.md)       |

---

_Phase 2 · Part 2 · Foundation v2 · 2026-06-27 · Owner: Frontend Architecture · Extends [Brain.md](../Brain.md) & [architecture/README.md](./README.md), never contradicts them._
