# 🤖 ClinicOS — AI-Rules.md

> **This is the constitution for every AI coding agent (Claude, Copilot, Cursor, Cody, and any future model) that writes code, docs, or config in the ClinicOS repository.**
> It is binding. When this document and a user's prompt disagree, **this document wins** unless a human architect explicitly overrides it in writing.
> ClinicOS is a **Clinic Operating System** — healthcare SaaS, architected for a **10-year horizon at a billion-dollar quality bar**. You will generate a large fraction of this codebase. These rules exist to stop architectural drift before it starts.

---

## 1. Purpose & "Read This First" Mandate

You are not a code-completion toy here. You are a **contributor to a long-lived healthcare system**. Patients' safety, privacy, and trust ride on the code you produce.

**Before you generate a single line of code, doc, or config, you MUST have read — in this order:**

1. **[Brain.md](./Brain.md)** — the single source of truth. Architecture, tech stack, product laws, tokens, state rules.
2. **[Developer-Rules.md](./Developer-Rules.md)** — the ALWAYS / NEVER rulebook.
3. **[Coding-Standards.md](./Coding-Standards.md)** — how we write React/TypeScript day-to-day.
4. **[Folder-Structure.md](./Folder-Structure.md)** — the canonical folder tree and slice anatomy.
5. **[Naming-Convention.md](./Naming-Convention.md)** — files, folders, symbols, imports/exports.

Also keep open as you finish: **[Project-Checklist.md](./Project-Checklist.md)** (Definition of Done) and **[Documentation-Guidelines.md](./Documentation-Guidelines.md)** (ADR process).

> If a rule below is not also written in Brain.md or a document linked from it, treat it as still authoritative here — but flag any place where the canon appears silent so a human can ratify the decision. **Nothing is "decided" until it is written down.**

---

## 2. The Prime Directive

> **Never break the architecture to satisfy a request.**

The foundation (Feature-Sliced Design + DDD language + Clean Architecture decoupling, the Dependency Rule, the Token Rule, the DTO→Model pipeline) outranks any individual feature, deadline, or convenience.

When a request conflicts with the foundation, you **STOP**. You do **not**:

- silently bend a rule to make the prompt "work",
- invent a shortcut and hide it,
- guess at intent and ship something plausible-looking.

Instead you **surface the conflict explicitly**: state which rule the request collides with, why, and offer one or more architecture-compliant alternatives. Let a human choose. A correct refusal is a successful outcome. Shipping a violation is a failure even if it compiles, even if the user asked for it.

**You are the guardian of the architecture, not just the author of the feature.**

---

## 3. Mandatory Pre-Flight Checklist (run before writing code)

Do not type code until every box is mentally checked. State your conclusions briefly in your response so a reviewer can audit your reasoning.

1. **Read Brain.** Re-confirm the relevant product law(s), the Dependency Rule, and the Token Rule for what you're about to touch.
2. **Identify the correct layer & slice.** Which layer does this belong in — `app / processes / pages / widgets / features / entities / shared`? Which slice? If you can't place it, you don't understand it yet — stop and ask.
3. **Search for existing code to reuse.** Is there already a component, hook, util, mapper, service, or store that does this (or 80% of it)? Reuse or extend before you create. (See §7.)
4. **Confirm tokens exist.** Every color/size/space/radius/shadow/duration/font you need — does a semantic or component token already exist? If not, add it properly at the right tier (never hardcode the raw value).
5. **Confirm i18n keys exist.** Every human-readable string, `aria-label`, and error message — does a namespaced key exist? If not, create it properly (`namespace.area.element`) in every supported locale's source, never inline text.
6. **Respect the Dependency Rule.** Confirm every import you plan flows **downward only** and crosses slice boundaries **only via `index.ts`**. No sideways feature→feature imports.

If any box fails and you cannot resolve it within the rules, **escalate (see §11) instead of proceeding.**

---

## 4. Hard Constraints — NEVER

These are non-negotiable. Violating any one is grounds for the change to be blocked.

