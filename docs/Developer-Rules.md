# 📏 ClinicOS — Developer-Rules.md

> **The law of the land.** Short, scannable, enforceable.
> If a rule here conflicts with your code, the code is wrong.
> This document operationalizes [Brain.md](./Brain.md). Read the Brain first; this is how it is enforced.

---

## 1. Purpose & enforcement

**Purpose.** Turn the 8 product laws and the architecture in [Brain.md](./Brain.md) into testable, reviewable ALWAYS / NEVER rules. Every rule below is something a linter, a CI gate, or a reviewer can check in under 30 seconds.

**How rules are enforced (in order of cheapness):**

| Layer      | Tool                                                                                        | Catches                                             |
| ---------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Edit-time  | TypeScript (strict), ESLint (`boundaries`, `jsx-a11y`, `i18next`, `import-sort`), Prettier  | Architecture, a11y, hardcoded strings, import order |
| Pre-commit | Husky + lint-staged                                                                         | Lint/format/type errors before they land            |
| CI         | `tsc --noEmit`, `vitest`, `playwright`, `jest-axe`/axe, bundle-size budget, Storybook build | Behavior, a11y, regressions, bundle bloat           |
| Review     | Human reviewer + [Project-Checklist.md](./Project-Checklist.md)                             | Intent, naming, "NEVER" violations, judgment        |
| Decision   | ADR + architect sign-off (see §14)                                                          | Anything that changes the shape of the system       |

**Severity levels** (every rule is tagged):

- 🔴 **Blocker** — CI fails / PR cannot merge. Non-negotiable.
- 🟡 **Must-fix** — Reviewer must block until fixed or an ADR justifies the exception.
- 🟢 **Guideline** — Strong default; deviation needs a one-line reason in the PR.

**Exceptions.** Any rule may be broken _only_ with an inline `// RULE-EXCEPTION(<rule-id>): <reason> — <ticket>` comment **and** reviewer approval. No silent exceptions.

---

## 2. The 8 Non-Negotiable Laws

These restate [Brain.md §2](./Brain.md) as enforceable rules. Each maps to detailed rules later in this doc.

| #   | Law                                | Enforceable rule                                                                                 | Severity | Details |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ------- |
| L1  | One Screen · One Task · One CTA    | ALWAYS exactly one primary CTA per screen; secondary actions are visually subordinate.           | 🟡       | §9      |
| L2  | Calm by default                    | ALWAYS use spacing/motion tokens; NEVER add motion that isn't gated by `prefers-reduced-motion`. | 🟡       | §5, §7  |
| L3  | Accessibility is a feature         | WCAG 2.2 AA is the floor; CI a11y gate must pass.                                                | 🔴       | §7      |
| L4  | Every string is localized          | NEVER ship a user-facing literal; all text via i18n keys (lint-enforced).                        | 🔴       | §6      |
| L5  | Every visual value is a token      | NEVER hardcode color/space/radius/shadow/font/duration.                                          | 🔴       | §5      |
| L6  | UI never talks to backend directly | UI calls services/query-hooks; NEVER `HttpClient`/`fetch`/`axios` in UI.                         | 🔴       | §4      |
| L7  | Frontend is backend-independent    | ALWAYS DTO→(Zod)→mapper→Model; components see Models only.                                       | 🔴       | §4      |
| L8  | Simplicity beats cleverness        | If a junior can't read it on first pass, rewrite it.                                             | 🟡       | §12     |

> **Litmus test (L1–L3):** _Could a non-technical 65-year-old complete the screen's primary task on the first try, in their language?_ If not, the screen fails review.

---

## 3. Architecture rules (FSD + Dependency Rule)

Layer order (imports flow **downward only**): `app → processes → pages → widgets → features → entities → shared`.

- 🔴 **ARCH-1 — Downward imports only.** A layer imports only from layers **below** it. Enforced by `eslint-plugin-boundaries`.
  _Rationale:_ the dependency rule is what keeps the graph acyclic and the system reasonable for 10 years.

  ```ts
  // ✅ features/record-vitals importing a domain noun
  import { Patient } from '@/entities/patient';
  // ❌ entities importing a feature (upward)
  import { recordVitals } from '@/features/record-vitals';
  ```

- 🔴 **ARCH-2 — Public API only.** Import a slice **only** through its `index.ts`. Never deep-import past it.
  _Rationale:_ the public API is the contract; internals stay free to change.

  ```ts
  // ✅ import { PatientCard } from '@/entities/patient';
  // ❌ import { PatientCard } from '@/entities/patient/ui/PatientCard';
  ```

