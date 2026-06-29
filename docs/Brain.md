# 🧠 ClinicOS — Brain.md

> **This file is the single source of truth for the ClinicOS frontend.**
> Every human developer and every AI agent must read this file **before** writing a single line of code or documentation.
> If a decision is not written here (or in a document linked from here), it is **not yet decided** — propose it, get it ratified, then record it here.

---

## 0. How to use this Brain

| If you are…     | Read this first                                                                                 | Then                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| A new developer | This file → [Architecture.md](./Architecture.md) → [Folder-Structure.md](./Folder-Structure.md) | Skim [Coding-Standards.md](./Coding-Standards.md) before your first PR |
| An AI agent     | This file → [AI-Rules.md](./AI-Rules.md)                                                        | Obey the **Dependency Rule** and **Token Rule** without exception      |
| A reviewer      | [Developer-Rules.md](./Developer-Rules.md) → [Project-Checklist.md](./Project-Checklist.md)     | Block any PR that violates a "NEVER"                                   |
| A designer      | [Frontend-Bible.md](./Frontend-Bible.md) (Design System)                                        | Tokens are the contract                                                |
| An architect    | [Frontend-Foundation-Blueprint.md](./Frontend-Foundation-Blueprint.md)                          | The 40-section master document                                         |

**Golden loop:** Read Brain → Find the right layer → Use the public API → Consume tokens & i18n keys → Never break the Dependency Rule → Update the docs.

---

## 1. What ClinicOS is

ClinicOS is **not** a Clinic Management System. It is a **Clinic Operating System** — the digital nervous system of a clinic that orchestrates the _entire lifetime patient journey_:

```
Appointment → Check-In → Vitals → Queue → Consultation → Prescription
   → Pharmacy → Billing → Follow-Up → Recovery → Lifetime Medical Record
```

Each arrow is a **state transition** in a long-running domain process. The frontend's job is to make each step feel like **one calm screen, one primary task, one primary action** — usable by someone who can use WhatsApp, including elderly, low-literacy, and non-English-reading users.

**Time horizon:** Architect for **10+ years without a rewrite.** Optimize for _change_, not for _today_.

---

## 2. Non-negotiable product laws

1. **One Screen · One Primary Task · One Primary CTA.** Never overwhelm.
2. **Calm by default.** Minimal motion, generous spacing, large readable type.
3. **Accessibility is a feature, not a setting.** WCAG 2.2 AA is the floor.
4. **Every string is localized.** No hardcoded human-readable text. Ever.
5. **Every color/size/space is a token.** No hardcoded visual values. Ever.
6. **The UI never talks to the backend directly.** It talks to _services_ and _repositories_.
7. **The frontend is backend-independent.** Backend can reshape APIs without a UI rewrite.
8. **Simplicity beats cleverness.** If a junior can't read it, rewrite it.

> These eight laws are enforced in [Developer-Rules.md](./Developer-Rules.md) and checked in [Project-Checklist.md](./Project-Checklist.md).

---

## 3. Target users (design constraints, not personas)

| User                           | Hard constraint they impose                                          |
| ------------------------------ | -------------------------------------------------------------------- |
| Super Admin                    | Multi-tenant, role/permission matrix, audit visibility               |
| Clinic Owner                   | Dashboards that read at a glance; bento KPIs                         |
| Doctor                         | Speed + zero friction during consultation; keyboard-first            |
| Receptionist                   | High-throughput data entry; large targets; few clicks                |
| Pharmacist                     | Clear stock/dispense flows; error-proofing                           |
| Patient                        | Self-service simplicity; mobile-first; trust                         |
| Elderly / low digital literacy | Large Text Mode, large touch targets, icons + words                  |
| Non-English readers            | Full localization (en, hi, mr, ur…), RTL, language switch w/o reload |

**Litmus test for every screen:** _Could a non-technical 65-year-old complete the primary task on the first try, in their language?_

---

## 4. Authoritative tech stack

> This list is **authoritative**. Do not introduce alternatives without an ADR (see [Documentation-Guidelines.md](./Documentation-Guidelines.md)).

