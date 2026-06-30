# ClinicOS — Engineering Standards

> **Phase 9 · Part 1.** The standard for every kind of artifact in the ClinicOS
> frontend — from architecture down to git workflow. Each standard states the
> **rule**, **why** it exists, its **benefits**, its **tradeoffs**, and a concrete
> **✅/❌ example**. These standards are enforced by the gates in
> [QualityGates.md](./QualityGates.md), the rules in [LintRules.md](./LintRules.md),
> and the validators in [ArchitectureValidation.md](./ArchitectureValidation.md).
> They **extend** [Coding-Standards.md](../Coding-Standards.md),
> [FolderStructure.md](../architecture/FolderStructure.md),
> [DependencyRules.md](../architecture/DependencyRules.md), and
> [NamingConvention.md](../architecture/NamingConvention.md) — never contradict them.

> **Reading key.** Each section uses: **Standard** (the rule) · **Why** · **Benefits** · **Tradeoffs** · **Example**.

---

## 1. Architecture

**Standard.** ClinicOS is **Feature-Sliced Design (structure) + Domain-Driven Design (language) + Clean Architecture (decoupling)**. Top-level layers import **downward only**, and only through a public `index.ts`: `app → processes → modules → entities → shared`. Inside a module, the Clean-Architecture rings are `Presentation → Application → Domain ← Infrastructure`. Business logic never lives in the UI; the UI never talks to the backend directly (Laws 6 & 7).

- **Why.** A 10-year, multi-team healthcare system rots at its seams. Explicit, enforced layers make the blast radius of any change local and the dependency graph acyclic and reasoned.
- **Benefits.** A module can be lazy-loaded, extracted to a package, or federated with zero import changes; backend reshapes are absorbed in one mapper; new domains are new modules.
- **Tradeoffs.** More indirection and boilerplate than a flat app; the discipline cost is paid up-front. We accept it because the alternative (a big ball of mud) is unrecoverable at this scale.
- **Example.** ✅ `appointments` page imports `usePatient` from `@entities/patient`. ❌ `appointments` imports `@modules/billing/services/invoice.service` (deep, sideways).

See [Architecture.md](../architecture/Architecture.md).

---

## 2. Folder Structure

**Standard.** Only the known top-level layers exist under `src/` (`app, processes, modules, entities, shared, assets, routes, testing, mock, locales`). Each module follows the **identical** template (`pages/ components/ hooks/ services/ repositories/ api/ mappers/ adapters/ types/ schemas/ validators/ constants/ utils/ store/ config/ tests/` + `index.ts, routes.tsx, permissions.ts, README.md, BRAIN.md`).

- **Why.** Predictability: any engineer (or AI) can find anything in any module because every module is shaped the same.
- **Benefits.** Generators and validators can enforce the shape; onboarding is "learn one module."
- **Tradeoffs.** Small modules carry empty folders — we materialise a folder only when it has its first occupant (no empty-folder churn).
- **Example.** ✅ `src/modules/appointments/services/book-appointment.service.ts`. ❌ `src/modules/appointments/logic/booking.ts` (invented segment).

Enforced by `pnpm validate:arch`. See [FolderStructure.md](../architecture/FolderStructure.md).

---

## 3. File Structure

**Standard.** One responsibility per file. Files are **kebab-case slugs with a dotted role suffix** (`book-appointment.service.ts`, `patient.mapper.ts`, `patient.queries.ts`, `auth.store.ts`); React components are `PascalCase.tsx`; hook files are `use-x.ts` (symbol `useX`). Every public surface is exported through `index.ts` only.

- **Why.** The filename tells you the layer and role at a glance; barrels keep the public contract explicit.
- **Benefits.** Grep-able, sortable, reviewable; no "what is in `utils.ts`?".
- **Tradeoffs.** More files. Accepted — small files are easier to test and reason about (Law 8).
- **Example.** ✅ `vitals.mapper.ts` exporting `toVitals`. ❌ `helpers.ts` exporting nine unrelated functions.

See [NamingConvention.md](../architecture/NamingConvention.md).

---

## 4. Components

**Standard.** Components are **token-styled, accessible, localized, and handle all four async states**. Shared, domain-free UI lives in `shared/design-system` (CVA variants + `tailwind-merge`, `forwardRef`, Storybook story per state). Domain components live in their module's `components/`. **Reuse before create** — search the [Component Registry](../design-system/ComponentRegistry.md) first. One screen, one primary task, **one** primary CTA.

- **Why.** Consistency, accessibility, and theming are properties of the system, not of each author's diligence.
- **Benefits.** A theme/brand swap re-maps tokens with zero component edits; every component is keyboard/AT correct by construction.
- **Tradeoffs.** CVA + tokens are more ceremony than inline classes; the payoff is a decade of consistent, themeable UI.
- **Example.** ✅ `<Button variant="primary">{t('appointments.book.cta')}</Button>`. ❌ `<button style={{ background: '#E87D7D' }}>Book</button>`.