- 🔴 **ARCH-3 — No cross-feature imports.** A `feature` never imports another `feature`. Compose them in `processes`/`pages`.
  _Rationale:_ features are independent capabilities; coupling them creates a tangle.

  ```ts
  // ❌ inside features/billing: import { Prescription } from '@/features/prescribe';
  // ✅ pages/consultation composes <Prescribe/> and <Billing/> side by side
  ```

- 🔴 **ARCH-4 — `shared` has zero domain knowledge.** No patient/appointment/clinic concepts in `shared`.
  _Rationale:_ `shared` is the design system + plumbing; domain leaks make it un-reusable.

  ```ts
  // ❌ shared/ui/PatientAvatar.tsx     ✅ shared/ui/Avatar.tsx (+ entities/patient wraps it)
  ```

- 🟡 **ARCH-5 — One slice = one responsibility.** A feature is one user verb (`book-appointment`), an entity is one noun (`patient`).
  _Rationale:_ single responsibility keeps slices small, testable, and deletable.

- 🟡 **ARCH-6 — Canonical slice anatomy.** Every slice uses `ui/ model/ api/ lib/ config/` and exposes `index.ts` (see [Folder-Structure.md](./Folder-Structure.md)).
  _Rationale:_ same shape everywhere → zero navigation cost, AI- and human-friendly.

- 🟢 **ARCH-7 — Path aliases, not relative climbs.** Use `@/<layer>/...`; never `../../../`.
  _Rationale:_ relative climbs hide layer violations and break on moves.

---

## 4. Data & API rules (backend-independence pipeline)

Pipeline (Brain §5.3): `HTTP → DTO (Zod) → mapper → Model → Service → Repository → Query hook → Component`.

- 🔴 **DATA-1 — UI never calls the network.** No `HttpClient`, `fetch`, `axios`, or URL strings in `ui/` or components. UI consumes Query hooks / services only.
  _Rationale:_ Law L6 — decouples UI from transport.

  ```ts
  // ❌ const r = await fetch('/api/patients');         (in a component)
  // ✅ const { data } = usePatients();                 (query hook)
  ```

- 🔴 **DATA-2 — No DTOs in components.** Components import **Models** only; DTO types never cross out of `api/`.
  _Rationale:_ Law L7 — DTOs are backend-shaped and unstable.

  ```ts
  // ❌ import { PatientDTO } from '@/entities/patient/api/patient.dto';
  // ✅ import { Patient } from '@/entities/patient';   (the Model)
  ```

- 🔴 **DATA-3 — Validate at the boundary with Zod.** Every server response is parsed by its DTO schema before use; reject/observe on parse failure.
  _Rationale:_ the network is hostile; trust nothing un-validated.

  ```ts
  const dto = PatientDtoSchema.parse(raw); // throws → typed AppError, logged (no PHI)
  ```

- 🔴 **DATA-4 — Always map DTO→Model.** Repositories return Models via a pure `*.mapper.ts`; never leak DTO fields upward.
  _Rationale:_ a backend rename (`patient_first_nm` → `firstName`) becomes a one-file change.

- 🔴 **DATA-5 — Server data lives in TanStack Query only.** It is the single source of truth for remote state.
  _Rationale:_ Brain §9 — one cache, one invalidation story.

- 🔴 **DATA-6 — Never mirror server data in Zustand.** No copying query results into a store.
  _Rationale:_ duplicated server state = stale data + cache-coherence bugs.

  ```ts
  // ❌ useEffect(() => clinicStore.setPatients(data), [data]);
  // ✅ read from usePatients() where you need it
  ```

- 🟡 **DATA-7 — Repository is an interface.** Services depend on the interface; the `HttpClient` impl is injected.
  _Rationale:_ enables MSW mocks, tests, and transport swaps with zero UI churn.

- 🟡 **DATA-8 — Stable query keys + bounded queries.** Centralize query keys; every list query is paginated/limited (see §10).
  _Rationale:_ predictable invalidation; no accidental "fetch all patients".

---

## 5. Design token rules (the visual contract)

- 🔴 **TOKEN-1 — Never hardcode visual values.** No raw hex/rgb, px sizes, radii, shadows, font sizes, or durations in components or CSS. (lint: no raw color/length literals.)
  _Rationale:_ Law L5 — tokens are the only theming contract.

  ```tsx
  // ❌ <div style={{ color: '#E87D7D', padding: '12px', borderRadius: '8px' }} />
  // ✅ <div className="text-primary p-3 rounded-lg" />   (Tailwind mapped to tokens)
  ```