| Concern                | Choice                                                            | Notes                                                              |
| ---------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| Language               | **TypeScript 5 (strict)**                                         | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Build/dev              | **Vite 5**                                                        | Fast HMR, ESBuild, code-splitting                                  |
| UI runtime             | **React 18**                                                      | Concurrent features, Suspense                                      |
| Routing                | **React Router v6 (data router)**                                 | Loaders/actions optional; route-level code split                   |
| Server state           | **TanStack Query v5**                                             | The _only_ place server data lives                                 |
| Client/UI state        | **Zustand**                                                       | Small, slice-based, no boilerplate                                 |
| Forms                  | **React Hook Form + Zod resolver**                                | Uncontrolled, performant                                           |
| Schema/validation      | **Zod**                                                           | DTO parsing at the boundary + form schemas                         |
| Styling                | **Tailwind CSS (token-mapped)** + **CVA** + **tailwind-merge**    | Tailwind theme reads _only_ from CSS-variable tokens               |
| Design tokens          | **CSS custom properties (3-tier)**                                | Primitive → Semantic → Component                                   |
| i18n                   | **i18next + react-i18next + ICU**                                 | Lazy locale bundles, RTL, runtime switch                           |
| Icons                  | **lucide-react**                                                  | Tree-shakeable, consistent stroke                                  |
| HTTP                   | **Typed client behind `HttpClient` interface**                    | Swappable (fetch/axios); never imported in UI                      |
| Server mocking         | **MSW**                                                           | Dev + tests; enables backend independence                          |
| Unit/integration tests | **Vitest + React Testing Library**                                | Test behavior, not implementation                                  |
| E2E tests              | **Playwright**                                                    | Critical patient-journey flows                                     |
| A11y testing           | **axe-core / jest-axe + Playwright**                              | CI gate                                                            |
| Component docs         | **Storybook**                                                     | Every shared UI component has stories                              |
| Offline                | **Workbox SW + IndexedDB (idb) + Query persistence + Outbox**     | See §10                                                            |
| Errors/monitoring      | **Sentry + Web Vitals + OpenTelemetry-web**                       | Behind an abstraction                                              |
| Analytics              | **Provider-agnostic `analytics` port**                            | No vendor SDK in components                                        |
| Lint/format            | **ESLint (+ boundaries, import-sort, jsx-a11y, i18n) + Prettier** | Architecture is _linted_                                           |
| Hooks/CI gates         | **Husky + lint-staged + Changesets**                              |                                                                    |

---

## 5. Architecture in one picture

ClinicOS frontend = **Feature-Sliced Design (FSD)** for _structure_ + **Domain-Driven Design** for _language_ + **Clean Architecture** (Repository/Service/DTO) for _decoupling_.

### 5.1 Layers (top may import from below — **never upward, never sideways except via public API**)

```
┌─────────────────────────────────────────────┐
│  app        composition root: providers,     │  ← bootstraps everything
│             router, global styles, boundaries│
├─────────────────────────────────────────────┤
│  processes  cross-feature journeys           │  ← the Patient Journey orchestration
├─────────────────────────────────────────────┤
│  pages      route-level screens              │  ← compose widgets/features
├─────────────────────────────────────────────┤
│  widgets    large self-sufficient UI blocks  │
├─────────────────────────────────────────────┤
│  features   user capabilities (verbs)        │  ← book-appointment, record-vitals
├─────────────────────────────────────────────┤
│  entities   domain nouns                     │  ← patient, appointment, prescription
├─────────────────────────────────────────────┤
│  shared     design system, lib, api, config  │  ← zero domain knowledge
└─────────────────────────────────────────────┘
```

**The Dependency Rule (enforced by `eslint-plugin-boundaries`):**

```
app → processes → pages → widgets → features → entities → shared
```

Imports flow **downward only**. A `feature` may use `entities` and `shared`, but **never** another `feature` directly — only via `processes`/`pages`. `shared` knows **nothing** about the domain.

### 5.2 Slice anatomy (every feature/entity looks the same)

```
features/book-appointment/
├── index.ts          ← PUBLIC API (the ONLY legal import surface)
├── ui/               ← components (presentational + container)
├── model/            ← types, zustand store, selectors, domain mappers
├── api/              ← repository, dto, mappers, query hooks, endpoints
├── lib/              ← slice-local pure helpers
└── config/           ← slice constants, feature flags
```

> Deep-importing past `index.ts` is **forbidden** and linted. See [Folder-Structure.md](./Folder-Structure.md).

### 5.3 Backend-independence pipeline (the most important contract)

```
HTTP ──► DTO (Zod-validated) ──► mapper ──► Domain Model ──► Service (use-case)
                                                                   │
Component ◄── TanStack Query hook ◄── Repository (interface) ◄─────┘
```

