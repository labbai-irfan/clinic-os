# ClinicOS — Enterprise Frontend Architecture (Phase 2)

> **Phase 2 of the ClinicOS Frontend Engineering Bible.**
> This continues — and never contradicts — [Phase 1](../Brain.md). It scales the foundation to **thousands of clinics, millions of patients, hundreds of developers, and many frontend/backend teams**, for a **10+ year** lifespan across **Web · Tablet · future Mobile**.

This folder is the **authoritative enterprise architecture canon**. Read [Brain.md](../Brain.md) (Phase 1) first, then this file, then the documents below.

---

## 0. Relationship to Phase 1 (read this before anything)

Phase 1 ratified the **architectural laws**. Phase 2 ratifies the **physical organization at enterprise scale**. The laws are unchanged.

| Phase 1 law                                                                           | Phase 2 status                                                    |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Feature-Sliced Design + DDD + **Clean Architecture**                                  | ✅ Preserved — now applied _inside every module_                  |
| **Dependency Rule** (downward-only, public-API-only)                                  | ✅ Preserved — restated for top-level **and** intra-module layers |
| **Backend-independence pipeline** (HTTP→DTO→mapper→Model→Repository→Service→Query→UI) | ✅ Preserved — unchanged, lives inside each module                |
| **3-tier design tokens**, Plus Jakarta Sans + Inter                                   | ✅ Preserved                                                      |
| **WCAG 2.2 AA**, i18n (en/hi/mr/ur + RTL), 4 async states                             | ✅ Preserved                                                      |
| The 8 Non-Negotiable Laws                                                             | ✅ Preserved                                                      |

### The single structural evolution

Phase 1 used **flat top-level FSD layers** (`pages/ widgets/ features/ entities/`). At Phase 2 scale (hundreds of devs, many teams), a flat layout makes code-ownership and team boundaries blurry. Therefore:

> **Decision (ADR-0001 — ratified):** Feature/widget/page/local-entity slices are organized **by bounded context** inside `src/modules/<context>/`. Each module is an internally-layered **Clean Architecture** package with an identical folder template.

- **Why:** Clear team ownership (one module ≈ one team via CODEOWNERS), domain cohesion, parallel work without collisions, lazy-loadable boundaries, micro-frontend-ready.
- **Benefits:** Scales to hundreds of devs; onboarding is module-local; blast radius of change is contained.
- **Trade-offs:** Some cross-module entities need a home (solved via top-level `entities/`); risk of duplication across modules (solved via `shared/` + reuse-first rule).
- **Alternatives considered:** (a) Flat FSD layers — blurry ownership at scale. (b) Micro-frontends now — premature operational cost. (c) Nx-style libs — heavier tooling than needed today (kept as a future option).
- **Future scalability:** A module can later be extracted to its own package/repo or remote (Module Federation) with **zero import changes**, because all cross-module access already flows through `index.ts`.
- **Enterprise considerations:** Maps cleanly to team topologies, code ownership, and independent release cadences.

**Nothing else changes.** The dependency rule, the decoupling pipeline, tokens, a11y, and i18n are identical to Phase 1.

---

## 1. Authoritative top-level structure (`src/`)

```
src/
├── app/                  # Composition root: providers, router assembly, layouts, bootstrap, global error boundary
├── processes/            # Cross-MODULE journeys — the Patient Journey state machine spanning modules
├── modules/              # Domain BOUNDED CONTEXTS — self-contained, identically structured (see §2)
├── entities/             # GLOBAL domain entities shared across modules (patient, clinic, doctor, user, tenant)
├── shared/               # Non-domain, cross-cutting reuse (design-system, core, lib, api, infra ports…)
├── assets/               # fonts/ icons/ images/ animations/
├── routes/               # Global route manifest (path constants, route metadata)  [may live under shared/config]
├── testing/              # Test utilities, render helpers, fixtures, a11y harness
├── mock/                 # MSW handlers, seed data, mock server
└── locales/              # i18n catalogs: en/ hi/ mr/ ur/ <namespace>.json
```

**Top-level dependency order (downward-only):**

```
app → processes → modules → entities → shared
                     │
                     └── a module may use: entities, shared (never another module's internals — only its index.ts)
```

`shared/` and `entities/` know **nothing** about modules. `shared/` knows **nothing** about the domain.

### `shared/` expansion (where the Phase-2 folder list lives)

```
shared/
├── design-system/   # The UI Kit (Phase 1 shared/ui): tokenized components, primitives, CVA variants, stories
├── core/            # Framework-agnostic kernel: Result type, AppError base, DI container, event bus, ports
├── api/             # HttpClient interface + impl, base repository, query client, interceptors
├── lib/             # i18n, query, telemetry, storage, date, currency wrappers
├── hooks/           # Generic reusable hooks (useDebounce, useMediaQuery, useOnlineStatus)
├── providers/       # Domain-agnostic React providers
├── contexts/        # Domain-agnostic React contexts
├── store/           # Global UI stores (theme, locale, session, layout)
├── config/          # env, route registry, permissions catalog, feature flags
├── constants/       # Global constants
├── types/           # Global shared types
├── schemas/         # Global shared Zod schemas
├── validators/      # Reusable validators
├── utils/           # Pure utilities
├── helpers/         # Domain-agnostic composed helpers
├── guards/          # Route/permission guards
├── middleware/      # Request/response + router middleware
├── theme/           # Theme definitions + switching logic
├── styles/          # tokens.css, themes, global styles, mixins
├── localization/    # i18next setup + locale loaders
├── permissions/     # RBAC engine, <Can>, permission checks
├── notifications/   # Toast/notification system
├── analytics/       # Analytics port + adapters
├── logger/          # Logging port + adapters
├── errors/          # AppError taxonomy, error-boundary components, error mapping
├── monitoring/      # Sentry / OTel / Web-Vitals behind ports
├── workers/         # Web workers (heavy compute, sync)
├── offline/         # Outbox + sync engine
└── cache/           # Cache strategies, query persistence config
```

