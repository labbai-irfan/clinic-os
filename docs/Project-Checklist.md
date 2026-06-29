# ✅ ClinicOS — Project-Checklist.md

> **Definition-of-Done (DoD) & quality-gate checklist for ClinicOS.**
> This is the operational companion to [Brain.md](./Brain.md) and [Developer-Rules.md](./Developer-Rules.md).
> A PR is **not done** until every box that applies to it is checked. A reviewer must **block** any PR that violates a "NEVER" (see [Developer-Rules.md](./Developer-Rules.md)).

---

## 0. Purpose & how to use this checklist

**Purpose.** Turn the eight non-negotiable product laws, the architecture, and the quality bars from [Brain.md](./Brain.md) into copy-pasteable checkboxes that gate every PR, every release, and the one-time project bootstrap. ClinicOS is a healthcare Clinic Operating System architected for a **10+ year horizon without a rewrite** — quality gates are how we protect that horizon.

**The eight laws this checklist enforces** (from [Brain.md](./Brain.md) §2):

1. One Screen · One Primary Task · One Primary CTA.
2. Calm by default (minimal motion, generous spacing, large readable type).
3. Accessibility is a feature, not a setting — WCAG 2.2 AA is the floor.
4. Every string is localized. No hardcoded human-readable text. Ever.
5. Every color/size/space is a token. No hardcoded visual values. Ever.
6. The UI never talks to the backend directly — only via services & repositories.
7. The frontend is backend-independent.
8. Simplicity beats cleverness.

**How to use it:**