---

## 5. Hooks

**Standard.** Hooks have a single concern and a `useX` symbol. **Domain-free** reusable hooks live in `shared/hooks` (`useDebounce`, `useMediaQuery`). Server-data hooks are **TanStack Query** hooks in a module's `api/`. No "god hook" that fetches, transforms, and holds UI state at once. Respect the Rules of Hooks.

- **Why.** Small hooks compose; god hooks become untestable and re-render the world.
- **Benefits.** Each hook is unit-testable; stable references prevent render storms.
- **Tradeoffs.** More hooks to name and wire. Accepted.
- **Example.** ✅ `useAppointmentSlots(date)` (query) + `useSelectedSlot()` (UI state). ❌ `useAppointments()` that fetches, maps, filters, and stores selection.

---

## 6. Services

**Standard.** Services are **framework-agnostic use-cases** in a module's `services/` (`x.service.ts`, symbol `XService` or a `bookAppointment(...)` function). They orchestrate repositories and ports and hold business rules. No React, no `HttpClient`, no DOM.

- **Why.** Business rules must be testable without a browser and reusable across hooks/processes.
- **Benefits.** Pure logic, trivially unit-tested; portable to a worker or future runtime.
- **Tradeoffs.** Another layer between hook and repository — justified by testability and reuse.
- **Example.** ✅ `bookAppointment.service.ts` calls `appointmentRepository.create()` and emits `AppointmentBooked`. ❌ a component that computes the next slot and POSTs it.

---

## 7. Repositories

**Standard.** Repositories (`repositories/`, interface + impl) are the **only** code that performs data access. They depend on `HttpClient`, **parse DTOs with Zod at the boundary**, map to **Models**, and return **Models, never DTOs**. They extend `shared/api` `BaseRepository`.

- **Why.** A single, validated boundary between the backend's shape and the app's shape (Law 7: backend independence).
- **Benefits.** A backend rename changes one mapper; invalid responses fail fast at the edge, not deep in the UI.
- **Tradeoffs.** DTO + schema + mapper + model is four artifacts per entity. This is the price of backend independence and is non-negotiable.
- **Example.** ✅ `patientRepository.get(id)` parses `PatientDto` → returns `Patient`. ❌ a hook calling `axios.get` and handing JSON to a component.

---

## 8. API (data pipeline)

**Standard.** The vertical slice is fixed: **DTO → Zod schema (boundary) → mapper → Model → repository → service → TanStack Query hook → UI**. Query keys are structured and documented; mutations invalidate the right keys. **No `HttpClient`/`fetch`/`axios`/DTO in the UI.** Server data lives **only** in TanStack Query, never in Zustand.

- **Why.** One predictable path for all server data; caching, retries, and offline are solved once.
- **Benefits.** Optimistic updates, dedup, and persistence come from Query; the UI is a pure function of Models.
- **Tradeoffs.** Strict separation feels heavy for a one-field fetch — but uniformity beats local cleverness at scale.
- **Example.** ✅ `useBookAppointment()` mutation invalidates `appointmentKeys.list()`. ❌ caching the appointment list in a Zustand store.

Every endpoint is registered in the **API Registry** ([PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)).

---

## 9. Pages

**Standard.** Pages (`pages/`) are **composition only** — they assemble components, wire hooks, and own layout. No business logic, no data mapping. **One primary task, one primary CTA** per page. Pages are registered as **lazy** routes.

- **Why.** Pages change often; keeping them logic-free keeps churn cheap and safe.
- **Benefits.** Pages read like a table of contents; logic stays tested in services/hooks.
- **Tradeoffs.** Some "prop plumbing" through the page — acceptable for clarity.
- **Example.** ✅ `BookAppointmentPage` renders `<PatientPicker/>`, `<SlotGrid/>`, `<Button/>`. ❌ a page that computes availability inline.

---

## 10. Layouts

**Standard.** Global shells live in `app/layouts/` (`AppShell`, `AuthLayout`); they provide nav, the content outlet, skip-to-content, and the online/offline + sync indicator. **Presentational composition only**, tokens + i18n only, no domain fetching.

- **Why.** One consistent frame for every screen; device targets are layout variants, not page rewrites.
- **Benefits.** Add a tablet-kiosk layout without touching a single page.
- **Tradeoffs.** Layout/page boundary requires discipline about what is "shell" vs "content".
- **Example.** ✅ `AppShell` renders `<SkipToContent/>` + `<Outlet/>`. ❌ a layout that fetches the patient list.

---

## 11. Providers

