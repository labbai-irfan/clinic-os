# 🧠 ClinicOS — PROJECT_BRAIN.md

> **THE PERMANENT PROJECT MEMORY.**
> This is the single file an AI agent or a human developer reads to understand **all of ClinicOS** — vision, users, workflows, standards, architecture, and every live registry — **without reading the codebase**.
> If something is true about ClinicOS and durable, it is recorded here. If it is not here (or in a doc linked from here), it is **not yet decided**.

---

## 0. What this file is, and how it relates to Phase 1

ClinicOS has a layered documentation canon. Two files sit at the top:

| File                                                                | Role                                                                                                                                                                                             | Nature                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| [Brain.md](../Brain.md) (Phase 1)                                   | **The Constitution / Anchor.** The concise, ratified source of truth: the 8 non-negotiable laws, the layer model, the tech stack, the token contract, a11y/i18n baselines, naming.               | Short, stable, rarely changes. Changing it is a constitutional amendment. |
| **PROJECT_BRAIN.md** (this file, Phase 2)                           | **The Living Memory + Registries.** The exhaustive working memory: full vision, personas, journeys, philosophies, and **every registry** (components, hooks, routes, APIs, state, themes, etc.). | Long, living, **updated every phase and every feature**.                  |
| [architecture/README.md](../architecture/README.md) (Phase 2 canon) | **The Enterprise Architecture Anchor.** The authoritative `src/` tree, module template, module list, dependency rules, and the Phase-1→Phase-2 reconciliation (ADR-0001).                        | Stable enterprise structure.                                              |