- **Per-PR Definition of Done** → copy [§3 Per-Feature / Per-PR DoD](#3-per-feature--per-pr-definition-of-done) into the PR description. Tick every applicable box. The [§9 PR Reviewer Quick Gate](#9-pr-reviewer-quick-gate-60-second-blockers) is the reviewer's 60-second pass.
- **Project foundation setup** → use [§2 Foundation Setup Checklist](#2-foundation-setup-checklist-one-time-bootstrap) once, as bootstrap milestones/issues. Each top-level group can be one issue.
- **Release** → run [§4 Release / Readiness](#4-release--readiness-checklist), [§5 Accessibility Audit](#5-accessibility-audit-checklist-wcag-22-aa), [§6 Localization Audit](#6-localization-audit-checklist), and [§7 Security / PHI Audit](#7-security--phi-audit-checklist-healthcare) before tagging.
- **Doc cross-refs:** [Architecture.md](./Architecture.md) · [Folder-Structure.md](./Folder-Structure.md) · [Frontend-Bible.md](./Frontend-Bible.md) · [Frontend-Foundation-Blueprint.md](./Frontend-Foundation-Blueprint.md) · [Coding-Standards.md](./Coding-Standards.md) · [Naming-Convention.md](./Naming-Convention.md) · [AI-Rules.md](./AI-Rules.md).

> **Legend:** 🔴 = release/merge blocker · 🟡 = strong default, deviation needs a note in the PR · ♿ = accessibility · 🌐 = localization · 🔒 = security/PHI.

---

## 1. Quick navigation

- [§2 Foundation Setup Checklist (one-time bootstrap)](#2-foundation-setup-checklist-one-time-bootstrap)
- [§3 Per-Feature / Per-PR Definition of Done](#3-per-feature--per-pr-definition-of-done)
- [§4 Release / Readiness Checklist](#4-release--readiness-checklist)
- [§5 Accessibility Audit Checklist (WCAG 2.2 AA)](#5-accessibility-audit-checklist-wcag-22-aa)
- [§6 Localization Audit Checklist](#6-localization-audit-checklist)
- [§7 Security / PHI Audit Checklist (healthcare)](#7-security--phi-audit-checklist-healthcare)
- [§8 Definition of Done — one-line summary](#8-definition-of-done--one-line-summary)
- [§9 PR Reviewer Quick Gate (60-second blockers)](#9-pr-reviewer-quick-gate-60-second-blockers)

---

## 2. Foundation Setup Checklist (one-time bootstrap)

> Goal: a green-from-day-one skeleton where **architecture, tokens, i18n, a11y, and the backend-independence pipeline are linted and tested before the first feature ships.** Group each block below into its own bootstrap issue.

### 2.1 Repository, tooling & CI gates

- [ ] Vite 5 + React 18 + TypeScript 5 project scaffolded.
- [ ] `tsconfig` in **strict** mode with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals`.
- [ ] Path aliases configured (`@app`, `@processes`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`) and mirrored in Vite + tsconfig + ESLint resolver.
- [ ] **ESLint** configured with: `eslint-plugin-boundaries` (the Dependency Rule), `import` + import-sort, `jsx-a11y`, an **i18n / no-literal-string** rule, `react-hooks`, `@typescript-eslint`.
- [ ] `boundaries` rules encode the layer order `app → processes → pages → widgets → features → entities → shared` and forbid sideways imports + deep imports past `index.ts`.
- [ ] **Prettier** configured; ESLint + Prettier do not conflict.
- [ ] **Husky** pre-commit + commit-msg hooks installed.
- [ ] **lint-staged** runs ESLint + Prettier + `tsc --noEmit` (typecheck) on staged files.
- [ ] **Changesets** initialized for versioning/changelog.
- [ ] Conventional Commits enforced (commitlint in commit-msg hook).
- [ ] **CI pipeline** runs, as required checks: `lint` → `typecheck` → `unit tests` → `a11y tests` → `build` → `e2e (critical journeys)`. 🔴
- [ ] Bundle-size budget check wired into CI (fails over budget). 🔴
- [ ] Node/pnpm versions pinned (`.nvmrc` / `packageManager`); lockfile committed.
- [ ] `.editorconfig` + `.gitignore` + `.env.example` (no secrets) committed. 🔒

### 2.2 Folder skeleton (per [Folder-Structure.md](./Folder-Structure.md))

- [ ] Layer folders created: `app/`, `processes/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.
- [ ] `shared/` sub-structure: `ui/` (design system), `lib/`, `api/`, `config/`, `i18n/`, `styles/`.
- [ ] Slice template documented & scaffolded (`index.ts`, `ui/`, `model/`, `api/`, `lib/`, `config/`).
- [ ] Each slice exposes a **public API** `index.ts`; barrel-only export pattern verified by lint.
- [ ] Generator/scaffold script (or Plop template) for new slices added.

### 2.3 Design tokens & theming (per [Frontend-Bible.md](./Frontend-Bible.md))

- [ ] **3-tier tokens** defined as CSS custom properties: Primitive → Semantic → Component.
- [ ] Brand anchors mapped: Primary `#E87D7D` (rose), Surface `#F8F3F0` (sand), Accent `#6B8E8E` (teal), Neutral `#827473` (stone).
- [ ] Semantic tokens present: `--color-primary`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-danger`, `--color-accent`, borders, focus ring.
- [ ] **Themes** implemented by remapping the semantic tier only: **light**, **dark**, **high-contrast**.
- [ ] **Large Text Mode** scales the root type token (whole UI grows proportionally).
- [ ] Spacing (4px base `--space-1…12`), radius (`sm/md/lg/xl/2xl/full`), shadow/elevation (Soft-UI), motion (`--duration-*`, `--ease-*`) tokens defined.
- [ ] **Tailwind theme reads only from CSS-variable tokens** (no raw hex/px in `tailwind.config`). 🔴
- [ ] **CVA** + **tailwind-merge** installed and wired for variant components.
- [ ] Token usage linted/guarded (no hardcoded color/size in components).

### 2.4 Typography & fonts

- [ ] **Plus Jakarta Sans** (headings) + **Inter** (body) loaded, self-hosted, `font-display: swap`, preloaded.
- [ ] Type scale tokens only (`display, h1–h6, body-lg/md/sm, caption, overline`) — size/line-height/weight/tracking baked in. No ad-hoc font sizes.

### 2.5 Internationalization (per [Brain.md](./Brain.md) §8)

- [ ] **i18next + react-i18next + ICU** configured; namespaced keys (`feature.area.element`).
- [ ] Locale scaffolding for **en, hi, mr, ur**; lazy-loaded locale bundles.
- [ ] **Runtime language switch without reload** verified.
- [ ] **RTL** support: `dir` attribute wiring + CSS **logical properties** baseline (no physical `margin-left` etc.).
- [ ] `Intl`-based date/number/currency formatting helpers in `shared/lib`.
- [ ] i18n-extraction script + missing-key reporter; CI flags missing keys.

### 2.6 Server state, client state & data pipeline

- [ ] **TanStack Query v5** client configured (sane defaults: stale time, retry, error policy).
- [ ] Query **persistence to IndexedDB** (`idb`) wired (offline read).
- [ ] **Zustand** base stores created (sliced): `theme`, `locale`, `auth/session`, `active-clinic`, `ui` — selector-based, no server data.
- [ ] **`HttpClient` interface** + one concrete impl (fetch/axios) behind it; never imported in UI. 🔴
- [ ] **Base repository** abstraction (returns Models, depends on `HttpClient`).
- [ ] DTO → Zod schema → mapper → Model → Service → Repository → Query hook pipeline demonstrated with one reference entity (e.g. `patient`).
- [ ] **MSW** handlers set up for dev + tests (enables backend independence). 🔴
- [ ] `AppError` typed error model + error mapping at the boundary.
- [ ] **Outbox pattern** scaffold for offline writes (queue + sync + conflict policy).

### 2.7 App shell, boundaries & resilience

- [ ] `app/` composition root: providers, **data router** (React Router v6), global styles, theme/locale providers.
- [ ] **Error boundaries** at app + route + widget level; fallback uses the four-state Error UI.
- [ ] Suspense boundaries + global loading skeleton strategy.
- [ ] **App shell** layout (nav, skip-to-content link, language switch, online/offline + sync indicator).
- [ ] **Service worker / PWA** (Workbox) caches app shell; installable; offline fallback page.
- [ ] Online/offline + sync status surfaced in UI (never silent data loss).

### 2.8 Quality, docs & observability tooling

- [ ] **Storybook** running; sample stories for shared UI; a11y addon enabled.
- [ ] **Vitest + React Testing Library** configured; coverage thresholds set.
- [ ] **Playwright** configured for critical patient-journey e2e flows.
- [ ] **axe-core / jest-axe** integrated into unit + Playwright a11y gates. 🔴
- [ ] **Sentry** wired behind an abstraction; **Web Vitals** + OpenTelemetry-web reporting. 🔒 (scrub PHI — see §7)
- [ ] **Provider-agnostic `analytics` port** in `shared` (no vendor SDK in components).
- [ ] Reference slice README + ADR template committed; `docs/` index links verified.

---

## 3. Per-Feature / Per-PR Definition of Done

> Copy this whole section into the PR. Tick what applies; strike through with a note what genuinely does not.

### 3.1 Architecture & layering 🔴

- [ ] Code lives in the **correct layer** (`app/processes/pages/widgets/features/entities/shared`) and slice.
- [ ] **Dependency Rule respected:** imports flow downward only; **no upward, no sideways** imports.
- [ ] No `feature → feature` import; cross-feature composition happens in `processes`/`pages` only.
- [ ] All cross-slice imports go through the slice **public API** (`index.ts`) — **no deep imports**.
- [ ] `shared/` contains **zero domain knowledge**.
- [ ] New public exports are intentional and minimal (the public surface is a contract).
- [ ] Naming follows [Naming-Convention.md](./Naming-Convention.md) (files, hooks, stores, services, slices).

### 3.2 Data layer & backend-independence pipeline 🔴

- [ ] **DTO** type defined for the raw backend shape (`api/dto`).
- [ ] **Zod schema** validates the DTO **at the boundary** (parse, don't trust).
- [ ] **Mapper** (`toModel` / `toDto`) is the only place that knows both shapes; pure functions.
- [ ] **Domain Model** is the UI-shaped, stable type components consume.
- [ ] **Repository** (interface + impl) returns **Models, never DTOs**; depends on `HttpClient`.
- [ ] **Service / use-case** holds business rules; framework-agnostic.
- [ ] **TanStack Query hooks** are the only way components fetch/mutate server data.
- [ ] **No `HttpClient`, no DTO, no raw fetch** imported in UI components. 🔴
- [ ] **No server data cached in Zustand** (TanStack Query is the single source of truth). 🔴
- [ ] Query keys structured & documented; cache invalidation handled on mutations.

### 3.3 UI & components 🟡

- [ ] **Reuse before create** — searched `shared/ui` (and entity UI) before adding a new component.
- [ ] **Tokens only** — no hardcoded color/size/space/radius/shadow/duration/font. 🔴
- [ ] Variants via **CVA** (+ tailwind-merge); no ad-hoc conditional class soup.
- [ ] Responsive & **bento/Soft-UI** layout; reads at a glance.
- [ ] **One Screen · One Primary Task · One Primary CTA** — exactly one primary action.
- [ ] Icons from **lucide-react**; consistent stroke.
- [ ] Calm by default: generous spacing, minimal motion, large readable type.

### 3.4 The four async states 🔴

- [ ] **Loading** — skeletons (preferred over spinners); no layout shift.
- [ ] **Empty** — meaningful illustration/message + one primary action.
- [ ] **Error** — typed `AppError`, localized human message, **retry path**.
- [ ] **Success** — content + optimistic/inline feedback (toast/inline), live region announces status.

### 3.5 Accessibility ♿ 🔴 (full audit in [§5](#5-accessibility-audit-checklist-wcag-22-aa))

- [ ] Fully **keyboard operable**; logical tab order; no keyboard traps.
- [ ] Visible **`:focus-visible`** rings (token-driven) on every interactive element.
- [ ] Semantic HTML first; **ARIA only to fill gaps**; names/roles/states correct.
- [ ] All labels / `aria-label` / errors come from **i18n keys**.
- [ ] Contrast meets **WCAG 2.2 AA** (AAA for text where feasible).
- [ ] Touch targets ≥ **44px** (≥ **56px** in Large Text Mode).
- [ ] **Reduced motion** honored (all motion gated by `prefers-reduced-motion`).
- [ ] **Never color alone** — status paired with icon/text/shape.
- [ ] Dialogs trap & restore focus; skip-to-content present on the page.
- [ ] **axe passes** (unit + e2e) with no new violations. 🔴

### 3.6 Localization 🌐 🔴 (full audit in [§6](#6-localization-audit-checklist))

- [ ] **No hardcoded human-readable strings** (lint-clean). 🔴
- [ ] i18n keys added to **all four locales** (en, hi, mr, ur) — or fallback explicitly noted in PR.
- [ ] ICU plurals/gender used where grammar requires.
- [ ] **RTL verified** (ur) using logical properties; no physical-direction CSS.
- [ ] Dates/numbers/currency via `Intl`; no manual string formatting.
- [ ] Runtime language switch tested (no reload, no layout break, no truncation).

### 3.7 State management 🟡

- [ ] **Right tool for the data kind** (per [Brain.md](./Brain.md) §9): server→Query, global UI→Zustand, form→RHF, URL→router params, ephemeral→`useState`/`useReducer`.
- [ ] **URL state** used for anything shareable/restorable (filters, tabs, pagination).
- [ ] Zustand stores stay small & selector-based; no derived-from-server state stored.

### 3.8 Forms 🟡

- [ ] **React Hook Form + Zod resolver** (uncontrolled, performant).
- [ ] Validation schema mirrors/derives the domain schema.
- [ ] **Accessible errors**: `aria-invalid`, `aria-describedby`, error text from **i18n keys**, focus moves to first error.
- [ ] Submit is disabled/guarded against double-submit; pending state shown.

### 3.9 Performance 🟡

- [ ] Routes/heavy components **lazy-loaded** / code-split where appropriate.
- [ ] Long lists **virtualized**.
- [ ] Within **bundle budget** (CI check green). 🔴
- [ ] No obvious re-render issues (stable callbacks/memo where measured; no unnecessary context churn).
- [ ] Images/assets optimized; no oversized payloads.

### 3.10 Security (healthcare / PHI) 🔒 🔴 (full audit in [§7](#7-security--phi-audit-checklist-healthcare))

- [ ] **No PHI in logs, analytics, error reports, or URLs.** 🔴
- [ ] **No PHI in `localStorage`/`sessionStorage`**; persisted Query cache scoped & clearable on logout. 🔴
- [ ] Action/route/data **permission-gated** (role/permission matrix respected).
- [ ] All external input **validated** (Zod at boundary; never trust the backend or the client).
- [ ] Output encoded; no `dangerouslySetInnerHTML` without sanitization.
- [ ] **No secrets/keys/tokens** committed or hardcoded. 🔴
- [ ] AuthN/AuthZ checks on every privileged surface; session handled via the auth store, tokens not exposed to JS where avoidable.

### 3.11 Quality, types & tests 🔴

- [ ] **No `any`** (no unsafe casts / `@ts-ignore` without justification). 🔴
- [ ] Strict-mode TypeScript passes (`tsc --noEmit` green). 🔴
- [ ] **Unit tests** for logic (mappers, services, hooks, stores) — behavior, not implementation.
- [ ] **E2E test** for the critical journey this change touches (where applicable).
- [ ] **Storybook story** added/updated for every shared/UI component (all variants + states).
- [ ] No `console.*` / debugger / commented-out code / dead code. 🔴
- [ ] Edge cases handled (empty, error, offline, slow network, long strings, RTL).

### 3.12 Documentation 🟡

- [ ] Code comments / JSDoc updated for non-obvious logic and public APIs.
- [ ] **Slice README** added/updated (what it owns, public API, gotchas).
- [ ] **ADR** added if the change is architectural — with Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations (per [Brain.md](./Brain.md) §14 / [Documentation-Guidelines.md](./Documentation-Guidelines.md)).
- [ ] Relevant docs updated **in the same PR** (no doc debt).

### 3.13 Git & CI 🔴

- [ ] **Conventional commit** messages; Changeset added if user-facing/versioned.
- [ ] **Small, focused PR** (one concern; reviewable).
- [ ] **CI green**: lint, types, unit, a11y, e2e, build, bundle budget. 🔴
- [ ] PR description includes this DoD with applicable boxes ticked.
- [ ] No merge conflicts; branch up to date with base.

---

## 4. Release / Readiness Checklist

> Run before tagging a release. Each item is a 🔴 release blocker unless explicitly waived with sign-off.

### 4.1 Performance budgets (Web Vitals) 🔴

- [ ] **LCP** ≤ 2.5s, **INP** ≤ 200ms, **CLS** ≤ 0.1 (field/lab) on target low-end devices.
- [ ] Initial JS bundle within budget; route chunks lazy.
- [ ] No layout shift on async-state transitions (skeletons reserve space).
- [ ] Web Vitals reporting live and visible in monitoring.

### 4.2 Accessibility 🔴 (detail in [§5](#5-accessibility-audit-checklist-wcag-22-aa))

- [ ] Full **WCAG 2.2 AA** audit passed; axe CI green across key screens.
- [ ] Keyboard-only + screen-reader walkthrough of one full patient journey.
- [ ] High-contrast, reduced-motion, Large Text Mode verified.

### 4.3 Localization completeness 🌐 🔴 (detail in [§6](#6-localization-audit-checklist))

- [ ] All four locales (en, hi, mr, ur) complete — **zero missing keys** (or documented fallbacks).
- [ ] RTL (ur) verified across primary screens; no clipped/overlapping text.

### 4.4 Offline & resilience

- [ ] App shell loads offline (PWA installable).
- [ ] Cached reads work offline; offline indicator shown.
- [ ] Outbox queues writes offline and **syncs on reconnect**; conflict policy verified.
- [ ] No silent data loss in any offline→online transition.

### 4.5 Error monitoring live 🔒

- [ ] Sentry receiving events in the release environment; source maps uploaded.
- [ ] Error reports **scrubbed of PHI** (verified with a test error).
- [ ] Alerting thresholds configured.

### 4.6 Security review 🔒 (detail in [§7](#7-security--phi-audit-checklist-healthcare))

- [ ] PHI audit passed; permission matrix verified end-to-end.
- [ ] Dependency/vulnerability scan clean; no secrets in bundle or repo.
- [ ] Auth/session expiry, logout-clears-data, and re-auth flows verified.

---

## 5. Accessibility Audit Checklist (WCAG 2.2 AA)

> Map each item to its WCAG 2.2 AA success criterion. ♿ All are blockers for the screens in scope.

### 5.1 Perceivable

- [ ] **1.1.1 Non-text Content** — all meaningful images/icons have text alternatives (via i18n); decorative ones are hidden from AT.
- [ ] **1.3.1 Info & Relationships** — semantic structure (headings, lists, landmarks, `<label>`/`for`, table headers).
- [ ] **1.3.5 Identify Input Purpose** — `autocomplete` on personal-data inputs.
- [ ] **1.4.1 Use of Color** — status never by color alone (icon/text/shape too).
- [ ] **1.4.3 Contrast (Minimum)** — text ≥ 4.5:1, large text ≥ 3:1 (AAA for body where feasible).
- [ ] **1.4.4 Resize Text** — usable at 200% zoom; Large Text Mode functional.
- [ ] **1.4.10 Reflow** — no horizontal scroll at 320px width.
- [ ] **1.4.11 Non-text Contrast** — UI components & focus indicators ≥ 3:1.
- [ ] **1.4.12 Text Spacing** — no loss of content with increased spacing.
- [ ] **1.4.13 Content on Hover/Focus** — dismissable, hoverable, persistent tooltips/popovers.

### 5.2 Operable

- [ ] **2.1.1 Keyboard** — everything operable by keyboard.
- [ ] **2.1.2 No Keyboard Trap** — focus can always leave a component.
- [ ] **2.4.1 Bypass Blocks** — skip-to-content link on every page.
- [ ] **2.4.3 Focus Order** — logical, meaningful order.
- [ ] **2.4.7 Focus Visible** — token-driven `:focus-visible` ring everywhere.
- [ ] **2.4.11 Focus Not Obscured (Minimum)** — focused element not hidden by sticky UI. _(2.2)_
- [ ] **2.5.5 / Target Size** — touch targets ≥ 44px (≥ 56px Large Mode).
- [ ] **2.5.7 Dragging Movements** — drag actions have a single-pointer alternative. _(2.2)_
- [ ] **2.5.8 Target Size (Minimum)** — interactive targets ≥ 24px minimum. _(2.2)_
- [ ] **2.3.3 / 2.2 Motion** — animation gated by `prefers-reduced-motion`.

### 5.3 Understandable

- [ ] **3.1.1 / 3.1.2 Language** — `lang`/`dir` set on `<html>` and on per-element language changes.
- [ ] **3.2.1 / 3.2.2 On Focus / On Input** — no surprise context changes.
- [ ] **3.3.1 Error Identification** — errors announced and described (localized).
- [ ] **3.3.2 Labels or Instructions** — every input labeled.
- [ ] **3.3.3 Error Suggestion** — actionable correction guidance.
- [ ] **3.3.7 Redundant Entry** — don't re-ask for info already provided. _(2.2)_
- [ ] **3.3.8 Accessible Authentication (Minimum)** — no cognitive-only auth tests. _(2.2)_

### 5.4 Robust & assistive-tech

- [ ] **4.1.2 Name, Role, Value** — custom widgets expose correct ARIA.
- [ ] **4.1.3 Status Messages** — async status via `aria-live`/role=status (the four states).
- [ ] Dialogs trap focus, label via `aria-labelledby`, restore focus on close.
- [ ] Tested with at least one screen reader (NVDA/VoiceOver) on a full journey.
- [ ] **axe-core** automated scan: zero violations on screens in scope. 🔴

---

## 6. Localization Audit Checklist

> 🌐 Languages now: **English, Hindi, Marathi, Urdu**; architecture supports unlimited.

- [ ] **No hardcoded strings** anywhere (UI text, `aria-label`, errors, toasts, empty/error states) — lint-clean. 🔴
- [ ] Every key present in **all four** locale bundles (en, hi, mr, ur); missing-key report clean. 🔴
- [ ] Keys follow `namespace.area.element` and live in the owning slice/namespace.
- [ ] **ICU** plurals/gender/select used where the language needs it (not string concatenation).
- [ ] **RTL (Urdu):** `dir="rtl"` correct; **CSS logical properties** only (`margin-inline-start`, `padding-inline`, `inset-inline`) — no physical `left/right`.
- [ ] Icons/chevrons/progress that imply direction flip correctly in RTL.
- [ ] **Runtime language switch** works with **no reload**; lazy locale bundle loads.
- [ ] Layout tolerates **text expansion** (German/Hindi length) and long unbroken strings — no truncation/overflow.
- [ ] **`Intl`** for dates, times, numbers, currency, relative time, lists — locale-correct.
- [ ] Numerals/calendars appropriate per locale; no en-only assumptions.
- [ ] Pseudo-localization or longest-string pass done on critical screens.
- [ ] Language switcher itself is labeled and keyboard/AT accessible.

---

## 7. Security / PHI Audit Checklist (healthcare)

> 🔒 ClinicOS handles Protected Health Information. Treat every patient field as sensitive by default. All items are 🔴 unless waived with security sign-off.

### 7.1 PHI handling & data minimization

- [ ] **No PHI in logs** (console, server logs, OpenTelemetry traces). 🔴
- [ ] **No PHI in analytics events** (the `analytics` port strips/forbids PHI). 🔴
- [ ] **No PHI in Sentry / error reports** (scrubbing verified with a seeded test error). 🔴
- [ ] **No PHI in URLs / query params** (not shareable, not in browser history/referrer). 🔴
- [ ] **No PHI in `localStorage`/`sessionStorage`**; persisted Query cache (IndexedDB) scoped and **cleared on logout**. 🔴
- [ ] Outbox/offline payloads with PHI are protected and cleared appropriately.
- [ ] Only the minimum necessary PHI fetched/rendered for the task (data minimization).

### 7.2 AuthN / AuthZ & permissions

- [ ] Every privileged route, action, and data view is **permission-gated** (role/permission matrix).
- [ ] UI gating is backed by server-side authorization (UI gate is convenience, not the control).
- [ ] Multi-tenant isolation: active-clinic scoping enforced; no cross-tenant leakage.
- [ ] Session expiry, idle timeout, and **logout clears all local PHI/caches**. 🔴
- [ ] Tokens/credentials never exposed to app code where avoidable (httpOnly cookies preferred); none in JS-readable storage.

### 7.3 Input/output safety & dependencies

- [ ] All inputs validated with **Zod at the boundary**; backend responses parsed, never trusted. 🔴
- [ ] No `dangerouslySetInnerHTML` without sanitization; output encoded (XSS-safe).
- [ ] **No secrets/API keys/tokens** in source, bundle, or `.env` committed. 🔴
- [ ] Dependency vulnerability scan clean; lockfile audited.
- [ ] Security headers / CSP configured for the app shell.
- [ ] Audit-relevant actions are traceable (without logging PHI).

---

## 8. Definition of Done — one-line summary

> A change is **Done** when: it sits in the **right layer behind a public API** (Dependency Rule intact); server data flows **DTO→Zod→mapper→Model→Service→Repository→Query** with **no HttpClient/DTO in UI and no server data in Zustand**; the UI uses **tokens + i18n keys only**, handles **all four async states**, passes **WCAG 2.2 AA + axe**, leaks **no PHI** and is **permission-gated**, is **typed (no `any`) and tested (unit + e2e + Storybook)**, and ships **green CI** with a conventional commit and updated docs.

---

## 9. PR Reviewer Quick Gate (60-second blockers)

> 🔴 If any of these is true, **block the PR**. This is the fast pass before deep review.

- [ ] 🔴 **Dependency Rule broken** — upward/sideways import, `feature→feature`, or **deep import past `index.ts`**.
- [ ] 🔴 **UI talks to backend directly** — `HttpClient`, raw `fetch`, or a **DTO** imported in a component.
- [ ] 🔴 **Server data in Zustand** (instead of TanStack Query).
- [ ] 🔴 **Hardcoded visual value** — color/size/space/radius/shadow/font not from a **token**.
- [ ] 🔴 **Hardcoded human-readable string** — text/`aria-label`/error not from an **i18n key**.
- [ ] 🔴 **Missing async state** — no skeleton **loading**, **empty**, **error+retry**, or **success** handling.
- [ ] 🔴 **Accessibility fail** — no focus-visible/keyboard path, missing labels, color-only signaling, or **new axe violation**.
- [ ] 🔴 **More than one primary CTA** on the screen.
- [ ] 🔴 **PHI leak** — PHI in logs/analytics/Sentry/URL/`localStorage`, or an ungated privileged surface.
- [ ] 🔴 **`any` / `@ts-ignore`**, `console.*`/debugger, or dead/commented-out code.
- [ ] 🔴 **CI red** — lint, types, tests, a11y, build, or bundle budget failing.
- [ ] 🔴 **Missing locale keys** (not in all four bundles) without a documented fallback.

> Everything green here → proceed to the full [§3 Per-PR DoD](#3-per-feature--per-pr-definition-of-done) review.

---

_Companion to [Brain.md](./Brain.md) & [Developer-Rules.md](./Developer-Rules.md) · Last updated: 2026-06-27 · Owner: Engineering / Quality · Status: **Foundation v1**_