**Standard.** All global providers are composed in **one** place — `app/providers/<AppProviders>` — in an explicit, reviewable order. Provider _logic_ lives in `shared/providers`/engines; `app` only composes. Context **values are memoized** (no new object per render).

- **Why.** Provider order is load-bearing (theme before i18n before router); one place makes it auditable.
- **Benefits.** Adding a real-time/socket provider is a one-line, ordered change.
- **Tradeoffs.** A single nesting point can get deep — acceptable and explicit.
- **Example.** ✅ `<QueryProvider><ThemeProvider><I18nProvider>…`. ❌ a provider declared inside a feature page.

---

## 12. Utilities

**Standard.** `shared/utils` are **pure** (no side effects, no React, no domain), one responsibility per file (`cn`, `group-by`, `clamp`). Browser-touching composed helpers go in `shared/helpers`. Domain math lives in a module's `utils/` — never in `shared`.

- **Why.** Pure functions are the safest, most reusable, most testable code we have.
- **Benefits.** 100% deterministic unit tests; reusable everywhere.
- **Tradeoffs.** The pure/impure split requires thought about where a helper belongs.
- **Example.** ✅ `formatBytes(n)`. ❌ `getCurrentUserName()` in `shared/utils` (domain + global read).

Duplicate utilities are flagged by `pnpm check:duplicates`.

---

## 13. Constants

**Standard.** Global, domain-free constants live in `shared/constants` (`UPPER_SNAKE_CASE`, `as const`): breakpoints, z-index scale, regex, time. Domain constants live in a module/entity `constants/`. **No magic numbers/strings** scattered in code.

- **Why.** One source for every magic value makes audits and global changes a one-file edit.
- **Benefits.** No drift between two copies of the same number; easy to reason about.
- **Tradeoffs.** Tiny indirection. Worth it.
- **Example.** ✅ `Z_INDEX.modal`. ❌ `style={{ zIndex: 1300 }}`.

---

## 14. Types