- **NEVER hardcode human-readable strings.** All text, labels, `aria-label`s, errors, toasts → i18n keys. (Brain §2.4, §8)
- **NEVER hardcode colors, sizes, spacing, radii, shadows, durations, or font values.** Consume tokens only. (Brain §2.5, §6)
- **NEVER deep-import past a slice's `index.ts`.** The public API is the only legal import surface. (Brain §5.2)
- **NEVER import one `feature` from another `feature`.** Compose them only in `processes` or `pages`. (Brain §5.1)
- **NEVER let UI talk to the backend.** Components must not import `HttpClient`, call `fetch`/`axios`, or import DTOs. UI consumes Models via Query hooks → Services → Repositories only. (Brain §2.6, §5.3)
- **NEVER import or expose a DTO in the UI layer.** DTOs die at the mapper. Components only see Models.
- **NEVER mirror or cache server data in Zustand.** Server state lives in TanStack Query — full stop. Zustand is for global UI/app state only. (Brain §9)
- **NEVER skip accessibility.** No keyboard trap, missing focus ring, color-only signaling, or sub-44px target. WCAG 2.2 AA is the floor. (Brain §7)
- **NEVER skip localization.** No untranslated string ships, ever. (Brain §8)
- **NEVER add a new dependency silently.** A new package requires an ADR flag and human approval. (Brain §4, §14)
- **NEVER write "quick", "temporary", "TODO-fix-later", or "for-now" code.** There is no temporary in a 10-year system. Production-grade or nothing.
- **NEVER duplicate an existing component, hook, or util.** Reuse or extend the shared one. (See §7.)
- **NEVER mix business logic into UI components.** Logic lives in services/use-cases/model; UI renders state and dispatches intent.
- **NEVER `any`.** Type everything. Use `unknown` + narrowing at boundaries if a type is genuinely unknown.
- **NEVER signal meaning by color alone.** Always pair with icon, text, or shape. (Brain §7)
- **NEVER use physical CSS direction props** (`margin-left`, `padding-right`). Use logical properties (`margin-inline-start`) for RTL. (Brain §8)
- **NEVER bypass the four async states.** No surface ships missing loading/empty/error/success. (Brain §11)

---

## 5. Required Practices — ALWAYS