> Every folder's **Purpose · Responsibilities · Rules · Allowed deps · Forbidden deps · Example · Future scalability** is specified in [FolderStructure.md](./FolderStructure.md).

---

## 2. Authoritative module template (every module is identical)

```
modules/<module-name>/
├── index.ts          # PUBLIC API — the ONLY legal import surface for other modules / app / processes
├── routes.tsx        # Module route subtree (lazy-loaded)
├── permissions.ts    # Module permission definitions (RBAC)
├── README.md         # Module overview, owners, public API, dependencies
├── BRAIN.md          # Module Brain Notes (decisions, local registries, TODOs, debt)
├── pages/            # Route-level screens — composition only (Presentation)
├── components/       # Module-local presentational components (Presentation)
├── hooks/            # Module-local hooks (Presentation ⇄ Application)
├── services/         # Use-cases / business logic — orchestrate repositories (Application)
├── repositories/     # Data access: interface + impl, returns domain Models (Infrastructure)
├── api/              # Endpoints + TanStack Query/mutation hooks + http calls (Infrastructure)
├── mappers/          # DTO ⇄ Model pure mapping (Infrastructure→Domain boundary)
├── adapters/         # Adapt 3rd-party / cross-module contracts (Infrastructure)
├── types/            # Module domain Models + DTO types (Domain)
├── schemas/          # Zod schemas: DTO validation + form schemas (Domain)
├── validators/       # Domain validation rules (Domain)
├── constants/        # Module constants (Domain)
├── utils/            # Module pure utilities
├── store/            # Module-local Zustand store (UI state only — never server data)
├── config/           # Module config + feature flags
└── tests/            # Module integration tests (unit tests co-located with source)
```

### Each module is a mini Clean Architecture

```
Presentation (pages, components, hooks, store)
        ↓ may call
Application (services / use-cases)
        ↓ depends on interfaces of
Domain (types/models, schemas, validators, constants)   ← the stable core
        ↑ implemented by
Infrastructure (api, repositories, mappers, adapters)
```

**Intra-module dependency rule:** Presentation never imports Infrastructure directly — it goes through `services`/`hooks`. Infrastructure depends on Domain interfaces, never the reverse. This **is** the Phase 1 backend-independence pipeline, localized.

### The canonical module set (bounded contexts)

`patients · appointments · queue · consultation · prescriptions · pharmacy · billing · follow-up · records · analytics · settings · doctor · reception · admin`

> Full responsibilities and a worked example live in [FeatureArchitecture.md](./FeatureArchitecture.md).

---

## 3. Cross-module communication (the rules in brief)

1. A module imports another module **only via its `index.ts`** — never deep paths.
2. Multi-module journeys (e.g. check-in → vitals → queue) are orchestrated in `processes/`, not by chaining module imports.
3. Shared domain → `entities/`. Shared non-domain → `shared/`. Never duplicate.
4. No circular module dependencies — enforced by `eslint-plugin-boundaries` + `import/no-cycle`.

> Full import matrix and anti-coupling/anti-God rules: [DependencyRules.md](./DependencyRules.md).

---

## 4. The Phase 2 document canon

| Document                                           | Part  | Purpose                                                                   |
| -------------------------------------------------- | ----- | ------------------------------------------------------------------------- |
| [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)      | 1, 10 | **Permanent project memory** — vision, standards, and all live registries |
| [Architecture.md](./Architecture.md)               | 7     | Enterprise architecture narrative: layers, scale, flows                   |
| [FolderStructure.md](./FolderStructure.md)         | 2     | Every folder with the 7-field contract                                    |
| [ProjectStructure.md](./ProjectStructure.md)       | 3     | File organization, module communication, barrels, ownership               |
| [FeatureArchitecture.md](./FeatureArchitecture.md) | 4     | The module template + each folder's responsibility + example              |
| [NamingConvention.md](./NamingConvention.md)       | 5     | Naming standards for everything                                           |
| [DependencyRules.md](./DependencyRules.md)         | 6     | Import matrix, layer boundaries, anti-God rules                           |
| [Diagrams.md](./Diagrams.md)                       | 7     | 10 architecture diagrams (mermaid)                                        |
| [BrainRules.md](./BrainRules.md)                   | —     | How PROJECT_BRAIN + registries are maintained                             |
| [AI_RULES.md](./AI_RULES.md)                       | 8     | AI development rules + mandatory update workflow                          |
| [DeveloperGuide.md](./DeveloperGuide.md)           | —     | Onboarding + build-a-feature end-to-end                                   |

> Phase 1 canon (still authoritative): [Brain.md](../Brain.md), [Frontend-Foundation-Blueprint.md](../Frontend-Foundation-Blueprint.md), [Architecture.md](../Architecture.md), [Frontend-Bible.md](../Frontend-Bible.md), [Folder-Structure.md](../Folder-Structure.md), [Naming-Convention.md](../Naming-Convention.md), [Coding-Standards.md](../Coding-Standards.md), [Developer-Rules.md](../Developer-Rules.md), [AI-Rules.md](../AI-Rules.md), [Project-Checklist.md](../Project-Checklist.md).

---

## 5. Governance

Every decision in this canon carries the **Decision Contract**: _Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations_. Structural changes require an **ADR** (`docs/adr/NNNN-*.md`) and a PROJECT_BRAIN update. This blueprint governs **every future phase**.

_Phase 2 · Foundation v2 · 2026-06-27 · Owner: Frontend Architecture_