- 🔴 **TOKEN-2 — Consume semantic/component tokens, not primitives.** Components use `--color-primary`, `--button-bg`; never `--color-rose-500` directly.
  _Rationale:_ primitives don't theme; semantics re-map per theme (light/dark/high-contrast).

- 🔴 **TOKEN-3 — Theme via tokens, not conditionals.** No `if (theme === 'dark')` styling branches; swap the token map.
  _Rationale:_ components must be theme-agnostic so new themes ship without touching them.

  ```tsx
  // ❌ className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
  // ✅ className="bg-surface"   (semantic token re-mapped by the active theme)
  ```

- 🟡 **TOKEN-4 — Type scale only.** Use `display/h1–h6/body-*/caption/overline`; no ad-hoc font sizes.
  _Rationale:_ Large Text Mode scales one root token → whole UI grows proportionally.

- 🟡 **TOKEN-5 — Spacing on the 4px scale.** Use `--space-*`; no magic margins.
  _Rationale:_ generous, consistent rhythm = the "calm" law (L2).

---

## 6. Localization rules

- 🔴 **I18N-1 — No hardcoded user-facing strings.** Every visible string, **including `aria-label`, errors, toasts, empty-state copy, and validation messages**, uses an i18n key. (lint: `i18next/no-literal-string`.)
  _Rationale:_ Law L4 — and accessibility text is user-facing too.

  ```tsx
  // ❌ <button aria-label="Close">✕</button>
  // ✅ <button aria-label={t('common.action.close')}>✕</button>
  ```

- 🔴 **I18N-2 — Namespaced keys.** Use `namespace.area.element` (Brain §12). No flat or duplicated keys.
  _Rationale:_ discoverable, collision-free, lazy-loadable per feature.

- 🔴 **I18N-3 — RTL via logical properties.** Use `margin-inline-start`, `padding-inline-end`, `start/end`; never `left/right`.
  _Rationale:_ Urdu/RTL must mirror without per-component overrides.

  ```css
  /* ❌ margin-left: var(--space-4);  ✅ margin-inline-start: var(--space-4); */
  ```

- 🔴 **I18N-4 — Format via `Intl`.** Dates, numbers, and currency go through locale-aware `Intl` formatters; no manual string concatenation.
  _Rationale:_ `06/27/2026` vs `27/06/2026` is a clinical safety issue.

- 🟡 **I18N-5 — ICU for plurals/gender.** Use ICU messages, not string concatenation, for counts and gendered text.
  _Rationale:_ Hindi/Marathi/Urdu plural rules differ from English.

- 🟡 **I18N-6 — Runtime switch, no reload.** Language change must not require a page reload; locale bundles lazy-load.
  _Rationale:_ Brain §8 — switching mid-task must not lose state.

---

## 7. Accessibility rules (WCAG 2.2 AA floor)

- 🔴 **A11Y-1 — Keyboard-reachable + labeled.** Every interactive element is focusable, operable by keyboard, and has an accessible name.
  _Rationale:_ Law L3; doctors are keyboard-first.

  ```tsx
  // ❌ <div onClick={save}>Save</div>
  // ✅ <button onClick={save}>{t('common.action.save')}</button>
  ```

- 🔴 **A11Y-2 — Visible focus.** Never remove focus outlines without a token-driven `:focus-visible` replacement.
  _Rationale:_ invisible focus = unusable by keyboard/SR users.

  ```css
  /* ❌ outline: none;  ✅ outline: none; box-shadow: var(--focus-ring); on :focus-visible */
  ```

- 🔴 **A11Y-3 — Never signal by color alone.** Always pair color with icon, text, or shape (e.g., status chips).
  _Rationale:_ color-blind safety; Brain §7.

- 🔴 **A11Y-4 — Dialogs trap + restore focus.** Modals/sheets trap focus while open and return it to the trigger on close.
  _Rationale:_ otherwise focus is lost behind the overlay.

- 🟡 **A11Y-5 — Minimum touch target.** Interactive targets ≥ 44px (≥ 56px in Large Text Mode).
  _Rationale:_ elderly/low-dexterity users; Brain §3.

- 🟡 **A11Y-6 — Respect reduced motion.** All animation gated by `prefers-reduced-motion`.
  _Rationale:_ vestibular safety; the "calm" law.