- **DTO** = raw backend shape. Validated with Zod _at the boundary_. Lives in `api/dto`.
- **Mapper** = pure `toModel` / `toDto`. The only place that knows both shapes.
- **Model** = stable, UI-shaped domain type. Components only ever see this.
- **Repository** = interface + impl; returns Models, never DTOs; depends on `HttpClient`.
- **Service / use-case** = business rules orchestrating repositories; framework-agnostic.

**Result:** Backend renames `patient_first_nm` → `firstName`? Change _one mapper_. Zero component edits. That is what "10 years without a rewrite" means in practice.

> Full treatment: [Frontend-Foundation-Blueprint.md](./Frontend-Foundation-Blueprint.md) §11–13.

---

## 6. Design tokens (the visual contract)

**Never hardcode a color, size, radius, shadow, duration, or font.** Consume tokens.

### 6.1 Three tiers

1. **Primitive** — raw scale values (`--color-rose-500`, `--space-4`, `--radius-lg`).
2. **Semantic** — intent, themeable (`--color-primary`, `--color-surface`, `--color-text`, `--color-danger`).
3. **Component** — per-component (`--button-bg`, `--card-radius`) referencing semantic.

Components consume **semantic/component** tokens only. Themes (light, dark, high-contrast) re-map the semantic tier — components never change.

### 6.2 Brand anchors (map to primitives, then to semantics)

| Brand role          | Hex       | Primitive family | Semantic use                                     |
| ------------------- | --------- | ---------------- | ------------------------------------------------ |
| Primary             | `#E87D7D` | `rose`           | `--color-primary` (primary CTA, active)          |
| Secondary / Surface | `#F8F3F0` | `sand`           | `--color-surface` / app background               |
| Accent              | `#6B8E8E` | `teal`           | `--color-accent` (highlights, secondary actions) |
| Neutral             | `#827473` | `stone`          | `--color-text-muted`, borders                    |

> Full ramps, theme maps, and the **Soft-UI / Bento** elevation system live in [Frontend-Bible.md](./Frontend-Bible.md).

### 6.3 Typography scale

- **Headings:** Plus Jakarta Sans · **Body:** Inter.
- Fixed type scale tokens only: `display, h1–h6, body-lg/md/sm, caption, overline` (size + line-height + weight + tracking baked in). **No ad-hoc font sizes.**
- **Large Text Mode** scales the root token, so the whole UI grows proportionally.

### 6.4 Spacing, radius, motion

- Spacing: 4px base scale (`--space-1 … --space-12`). Generous by default (calm UI).
- Radius: `sm/md/lg/xl/2xl/full` — rounded, soft.
- Motion: `--duration-*`, `--ease-*`; **all motion gated by `prefers-reduced-motion`**.

---

## 7. Accessibility baseline (always-on)

WCAG **2.2 AA** is the floor (AAA for text contrast where feasible).

- Keyboard navigable everything; visible `:focus-visible` rings (token-driven).
- Semantic HTML first; ARIA only to fill gaps.
- Screen-reader labels via i18n keys; live regions for async status.
- **High-contrast theme** + **Reduced-motion** + **Large Text Mode** as first-class themes.
- **Color-blind safe:** never signal by color alone — always pair with icon/text/shape.
- Touch targets ≥ 44px (≥ 56px in Large Mode); large inputs and icons.
- Dialogs trap focus and restore it; skip-to-content link on every page.

> Rules: [Frontend-Bible.md](./Frontend-Bible.md) (A11y) · Checklist: [Project-Checklist.md](./Project-Checklist.md).

---

## 8. Localization baseline (always-on)

- **i18next**, namespaced keys (`feature.area.element`), ICU plurals/gender.
- **No hardcoded strings** (linted). All text, including `aria-label` and errors, uses keys.
- Languages now: **English, Hindi, Marathi, Urdu**; later: unlimited.
- **RTL** via `dir` + CSS **logical properties** (`margin-inline-start`, not `margin-left`).
- **Runtime language switch without reload.** Locale bundles lazy-loaded.
- Locale-aware dates/numbers/currency via `Intl`.

---

## 9. State management — where does data live?