**Standard.** **No `any`.** Honor `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Domain **Models** live in their entity/module `types/`; global utility types in `shared/types` (`AppError`, `ApiResult<T>`, `Brand<T>`). No `I`-prefix; no `enum` (use `as const` unions). DTOs are boundary-only and never exported across a barrel.

- **Why.** Types are the cheapest tests and the contract between layers; `any` deletes that contract.
- **Benefits.** The compiler catches whole classes of healthcare bugs before runtime.
- **Tradeoffs.** Strict types take longer to write; they save far more in debugging and safety.
- **Example.** ✅ `type AppointmentStatus = 'scheduled' | 'waiting' | …`. ❌ `status: any`.

Enforced by `@typescript-eslint/no-explicit-any` ([LintRules.md](./LintRules.md)).

---

## 15. Validation

**Standard.** **Zod everywhere external data enters** — DTOs at the repository boundary and forms via the RHF Zod resolver. Form schemas derive from/mirror the domain schema. Never trust the backend or the client. Reusable refinements live in `shared/validators`.

- **Why.** "Parse, don't validate": once parsed, the rest of the app trusts the type.
- **Benefits.** One schema validates the boundary and types the result; bad data dies at the edge.
- **Tradeoffs.** Schemas duplicate some shape info — mitigated by `z.infer` deriving the type.
- **Example.** ✅ `patientSchema.parse(dto)` in the repository. ❌ `dto as Patient`.

---

## 16. Localization

**Standard.** **Every** human-readable string, `aria-label`, `title`, `placeholder`, `alt`, and error is an **i18n key** (`namespace.area.element`, leaf camelCase) present in **all four** locales (en, hi, mr, ur). ICU plurals/gender — never concatenation. RTL (ur) via **logical CSS properties** only. Dates/numbers/currency/time via **`Intl`**. Runtime switch, no reload.

- **Why.** Law 4. A clinic in Maharashtra and one serving Urdu speakers must both feel native.
- **Benefits.** New languages are new JSON folders; the UI never needs editing to localize.
- **Tradeoffs.** No inline copy ever — every string round-trips through a key. Enforced, so it never slips.
- **Example.** ✅ `t('appointments.book.cta')`. ❌ `<button>Book now</button>`.

Enforced by ESLint `i18next/no-literal-string` + `pnpm check:i18n`. See [LocalizationValidation.md](./LocalizationValidation.md).

---

## 17. Accessibility

**Standard.** **WCAG 2.2 AA is the floor.** Keyboard-operable, visible token-driven `:focus-visible`, semantic HTML first (ARIA to fill gaps), contrast ≥ 4.5:1, touch targets ≥ 44px (≥ 56px Large Text), reduced-motion honored, **never color alone**, dialogs trap+restore focus, the four async states announce via live regions. RTL verified.

- **Why.** Law 3. Patients may be elderly, low-literacy, or AT users; access is a feature, not a setting.
- **Benefits.** Usable by everyone, on every device; legally and ethically sound for healthcare.
- **Tradeoffs.** Every interactive element needs a name/role/state — extra care that we automate where possible.
- **Example.** ✅ status shown as colour **+ icon + text**. ❌ a red dot as the only "error" signal.

Enforced by `eslint-plugin-jsx-a11y`, vitest-axe, Storybook addon-a11y. See [AccessibilityValidation.md](./AccessibilityValidation.md).

---

## 18. Performance

**Standard.** Within **budget** ([PerformanceBudgets.md](./PerformanceBudgets.md)): routes/modules code-split and lazy; long lists virtualized; skeletons reserve space (no CLS); stable callbacks/memo **where measured**; images/fonts optimized. Targets: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1** on low-end devices.

- **Why.** Clinics run on modest hardware and flaky networks; speed is patient-care throughput.
- **Benefits.** Snappy UI under load; enforced budgets prevent slow regressions from shipping.
- **Tradeoffs.** Lazy boundaries and memoization add complexity — applied where they pay off, not blindly.
- **Example.** ✅ `const Page = lazy(() => import('./BookAppointmentPage'))`. ❌ eagerly importing every module at the root.

Enforced by `pnpm check:perf` against `scripts/quality/budgets.json`.

---

## 19. Documentation

**Standard.** Every module ships a `README.md` (overview, owners, public API, deps) and a `BRAIN.md` (decisions, local registries, TODOs, debt). Non-obvious logic and public APIs carry **JSDoc**. Structural decisions get an **ADR**. Docs ship in the **same PR** as the code — no doc debt.

- **Why.** Undocumented work is lost work for the next team/agent.
- **Benefits.** The system's memory never drifts from its reality.
- **Tradeoffs.** Writing docs alongside code is slower per-PR, faster per-decade.
- **Example.** ✅ a PR adding a service updates the module BRAIN + API Registry. ❌ "I'll document it later."

See [DocumentationStandards.md](./DocumentationStandards.md) and [AI_RULES.md §4](../architecture/AI_RULES.md).

---

## 20. Testing

**Standard.** Test **behavior, not implementation**. Unit-test the **mapper (pure), repository (MSW), service, hooks, store**; **a11y-test** UI with axe; **e2e-test** every patient-journey path with Playwright. Coverage thresholds are set and enforced. A Storybook story per shared component (all variants + states).

- **Why.** Healthcare cannot ship regressions; tests are the safety net for a 10-year refactor lifespan.
- **Benefits.** Confident refactors; bugs caught at the cheapest layer.
- **Tradeoffs.** Tests are code to maintain — kept cheap by testing behavior and using shared fixtures.
- **Example.** ✅ `patient.mapper.test.ts` asserts DTO→Model. ❌ a test asserting a component's internal state shape.

Run by `pnpm test` (+ `pnpm e2e`). See [DocumentationStandards.md](./DocumentationStandards.md) §Testing-Guide.

---

## 21. Git Workflow

**Standard.** **Conventional Commits** (commitlint in the commit-msg hook). **Small, focused PRs** (one concern). Husky + lint-staged run ESLint + Prettier + typecheck on staged files pre-commit. The PR description carries the [Definition of Done](./DefinitionOfDone.md) with applicable boxes ticked. **CI must be green** (lint, types, format, tests, a11y, build, all quality gates) before merge. Branches are short-lived and up to date with base.

- **Why.** A readable history and small PRs make review, revert, and `git bisect` tractable across a decade.
- **Benefits.** Automated changelogs/versioning (Changesets); fast, focused reviews; safe reverts.
- **Tradeoffs.** Conventional-commit discipline and small PRs require habit — paid back at every review and incident.
- **Example.** ✅ `feat(appointments): add slot picker`. ❌ `fixes` (200-file mixed-concern PR).

---

## 22. The standard, in one line

> A change meets the ClinicOS standard when it sits in the **right layer behind a public API**, flows server data through the **DTO→…→Query** pipeline, uses **tokens + i18n keys only**, handles **all four async states**, passes **WCAG 2.2 AA + axe**, stays **within performance budget**, is **typed (no `any`) and tested**, leaks **no PHI** and is **permission-gated**, **updates the Brain + docs**, and ships **green CI** with a conventional commit.

See the gated, checkbox form in [DefinitionOfDone.md](./DefinitionOfDone.md).

_Phase 9 · Engineering Quality Platform · Part 1 · Status: **Foundation v9** · 2026-06-30_
_Companion: [QualityGates.md](./QualityGates.md) · [LintRules.md](./LintRules.md) · [DefinitionOfDone.md](./DefinitionOfDone.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)_