- 🟡 **A11Y-7 — Semantic HTML first, ARIA to fill gaps.** Use native elements; live regions for async status.
  _Rationale:_ native semantics are more robust than hand-rolled ARIA.

- 🟢 **A11Y-8 — Skip-to-content on every page.**
  _Rationale:_ keyboard users bypass nav.

---

## 8. State rules (where data lives)

Homes (Brain §9): server→**TanStack Query**, global UI→**Zustand**, form→**RHF**, shareable→**URL**, ephemeral→**`useState`/`useReducer`**.

- 🔴 **STATE-1 — Right tool for the data kind.** Match each datum to its home above. (See §4 for server-state rules.)
  _Rationale:_ misplaced state is the #1 source of bugs and re-render storms.

- 🔴 **STATE-2 — URL owns shareable state.** Filters, tabs, pagination, and selected IDs live in search params.
  _Rationale:_ links must be shareable, restorable, and back-button correct.

  ```ts
  // ❌ const [tab, setTab] = useState('vitals');
  // ✅ const [params, setParams] = useSearchParams(); // ?tab=vitals
  ```

- 🟡 **STATE-3 — No prop drilling beyond 2 levels.** If a prop passes through 3+ components, lift to a store or context.
  _Rationale:_ deep drilling couples unrelated components and resists change.

- 🟡 **STATE-4 — Zustand stores are sliced + selector-based.** Subscribe with selectors; no monolithic god-store.
  _Rationale:_ selectors prevent whole-tree re-renders.

- 🟢 **STATE-5 — Form state stays in RHF.** Don't lift form fields into global state.
  _Rationale:_ forms are local and ephemeral by nature.

---

## 9. Component rules

- 🔴 **CMP-1 — No business logic in UI.** Components render and dispatch; rules live in services/`model`. No fetch, no money math, no domain branching in JSX.
  _Rationale:_ Law L8 + testability; logic must be unit-testable without the DOM.

- 🔴 **CMP-2 — Props are fully typed.** No `any` props; no implicit `any`. Public component props are explicit interfaces.
  _Rationale:_ strict TS is the contract (Brain §4).

- 🟡 **CMP-3 — Presentational vs container split.** Presentational components are pure (props in, UI out); containers wire data/state.
  _Rationale:_ pure components are reusable, story-able, and trivially tested.

- 🟡 **CMP-4 — Reuse before create; no duplicates.** Search `shared/ui` and the entity before building a new component.
  _Rationale:_ two `Button`s = two bugs and drifting design.

- 🟢 **CMP-5 — Every shared component has a Story.** Storybook coverage for `shared/ui`.
  _Rationale:_ visual contract + a11y baseline live in stories.

---

## 10. Performance rules

- 🔴 **PERF-1 — Lazy-load routes.** Route-level code splitting; no eager import of every page in the router.
  _Rationale:_ first paint must stay fast on low-end devices.

- 🔴 **PERF-2 — Virtualize long lists.** Queue, patient records, audit logs, and any unbounded list are windowed/virtualized.
  _Rationale:_ a 2,000-row queue must not render 2,000 DOM nodes.

- 🔴 **PERF-3 — No unbounded queries.** Every list query is paginated or limited; no "fetch everything".
  _Rationale:_ protects the device and the backend.

- 🟡 **PERF-4 — Bundle budget enforced in CI.** Per-route and total JS budgets fail the build when exceeded.
  _Rationale:_ bundle bloat is a silent 10-year tax.

- 🟢 **PERF-5 — Memoize deliberately.** Use `memo`/`useMemo`/`useCallback` where profiling shows a win, not reflexively.
  _Rationale:_ premature memoization adds noise without measured benefit.

---

## 11. Security rules (healthcare / PHI)

- 🔴 **SEC-1 — PHI never leaves the safe path.** Never log, store in `localStorage`/`sessionStorage`, or send PHI to analytics/Sentry/breadcrumbs.
  _Rationale:_ patient data leakage is a regulatory and ethical breach.

  ```ts
  // ❌ analytics.track('view', { patientName, dob });   logger.info(patient);
  // ✅ analytics.track('patient_viewed', { patientId: hashedId });
  ```

- 🔴 **SEC-2 — No secrets in the bundle.** No API keys, tokens, or credentials in client code or env vars shipped to the browser.
  _Rationale:_ anything in the bundle is public.