| Data kind                                                        | Home                        | Rule                                                             |
| ---------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------- |
| Server data (patients, appointments)                             | **TanStack Query**          | Single source of truth for remote state; never copy into Zustand |
| Global UI/app state (theme, locale, active clinic, auth session) | **Zustand** (sliced stores) | Small, selector-based                                            |
| Form state                                                       | **React Hook Form**         | Local to the form                                                |
| URL state (filters, tabs, pagination)                            | **Router / search params**  | Shareable, restorable                                            |
| Ephemeral component state                                        | **`useState`/`useReducer`** | Keep it local                                                    |

> Anti-pattern: caching server data in Zustand. Don't. See [Frontend-Foundation-Blueprint.md](./Frontend-Foundation-Blueprint.md) §10.

---

## 10. Offline & resilience (designed-in, not bolted-on)

- **Read:** TanStack Query cache persisted to IndexedDB → last-known data offline.
- **Write:** **Outbox pattern** — mutations queue locally, sync when online, with conflict policy.
- **Shell:** Workbox service worker caches the app shell (installable PWA).
- **Signal:** explicit online/offline + sync status in the UI (never silent data loss).

---

## 11. Cross-cutting state contracts (every async surface)

Every data-driven surface must define **all four** states — no exceptions:

1. **Loading** — skeletons (prefer) over spinners; never layout shift.
2. **Empty** — meaningful illustration + one primary action.
3. **Error** — typed `AppError`, human message (localized), retry path.
4. **Success** — content + optimistic feedback (toast/inline).

> Philosophies: [Frontend-Foundation-Blueprint.md](./Frontend-Foundation-Blueprint.md) §29–32.

---

## 12. Naming at a glance

| Thing              | Convention                                   | Example                     |
| ------------------ | -------------------------------------------- | --------------------------- |
| Component file     | `PascalCase.tsx`                             | `VitalsCard.tsx`            |
| Hook               | `useThing.ts`                                | `usePatient.ts`             |
| Store              | `thing.store.ts`                             | `auth.store.ts`             |
| Service            | `thing.service.ts`                           | `billing.service.ts`        |
| Repository         | `thing.repository.ts`                        | `patient.repository.ts`     |
| Mapper             | `thing.mapper.ts`                            | `patient.mapper.ts`         |
| DTO                | `thing.dto.ts`                               | `patient.dto.ts`            |
| Schema             | `thing.schema.ts`                            | `appointment.schema.ts`     |
| Types              | `thing.types.ts`                             | `queue.types.ts`            |
| Test / E2E / Story | `*.test.tsx` / `*.spec.ts` / `*.stories.tsx` |                             |
| Folder / slice     | `kebab-case`                                 | `book-appointment`          |
| Constant           | `UPPER_SNAKE_CASE`                           | `MAX_QUEUE_SIZE`            |
| i18n key           | `namespace.area.element`                     | `vitals.form.bloodPressure` |

> Full rules: [Naming-Convention.md](./Naming-Convention.md).

---

## 13. Document index (the ClinicOS canon)

| Document                                                               | Purpose                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------ |
| [Brain.md](./Brain.md)                                                 | **You are here.** Single source of truth + index |
| [Frontend-Foundation-Blueprint.md](./Frontend-Foundation-Blueprint.md) | The 40-section master architecture document      |
| [Architecture.md](./Architecture.md)                                   | System architecture, layers, data flow, diagrams |
| [Frontend-Bible.md](./Frontend-Bible.md)                               | Design system, tokens, components, a11y, i18n    |
| [Folder-Structure.md](./Folder-Structure.md)                           | Canonical folder tree + slice anatomy            |
| [Naming-Convention.md](./Naming-Convention.md)                         | Files, folders, symbols, imports/exports         |
| [Coding-Standards.md](./Coding-Standards.md)                           | How we write React/TS day-to-day                 |
| [Developer-Rules.md](./Developer-Rules.md)                             | The "ALWAYS / NEVER" rulebook                    |
| [Documentation-Guidelines.md](./Documentation-Guidelines.md)           | How we document + ADR process                    |
| [AI-Rules.md](./AI-Rules.md)                                           | Constitution for AI agents working in this repo  |
| [Project-Checklist.md](./Project-Checklist.md)                         | Definition-of-Done & PR gates                    |

---

## 14. The decision contract

Every architectural decision recorded in these docs **must** state: **Why · Benefits · Trade-offs · Alternatives considered · Future scalability · Enterprise considerations.** If a decision lacks these, it is not ratified.

---

_Last updated: 2026-06-27 · Owner: Frontend Architecture · Status: **Foundation v1**_