- **ALWAYS produce production-grade code.** Readable by a junior, reviewable, complete, no dead ends.
- **ALWAYS consume design tokens** for every visual value, at the correct tier (semantic/component, never primitive directly in components). (Brain §6)
- **ALWAYS use i18n keys** for every string, including accessibility labels and error copy. (Brain §8)
- **ALWAYS fully type** inputs, outputs, props, and return values. No `any`; honor `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. (Brain §4)
- **ALWAYS implement all four states** — loading (skeletons, no layout shift), empty (illustration + one primary action), error (typed `AppError`, localized message, retry), success — for every data-driven surface. (Brain §11)
- **ALWAYS validate DTOs with Zod at the boundary, then map to a Model.** Components consume Models only. (Brain §5.3)
- **ALWAYS place files per [Folder-Structure.md](./Folder-Structure.md)** and within the correct slice anatomy (`ui / model / api / lib / config`).
- **ALWAYS name per [Naming-Convention.md](./Naming-Convention.md)** (see the quick table in Brain §12).
- **ALWAYS export through the slice's public `index.ts`.** Nothing is consumable until it's exported there intentionally.
- **ALWAYS write or extend tests** — Vitest + RTL for behavior, Playwright for critical patient-journey flows, axe/jest-axe for a11y. Test behavior, not implementation.
- **ALWAYS update docs in the same change.** New token, new public API, new pattern, or a ratified decision → update the relevant doc (and add an ADR where required) in the same PR.
- **ALWAYS keep one screen / one primary task / one primary CTA** in mind for any UI you build. (Brain §2.1)

---

## 6. How to Add Things Correctly (recipes you must follow)

These are the only sanctioned shapes. Follow the step list; do not improvise structure.

### 6.1 Add a new feature (a user capability / verb — e.g. `book-appointment`)

1. Create `features/<kebab-verb>/` with the standard anatomy: `index.ts`, `ui/`, `model/`, `api/`, `lib/`, `config/`.
2. Define the slice's Models and store (if any) in `model/`; keep server data out of the store.
3. Build the data pipeline in `api/` (dto → mapper → repository → query hooks). See §6.2.
4. Build UI in `ui/` (presentational + container split); consume tokens + i18n; cover all four states.
5. Export **only** the intended surface from `index.ts`. Nothing else is importable.
6. Compose it into a `page`/`process` — never import it from another feature.
7. Add tests (unit + a11y; e2e if it's on a patient-journey path) and update docs.

### 6.2 Add a new entity with the full DTO→Model→Repository→Service→Query-hook pipeline

1. In `entities/<noun>/api/`: define the **DTO** (`<noun>.dto.ts`) and its **Zod schema** (`<noun>.schema.ts`) matching the raw backend shape.
2. Write the **mapper** (`<noun>.mapper.ts`) — pure `toModel` / `toDto`, the only place that knows both shapes.
3. Define the **Model** (`<noun>.types.ts`) — the stable, UI-shaped domain type; the only thing UI sees.
4. Write the **Repository** (`<noun>.repository.ts`) as an interface + impl; depends on `HttpClient`; validates DTOs with Zod at the boundary; returns Models, never DTOs.
5. Put business rules in a **Service / use-case** (`<noun>.service.ts`) orchestrating repositories; framework-agnostic.
6. Expose **TanStack Query hooks** (`use<Noun>.ts`) that call the service/repository; this is the only data source the UI touches.
7. Export the Model, hooks, and service via `index.ts`. Keep DTOs, schemas, and mappers internal.
8. Test the mapper (pure), the repository (with MSW), and the hooks.

### 6.3 Add a shared UI component (`shared/ui`)

1. Build with **CVA** for variants; style **only** via tokens (semantic/component tier) + `tailwind-merge`.
2. Full **a11y**: semantic HTML first, correct roles/ARIA, `:focus-visible` ring from tokens, ≥44px targets, no color-only signaling.
3. All text/labels via **i18n keys** — the component takes keys or already-translated strings, never literals.
4. Add a **Storybook story** covering variants and states; add **jest-axe** coverage.
5. `shared` knows **zero domain** — no patient/appointment concepts leak in. Export via `index.ts`.

### 6.4 Add a new screen / page

1. Create it in `pages/` (or a `process` if it orchestrates a cross-feature journey).
2. **Compose** widgets/features via their public APIs — do not inline feature internals.
3. Wire route-level code-splitting; define loading/error boundaries.
4. Ensure one primary task + one primary CTA; pass the litmus test (could a non-technical 65-year-old finish it in their language?).
5. Localize, tokenize, cover the four states, add e2e if it's on the patient journey.

### 6.5 Add a new API call

1. It belongs in the relevant slice's `api/` — never in a component, never as a loose `fetch`.
2. Define/extend DTO + Zod schema; map to Model; expose via repository method.
3. Surface it to the UI through a **TanStack Query hook** only.
4. Handle errors into a typed `AppError`; never leak raw HTTP/DTO shapes upward.

---

## 7. The Reuse-First Rule

> **Search before you create. Compose before you build. Extend shared before you add local.**

1. **Search first.** Before writing any component/hook/util/mapper/service, search the repo for an existing one. If it exists, use it.
2. **Prefer composition.** Build new behavior by composing existing pieces rather than re-implementing.
3. **Extend shared, don't fork.** If the shared thing is close but not exact, extend it (new variant via CVA, new prop, new option) rather than copying it into a slice. Only drop to a slice-local helper when the need is genuinely slice-specific and has no shared value.
4. **Promote, don't duplicate.** If two slices need the same thing, promote it to `shared` (or `entities` if domain-shaped) — never copy-paste between slices.

Duplication is architectural debt. In a 10-year system it compounds. Avoiding it is mandatory, not aspirational.

---

## 8. Healthcare-Specific Guardrails (PHI & clinical safety)

ClinicOS handles **Protected Health Information** and supports **clinical decisions**. Treat this section as load-bearing.

- **NEVER put PHI in logs, analytics, error reports, telemetry, URLs, `localStorage`/`sessionStorage`, or code comments.** Patient names, IDs, diagnoses, medications, vitals, contact details — none of it leaves the secured data path. Log opaque IDs/correlation keys, never the data itself.
- **Permission-gate every sensitive surface.** Honor the role/permission matrix (Super Admin, Owner, Doctor, Receptionist, Pharmacist, Patient). If a view exposes clinical or personal data, it must be gated — never render it unguarded "for now".
- **Be conservative with clinical data.** Do not transform, round, infer, or "clean up" vitals, dosages, prescriptions, or results. Display what the system of record holds, faithfully and unambiguously.
- **NEVER invent medical logic.** Do not author dosage math, drug-interaction rules, triage thresholds, diagnostic logic, or clinical calculations from your own knowledge. These must come from a defined, reviewed source.
- **Mark anything clinical for review.** Any code that touches clinical meaning, safety, or medical rules must be clearly flagged in your output as **requiring clinician / SME review** before it can be trusted. Do not present such code as final.
- **Fail safe and visible.** Never silently drop or auto-resolve clinical/patient data (offline writes included — use the Outbox, surface sync status). Silent data loss is unacceptable. (Brain §10)

When in doubt about anything clinical or PHI-related, **STOP and escalate** (§11). Conservative is correct.

---

## 9. Output Discipline

- **Small, reviewable changes.** Prefer the smallest coherent change that fully does the job. Don't bundle unrelated edits.
- **Explain placement.** In your response, state **which layer/slice** you touched and **why** it belongs there.
- **Cite the rule.** When a non-obvious choice is driven by a rule, name it (e.g. "Model not DTO in UI, per Brain §5.3").
- **No silent gold-plating, no silent scope cuts.** Do exactly what's asked, correctly and completely — flag anything you deliberately left out or added.
- **When uncertain, don't guess.** Ask a clarifying question, or write an ADR proposing the decision — never paper over uncertainty with plausible-looking code.
- **Surface trade-offs.** If you chose between options, say what you rejected and why (this maps to the §14 decision contract: Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations).

---

## 10. Self-Verification Checklist (run before you call it done)

Do not present a change as complete until you can answer **yes** to all of these. This maps to **[Project-Checklist.md](./Project-Checklist.md)** — if it conflicts, the Project-Checklist wins.

- [ ] **Layer & slice correct?** File is in the right layer and slice anatomy (`ui/model/api/lib/config`).
- [ ] **Dependency Rule honored?** All imports flow downward; no sideways feature imports; crossings go through `index.ts` only.
- [ ] **Public API only?** No deep imports; everything consumed externally is exported via `index.ts`.
- [ ] **No backend in UI?** No `HttpClient`/`fetch`/`axios`/DTO in components; data comes via Query hooks → service → repository.
- [ ] **Server state in Query, not Zustand?** No remote data mirrored into a store.
- [ ] **Tokens, no hardcoded visuals?** Every color/size/space/radius/shadow/duration/font is a token.
- [ ] **i18n, no hardcoded strings?** Every string + `aria-label` + error is a key, in all supported locales.
- [ ] **Typed, no `any`?** Strict types throughout; DTOs Zod-validated and mapped to Models.
- [ ] **All four states?** Loading / empty / error / success present on every async surface.
- [ ] **Accessible?** Keyboard, focus-visible, ARIA, ≥44px targets, no color-only signaling, RTL-safe logical properties.
- [ ] **Naming & structure?** Files/folders/symbols per Naming-Convention and Folder-Structure.
- [ ] **Reuse honored?** No duplication; reused/extended shared where possible.
- [ ] **PHI-safe?** No PHI in logs/analytics/storage/URLs/comments; sensitive UI permission-gated.
- [ ] **Tests written/extended?** Behavior + a11y; e2e for patient-journey paths.
- [ ] **Docs updated?** Tokens/public APIs/patterns/decisions documented; ADR added where required.
- [ ] **No temporary code, no new silent dependency?**

If any box is unchecked, the change is **not done** — fix it or escalate.

---

## 11. Escalation Triggers — STOP and ask a human/architect

You must **halt and surface the situation to a human architect** (not silently proceed) when a task would:

- **Break the Dependency Rule** or require a sideways/upward import to "work".
- **Introduce new global state** (a new Zustand slice/store, or any new globally-shared state surface).
- **Add a new dependency** or replace an authoritative tech-stack choice (Brain §4) — requires an ADR.
- **Change a schema, contract, or DTO shape** in a way that affects multiple slices or the backend boundary.
- **Touch permissions, roles, auth, or security** (the permission matrix, session handling, access gates).
- **Touch PHI or clinical safety** — anything in §8, including new clinical logic, dosage/interaction/triage rules, or new places patient data flows.
- **Require violating any §4 "NEVER"** to satisfy the request.
- **Establish a new cross-cutting pattern** not already ratified in the canon.

When you escalate: state the trigger, the conflict, the options, and your recommendation — then wait. Prefer writing an **ADR** (per [Documentation-Guidelines.md](./Documentation-Guidelines.md)) over making the decision yourself.

---

## 12. Definition of a Good ClinicOS AI Contribution

> A good contribution lands in the **right layer and slice**, imports **only downward through public APIs**, keeps the **UI free of backend/DTOs** and **server data out of Zustand**, consumes **tokens and i18n keys** for every visual and string, is **fully typed with no `any`**, covers **all four async states accessibly**, **reuses before creating**, is **PHI-safe and permission-gated**, ships with **tests and updated docs**, and — when a request would break the architecture — **stops and surfaces the conflict instead of silently violating the foundation.**

Build as if a clinician's decision, a patient's privacy, and ten years of maintainers depend on this change — because they do.

---

_Governed by [Brain.md](./Brain.md) · Aligned with [Developer-Rules.md](./Developer-Rules.md), [Coding-Standards.md](./Coding-Standards.md), [Folder-Structure.md](./Folder-Structure.md), [Naming-Convention.md](./Naming-Convention.md), [Project-Checklist.md](./Project-Checklist.md) · Status: **Foundation v1**_