- 🔴 **SEC-3 — Sanitize any HTML.** Never `dangerouslySetInnerHTML` without sanitization; prefer never rendering raw HTML.
  _Rationale:_ XSS in a clinical app can alter displayed dosages.

- 🟡 **SEC-4 — Permission-gate sensitive UI.** Render/enable actions based on the role/permission matrix; never rely on hiding alone — gate the action too.
  _Rationale:_ RBAC is a product law (Brain §3, Super Admin).

- 🟡 **SEC-5 — Idle & session timeout.** Enforce idle lock and session expiry; clear in-memory PHI on logout/timeout.
  _Rationale:_ shared clinic terminals must not leak the last patient.

- 🟢 **SEC-6 — Analytics via the port only.** Use the provider-agnostic `analytics` port; no vendor SDK in components.
  _Rationale:_ one chokepoint to scrub PHI and swap vendors.

---

## 12. Quality rules

- 🔴 **QA-1 — All four async states.** Every data surface defines **Loading / Empty / Error / Success** (Brain §11). No bare spinner-only screens.
  _Rationale:_ missing states are the most common production embarrassment.

- 🔴 **QA-2 — Typed errors.** Errors surface as `AppError` with a localized human message + retry path; no raw `catch` swallowing.
  _Rationale:_ users need a way forward; engineers need a typed contract.

- 🟡 **QA-3 — Tests for logic and critical flows.** Unit-test services/mappers/`model`; Playwright-cover critical patient-journey flows; a11y assertions in component tests.
  _Rationale:_ logic and the journey are where regressions hurt patients.

- 🟡 **QA-4 — No commented-out code.** Delete it; git remembers.
  _Rationale:_ dead code rots and misleads.

- 🟡 **QA-5 — No `TODO` without a ticket.** Format: `// TODO(CLIN-123): …`.
  _Rationale:_ an untracked TODO is a promise no one will keep.

- 🟢 **QA-6 — Skeletons over spinners; no layout shift.**
  _Rationale:_ calm, stable UI (L2).

---

## 13. Git / PR rules

- 🔴 **GIT-1 — No direct pushes to `main`.** Protected branch; all changes via PR.
  _Rationale:_ `main` is always releasable.

- 🔴 **GIT-2 — Green CI required.** Lint + types + tests + a11y + bundle budget all pass before merge.
  _Rationale:_ CI is the automated half of these rules.

- 🟡 **GIT-3 — Branch naming.** `type/short-desc` → `feat/book-appointment`, `fix/queue-virtualization`, `chore/`, `docs/`.
  _Rationale:_ readable history and tooling.

- 🟡 **GIT-4 — Conventional Commits.** `type(scope): subject` → `feat(vitals): add blood-pressure field`.
  _Rationale:_ drives Changesets/changelog and versioning.

- 🟡 **GIT-5 — Small PRs + required reviews.** Prefer < ~400 changed lines; ≥ 1 approving review (architect for §14 items).
  _Rationale:_ small PRs get real reviews; big PRs get rubber stamps.

- 🟢 **GIT-6 — PR links the ticket and notes the checklist.** Reference [Project-Checklist.md](./Project-Checklist.md) items addressed.
  _Rationale:_ traceability and Definition-of-Done.

---

## 14. STOP — escalate (ADR / architect sign-off required)

These changes alter the **shape** of the system. **Stop, write an ADR** (per [Documentation-Guidelines.md](./Documentation-Guidelines.md)) covering _Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations_ (Brain §14), and get architect sign-off **before** coding:

- 🔴 Adding a **new runtime dependency** (anything not in Brain §4's authoritative stack).
- 🔴 Introducing a **new architectural layer** or changing the layer set.
- 🔴 **Breaking the Dependency Rule** (any upward/sideways import) — even "temporarily".
- 🔴 Adding a **new global Zustand store** or new top-level global state.
- 🔴 Adding a **new top-level route group** / process (a new branch of the patient journey).
- 🔴 Changing the **DTO→Model pipeline**, token tiers, or the `analytics`/`HttpClient` ports.
- 🔴 Adding a **new locale-wide pattern**, theme tier, or auth/permission model change.

> If you're unsure whether something belongs here, it does. Ask first.

---

## 15. Quick reference

### 🚫 NEVER table

| #   | NEVER                                                                | Severity | Rule      |
| --- | -------------------------------------------------------------------- | -------- | --------- |
| 1   | Call `HttpClient`/`fetch`/`axios` from UI/components                 | 🔴       | DATA-1    |
| 2   | Import a DTO into a component                                        | 🔴       | DATA-2    |
| 3   | Use un-validated server data (skip Zod at the boundary)              | 🔴       | DATA-3    |
| 4   | Mirror/cache server data in Zustand                                  | 🔴       | DATA-6    |
| 5   | Deep-import past a slice's `index.ts`                                | 🔴       | ARCH-2    |
| 6   | Import another `feature` from a `feature`                            | 🔴       | ARCH-3    |
| 7   | Import upward/sideways across layers                                 | 🔴       | ARCH-1    |
| 8   | Put domain logic in `shared`                                         | 🔴       | ARCH-4    |
| 9   | Hardcode color/space/radius/shadow/font/duration                     | 🔴       | TOKEN-1   |
| 10  | Use primitive tokens or `theme ===` conditionals in components       | 🔴       | TOKEN-2/3 |
| 11  | Hardcode any user-facing string (incl. `aria-label`, errors, toasts) | 🔴       | I18N-1    |
| 12  | Use physical `left/right` (use logical properties)                   | 🔴       | I18N-3    |
| 13  | Remove focus outline without a token-driven replacement              | 🔴       | A11Y-2    |
| 14  | Signal state by color alone                                          | 🔴       | A11Y-3    |
| 15  | Log/store/transmit PHI to analytics/`localStorage`/Sentry            | 🔴       | SEC-1     |
| 16  | Ship secrets in the client bundle                                    | 🔴       | SEC-2     |
| 17  | `dangerouslySetInnerHTML` without sanitization                       | 🔴       | SEC-3     |
| 18  | Put business logic in a component                                    | 🔴       | CMP-1     |
| 19  | Fire unbounded "fetch-all" queries                                   | 🔴       | PERF-3    |
| 20  | Push to `main` directly / merge red CI                               | 🔴       | GIT-1/2   |
| 21  | Leave commented-out code or a ticket-less `TODO`                     | 🟡       | QA-4/5    |
| 22  | Add a dep/layer/global store/route group without an ADR              | 🔴       | §14       |

### ✅ ALWAYS table

| #   | ALWAYS                                                            | Severity | Rule       |
| --- | ----------------------------------------------------------------- | -------- | ---------- |
| 1   | Import slices via their public `index.ts` only                    | 🔴       | ARCH-2     |
| 2   | Keep imports flowing downward (`app→…→shared`)                    | 🔴       | ARCH-1     |
| 3   | Validate responses with Zod at the boundary                       | 🔴       | DATA-3     |
| 4   | Map DTO→Model; expose Models to UI only                           | 🔴       | DATA-4/2   |
| 5   | Keep server data in TanStack Query (single source)                | 🔴       | DATA-5     |
| 6   | Consume semantic/component tokens for every visual value          | 🔴       | TOKEN-1/2  |
| 7   | Route user-facing text through i18n keys                          | 🔴       | I18N-1     |
| 8   | Use logical properties + `Intl` formatting (RTL-safe)             | 🔴       | I18N-3/4   |
| 9   | Make interactives keyboard-reachable, labeled, with visible focus | 🔴       | A11Y-1/2   |
| 10  | Pair color with icon/text/shape; respect reduced motion           | 🔴/🟡    | A11Y-3/6   |
| 11  | Trap + restore focus in dialogs                                   | 🔴       | A11Y-4     |
| 12  | Put each datum in its correct home; URL owns shareable state      | 🔴       | STATE-1/2  |
| 13  | Define Loading / Empty / Error / Success on every async surface   | 🔴       | QA-1       |
| 14  | Surface typed `AppError` with localized message + retry           | 🔴       | QA-2       |
| 15  | Lazy-load routes; virtualize long lists; budget the bundle        | 🔴/🟡    | PERF-1/2/4 |
| 16  | Permission-gate sensitive actions; enforce idle/session timeout   | 🟡       | SEC-4/5    |
| 17  | Reuse before create; one primary CTA per screen                   | 🟡       | CMP-4 / L1 |
| 18  | Write small PRs, conventional commits, green CI                   | 🔴/🟡    | GIT-2/4/5  |
| 19  | Escalate shape-changing decisions to an ADR (§14)                 | 🔴       | §14        |
| 20  | Keep it simple enough for a junior to read                        | 🟡       | L8 / CMP-1 |

---

_Enforces: [Brain.md](./Brain.md) · Gated by: [Project-Checklist.md](./Project-Checklist.md) · Last updated: 2026-06-27 · Owner: Frontend Architecture · Status: **Foundation v1**_