**Reading order for a new agent/dev:** [Brain.md](../Brain.md) → [architecture/README.md](../architecture/README.md) → **this file** → the specific Phase 2 doc you need (see [§ Phase 2 Document Canon](#43-phase-2-document-canon)).

**Golden rule:** This file **never contradicts** [Brain.md](../Brain.md) or [architecture/README.md](../architecture/README.md). It _extends and operationalizes_ them. Every Phase 1 law is preserved verbatim in spirit and enforced here. How this file and its registries are maintained is governed by [BrainRules.md](../architecture/BrainRules.md); the mandatory AI update workflow is in [AI_RULES.md](../architecture/AI_RULES.md).

---

## Table of Contents

**Part 1 — Vision & Product**

1. [Startup Vision](#1-startup-vision)
2. [Product Vision](#2-product-vision)
3. [Mission](#3-mission)
4. [Goals](#4-goals)
5. [Target Users](#5-target-users)
6. [User Personas](#6-user-personas)
7. [Healthcare Workflow](#7-healthcare-workflow)
8. [User Journey — Appointment → Lifetime Record](#8-user-journey--appointment--lifetime-record)

**Part 2 — Philosophy & Standards** 9. [Design Philosophy](#9-design-philosophy) 10. [UI Philosophy](#10-ui-philosophy) 11. [UX Principles](#11-ux-principles) 12. [Accessibility Standards](#12-accessibility-standards) 13. [Localization Standards](#13-localization-standards) 14. [Coding Philosophy](#14-coding-philosophy) 15. [Enterprise Rules](#15-enterprise-rules)

**Part 3 — Architecture** 16. [Folder Architecture](#16-folder-architecture) 17. [Technology Stack](#17-technology-stack) 18. [Dependencies](#18-dependencies) 19. [Feature List](#19-feature-list) 20. [Module List (canonical bounded contexts)](#20-module-list-canonical-bounded-contexts)

**Part 4 — Registries (the living memory)** 21. [Registry System Overview](#21-registry-system-overview) 22. [Component Registry](#22-component-registry) 23. [Hook Registry](#23-hook-registry) 24. [Utility Registry](#24-utility-registry) 25. [API Registry](#25-api-registry) 26. [Route Registry](#26-route-registry) 27. [State Registry](#27-state-registry) 28. [Form Registry](#28-form-registry) 29. [Table Registry](#29-table-registry) 30. [Theme Registry](#30-theme-registry) 31. [Localization Registry](#31-localization-registry) 32. [Asset Registry](#32-asset-registry)

**Part 5 — Governance, Registries-of-Registries & History** 33. [Architecture Registry (PART 10)](#33-architecture-registry-part-10) 34. [Convention Registry (PART 10)](#34-convention-registry-part-10) 35. [Architectural Decisions (ADR Log)](#35-architectural-decisions-adr-log) 36. [Technical Debt](#36-technical-debt) 37. [Known Constraints](#37-known-constraints) 38. [Future Roadmap](#38-future-roadmap) 39. [Completed Phases](#39-completed-phases) 40. [Pending Phases](#40-pending-phases) 41. [Changelog](#41-changelog) 42. [Future Improvements](#42-future-improvements)

---

---

# Part 1 — Vision & Product

## 1. Startup Vision

ClinicOS is a **billion-dollar healthcare SaaS** built to become the **operating system of the outpatient clinic** — the way Stripe is the OS of payments and Shopify is the OS of commerce.

We are **not** building "yet another Clinic Management System." A CMS is a database with forms on top. ClinicOS is a **Clinic Operating System (Clinic-OS)**: the digital nervous system that orchestrates the **entire lifetime patient journey** as a sequence of calm, deliberate state transitions — from the moment an appointment is requested to the patient's permanent, portable lifetime medical record.

**The 10-year thesis.** Software in healthcare lives for a decade or more. Backends change, regulations change, vendors change, devices change. We therefore **architect for change, not for today** — a frontend that can absorb a backend reshape, a new tenant model, a new device class, or a new country's compliance regime **without a rewrite**. Every architectural choice is justified by: _Will this still be true and serviceable in 10 years?_

**The scale thesis.** ClinicOS must serve **thousands of clinics, millions of patients, hundreds of developers, and many independent frontend/backend teams**, across **Web · Tablet · (future) Mobile**. The architecture is therefore organized by **bounded context modules** that map to team ownership and can later be extracted to independent packages or micro-frontends with zero import changes (see [ADR-0001](#35-architectural-decisions-adr-log)).

## 2. Product Vision

> **One calm screen. One primary task. One primary action. In your language. On any device. For the next decade.**

ClinicOS makes a clinic visit feel effortless for _everyone in the building_ — the owner watching dashboards, the doctor mid-consultation, the receptionist under a queue of walk-ins, the pharmacist dispensing, and above all the **patient**, who may be elderly, low-literacy, or a non-English reader. The product's north star is that **a non-technical 65-year-old can complete the primary task on the first try, in their own language** — the same litmus test Phase 1 ratified.

The product is **backend-independent by design**: the UI talks to _services_ and _repositories_, never to raw APIs. This is the structural guarantee that lets the product evolve for a decade while the data layer underneath it changes freely.

## 3. Mission

**To give every clinic — regardless of size, budget, or the digital literacy of its staff and patients — an operating system that turns the chaotic, paper-and-shouting reality of outpatient care into one calm, accessible, multilingual, lifetime-aware digital flow.**

We measure mission success by:

- A patient's record is **continuous and lifetime**, not fragmented per visit.
- Every screen passes **WCAG 2.2 AA** and the 65-year-old litmus test.
- Every string is available in **English, Hindi, Marathi, Urdu** (and beyond), including RTL.
- The clinic never silently loses data, even offline.

## 4. Goals

| #   | Goal                                                                   | How the architecture serves it                                                                   |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| G1  | **Lifetime patient record** — one continuous record across all visits. | `records` module + `processes/` patient-journey orchestration; server state in TanStack Query.   |
| G2  | **Calm, single-task UX** for stressed, non-technical users.            | Phase 1 Law 1 (one screen/task/CTA); design-system primitives; 4 mandatory async states.         |
| G3  | **Universal accessibility** (WCAG 2.2 AA floor).                       | Always-on a11y baseline; high-contrast + reduced-motion + Large Text Mode as first-class themes. |
| G4  | **Universal localization** (en/hi/mr/ur + RTL, runtime switch).        | i18next + ICU; logical CSS properties; lazy locale bundles.                                      |
| G5  | **Backend independence** (10 years without a rewrite).                 | DTO→Mapper→Model→Repository→Service→Query→UI pipeline inside every module.                       |
| G6  | **Enterprise scale** (1000s of clinics, 100s of devs).                 | Bounded-context modules + CODEOWNERS + downward-only dependency rule.                            |
| G7  | **Offline resilience** — never silent data loss.                       | Query persistence (read) + Outbox pattern (write) + Workbox PWA shell.                           |
| G8  | **Multi-tenant, RBAC-governed** operation.                             | `tenant` entity, `shared/permissions` RBAC engine, `<Can>` guards, per-module `permissions.ts`.  |

## 5. Target Users

These are **design constraints first, personas second** (Phase 1 §3). Each user imposes a hard, non-negotiable constraint on every screen.

| User                               | Hard constraint they impose                                               |
| ---------------------------------- | ------------------------------------------------------------------------- |
| **Super Admin**                    | Multi-tenant control, role/permission matrix, audit visibility.           |
| **Clinic Owner**                   | Dashboards that read at a glance; bento KPIs.                             |
| **Doctor**                         | Speed + zero friction during consultation; keyboard-first.                |
| **Receptionist**                   | High-throughput data entry; large targets; few clicks.                    |
| **Pharmacist**                     | Clear stock/dispense flows; error-proofing.                               |
| **Patient**                        | Self-service simplicity; mobile-first; trust.                             |
| **Elderly / low digital literacy** | Large Text Mode, large touch targets, icons + words.                      |
| **Non-English readers**            | Full localization (en, hi, mr, ur…), RTL, language switch without reload. |

**Litmus test for every screen:** _Could a non-technical 65-year-old complete the primary task on the first try, in their language?_

## 6. User Personas

Personas put a face on the constraints above. Each lists their **goal**, **context**, **frustrations**, and the **architectural/UX response**.

### 6.1 Super Admin — "Priya, the Platform Operator"

- **Goal:** Onboard clinics, manage tenants, assign roles, watch audit logs across the whole platform.
- **Context:** Works in the `admin` module; spans every tenant; highest privilege.
- **Frustrations:** Blurry permissions; no audit trail; risky bulk actions.
- **Response:** `tenant` global entity; `shared/permissions` RBAC engine + `<Can>`; multi-tenant data scoping; audit visibility; destructive actions use `AlertDialog` confirmations.

### 6.2 Clinic Owner — "Dr. Mehta, the Proprietor"

- **Goal:** Understand clinic health in 10 seconds — revenue, footfall, queue length, no-shows.
- **Context:** `analytics` module; bento-grid dashboards; reads at a glance, rarely types.
- **Frustrations:** Dense reports; numbers without meaning; mobile dashboards that don't fit.
- **Response:** **Bento KPI tiles** (one job per tile); `Stat` + `Timeline` components; responsive grid; color **+ icon + text** never color alone.

### 6.3 Doctor — "Dr. Khan, the Consultant"

- **Goal:** See the patient, record findings, prescribe — with zero friction, mid-conversation.
- **Context:** `consultation` + `prescriptions` modules; keyboard-first; seconds matter.
- **Frustrations:** Clicking through modals; losing context; slow forms.
- **Response:** Keyboard-first flows; React Hook Form (uncontrolled, fast); inline validation; one primary CTA ("Save & continue"); optimistic feedback.

### 6.4 Receptionist — "Anjali, the Front Desk"

- **Goal:** Register/check-in patients and manage the queue at high throughput, all day.
- **Context:** `reception` + `appointments` + `queue` modules; kiosk/tablet; large targets.
- **Frustrations:** Tiny click targets; re-typing data; ambiguous queue state.
- **Response:** Large touch targets (≥44px, ≥56px Large Mode); few-click flows; clear queue states; skeletons (no layout shift).

### 6.5 Pharmacist — "Rahul, the Dispenser"

- **Goal:** Dispense prescriptions accurately, track stock, prevent errors.
- **Context:** `pharmacy` module; error-proofing is paramount.
- **Frustrations:** Wrong-drug risk; unclear stock levels; no double-check.
- **Response:** Error-proofed dispense flow; clear stock badges (icon+text); confirmation on irreversible dispense; `Table`/`DataGrid` with sortable stock.

### 6.6 Patient — "Sunita, the Self-Server"

- **Goal:** Book an appointment, see her record, pay — on her phone, in her language.
- **Context:** Patient-facing surfaces; mobile-first; must build trust.
- **Frustrations:** Forms that don't fit her phone; English-only UIs; opaque billing.
- **Response:** Mobile-first; full localization + RTL; transparent `billing` flows; trust-building calm UI; self-service simplicity.

### 6.7 Elderly / Low-Literacy — "Dada ji, the Cautious First-Timer"

- **Goal:** Complete one task (e.g., check in / view prescription) without help or fear.
- **Context:** Can use WhatsApp; low digital literacy; may not read fluently.
- **Frustrations:** Small text; jargon; too many choices; English-only.
- **Response:** **Large Text Mode** (scales root token, whole UI grows); **icons + words** together; one primary action per screen; high-contrast theme; their language.

## 7. Healthcare Workflow

ClinicOS models the clinic as a **long-running domain process**. Each step is a **state transition**, owned by a bounded-context module, and each transition is one calm screen.

```
Appointment → Check-In → Vitals → Queue → Consultation → Prescription
   → Pharmacy → Billing → Follow-Up → Recovery → Lifetime Medical Record
```

| Stage             | Owning module           | Primary actor          | Primary task              |
| ----------------- | ----------------------- | ---------------------- | ------------------------- |
| Appointment       | `appointments`          | Patient / Receptionist | Book / confirm a slot     |
| Check-In          | `reception`             | Receptionist           | Mark patient arrived      |
| Vitals            | `consultation` (intake) | Receptionist / Nurse   | Record BP, temp, weight…  |
| Queue             | `queue`                 | Receptionist / system  | Order & call patients     |
| Consultation      | `consultation`          | Doctor                 | Examine, diagnose, note   |
| Prescription      | `prescriptions`         | Doctor                 | Prescribe medication      |
| Pharmacy          | `pharmacy`              | Pharmacist             | Dispense, manage stock    |
| Billing           | `billing`               | Receptionist / Patient | Invoice & pay             |
| Follow-Up         | `follow-up`             | System / Doctor        | Schedule recovery review  |
| Recovery / Record | `records`               | System                 | Append to lifetime record |

The **cross-module orchestration** of this workflow lives in `processes/` (the Patient Journey state machine) — **not** by chaining module imports. See [§16](#16-folder-architecture) and [DependencyRules.md](../architecture/DependencyRules.md).

## 8. User Journey — Appointment → Lifetime Record

The end-to-end happy path, told as one continuous journey. Every arrow is a state transition; every screen obeys **one screen / one task / one CTA** and defines all **four async states** (loading, empty, error, success).

1. **Appointment (book).** Patient (or receptionist) picks a slot. `appointments` module. Form: React Hook Form + Zod. CTA: "Book appointment." → state: _Booked_.
2. **Confirmation & reminder.** System confirms; localized notification. → state: _Confirmed_.
3. **Check-In (arrival).** Receptionist marks arrival on a tablet. `reception` module. Large targets. → state: _Checked-in_.
4. **Vitals (intake).** BP, temperature, weight, pulse recorded. `consultation` intake. Numeric inputs, `inputMode="numeric"`. → state: _Vitals recorded_.
5. **Queue.** Patient enters the live queue; status visible to all. `queue` module. → state: _Waiting → Called_.
6. **Consultation.** Doctor examines, records findings/diagnosis. `consultation` module. Keyboard-first. → state: _In consultation → Consulted_.
7. **Prescription.** Doctor prescribes; drug interactions surfaced. `prescriptions` module. → state: _Prescribed_.
8. **Pharmacy (dispense).** Pharmacist dispenses against the prescription; stock decremented; error-proofed. `pharmacy` module. → state: _Dispensed_.
9. **Billing.** Invoice generated; patient pays; transparent line items. `billing` module. → state: _Invoiced → Paid_.
10. **Follow-Up.** Recovery review scheduled if needed. `follow-up` module. → state: _Follow-up scheduled_.
11. **Recovery.** Outcome captured. → state: _Recovered / Ongoing_.
12. **Lifetime Medical Record.** Everything above is appended to the patient's **permanent, portable, lifetime record**. `records` module. The record is continuous across every visit, for a decade and beyond.

**Offline along the journey:** reads come from the persisted Query cache; writes queue in the **Outbox** and sync when online, with explicit online/offline status — never silent loss (Phase 1 §10).

---

---

# Part 2 — Philosophy & Standards

## 9. Design Philosophy

ClinicOS design is **Calm · Soft · Trustworthy · Accessible · Localized**. It uses a **Soft-UI / Bento** visual language: low-spread, low-opacity, warm-tinted elevation; rounded, soft radii; generous spacing.

- **One Screen · One Primary Task · One Primary CTA.** Never overwhelm.
- **Calm by default.** Minimal motion, generous whitespace, large readable type.
- **Tokens are the contract.** Every color, size, radius, shadow, duration, and font is a **3-tier design token** (Primitive → Semantic → Component). No hardcoded visual values, ever.
- **Brand anchors:** Primary `#E87D7D` (rose), Surface `#F8F3F0` (sand), Accent `#6B8E8E` (teal), Neutral `#827473` (stone).
- **Type:** **Plus Jakarta Sans** (headings) + **Inter** (body); fixed type-scale tokens only.

> Full design system, ramps, theme maps, and the Soft-UI/Bento system: Phase 1 [Frontend-Bible.md](../Frontend-Bible.md).

## 10. UI Philosophy

- **Semantic HTML first; ARIA only to fill gaps.**
- **Skeletons over spinners** — never layout shift.
- **Status is color + icon + text** — never color alone (color-blind safe).
- **One filled primary `Button` per screen** (bottom-right desktop / sticky full-width footer mobile, ≥56px). Everything else is `secondary`/`ghost`/`link`.
- **Bento grid** for at-a-glance dashboards — self-contained tiles, one job each.
- **Component library is the only UI surface.** UI lives in `shared/design-system/`; modules compose it. Components consume **semantic/component tokens only**.

## 11. UX Principles

| Principle                | Meaning                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| One primary task         | Each screen has exactly one job and one primary action.                                      |
| Four async states        | Every data surface defines **Loading · Empty · Error · Success** — no exceptions.            |
| Calm motion              | All motion gated by `prefers-reduced-motion`; nothing > `--duration-slower`.                 |
| Forgiving by default     | Confirm destructive actions (`AlertDialog`); optimistic feedback; clear retry on error.      |
| Large, reachable targets | ≥44px touch targets (≥56px Large Text Mode).                                                 |
| The 65-year-old litmus   | Every flow must pass: a non-technical 65-year-old completes it first try, in their language. |

## 12. Accessibility Standards

**WCAG 2.2 AA is the floor** (AAA for text contrast where feasible). Accessibility is a **feature, not a setting** (Phase 1 Law 3). Always-on:

- Keyboard navigable everything; visible token-driven `:focus-visible` rings.
- Semantic HTML first; ARIA only to fill gaps; screen-reader labels via i18n keys; live regions for async status.
- **High-contrast theme + Reduced-motion + Large Text Mode** are first-class themes.
- **Never signal by color alone** — always pair with icon/text/shape.
- Touch targets ≥44px (≥56px Large Mode).
- Dialogs trap focus and restore it; skip-to-content link on every page.
- **CI gate:** axe-core / jest-axe + Playwright a11y checks block merges.

> Full a11y guide and per-component keyboard patterns: Phase 1 [Frontend-Bible.md](../Frontend-Bible.md) §9.

## 13. Localization Standards

- **i18next + react-i18next + ICU**; namespaced keys `namespace.area.element`; ICU plurals/gender.
- **No hardcoded human-readable strings, ever** (linted) — including `aria-label`s and error messages.
- **Languages now: English (en), Hindi (hi), Marathi (mr), Urdu (ur)**; later: unlimited.
- **RTL** (Urdu/Arabic) via `dir` + CSS **logical properties** (`margin-inline-start`, never `margin-left`).
- **Runtime language switch without reload**; locale bundles lazy-loaded.
- Locale-aware dates/numbers/currency via `Intl`.

> i18n setup lives in `shared/localization/`; catalogs in `src/locales/<lang>/<namespace>.json`.

## 14. Coding Philosophy

- **TypeScript 5 strict** (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- **Simplicity beats cleverness.** If a junior can't read it, rewrite it (Phase 1 Law 8).
- **The UI never talks to the backend directly** — only via services/repositories (Law 6).
- **The frontend is backend-independent** — backend reshapes flow through one mapper (Law 7).
- **Architecture is linted**: `eslint-plugin-boundaries` enforces the dependency rule; `import/no-cycle` forbids cycles; jsx-a11y + i18n lint rules enforce a11y/i18n.
- **Test behavior, not implementation** (Vitest + RTL; Playwright for journeys).
- **Public-API-only imports**: never deep-import past a slice/module `index.ts`.

> Day-to-day rules: Phase 1 [Coding-Standards.md](../Coding-Standards.md), [Developer-Rules.md](../Developer-Rules.md).

## 15. Enterprise Rules

The **8 Non-Negotiable Laws** (Phase 1 §2), preserved verbatim:

1. **One Screen · One Primary Task · One Primary CTA.**
2. **Calm by default.**
3. **Accessibility is a feature, not a setting** (WCAG 2.2 AA floor).
4. **Every string is localized.**
5. **Every color/size/space is a token.**
6. **The UI never talks to the backend directly.**
7. **The frontend is backend-independent.**
8. **Simplicity beats cleverness.**

Plus the **Phase 2 enterprise overlay**:

- **Bounded-context modules** map to **team ownership** (one module ≈ one team via CODEOWNERS).
- **Cross-module access only via `index.ts`** — never deep paths; **no circular module deps**.
- **Multi-module journeys live in `processes/`**, never by chaining module imports.
- **Shared domain → `entities/`; shared non-domain → `shared/`; never duplicate.**
- Every architectural decision carries the **Decision Contract**: _Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations._ Structural changes require an **ADR** + a PROJECT_BRAIN update.

> Enforcement: Phase 1 [Developer-Rules.md](../Developer-Rules.md), [Project-Checklist.md](../Project-Checklist.md); Phase 2 [DependencyRules.md](../architecture/DependencyRules.md), [AI_RULES.md](../architecture/AI_RULES.md).

---

---

# Part 3 — Architecture

## 16. Folder Architecture

The authoritative `src/` tree is defined in [architecture/README.md §1](../architecture/README.md) and detailed folder-by-folder in [FolderStructure.md](../architecture/FolderStructure.md). Summary (do not diverge):

```
src/
├── app/          # Composition root: providers, router assembly, layouts, bootstrap, global error boundary
├── processes/    # Cross-MODULE journeys — the Patient Journey state machine spanning modules
├── modules/      # Domain BOUNDED CONTEXTS — self-contained, identically structured (see §20)
├── entities/     # GLOBAL domain entities shared across modules (patient, clinic, doctor, user, tenant)
├── shared/       # Non-domain, cross-cutting reuse (design-system, core, lib, api, infra ports…)
├── assets/       # fonts/ icons/ images/ animations/
├── routes/       # Global route manifest (path constants, route metadata)
├── testing/      # Test utilities, render helpers, fixtures, a11y harness
├── mock/         # MSW handlers, seed data, mock server
└── locales/      # i18n catalogs: en/ hi/ mr/ ur/ <namespace>.json
```

**Top-level dependency order (downward-only):**

```
app → processes → modules → entities → shared
                     └── a module may use: entities, shared (never another module's internals — only its index.ts)
```

**Module template (every module is identical)** — Presentation → Application → Domain ← Infrastructure (a mini Clean Architecture):

```
modules/<module-name>/
├── index.ts · routes.tsx · permissions.ts · README.md · BRAIN.md
├── pages/ components/ hooks/ store/        # Presentation
├── services/                                # Application (use-cases)
├── types/ schemas/ validators/ constants/   # Domain (stable core)
├── api/ repositories/ mappers/ adapters/     # Infrastructure
├── utils/ config/ tests/
```

The intra-module pipeline **is** the Phase 1 backend-independence pipeline, localized: `HTTP → DTO (Zod) → mapper → Model → Repository → Service → Query hook → UI`.

`shared/` is expanded into ~30 cross-cutting folders (design-system, core, api, lib, hooks, providers, contexts, store, config, constants, types, schemas, validators, utils, helpers, guards, middleware, theme, styles, localization, permissions, notifications, analytics, logger, errors, monitoring, workers, offline, cache). Full 7-field contract per folder: [FolderStructure.md](../architecture/FolderStructure.md).

## 17. Technology Stack

Authoritative (Phase 1 §4) — no alternatives without an ADR.

| Concern           | Choice                                                          |
| ----------------- | --------------------------------------------------------------- |
| Language          | **TypeScript 5 (strict)**                                       |
| Build/dev         | **Vite 5**                                                      |
| UI runtime        | **React 18** (concurrent, Suspense)                             |
| Routing           | **React Router v6 (data router)**                               |
| Server state      | **TanStack Query v5** (only home of server data)                |
| Client/UI state   | **Zustand** (sliced)                                            |
| Forms             | **React Hook Form + Zod resolver**                              |
| Schema/validation | **Zod**                                                         |
| Styling           | **Tailwind CSS (token-mapped) + CVA + tailwind-merge**          |
| Design tokens     | **CSS custom properties (3-tier)**                              |
| i18n              | **i18next + react-i18next + ICU**                               |
| Icons             | **lucide-react**                                                |
| HTTP              | **Typed client behind `HttpClient` interface**                  |
| Server mocking    | **MSW**                                                         |
| Unit/integration  | **Vitest + React Testing Library**                              |
| E2E               | **Playwright**                                                  |
| A11y testing      | **axe-core / jest-axe + Playwright**                            |
| Component docs    | **Storybook**                                                   |
| Offline           | **Workbox SW + IndexedDB (idb) + Query persistence + Outbox**   |
| Errors/monitoring | **Sentry + Web Vitals + OpenTelemetry-web** (behind ports)      |
| Analytics         | **Provider-agnostic `analytics` port**                          |
| Lint/format       | **ESLint (boundaries, import-sort, jsx-a11y, i18n) + Prettier** |
| Hooks/CI          | **Husky + lint-staged + Changesets**                            |

## 18. Dependencies

Each package, its purpose, and the **layer it is allowed in** (per the dependency rule — `shared/` is domain-agnostic; modules consume via public API). "UI components" = `shared/design-system/` + module `components/pages/`.

| Package                                                             | Purpose                         | Allowed layer                                               |
| ------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------- |
| `typescript`                                                        | Strict typing                   | All layers (build)                                          |
| `vite`                                                              | Build/dev server, HMR           | `app` / build config only                                   |
| `react`, `react-dom`                                                | UI runtime                      | UI layers (presentation)                                    |
| `react-router-dom`                                                  | Routing (data router)           | `app`, `routes`, module `routes.tsx`                        |
| `@tanstack/react-query`                                             | Server-state cache              | module `api/` + `hooks/`; provider in `app`                 |
| `zustand`                                                           | Client/UI state                 | `shared/store`, module `store/` (UI only)                   |
| `react-hook-form`                                                   | Form state                      | UI components / module `pages`                              |
| `zod`                                                               | DTO + form schema validation    | module `schemas/`, `shared/schemas`, mappers boundary       |
| `@hookform/resolvers`                                               | RHF↔Zod bridge                  | UI components (forms)                                       |
| `tailwindcss`                                                       | Utility styling (token-mapped)  | styling config + UI components                              |
| `class-variance-authority` (CVA)                                    | Component variants              | `shared/design-system`, module `components`                 |
| `tailwind-merge`                                                    | Class conflict resolution       | UI components                                               |
| `i18next`, `react-i18next`                                          | Localization runtime            | `shared/localization`, all UI (via keys)                    |
| `lucide-react`                                                      | Icon set                        | UI components                                               |
| `axios`/`fetch` (typed)                                             | HTTP transport                  | **only** behind `shared/api` `HttpClient` — **never** in UI |
| `msw`                                                               | API mocking                     | `mock/`, `testing/` (dev/test only)                         |
| `idb`                                                               | IndexedDB wrapper               | `shared/offline`, `shared/cache`                            |
| `workbox-*`                                                         | Service worker / PWA shell      | `app` / build (SW)                                          |
| `@sentry/react`                                                     | Error monitoring                | **only** behind `shared/monitoring` port                    |
| `web-vitals`                                                        | Perf metrics                    | `shared/monitoring`                                         |
| `@opentelemetry/*`                                                  | Tracing (web)                   | `shared/monitoring`                                         |
| `vitest`, `@testing-library/react`                                  | Unit/integration tests          | `testing/`, co-located `*.test.tsx`                         |
| `@playwright/test`                                                  | E2E journeys                    | `testing/` / e2e specs                                      |
| `jest-axe` / `axe-core`                                             | A11y assertions                 | `testing/`, stories                                         |
| `storybook`                                                         | Component docs                  | `shared/design-system` stories                              |
| `eslint` (+ `eslint-plugin-boundaries`, `import`, `jsx-a11y`, i18n) | Lint + architecture enforcement | repo tooling                                                |
| `prettier`                                                          | Formatting                      | repo tooling                                                |
| `husky`, `lint-staged`                                              | Pre-commit gates                | repo tooling                                                |
| `@changesets/cli`                                                   | Versioning/release (future)     | repo tooling                                                |

**Phase 3 additions (ratified ADR-0005 / ADR-0006 / ADR-0007):**

| Package                                                           | Purpose                                                          | Allowed layer                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| `axios`                                                           | HTTP transport **impl** behind the `HttpClient` port             | **only** `shared/api` — never UI · ADR-0005 |
| `react-error-boundary`                                            | Declarative error boundaries                                     | `app`, `shared/errors` · ADR-0005           |
| `react-helmet-async`                                              | Document `<head>` / SEO (maintained successor to `react-helmet`) | `app` providers, pages · ADR-0005           |
| `react-hot-toast`                                                 | Toast **impl** behind `shared/notifications` port                | `shared/notifications`, `app` · ADR-0005    |
| `framer-motion`                                                   | Animation (reduced-motion gated)                                 | UI / `shared/design-system` · ADR-0005      |
| `react-dropzone`                                                  | File-upload primitive                                            | UI components (uploads) · ADR-0005          |
| `dayjs`                                                           | Date/time behind a `shared/lib` date wrapper                     | `shared/lib`, UI via wrapper · ADR-0005     |
| `clsx`, `tailwind-merge`                                          | className composition                                            | UI components                               |
| `i18next-browser-languagedetector`, `i18next-http-backend`        | Locale detection + lazy locale loading                           | `shared/localization`                       |
| `@tanstack/react-query-persist-client` (+ sync-storage-persister) | Query cache persistence (offline-ready)                          | `shared/lib/query`, `app`                   |
| `vite-tsconfig-paths`                                             | Single-source path aliases in Vite                               | build config · ADR-0007                     |
| `rollup-plugin-visualizer`                                        | Bundle analysis (`analyze` mode)                                 | build config · ADR-0007                     |
| `@commitlint/cli` + `config-conventional`                         | Conventional-commit linting                                      | repo tooling · ADR-0007                     |
| `plop`                                                            | Code generators (module/component scaffolding)                   | repo tooling / `scripts`                    |
| `rimraf`                                                          | Cross-platform `clean`                                           | repo tooling                                |
| `pnpm`                                                            | Package manager (via Corepack)                                   | repo tooling · ADR-0007                     |

**Rule:** Adding a dependency requires an ADR entry ([§35](#35-architectural-decisions-adr-log)) and a row here. Vendor SDKs (Sentry, analytics, HTTP) are **always** behind a port — never imported in components.

## 19. Feature List

User-facing capabilities (verbs), grouped by their owning module. Status: **Planned** until shipped.

| Feature                                        | Module             | Status             |
| ---------------------------------------------- | ------------------ | ------------------ |
| Register / search patients; view profile       | `patients`         | Planned            |
| Book / reschedule / cancel appointment         | `appointments`     | Planned            |
| Check-in patient                               | `reception`        | Planned            |
| Record vitals (intake)                         | `consultation`     | Planned            |
| Live queue management (call next, reorder)     | `queue`            | Planned            |
| Consultation notes & diagnosis                 | `consultation`     | Planned            |
| Create prescription; drug-interaction warnings | `prescriptions`    | Planned            |
| Dispense medication; stock management          | `pharmacy`         | Planned            |
| Generate invoice; collect payment              | `billing`          | Planned            |
| Schedule follow-up / recovery review           | `follow-up`        | Planned            |
| Lifetime medical record (continuous, portable) | `records`          | Planned            |
| Owner dashboards / KPIs                        | `analytics`        | Planned            |
| Clinic & user settings; themes; language       | `settings`         | Planned            |
| Doctor workspace                               | `doctor`           | Planned            |
| Reception desk workspace                       | `reception`        | Planned            |
| Tenant/role/permission administration; audit   | `admin`            | Planned            |
| Auth: login, session, RBAC                     | `shared` + `admin` | Planned (Phase 4)  |
| Offline read + Outbox write                    | `shared/offline`   | Planned (Phase 4+) |

## 20. Module List (canonical bounded contexts)

The canonical module set (from [architecture/README.md §2](../architecture/README.md)) — **fully populated; do not add/rename without an ADR**:

`patients · appointments · queue · consultation · prescriptions · pharmacy · billing · follow-up · records · analytics · settings · doctor · reception · admin`

| Module          | Bounded context                    | Owns (illustrative)                |
| --------------- | ---------------------------------- | ---------------------------------- |
| `patients`      | Patient identity & profile         | registration, search, demographics |
| `appointments`  | Scheduling                         | slots, booking, reschedule/cancel  |
| `queue`         | Live waiting room                  | queue order, call-next, status     |
| `consultation`  | Clinical encounter + intake/vitals | vitals, notes, diagnosis           |
| `prescriptions` | Prescribing                        | Rx creation, interactions          |
| `pharmacy`      | Dispensing & stock                 | dispense, inventory                |
| `billing`       | Invoicing & payments               | invoices, line items, payment      |
| `follow-up`     | Recovery scheduling                | follow-up appts, reminders         |
| `records`       | Lifetime medical record            | continuous patient history         |
| `analytics`     | Insights & dashboards              | KPIs, bento tiles, reports         |
| `settings`      | Clinic & user preferences          | themes, language, profile          |
| `doctor`        | Doctor workspace                   | doctor-centric views               |
| `reception`     | Front-desk workspace               | check-in, desk operations          |
| `admin`         | Platform/tenant administration     | tenants, roles, audit              |

Full module responsibilities + worked example: [FeatureArchitecture.md](../architecture/FeatureArchitecture.md).

---

---

# Part 4 — Registries (the living memory)

## 21. Registry System Overview

Registries are the **structured, living memory** of ClinicOS. Because **no application code exists yet (Phase 2)**, each registry is presented as:

- **(a) SCHEMA** — the table shape with column definitions (the contract for every future entry).
- **(b) UPDATE RULE** — when and how it must be updated. The general rule: **whenever the corresponding artifact is created, changed, or removed, its registry row is added/edited in the same PR.** This is mandatory and governed by [BrainRules.md](../architecture/BrainRules.md); the AI agent's mandatory update workflow is in [AI_RULES.md](../architecture/AI_RULES.md).
- **(c) SEED entries** — what already exists from the architecture itself.

Registries with no concrete artifacts yet are marked **"Seeded — populated as features ship."**

> **Global update law:** No artifact (component, hook, util, API, route, store, form, table, theme, locale, asset) is "done" until its registry row exists. PR reviewers and the [Project-Checklist.md](../Project-Checklist.md) block merges that add artifacts without registry rows.

## 22. Component Registry

> **Registry now code-enforced (Phase 8):** the source of truth is [`design-system/registry/component-registry.ts`](../../src/shared/design-system/registry/component-registry.ts) (24 shipped + 14 planned). `pnpm ds:registry` validates it against the component folders + barrel and generates [ComponentRegistry.md](../design-system/ComponentRegistry.md). Architecture blueprint: [docs/design-system/DesignSystem.md](../design-system/DesignSystem.md).

> **Phase 6 — shipped (24):** _Form_ — Button, IconButton, Input, Textarea, Label, FormField, Checkbox, Radio/RadioGroup, Switch, Select. _Display/Layout_ — Card (+Header/Title/Description/Content/Footer), BentoGrid/BentoItem, Divider, Badge, StatusBadge, Avatar, Spinner, Skeleton, Icon, VisuallyHidden. _Feedback_ — Alert, EmptyState, ErrorState, Tooltip. All CVA + tokens + a11y + Storybook. Catalog: [docs/design-system/Components.md](../design-system/Components.md). _Planned next:_ Tabs, Table/DataGrid, Dialog, Drawer, Combobox, DatePicker, Pagination, Breadcrumb, Stepper, Toast, Menu, Popover.

**(a) Schema**

| Column          | Definition                                                                               |
| --------------- | ---------------------------------------------------------------------------------------- |
| Name            | Component name (`PascalCase`).                                                           |
| Category        | Actions / Inputs / Forms / Containers / Data display / Navigation / Overlays / Feedback. |
| Location        | Path (`shared/design-system/<Name>/` or `modules/<m>/components/`).                      |
| Variants        | CVA variants (e.g. `primary\|secondary\|ghost`).                                         |
| Tokens consumed | Semantic/component tokens used.                                                          |
| A11y notes      | Keyboard/ARIA contract.                                                                  |
| i18n            | Requires localized labels? (y/n).                                                        |
| Status          | Planned / In progress / Shipped.                                                         |

**(b) Update rule:** Add a row when a component is created; edit on variant/API change; never deep-import past its `index.ts`. Design-system components must have **Storybook stories + a11y tests** before "Shipped." Tokens consumed must be **semantic/component only** (never primitives/raw hex/px).

**(c) Seed — design-system primitives planned in Phase 1 [Frontend-Bible.md](../Frontend-Bible.md) §8** (all **Planned**, in `shared/design-system/`):

| Category          | Components (seeded)                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Actions           | `Button`, `IconButton`, `ButtonGroup`, `Link`                                                                                      |
| Inputs            | `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Radio`/`RadioGroup`, `Switch`, `DatePicker`, `NumberStepper`, `FileUpload` |
| Forms             | `Field`, `Label`, `HelpText`, `ErrorText`, `Fieldset`, `FormRow`                                                                   |
| Containers        | `Card`, `Bento`, `Panel`, `Accordion`, `Divider`                                                                                   |
| Data display      | `Badge`, `Tag`, `Avatar`, `Table`/`DataGrid`, `Stat`, `DescriptionList`, `Timeline`                                                |
| Navigation        | `Tabs`, `Breadcrumb`, `Pagination`, `Stepper`, `Sidebar`/`NavItem`, `Menu`                                                         |
| Overlays          | `Modal`/`Dialog`, `Drawer`, `Tooltip`, `Popover`, `Toast`, `AlertDialog`                                                           |
| Feedback / states | `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`, `Banner`, `ProgressBar`                                                         |

## 23. Hook Registry

**(a) Schema**

| Column   | Definition                                                        |
| -------- | ----------------------------------------------------------------- |
| Name     | `useThing`.                                                       |
| Location | `shared/hooks/` (generic) or `modules/<m>/hooks/` (module-local). |
| Purpose  | What it does.                                                     |
| Returns  | Shape returned.                                                   |
| Layer    | Presentation⇄Application; never imports Infrastructure directly.  |
| Status   | Planned / Shipped.                                                |

**(b) Update rule:** Generic, domain-agnostic hooks → `shared/hooks/`; domain hooks → owning module. Hooks bridge Presentation and Application only — they call services/query-hooks, never repositories/HTTP directly.

**(c) Seed — generic hooks named in [architecture/README.md](../architecture/README.md):** `useDebounce`, `useMediaQuery`, `useOnlineStatus` (in `shared/hooks/`, **Planned**). Module hooks: **Seeded — populated as features ship.**

## 24. Utility Registry

**(a) Schema**

| Column   | Definition                                                             |
| -------- | ---------------------------------------------------------------------- |
| Name     | Function name (`camelCase`).                                           |
| Location | `shared/utils` / `shared/helpers` / `modules/<m>/utils`.               |
| Purpose  | What it computes.                                                      |
| Pure?    | Must be pure (utils) — yes/no.                                         |
| Layer    | Domain-agnostic (`shared/utils`) vs domain (`shared/helpers`, module). |
| Status   | Planned / Shipped.                                                     |

**(b) Update rule:** `shared/utils` = pure, domain-agnostic; `shared/helpers` = domain-agnostic composed helpers; module `utils/` = module-pure helpers. Date/currency/format wrappers live in `shared/lib`. No util may import a module.

**(c) Seed:** Wrappers planned in `shared/lib` (date, currency, telemetry, storage, query, i18n). **Seeded — populated as features ship.**

## 25. API Registry

**(a) Schema**

| Column              | Definition                                    |
| ------------------- | --------------------------------------------- |
| Endpoint            | Logical operation (e.g. `GET /patients/:id`). |
| Module              | Owning module.                                |
| DTO                 | Zod-validated DTO type (`*.dto.ts`).          |
| Model               | Domain Model returned to UI.                  |
| Mapper              | `*.mapper.ts` (DTO⇄Model).                    |
| Repository          | `*.repository.ts` returning Models.           |
| Query/Mutation hook | TanStack hook name.                           |
| Status              | Planned / Shipped.                            |

**(b) Update rule:** Every endpoint flows through the pipeline `HTTP → DTO (Zod at boundary) → mapper → Model → Repository → Service → Query hook → UI`. The transport (`HttpClient`) is never imported in UI. A backend rename changes **one mapper** only. Each new endpoint adds a row here + DTO/mapper/repository entries.

**(c) Seed:** No endpoints yet. **Seeded — populated as features ship.** First entries expected in Phase 5 (`appointments`).

## 26. Route Registry

**(a) Schema**

| Column         | Definition                                     |
| -------------- | ---------------------------------------------- |
| Path           | Route path (route root or nested).             |
| Module         | Owning module (`routes.tsx`).                  |
| Page           | Page component.                                |
| Guard          | Permission/auth guard (`<Can>` / route guard). |
| Lazy           | Code-split? (y/n).                             |
| i18n title key | Localized title key.                           |
| Status         | Planned / Shipped.                             |

**(b) Update rule:** Global path constants live in `src/routes/` (or `shared/config` route registry); each module owns its subtree in `routes.tsx` (lazy-loaded). Add a row per route; routes are guarded by permissions; titles are i18n keys. No hardcoded paths in components — import from the route manifest.

**(c) Seed — module route roots (all **Planned**, lazy):**

| Path             | Module                            |
| ---------------- | --------------------------------- |
| `/patients`      | `patients`                        |
| `/appointments`  | `appointments`                    |
| `/queue`         | `queue`                           |
| `/consultation`  | `consultation`                    |
| `/prescriptions` | `prescriptions`                   |
| `/pharmacy`      | `pharmacy`                        |
| `/billing`       | `billing`                         |
| `/follow-up`     | `follow-up`                       |
| `/records`       | `records`                         |
| `/analytics`     | `analytics`                       |
| `/settings`      | `settings`                        |
| `/doctor`        | `doctor`                          |
| `/reception`     | `reception`                       |
| `/admin`         | `admin`                           |
| `/login`         | auth (`shared`/`admin`) — Phase 4 |

## 27. State Registry

**(a) Schema**

| Column        | Definition                                                     |
| ------------- | -------------------------------------------------------------- |
| Store / slice | Store name (`thing.store.ts`).                                 |
| Location      | `shared/store` (global UI) or `modules/<m>/store` (module UI). |
| Kind          | Global UI / Module UI.                                         |
| Holds         | What UI state (never server data).                             |
| Selectors     | Key selectors.                                                 |
| Persisted?    | Persisted to storage? (y/n).                                   |
| Status        | Planned / Shipped.                                             |

**(b) Update rule (from Phase 1 §9):** Server data → **TanStack Query only** (never copied into Zustand). Global UI/app state → `shared/store` Zustand slices. Module UI state → module `store/`. Form state → React Hook Form. URL state → Router/search params. Ephemeral → `useState`/`useReducer`. **Anti-pattern (forbidden):** caching server data in Zustand.

**(c) Seed — global UI stores named in [architecture/README.md](../architecture/README.md)** (`shared/store/`, **Planned**): `theme`, `locale`, `session`, `layout`. Module stores: **Seeded — populated as features ship.**

## 28. Form Registry

**(a) Schema**

| Column        | Definition                                       |
| ------------- | ------------------------------------------------ |
| Form          | Form name.                                       |
| Module        | Owning module.                                   |
| Schema        | Zod schema (`*.schema.ts`).                      |
| Fields        | Key fields.                                      |
| Submit action | Service/mutation invoked.                        |
| A11y          | Field/Label/ErrorText wiring + localized errors. |
| Status        | Planned / Shipped.                               |

**(b) Update rule:** All forms use **React Hook Form + Zod resolver**, wired through the `Field`/`Label`/`HelpText`/`ErrorText` primitives. Validation messages are **i18n keys**. Form state stays local to the form. Add a row per form with its schema.

**(c) Seed:** No forms yet. First expected: Book Appointment (Phase 5), Login (Phase 4). **Seeded — populated as features ship.**

## 29. Table Registry

**(a) Schema**

| Column   | Definition                                |
| -------- | ----------------------------------------- |
| Table    | Table/grid name.                          |
| Module   | Owning module.                            |
| Columns  | Column set.                               |
| Density  | comfortable / compact.                    |
| Features | sort / filter / paginate / sticky header. |
| A11y     | `<caption>`, scope headers, `aria-sort`.  |
| Source   | Query hook feeding it.                    |
| Status   | Planned / Shipped.                        |

**(b) Update rule:** All tables use the `Table`/`DataGrid` primitive with accessible `<caption>`, scoped headers, and `aria-sort`. Data comes from a TanStack Query hook (never local server-data copies). Filters/pagination go in URL state where shareable. Add a row per table.

**(c) Seed:** No tables yet. First expected: Patient list, Queue list, Pharmacy stock (Phase 5+). **Seeded — populated as features ship.**

## 30. Theme Registry

> **Phase 5 — implemented:** the runtime [Theme Engine](../theme-engine/README.md) (manager / hooks / utils / clinic-branding) applies these themes. Modes: light · dark · high-contrast · large-text · reduced-motion · density · clinic-brand / white-label. Persistence: individual localStorage keys + cross-tab sync + pre-paint no-flash script.

**(a) Schema**

| Column       | Definition                                   |
| ------------ | -------------------------------------------- |
| Theme / mode | Theme or accessibility mode name.            |
| Selector     | `data-theme` / `data-*` flag on `<html>`.    |
| Re-maps      | Which token tier it changes (semantic only). |
| Purpose      | Intent.                                      |
| Status       | Planned / Shipped.                           |

**(b) Update rule (from [Frontend-Bible.md](../Frontend-Bible.md) §4):** Themes re-map the **semantic tier only**; primitives and component tokens never change between themes. Themes/modes are selected via `data-theme` / `data-*` on `<html>`, set by the `theme` Zustand store and persisted. A new theme = a new semantic map file; **no component edits**.

**(c) Seed (all **Planned**):**

| Theme / mode    | Selector                                             | Purpose                           |
| --------------- | ---------------------------------------------------- | --------------------------------- |
| Light           | `data-theme="light"`                                 | Default theme.                    |
| Dark            | `data-theme="dark"`                                  | Dark semantic overrides.          |
| High-contrast   | `data-theme="hc"` (pairs with light/dark)            | WCAG AAA-leaning contrast.        |
| Reduced-motion  | `data-motion="reduced"` (+ `prefers-reduced-motion`) | Disable non-essential motion.     |
| Large Text Mode | `data-text="large"`                                  | Scale root token; whole UI grows. |
| RTL             | `dir="rtl"` (Urdu/Arabic)                            | Logical-property mirroring.       |

## 31. Localization Registry

**(a) Schema**

| Column       | Definition                             |
| ------------ | -------------------------------------- |
| Language     | Name.                                  |
| Code         | ISO code.                              |
| Direction    | LTR / RTL.                             |
| Catalog path | `src/locales/<code>/<namespace>.json`. |
| Namespaces   | i18n namespaces present.               |
| Status       | Planned / Shipped.                     |

**(b) Update rule (from Phase 1 §8):** Keys are `namespace.area.element` with ICU plurals/gender. **No hardcoded strings** (linted) — including `aria-label`s/errors. Every new namespace/key is added across **all** active languages. Runtime switch without reload; bundles lazy-loaded. RTL via logical properties only.

**(c) Seed (all **Planned**):**

| Language | Code | Direction |
| -------- | ---- | --------- |
| English  | `en` | LTR       |
| Hindi    | `hi` | LTR       |
| Marathi  | `mr` | LTR       |
| Urdu     | `ur` | **RTL**   |

Namespaces: **Seeded — populated as features ship** (e.g. `common`, `nav`, then per-module: `appointments`, `vitals`, `billing`…).

## 32. Asset Registry

> **Asset System — implemented:** the [Asset Registry](../../src/shared/config/assets.ts) (`assetUrl(key)`; CDN base via `VITE_ASSET_BASE_URL`) + the [Icon Registry](../../src/shared/design-system/icons/registry.ts) (semantic categorised icons) + the two-tier `src/assets/**` (bundled) / `public/assets/**` (served) tree. Standards: [docs/assets/](../assets/README.md). Optimize via `pnpm optimize:svg`; audit via `pnpm check:assets`.

**(a) Schema**

| Column   | Definition                       |
| -------- | -------------------------------- |
| Asset    | Name.                            |
| Type     | font / icon / image / animation. |
| Location | `src/assets/<type>/`.            |
| Usage    | Where/why used.                  |
| License  | License/source.                  |
| Status   | Planned / Shipped.               |

**(b) Update rule:** Fonts/icons/images/animations live under `src/assets/`. Icons use **lucide-react** (tree-shakeable) — register only non-lucide custom assets here. Decorative imagery is `aria-hidden`/has localized `alt`. Add a row per non-trivial asset with its license.

**(c) Seed (all **Planned**):**

| Asset                     | Type  | Notes                                                                             |
| ------------------------- | ----- | --------------------------------------------------------------------------------- |
| Plus Jakarta Sans         | font  | Headings (`shared/styles` typography tokens).                                     |
| Inter                     | font  | Body text.                                                                        |
| lucide-react icon set     | icon  | Default icon library (consistent stroke).                                         |
| Empty-state illustrations | image | Calm, friendly empty states (per [Frontend-Bible.md](../Frontend-Bible.md) §6.3). |

Other assets: **Seeded — populated as features ship.**

---

---

# Part 5 — Governance, Registries-of-Registries & History

## 33. Architecture Registry (PART 10)

> **PART 10 requirement:** explicitly register **every architecture decision, every folder category, every file category, every rule, every dependency, every naming standard, and every convention.** This section + [§34](#34-convention-registry-part-10) are the registries-of-registries. They **cross-link** to the detailed docs rather than duplicating their content.

### 33.1 Architecture decisions registry

All structural decisions live in the [ADR Log (§35)](#35-architectural-decisions-adr-log). Every decision carries the Decision Contract (_Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations_). Seed: **ADR-0001** (domain-module evolution).

### 33.2 Folder-category registry

Every top-level folder and its role (full 7-field contract in [FolderStructure.md](../architecture/FolderStructure.md)):

| Category              | Folder                                                                                                                                                                                                                                                                       | Role                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Composition root      | `app/`                                                                                                                                                                                                                                                                       | Providers, router, layouts, bootstrap, global error boundary.  |
| Cross-module journeys | `processes/`                                                                                                                                                                                                                                                                 | Patient Journey state machine across modules.                  |
| Bounded contexts      | `modules/`                                                                                                                                                                                                                                                                   | Self-contained, identically structured domain packages.        |
| Global domain         | `entities/`                                                                                                                                                                                                                                                                  | Cross-module entities (patient, clinic, doctor, user, tenant). |
| Cross-cutting reuse   | `shared/`                                                                                                                                                                                                                                                                    | Design-system, core, api, lib, infra ports (domain-agnostic).  |
| Assets                | `assets/`                                                                                                                                                                                                                                                                    | fonts/icons/images/animations.                                 |
| Routing manifest      | `routes/`                                                                                                                                                                                                                                                                    | Global path constants + metadata.                              |
| Testing               | `testing/`                                                                                                                                                                                                                                                                   | Render helpers, fixtures, a11y harness.                        |
| Mocking               | `mock/`                                                                                                                                                                                                                                                                      | MSW handlers, seed data.                                       |
| Localization          | `locales/`                                                                                                                                                                                                                                                                   | i18n catalogs per language.                                    |
| Module sub-layers     | `pages/components/hooks/store` (Presentation), `services` (Application), `types/schemas/validators/constants` (Domain), `api/repositories/mappers/adapters` (Infrastructure)                                                                                                 | The mini Clean Architecture inside each module.                |
| `shared/` sub-folders | design-system, core, api, lib, hooks, providers, contexts, store, config, constants, types, schemas, validators, utils, helpers, guards, middleware, theme, styles, localization, permissions, notifications, analytics, logger, errors, monitoring, workers, offline, cache | ~30 cross-cutting categories.                                  |

### 33.3 File-category registry

Canonical file kinds and their naming (full rules: [NamingConvention.md](../architecture/NamingConvention.md) / Phase 1 [Naming-Convention.md](../Naming-Convention.md)):

| File category      | Pattern                                      | Layer                    |
| ------------------ | -------------------------------------------- | ------------------------ |
| Component          | `PascalCase.tsx`                             | Presentation             |
| Hook               | `useThing.ts`                                | Presentation⇄Application |
| Store              | `thing.store.ts`                             | UI state                 |
| Service            | `thing.service.ts`                           | Application              |
| Repository         | `thing.repository.ts`                        | Infrastructure           |
| Mapper             | `thing.mapper.ts`                            | Infra→Domain boundary    |
| DTO                | `thing.dto.ts`                               | Infrastructure           |
| Schema             | `thing.schema.ts`                            | Domain                   |
| Types              | `thing.types.ts`                             | Domain                   |
| Module public API  | `index.ts`                                   | Module surface           |
| Module routes      | `routes.tsx`                                 | Routing                  |
| Module permissions | `permissions.ts`                             | RBAC                     |
| Module brain       | `BRAIN.md`                                   | Local memory             |
| Test / E2E / Story | `*.test.tsx` / `*.spec.ts` / `*.stories.tsx` | Testing/docs             |

### 33.4 Rules registry

| Rule                                             | Source                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 8 Non-Negotiable Laws                            | [Brain.md §2](../Brain.md) / [§15](#15-enterprise-rules)                                                         |
| Dependency Rule (downward-only, public-API-only) | [Brain.md §5](../Brain.md), [DependencyRules.md](../architecture/DependencyRules.md)                             |
| Backend-independence pipeline                    | [Brain.md §5.3](../Brain.md), [FeatureArchitecture.md](../architecture/FeatureArchitecture.md)                   |
| Token Rule (3-tier, semantic/component only)     | [Frontend-Bible.md §3](../Frontend-Bible.md)                                                                     |
| 4 async states on every data surface             | [Brain.md §11](../Brain.md)                                                                                      |
| State-home rules (server→Query, UI→Zustand)      | [Brain.md §9](../Brain.md), [§27](#27-state-registry)                                                            |
| Cross-module via `index.ts`; no cycles           | [architecture/README.md §3](../architecture/README.md), [DependencyRules.md](../architecture/DependencyRules.md) |
| Registry update law                              | [BrainRules.md](../architecture/BrainRules.md), [AI_RULES.md](../architecture/AI_RULES.md)                       |
| Decision Contract on every decision              | [architecture/README.md §5](../architecture/README.md)                                                           |

### 33.5 Dependency registry

The package→purpose→layer table is the authoritative dependency registry — see [§18](#18-dependencies). Adding a dependency requires an ADR.

### 33.6 Naming-standard registry

All naming standards are registered in [§33.3](#333-file-category-registry) (files) and [§34](#34-convention-registry-part-10) (symbols/folders/keys), cross-linking [NamingConvention.md](../architecture/NamingConvention.md) and Phase 1 [Naming-Convention.md](../Naming-Convention.md).

## 34. Convention Registry (PART 10)

Every naming/structural convention, registered once. Full rules: [NamingConvention.md](../architecture/NamingConvention.md) / [Naming-Convention.md](../Naming-Convention.md).

| Thing                   | Convention                                   | Example                         |
| ----------------------- | -------------------------------------------- | ------------------------------- |
| Component file          | `PascalCase.tsx`                             | `VitalsCard.tsx`                |
| Hook                    | `useThing.ts`                                | `usePatient.ts`                 |
| Store                   | `thing.store.ts`                             | `auth.store.ts`                 |
| Service                 | `thing.service.ts`                           | `billing.service.ts`            |
| Repository              | `thing.repository.ts`                        | `patient.repository.ts`         |
| Mapper                  | `thing.mapper.ts`                            | `patient.mapper.ts`             |
| DTO                     | `thing.dto.ts`                               | `patient.dto.ts`                |
| Schema                  | `thing.schema.ts`                            | `appointment.schema.ts`         |
| Types                   | `thing.types.ts`                             | `queue.types.ts`                |
| Test / E2E / Story      | `*.test.tsx` / `*.spec.ts` / `*.stories.tsx` | —                               |
| Folder / slice / module | `kebab-case`                                 | `book-appointment`, `follow-up` |
| Constant                | `UPPER_SNAKE_CASE`                           | `MAX_QUEUE_SIZE`                |
| i18n key                | `namespace.area.element`                     | `vitals.form.bloodPressure`     |
| Token (primitive)       | `--color-rose-500`, `--space-4`              | raw scale                       |
| Token (semantic)        | `--color-primary`, `--color-surface`         | intent                          |
| Token (component)       | `--button-bg`, `--card-radius`               | per-component                   |
| Import surface          | only via `index.ts`                          | no deep imports                 |
| Route path              | `/kebab-case` from manifest                  | `/follow-up`                    |

## 35. Architectural Decisions (ADR Log)

**Schema:** ADR-NNNN · Title · Status (Proposed/Accepted/Superseded) · Date · Decision Contract summary · Link.
**Rule:** Every structural change requires a new ADR (`docs/adr/NNNN-*.md`) **and** a PROJECT_BRAIN update. Decisions carry the full Decision Contract.

| ADR          | Title                                                                                                                                                                                                                                                                                                                                                                                                     | Status       | Date       | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ADR-0001** | **Domain-module evolution** — organize feature/widget/page/local-entity slices **by bounded context** inside `src/modules/<context>/`, each an internally-layered Clean Architecture package with an identical template.                                                                                                                                                                                  | **Accepted** | 2026-06-27 | The single structural evolution from Phase 1's flat FSD layers. _Why:_ clear team ownership, domain cohesion, parallel work, lazy boundaries, micro-frontend-ready. _Trade-offs:_ cross-module entities need a home (→ `entities/`), duplication risk (→ `shared/` + reuse-first). _Alternatives:_ flat FSD (blurry ownership), micro-frontends now (premature), Nx libs (heavier; kept as future option). _Future:_ a module can be extracted to a package/remote with **zero import changes** (all cross-module access flows through `index.ts`). _Enterprise:_ maps to team topologies, CODEOWNERS, independent release cadences. Full text: [architecture/README.md §0](../architecture/README.md). |
| ADR-0002     | Tech-stack ratification (TS5/Vite5/React18/Router6/TanStack Query5/Zustand/RHF+Zod/Tailwind+CVA/i18next/MSW/Vitest/Playwright/Storybook).                                                                                                                                                                                                                                                                 | Accepted     | 2026-06-27 | Authoritative stack from [Brain.md §4](../Brain.md). Alternatives require a new ADR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ADR-0003     | 3-tier design tokens (Primitive→Semantic→Component); components consume semantic/component only.                                                                                                                                                                                                                                                                                                          | Accepted     | 2026-06-27 | From [Frontend-Bible.md §3](../Frontend-Bible.md). Enables themes without component edits.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ADR-0004     | Backend-independence pipeline (DTO→Mapper→Model→Repository→Service→Query→UI).                                                                                                                                                                                                                                                                                                                             | Accepted     | 2026-06-27 | From [Brain.md §5.3](../Brain.md). 10-years-without-rewrite guarantee.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **ADR-0005** | **HTTP via Axios behind the `HttpClient` port** (+ ratifies new runtime deps `framer-motion`, `react-helmet-async`, `react-hot-toast`, `react-dropzone`, `dayjs`, `react-error-boundary`, each behind a wrapper/port).                                                                                                                                                                                    | **Accepted** | 2026-06-27 | UI never imports axios; only `shared/api`. `react-helmet` → `react-helmet-async` (maintained). Full text: [adr/0005](../adr/0005-http-axios-behind-port.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **ADR-0006** | **Fail-fast runtime env validation with Zod** in `shared/config/env.ts`.                                                                                                                                                                                                                                                                                                                                  | **Accepted** | 2026-06-27 | Invalid/missing env throws at boot with a clear message; typed `env` everywhere. [adr/0006](../adr/0006-runtime-env-validation-zod.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **ADR-0007** | **Toolchain: pnpm + ESLint flat config (boundaries) + Prettier + Husky/lint-staged + Commitlint + tsconfig path aliases + Vite build/manualChunks.**                                                                                                                                                                                                                                                      | **Accepted** | 2026-06-27 | Architecture is _linted_; conventional commits; single-source aliases. [adr/0007](../adr/0007-tooling-pnpm-eslint-flat-husky.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **ADR-0008** | **3-tier design-token system implemented** as `tokens/{primitives,semantic,components}.css` + barrel + `themes.css`; Tailwind is a thin `var(--…)` alias layer; healthcare semantics (queue/vital/emergency/chart) added; `emergency` deliberately breaks the calm palette for life-safety; white-label via `data-clinic-theme`.                                                                          | **Accepted** | 2026-06-27 | Themes/large-text/RTL = pure CSS-var swaps, zero component churn. Full values: [docs/design-system/](../design-system/README.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **ADR-0009** | **Theme Engine** — manager-based runtime (vanilla external store + `useSyncExternalStore`) over CSS-variable tokens; clinic branding via an injectable `ClinicBrandSource` PORT (backend-independent) with runtime shade generation + WCAG contrast validation; preferences as individual keys + cross-tab sync + a pre-paint no-flash script; theme changes are attr/CSS-var swaps (no React re-render). | **Accepted** | 2026-06-27 | White-label without source edits; [docs/theme-engine/](../theme-engine/README.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **ADR-0010** | **Component library** — presentational UI kit in `shared/design-system/` using CVA + semantic Tailwind utilities (token-backed) + `forwardRef`; a11y-first (accessible names via props, never color-only); Storybook 8 + addon-a11y as the living catalog; wired Tailwind `@tailwind` directives so utilities emit.                                                                                       | **Accepted** | 2026-06-27 | Components are string-agnostic (i18n at call sites), tree-shakeable, theme-driven by tokens. [docs/design-system/Components.md](../design-system/Components.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **ADR-0011** | **Asset Management System** — two-tier assets (bundled source vs CDN-served-by-key); an **Icon Registry** as the single semantic icon source (vendor-independent, swappable); served assets addressed by stable key via `assetUrl()` (white-label/CDN with zero code edits); SVGO pipeline + duplicate/unused checks.                                                                                     | **Accepted** | 2026-06-30 | Decouples artwork location + icon vendor from code; CDN/white-label ready. [docs/assets/](../assets/README.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **ADR-0012** | **Design System Architecture** — a layered system (tokens → theme → primitives/components → patterns → templates) with ONE component architecture; a **code-enforced Component Registry** (validated against folders + barrel by `pnpm ds:registry`) as the single source of truth that prevents duplicate components; categories + standards govern every component.                                     | **Accepted** | 2026-06-30 | 10-year reusability/scalability; "always check the registry" is _enforced_, not asked. [docs/design-system/DesignSystem.md](../design-system/DesignSystem.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

| **ADR-0013** | **Engineering Quality Platform** — a permanent, automated QA system: 22 engineering standards + 12 PR quality gates (`pnpm quality`) enforced by ESLint + four dependency-free Node validators (`validate-architecture`, `check-duplicates`, `check-tokens`, `check-i18n`, `check-perf-budget`); perf budgets in `scripts/quality/budgets.json`; the full `docs/engineering/` canon (standards, gates, lint rules, architecture/perf/a11y/loc validation, docs standards, Definition of Done, review checklists, AI quality rules, Quality Registry). | **Accepted** | 2026-06-30 | After Phase 9 every change (human or AI) is held to the same automated gates — drift, duplication, hardcoded values, untranslated/inaccessible UI, and budget regressions are blocked in CI, not asked for. _Why:_ a 10-year healthcare system needs enforced, not aspirational, quality. _Trade-offs:_ stricter CI + more ceremony per PR, paid back at every review/incident. _Alternatives:_ docs-only standards (drift), heavyweight platforms like Nx/Knip now (premature; rostered as Future Improvements). [docs/engineering/](../engineering/README.md). |

| **ADR-0014** | **DevOps & Automation Platform** — a permanent, automated delivery pipeline on top of the Phase-9 quality gate: a **trunk-based git strategy** (protected `main`, short-lived feature branches, squash + linear history, Conventional Commits, immutable `vX.Y.Z` tags), a **GitHub architecture** (CODEOWNERS team-topology, issue/PR templates, a synced label taxonomy, declared branch protection), **CI/CD** (extended `ci.yml` + CodeQL SAST, dependency-review, release-drafter, labeler, release, deploy), **SemVer** versioning **derived** from commits/labels, an **automated release flow** (push tag → GitHub Release), a **deterministic phase-completion pipeline** (`pnpm phase:complete`), documentation + Brain **validators** wired into `verify`/CI, **Dependabot** + secret/code/license scanning, and the `docs/devops/` canon (14 docs) + **DevOps Registry**. | **Accepted** | 2026-06-30 | Delivery becomes automated and enforced, not improvised: every push is gated, every release is reproducible from a tag, every phase closes identically, and security/dependency/license/doc/Brain drift is blocked in CI. _Why:_ a 10-year healthcare product must ship safely and the same way every time. _Trade-offs:_ more pipeline ceremony per release, repaid at every review/incident. _Alternatives:_ full Git Flow now (premature — `develop`/`release` branches are pre-specified for later adoption), heavyweight release tooling (semantic-release/Nx) now (premature — the dependency-free `scripts/phase` + `scripts/release` mirror the existing `scripts/quality` style). [docs/devops/](../devops/README.md). |

> Future ADRs append below ADR-0014. Never renumber; supersede instead.

## 36. Technical Debt

**Schema:** ID · Description · Impact · Owner · Created · Status.
**Rule:** Any knowingly-deferred compromise gets a row here and a `// TODO(DEBT-NNNN)` in code.

| ID        | Description                                                                                                                 | Impact                                              | Status                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| DEBT-0001 | Storybook deferred to Phase 4 (design-system); `storybook` / `build-storybook` scripts print a deferral notice for now.     | No living component docs / visual a11y harness yet. | ✅ Resolved (Phase 6 — Storybook 8) |
| DEBT-0002 | `shared/styles/tokens.css` ships a **foundation subset** of token ramps; full Primitive ramps land with the design system.  | Limited palette until Phase 4.                      | ✅ Resolved (Phase 4)               |
| DEBT-0003 | High-contrast theme uses a single `data-theme="high-contrast"` rather than the Frontend-Bible `hc-light` / `hc-dark` split. | Minor theming nuance deferred.                      | Open — Phase 4                      |
| DEBT-0004 | `AuthProvider` is a documented placeholder in `AppProviders.tsx`; no auth/session built (by design this phase).             | No auth until Phase 5.                              | Open — Phase 5                      |
| DEBT-0005 | MSW `handlers.ts` is empty; real handlers arrive with the first vertical slice.                                             | No mocked APIs yet.                                 | Open — Phase 6                      |

## 37. Known Constraints

| Constraint                        | Detail                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Backend not yet defined           | UI must remain backend-independent; all data behind repositories/MSW until real APIs exist. |
| Litmus test gate                  | Every screen must pass the non-technical-65-year-old test, in-language.                     |
| WCAG 2.2 AA floor                 | Non-negotiable; CI a11y gate blocks merges.                                                 |
| Token-only visuals                | No hardcoded color/size/space/radius/shadow/duration/font — ever.                           |
| String-only-via-i18n              | No hardcoded human-readable text — ever (linted).                                           |
| Active languages                  | en, hi, mr, ur (ur is RTL); every key added to all four.                                    |
| Downward-only, cycle-free imports | Enforced by `eslint-plugin-boundaries` + `import/no-cycle`.                                 |
| No vendor SDK in components       | HTTP/Sentry/analytics always behind ports.                                                  |
| Server data lives only in Query   | Never cache server data in Zustand.                                                         |
| Platform reality                  | Authored on Windows; tooling must be cross-platform.                                        |

## 38. Future Roadmap

| Horizon | Theme                                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Near    | Design-system implementation; auth + app shell; first vertical slice (appointments).                                                                                |
| Mid     | Full patient-journey modules; offline (Outbox/PWA); RBAC + multi-tenant admin; analytics dashboards.                                                                |
| Long    | Mobile (React Native / responsive PWA); micro-frontends via Module Federation; more languages; deeper compliance (region-specific); AI-assisted clinical workflows. |

Concrete phase plan: [§40](#40-pending-phases).

## 39. Completed Phases

| Phase        | Name                             | Deliverable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Status      |
| ------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| **Phase 1**  | **Foundation v1**                | The 12 canon docs: [Brain.md](../Brain.md), [Frontend-Foundation-Blueprint.md](../Frontend-Foundation-Blueprint.md), [Architecture.md](../Architecture.md), [Frontend-Bible.md](../Frontend-Bible.md), [Folder-Structure.md](../Folder-Structure.md), [Naming-Convention.md](../Naming-Convention.md), [Coding-Standards.md](../Coding-Standards.md), [Developer-Rules.md](../Developer-Rules.md), [Documentation-Guidelines.md](../Documentation-Guidelines.md), [AI-Rules.md](../AI-Rules.md), [Project-Checklist.md](../Project-Checklist.md), [README.md](../README.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ✅ Complete |
| **Phase 2**  | **Enterprise Architecture**      | This canon: [architecture/README.md](../architecture/README.md) + the Phase 2 document set (Architecture, FolderStructure, ProjectStructure, FeatureArchitecture, NamingConvention, DependencyRules, Diagrams, BrainRules, AI_RULES, DeveloperGuide) + **this PROJECT_BRAIN.md**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ✅ Complete |
| **Phase 3**  | **Engineering Foundation**       | Production-ready project scaffold (`src/` + root config), built & verified: Vite + TS(strict) + React; ESLint flat (boundaries) / Prettier / EditorConfig / Husky / lint-staged / Commitlint; Zod-validated env; path aliases; package scripts; `shared/config` architecture; app bootstrap + full provider hierarchy; RootErrorBoundary; logger; HttpClient (axios) port; TanStack Query client (+persist); i18n (en/hi/mr/ur + RTL); theme/notifications kernels; MSW + Vitest/RTL harness; token subset. Docs: root [README.md](../../README.md), [EnvironmentGuide.md](../architecture/EnvironmentGuide.md), DeveloperGuide (extended), ADR-0005/0006/0007. **typecheck + build + lint + format + tests all green.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ✅ Complete |
| **Phase 4**  | **Design Token System**          | The permanent design language (Part 1 of the design-system phase), implemented & verified: 3-tier tokens split into `src/shared/styles/tokens/{primitives,semantic,components}.css` (barrel `tokens.css`) + expanded `themes.css`; full 50–900 ramps, complete type scale, 8pt spacing, radius/elevation/motion, healthcare semantics (queue status, vital severity, emergency, chart palette), white-label `data-clinic-theme` hook; Tailwind fully mapped; `shared/theme/tokens.ts` (JS access for framer-motion/charts). Docs: [docs/design-system/](../design-system/README.md) (9 files). **typecheck + lint + build + format + tests green.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ✅ Complete |
| **Phase 5**  | **Theme Engine**                 | The runtime theme engine in `src/shared/theme/` over the Phase-4 tokens: ThemeManager (stable snapshot + `useSyncExternalStore`, matchMedia + cross-tab storage sync), registry/loader/validator/generator, context + 8 hooks (useTheme/useThemeMode/useColorScheme/useReducedMotion/useLargeText/useDensity/useDirection/useClinicBrand), pure utils (color/contrast/generate-shades/get-token/apply-theme/preferences), and a clinic-branding engine via an injectable `ClinicBrandSource` port (AA-safe shade generation, no source changes). No-flash `<head>` script + compact density. Docs: [docs/theme-engine/](../theme-engine/README.md) (9). **typecheck + lint + build + format + tests green.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ✅ Complete |
| **Phase 6**  | **Component Library (UI Kit)**   | The foundational design-system components in `src/shared/design-system/` on the Phase-4 tokens + Phase-5 theme engine — 24 components (Button, IconButton, Input, Textarea, Label, FormField, Checkbox, Radio/RadioGroup, Switch, Select; Card+subparts, BentoGrid/Item, Divider, Badge, StatusBadge, Avatar, Spinner, Skeleton, Icon, VisuallyHidden; Alert, EmptyState, ErrorState, Tooltip) with CVA variants, `forwardRef`, WCAG 2.2 AA, token-only Tailwind utilities, and Storybook 8 (+ a11y addon): stories for all + axe tests for the key set. Also fixed a latent bug — Tailwind's `@tailwind` directives were never injected (no utilities emitted), now wired in global.css. Catalog: [docs/design-system/Components.md](../design-system/Components.md). **typecheck + lint + build + format + tests green.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ✅ Complete |
| **Phase 7**  | **Asset Management System**      | The governed visual foundation: a two-tier asset architecture (bundled `src/assets/**` + CDN-ready `public/assets/**` addressed by stable key), the **Icon Registry** (`design-system/icons` — semantic categorised icons decoupling lucide, consumed via `<Icon>`), the **Asset Registry** (`shared/config/assets.ts` → `assetUrl()`, CDN base via `VITE_ASSET_BASE_URL`), an SVGO optimization pipeline + a duplicate/unused hygiene check, the full asset folder tree, and `docs/assets/` (7 guides). **typecheck + lint + build + tests green.** _(The user's "Phase 6 — asset system"; report at `docs/reports/phase-006-report.md`.)_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ✅ Complete |
| **Phase 8**  | **Design System Architecture**   | The permanent design-system blueprint: the layered model (tokens → theme → primitives/components → patterns → templates), the complete folder + component architecture, component categories + standards (a11y / i18n / states / API / healthcare), and the **Component Registry** — `design-system/registry/component-registry.ts` (24 shipped + 14 planned) validated against folders + barrel and catalogued by `pnpm ds:registry`. Eight `docs/design-system/` guides (DesignSystem, ArchitectureGuide, ComponentStandards, ContributionGuide, StorybookGuide, TestingGuide, MigrationGuide, BestPractices) + the generated ComponentRegistry.md. **typecheck + lint + build + tests + ds:registry green.** _(The user's "Phase 7"; report at `docs/reports/phase-007-report.md`.)_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ✅ Complete |
| **Phase 9**  | **Engineering Quality Platform** | The permanent QA system governing every future feature: 22 engineering standards + a 12-gate PR pipeline (`pnpm quality`) — ESLint enterprise rules (no-`any`, no hardcoded hex, memoized context, no-`console`) + five dependency-free Node validators (`scripts/quality/`: architecture, duplicates, design-tokens, i18n key-parity, performance budget) + the orchestrator that regenerates the Engineering Quality Report. Perf budgets in `scripts/quality/budgets.json`; CI extended with all gates. The full `docs/engineering/` canon (13 docs: Standards, QualityGates, LintRules, ArchitectureValidation, PerformanceBudgets, AccessibilityValidation, LocalizationValidation, DocumentationStandards, DefinitionOfDone, ReviewChecklists, AIQualityRules, QualityRegistry, README). ADR-0013. **typecheck + lint + format + tests + build + arch + duplicates + tokens + i18n + perf + ds:registry + assets all green.** _(report at `docs/reports/phase-009-report.md`.)_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ✅ Complete |
| **Phase 10** | **DevOps & Automation Platform** | The permanent delivery platform governing how every future change ships: a trunk-based **git strategy** (protected `main`, short-lived branches, squash + linear history, Conventional Commits, immutable tags); a **GitHub architecture** (`.github/` — CODEOWNERS, PR + 3 issue templates, synced label taxonomy, declared branch protection); **CI/CD** — extended `ci.yml` (now also `validate:docs` + `validate:brain` + build artifact) + six new workflows (CodeQL, dependency-review, release-drafter, labeler, release, deploy); **SemVer** version management derived from commits/labels (`package.json` → `0.10.0`); an **automated release flow** (push `vX.Y.Z` → `release.yml` publishes the GitHub Release with generated notes); a **deterministic phase-completion pipeline** (`pnpm phase:complete` — gate → paperwork → notes → commit·tag·push); **documentation automation** (generated registry/quality/release artifacts + `validate-docs`/`validate-brain` gates); a provider-agnostic **deployment** pipeline (preview/staging/production, approval-gated, health + smoke); **monitoring** (budgets + run-time ports) and **security** (Dependabot, CodeQL, dependency-review, license denylist, least-privilege CI, branch/tag protection). New scripts: `scripts/phase/complete-phase.mjs`, `scripts/release/generate-release-notes.mjs`, `scripts/quality/validate-docs.mjs`, `validate-brain.mjs` + `pnpm phase:complete`/`release:notes`/`validate:docs`/`validate:brain`. The full `docs/devops/` canon (14 docs) + **DevOps Registry**. ADR-0014. **typecheck + lint + format + tests + build + arch + duplicates + tokens + i18n + ds:registry + assets + docs + brain + perf all green.** _(report at `docs/reports/phase-010-report.md`.)_ | ✅ Complete |

## 40. Pending Phases

> **Re-sequenced 2026-06-27:** Phase 3 was originally "Design-system implementation"; it is now **Engineering Foundation** (the dev environment must exist before components can be built). All later phases shifted **+1**.

| Phase | Name | Scope |
| ----- | ---- | ----- |

| **Phase 6 (cont.)** | **Advanced components** | On the shipped UI-kit foundation: Tabs, Table/DataGrid, Dialog, Drawer, Combobox, DatePicker, Pagination, Breadcrumb, Stepper, Toast (component), Menu, Popover — with Storybook coverage. |
| **Phase 5** | **Auth + App Shell** | Replace the Phase-3 `AuthProvider` placeholder: auth/session, token refresh, RBAC engine + `<Can>`; app shell layouts; global stores (theme/locale/session/layout); `/login`. Begin offline scaffolding. |
| **Phase 6** | **First vertical slice — Appointments** | End-to-end `appointments` module proving the full pipeline (DTO→…→UI) + MSW handlers + tests. Seeds API/Route/Form/Table/State registries. |
| **Phase 7** | **Core journey modules** | `reception`, `queue`, `consultation` (incl. vitals) — the check-in→consult flow + `processes/` Patient Journey orchestration. |
| **Phase 8** | **Clinical + commerce modules** | `prescriptions`, `pharmacy`, `billing`, `follow-up`, `records` (lifetime record). |
| **Phase 9** | **Insights + administration** | `analytics` dashboards, `settings`, `admin` (multi-tenant, audit). |
| **Phase 10** | **Offline + PWA hardening** | Query persistence, Outbox sync engine, Workbox SW, installable PWA, conflict policy. |
| **Phase 11** | **Mobile + scale-out** | Mobile target; micro-frontend extraction readiness (Module Federation); additional languages; compliance deepening. |

## 41. Changelog

**Schema:** Date · Phase · Change · Author.

| Date       | Phase    | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-27 | Phase 2  | Authored **PROJECT_BRAIN.md** — the permanent project memory: vision, personas, journey, philosophies, standards, folder/stack/deps, full registry system (Component/Hook/Utility/API/Route/State/Form/Table/Theme/Localization/Asset), Architecture + Convention registries (PART 10), ADR log (seeded ADR-0001–0004), debt, constraints, roadmap, phases. Aligned to [Brain.md](../Brain.md) (Phase 1) and [architecture/README.md](../architecture/README.md) (Phase 2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-06-27 | Phase 2  | Established this file as the living memory updated every phase; [Brain.md](../Brain.md) remains the concise constitution.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-06-27 | Phase 3  | **Engineering Foundation built & verified.** Initialized Vite + React + TS(strict); configured ESLint flat (boundaries/jsx-a11y/i18n) / Prettier / EditorConfig / Husky / lint-staged / Commitlint; Zod-validated env (.env.\*); path aliases; package scripts; `shared/config` (env/app-config/feature-flags/settings); app bootstrap + provider hierarchy; RootErrorBoundary; logger; HttpClient (axios) port; TanStack Query (+persist); i18n en/hi/mr/ur + RTL; theme + notifications kernels; MSW + Vitest/RTL/Playwright harness; token subset + global styles; smoke tests. Verified: install + typecheck + build + lint + format + tests **green**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-06-27 | Phase 3  | Re-sequenced roadmap (Phase 3 = Engineering Foundation; design-system → Phase 4; rest +1). Registered new deps + ADR-0005/0006/0007; added DEBT-0001…0005.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-06-27 | Phase 4  | **Design Token System built & verified.** Implemented the full 3-tier token system in `src/shared/styles/tokens/{primitives,semantic,components}.css` (barrel) + expanded `themes.css` (dark/high-contrast/large-text + white-label `data-clinic-theme` hook): full color ramps, type scale, 8pt spacing, radius/elevation/motion, and healthcare semantics (queue status, vital severity, emergency, 8-hue chart palette). Mapped Tailwind to the tokens; added `shared/theme/tokens.ts` (framer-motion/chart/breakpoint values). Authored [docs/design-system/](../design-system/README.md) (9 reference docs — the token registries) and linked them from Frontend-Bible.md. ADR-0008. Resolved DEBT-0002. Verified: typecheck + lint + build + format + tests **green**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-06-27 | Phase 5  | **Theme Engine built & verified.** Implemented the runtime engine in `src/shared/theme/` (model/branding/utils/manager/context/hooks) on the Phase-4 tokens: ThemeManager (stable snapshot + `useSyncExternalStore`, matchMedia + cross-tab storage sync), registry/loader/validator/generator, 8 hooks, color/contrast/shade-generation/preferences utils, and a clinic-branding engine via an injectable `ClinicBrandSource` port (AA-safe brand ramps, CSS-var + favicon application, no source changes). Added a no-flash `<head>` script + compact density; rebuilt ThemeProvider around the manager. Docs: [docs/theme-engine/](../theme-engine/README.md) (9). ADR-0009. Verified: typecheck + lint + build + format + tests **green**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-06-27 | Phase 6  | **Component Library (UI Kit) built & verified.** Shipped 24 foundational components in `src/shared/design-system/` (CVA + semantic Tailwind utilities + `forwardRef` + WCAG 2.2 AA) with Storybook 8 + addon-a11y — stories for all, axe tests for the key set. Fixed a latent bug: Tailwind's `@tailwind` directives were never injected (so NO utilities were generated) — wired them into global.css with a proper `@layer` cascade. ADR-0010; resolved DEBT-0001 (Storybook). Verified: typecheck + lint + build + format + tests **green**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-06-30 | Phase 6+ | **UI polish — real fonts + live showcase screen.** Loaded the brand fonts via Fontsource (`@fontsource-variable/inter` + `plus-jakarta-sans`) — fixed that Plus Jakarta Sans/Inter were never actually loading (no woff2 files), so typography now renders as designed. Replaced the inline-styled placeholder with a real, token + component-driven `WelcomeScreen` (hero + bento showcase) and a live `ThemeControls` panel that drives the theme engine (appearance / large-text / density / reduced-motion). Added welcome/theme/queue i18n keys (en/hi/mr/ur). Verified: typecheck + lint + build + format + tests green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-06-30 | Phase 7  | **Asset Management System built & verified.** Two-tier asset architecture (bundled `src/assets` + CDN-ready `public/assets` via the Asset Registry `assetUrl()` + `VITE_ASSET_BASE_URL`); the Icon Registry (`design-system/icons` — semantic categorised icons decoupling lucide, consumed via `<Icon>`); SVGO optimization pipeline + `check:assets` (duplicate/unused) hygiene check; the full asset folder tree (brand/icons/illustrations/avatars/images/animations/documents + public favicons/social/splash); 7 `docs/assets/` guides; root `CHANGELOG.md` + `docs/reports/phase-006-report.md`. ADR-0011. Verified: typecheck + lint + build + tests **green**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-06-30 | Phase 8  | **Design System Architecture built & verified.** The permanent design-system blueprint: layered model + folder/component architecture + categories + component standards (a11y/i18n/states/API/healthcare); a code-enforced **Component Registry** (`design-system/registry/component-registry.ts`, 24 shipped + 14 planned) validated + catalogued by `pnpm ds:registry`; 8 `docs/design-system/` guides + generated ComponentRegistry.md; `docs/reports/phase-007-report.md`. ADR-0012. Verified: typecheck + lint + build + tests + ds:registry **green**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-06-30 | Infra    | **Production-readiness pass.** Added CI (`.github/workflows/ci.yml` — full gate + Playwright job on push/PR), Playwright E2E smoke, web essentials (favicon.svg + manifest.webmanifest + OG/meta), LICENSE (proprietary) + CONTRIBUTING.md, and hook hardening (husky corepack fallback, lint-staged --no-warn-ignored, .claude/ gitignored). Closes the CI/license/favicon/E2E gaps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-06-30 | Phase 9  | **Engineering Quality Platform built & verified.** Authored the `docs/engineering/` canon (13 docs: Standards, QualityGates, LintRules, Architecture/Performance/Accessibility/Localization Validation, DocumentationStandards, DefinitionOfDone, ReviewChecklists, AIQualityRules, QualityRegistry, README). Added five dependency-free Node gates under `scripts/quality/` (architecture validation, duplication, design-token compliance, i18n key-parity, performance budget) + a `quality-gate.mjs` orchestrator + `budgets.json`; new pnpm scripts (`validate:arch`, `check:duplicates`, `check:tokens`, `check:i18n`, `check:perf`, `quality`, `quality:quick`) and an extended `verify`. Extended `eslint.config.js` with enterprise rules (no-`any`, no-hardcoded-hex via `no-restricted-syntax`, memoized context values, no-`console` with a logger exemption, self-closing / no-useless-fragment) and fixed a real inline-context-value perf bug in `Radio.tsx` (useMemo). Extended CI with all new gates. ADR-0013; Quality Registry added. Reports: `docs/reports/phase-009-report.md` + generated `docs/reports/engineering-quality-report.md`. Verified: all gates **green**.                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-06-30 | Phase 10 | **DevOps & Automation Platform built & verified.** Stood up the permanent delivery pipeline: a trunk-based git strategy + GitHub architecture (`.github/` — CODEOWNERS, PR + bug/feature/chore issue templates + chooser, `labels.yml` taxonomy + `labeler.yml`, `release-drafter.yml`, `dependabot.yml`, `BRANCH_PROTECTION.md`); extended `ci.yml` (added `validate:docs` + `validate:brain` + build-artifact upload) and added six workflows (`codeql`, `dependency-review`, `release-drafter`, `labeler`, `release`, `deploy`); SemVer version management (`package.json` → `0.10.0`, derived from Conventional Commits/labels); an automated release flow (push `vX.Y.Z` tag → `release.yml` re-verifies, builds, publishes the GitHub Release with generated notes + tarball); a deterministic phase-completion pipeline (`scripts/phase/complete-phase.mjs` → `pnpm phase:complete`) that gates → validates paperwork → generates notes → commit·tag·push; release-notes generator (`scripts/release/generate-release-notes.mjs` → `pnpm release:notes`); two new doc/Brain validators (`scripts/quality/validate-docs.mjs`, `validate-brain.mjs`) wired into `verify` + CI; a provider-agnostic, approval-gated deployment pipeline with health + smoke; monitoring (budgets + run-time ports) and security (CodeQL, dependency-review, Dependabot, license denylist, least-privilege CI, branch/tag protection). The full `docs/devops/` canon (14 docs) + DevOps Registry. ADR-0014. Report: `docs/reports/phase-010-report.md`. Verified: all gates **green**. |

## 42. Future Improvements

- Auto-generate registry rows from code (lint rule / codegen) so registries can't drift from reality.
- Per-module `BRAIN.md` files roll up into this file's registries.
- Visual ADR graph + dependency graph in [Diagrams.md](../architecture/Diagrams.md).
- Token-contrast CI report wired to the Theme Registry.
- i18n key-coverage report wired to the Localization Registry (fail build on missing language).
- Storybook ↔ Component Registry sync check.

---

_Phase 10 · Permanent Project Memory · Last updated 2026-06-30 · Owner: Frontend Architecture · Status: **Foundation v10 — Living**_
_Anchors: [Brain.md](../Brain.md) (Phase 1 constitution) · [architecture/README.md](../architecture/README.md) (Phase 2 canon) · Maintenance: [BrainRules.md](../architecture/BrainRules.md) · [AI_RULES.md](../architecture/AI_RULES.md)_
