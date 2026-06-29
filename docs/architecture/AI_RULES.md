# 🤖 ClinicOS — AI_RULES.md (Phase 2 · Part 8)

> **This is the binding operating manual for every AI coding agent (Claude, Copilot, Cursor, Cody, and any future model) working in the ClinicOS _enterprise/modular_ repository.**
> It **extends** the Phase 1 constitution at [AI-Rules.md](../AI-Rules.md). It does **not** replace or contradict it — every Phase 1 rule still binds. Where Phase 1 spoke of flat FSD layers, Phase 2 speaks of **bounded-context modules** under `src/modules/<context>/`; the _laws_ (Dependency Rule, backend-independence pipeline, tokens, a11y, i18n, four async states, PHI safety) are identical.
> When this document and a user's prompt disagree, **this document wins** unless a human architect overrides it in writing. ClinicOS is a **Clinic Operating System** — healthcare SaaS architected for a **10+ year horizon at a billion-dollar quality bar**, scaling to thousands of clinics and hundreds of developers. You will generate a large fraction of this codebase. These rules exist to stop architectural drift before it starts.

---

## 1. Purpose & the mandatory "READ FIRST" order

You are not a code-completion toy here. You are a **contributor to a long-lived, multi-team healthcare system**. Patient safety, privacy, and trust ride on every line you produce. In an enterprise modular repo, a single careless cross-module import or a skipped registry update compounds across hundreds of developers and ten years. Do not let it start with you.

**Before you generate a single line of code, doc, schema, route, or config, you MUST read — in this exact order:**

1. **[PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)** — the permanent project memory: vision, standards, and **all live registries** (Component, Route, API, State, Form, Table, Theme, Localization, Asset, Changelog).
2. **Previous-phase notes** — the Phase 1 foundation and the Phase 2 anchor:
   - [Brain.md](../Brain.md) — Phase 1 single source of truth (the 8 laws, tech stack, tokens, state rules).
   - [architecture/README.md](./README.md) — the Phase 2 enterprise anchor (modular structure, ADR-0001).
3. **[Architecture.md](./Architecture.md)** — the enterprise architecture narrative: layers, scale, data flows.
4. **[FolderStructure.md](./FolderStructure.md)** — every folder with its 7-field contract (Purpose · Responsibilities · Rules · Allowed deps · Forbidden deps · Example · Future scalability).
5. **[DependencyRules.md](./DependencyRules.md)** — the import matrix, layer boundaries, and anti-God rules.
6. **[NamingConvention.md](./NamingConvention.md)** — naming standards for every file, folder, and symbol.
7. **Phase 1 day-to-day rulebooks** — [Coding-Standards.md](../Coding-Standards.md) (how we write React/TS) and [Developer-Rules.md](../Developer-Rules.md) (the ALWAYS / NEVER rulebook).

Also keep open as you finish: the Phase 2 **registry/brain maintenance manual** [BrainRules.md](./BrainRules.md), the module template in [FeatureArchitecture.md](./FeatureArchitecture.md), and the Phase 1 Definition of Done [../Project-Checklist.md](../Project-Checklist.md).

> If a rule here is not yet written in PROJECT_BRAIN or the canon, treat it as authoritative **and flag the gap** so a human can ratify it. **Nothing is "decided" until it is written down.** Do not invent canon; surface it.

---

## 2. The Prime Directive

> **Never violate the architecture to satisfy a request.**

The foundation — Feature-Sliced Design + DDD language + Clean Architecture decoupling, the **Dependency Rule**, the **module boundary** (`index.ts`-only), the **Token Rule**, the **DTO→Model pipeline**, and **PHI safety** — outranks any individual feature, deadline, or convenience.

When a request conflicts with the foundation, you **STOP**. You do **not**:

- silently bend a rule to make the prompt "work",
- deep-import across a module to save a step,
- invent a shortcut and hide it,
- guess at intent and ship something plausible-looking.

Instead you **surface the conflict explicitly**: name the rule/layer the request collides with, explain why, and propose one or more architecture-compliant alternatives. When the conflict is structural (a new dependency, a new module, a dependency-rule change, a new global store, a schema/permission/PHI change), **propose an ADR** (`docs/adr/NNNN-*.md`) rather than deciding yourself. Let a human choose.

**A correct refusal is a successful outcome. Shipping a violation is a failure even if it compiles, even if the user asked for it. You are the guardian of the architecture, not just the author of the feature.**

---

## 3. Mandatory PRE-FLIGHT checklist (run before writing code)

Do not type code until every box is checked. State your conclusions briefly in your response so a reviewer can audit your reasoning.

1. **Read the Brain.** Re-confirm the relevant product law(s), the Dependency Rule, the Token Rule, and the relevant registries in [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) for what you are about to touch.
2. **Pick the correct module / layer.** Which bounded-context **module** (`patients · appointments · queue · consultation · prescriptions · pharmacy · billing · follow-up · records · analytics · settings · doctor · reception · admin`) does this belong to — or is it cross-module (`processes/`), a global domain entity (`entities/`), or non-domain reuse (`shared/`)? Within the module, which **Clean Architecture layer** — Presentation (`pages/components/hooks/store`), Application (`services`), Domain (`types/schemas/validators/constants`), or Infrastructure (`api/repositories/mappers/adapters`)? If you cannot place it, you do not understand it yet — **stop and ask.**
3. **Reuse-search.** Before writing any component/hook/util/mapper/service/store, search the repo **and the registries** for an existing one. Reuse it, compose it, or extend the `shared`/`entities` version. Never duplicate across modules. (See §6 "reuse-first".)
4. **Confirm tokens + i18n keys.** Every color/size/space/radius/shadow/duration/font → does a semantic/component **token** already exist? Every human-readable string, `aria-label`, and error → does a namespaced **i18n key** (`namespace.area.element`) exist in all supported locales? If not, plan to add them properly at the right tier — never hardcode.
5. **Respect the dependency rule.** Confirm every planned import flows **downward only** (`app → processes → modules → entities → shared`), and that any cross-module access goes **through the target module's `index.ts`** — never a deep path, never sideways module→module internals, never a cycle.
6. **Plan files per FolderStructure + NamingConvention.** List the exact files you will create/edit, each in its correct module/layer folder per [FolderStructure.md](./FolderStructure.md), named per [NamingConvention.md](./NamingConvention.md), exported only through `index.ts`.

If any box fails and you cannot resolve it within the rules, **escalate (§9)** instead of proceeding.

---

## 4. The POST-WORK UPDATE WORKFLOW (the heart of Part 8)

> **The change is not the code. The change is the code _plus_ the memory of the code.** In an enterprise repo, undocumented work is _lost_ work — the next agent and the next team cannot see it. Phase 8 exists so the system's memory never drifts from its reality.

**After ANY change — in the SAME change/PR, never "later" — you MUST update every artifact below that your work touched.** This is governed in detail by [BrainRules.md](./BrainRules.md); follow its formats and ID conventions exactly.

**The exact step list (do them in order):**

1. **Documentation.** Update the relevant Phase 2 doc(s) — [Architecture.md](./Architecture.md), [FolderStructure.md](./FolderStructure.md), [DependencyRules.md](./DependencyRules.md), [FeatureArchitecture.md](./FeatureArchitecture.md), [NamingConvention.md](./NamingConvention.md) — for any new public API, pattern, folder, or ratified decision. Add an **ADR** where the decision is structural (§9).
2. **PROJECT_BRAIN — relevant registries.** Open [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) and update the registries your change affected. The **always-check** registries on every functional change:
   - **Changelog** — one dated entry describing what changed and why (the running history).
   - **Component Registry** — every new/changed shared or module component (name, location, public-API status, variants/states).
   - **Route Registry** — every added/changed/removed route (path, module, lazy chunk, permission, title i18n key).
   - **API Registry** — every added/changed endpoint (method, path, DTO, schema, repository, service, query hook, query key).
3. **Conditionally-touched registries** — update these **only when your change touched them**, but you MUST update them if it did:
   - **State Registry** — new/changed Zustand store, slice, or selector (UI state only — never server data).
   - **Form Registry** — new/changed form (RHF + Zod schema, fields, validation).
   - **Table Registry** — new/changed data table (columns, sorting, pagination, virtualization).
   - **Theme Registry** — new/changed tokens or theme mappings.
   - **Localization Registry** — new/changed i18n namespaces/keys and the locales they were added to (en/hi/mr/ur).
   - **Asset Registry** — new/changed fonts, icons, images, or animations.
4. **The module's `BRAIN.md`.** Update the touched module's local `modules/<module>/BRAIN.md` (and `README.md` if its public API/owners/deps changed): record the decision, any local registry deltas, new public exports, TODOs, and known debt.
5. **Self-verify the memory matches reality.** Re-read your diff against the registries: every new route/component/endpoint/store/form/table/token/asset/i18n key you added is now registered, and nothing registered is missing from the code. If they diverge, the change is **not done**.

> Rule of thumb: **if a reviewer would have to read your diff to know it exists, you have not finished — register it.** Registry updates ship in the same diff as the code, never as a follow-up.

---

## 5. Hard NEVER list (enterprise)

These are non-negotiable. Violating any one is grounds to block the change. (These extend the Phase 1 NEVERs in [AI-Rules.md](../AI-Rules.md) §4 — all of those still apply.)

- **NEVER break the Dependency Rule.** Imports flow **downward only** (`app → processes → modules → entities → shared`). No upward, no sideways.
- **NEVER deep-import across modules.** No reaching past another module's `index.ts` into its `pages/services/api/...`.
- **NEVER import another module except via its `index.ts`.** The module public API is the only legal cross-module surface. Multi-module journeys are orchestrated in `processes/`, not by chaining module imports. No circular module dependencies.
- **NEVER put server state in Zustand.** Server data lives in **TanStack Query** — full stop. Zustand (module-local or global `shared/store`) is for UI/app state only.
- **NEVER call `HttpClient`/`fetch`/`axios` from, or import a DTO into, the UI (Presentation) layer.** UI consumes **Models** via Query hooks → services → repositories. DTOs die at the mapper.
- **NEVER hardcode strings, colors, sizes, spacing, radii, shadows, durations, or fonts.** i18n keys and design tokens only.
- **NEVER bypass `ThemeProvider` or hardcode colors — always consume the theme via `useTheme()`/tokens.** No component touches `localStorage`/`matchMedia`/`document` for theming; the Theme Engine manager is the single source of truth. See [docs/theme-engine/](../theme-engine/README.md).
- **NEVER skip accessibility or i18n.** No keyboard trap, missing focus ring, color-only signaling, sub-44px target, or untranslated string. WCAG 2.2 AA is the floor; every locale (en/hi/mr/ur + RTL) is in scope.
- **NEVER add a dependency without an ADR** and human approval. The Phase 1 tech stack ([Brain.md](../Brain.md) §4) is authoritative.
- **NEVER create God components, hooks, or services.** No mega-component, no do-everything hook, no service that owns half a module. One responsibility per unit; split by Clean-Architecture layer.
- **NEVER generate "quick", "temporary", "TODO-fix-later", or "for-now" code.** There is no temporary in a 10-year system. Production-grade or nothing.
- **NEVER duplicate an existing component or util.** Reuse, compose, or extend the `shared`/`entities`/module version (and check the registries first).
- **NEVER put PHI in logs, analytics, telemetry, error reports, URLs, `localStorage`/`sessionStorage`, or code comments.** Log opaque IDs/correlation keys, never the data itself.

Other binding NEVERs carried from Phase 1: no `any`; no business logic in UI; no physical CSS direction props (use logical: `margin-inline-start`); no surface missing the four async states.

---

## 6. Always ALWAYS list

- **ALWAYS produce production-grade code** — typed (no `any`; honor `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), tokenized, localized, accessible (WCAG 2.2 AA), and tested (Vitest + RTL for behavior, Playwright for patient-journey flows, jest-axe for a11y).
- **ALWAYS implement all four async states** on every data-driven surface — **loading** (skeletons, no layout shift), **empty** (illustration + one primary action), **error** (typed `AppError`, localized message, retry), **success** (content + optimistic/inline feedback).
- **ALWAYS place files per the module template** — the correct module and the correct Clean-Architecture layer (Presentation / Application / Domain / Infrastructure) per [FeatureArchitecture.md](./FeatureArchitecture.md) and [FolderStructure.md](./FolderStructure.md).
- **ALWAYS export through the slice/module `index.ts`** — nothing is consumable until it is intentionally and minimally exported there. The public surface is a contract.
- **ALWAYS keep diffs small and reviewable** — the smallest coherent change that fully does the job; no unrelated edits bundled in.
- **ALWAYS cite the rule/layer you are following** — e.g. "Model not DTO in UI, per Brain §5.3" or "via `appointments/index.ts`, per DependencyRules". State which module/layer you touched and why it belongs there.
- **ALWAYS reuse before creating, validate DTOs with Zod at the boundary then map to a Model, name per [NamingConvention.md](./NamingConvention.md), and update docs + registries in the same change** (§4).

---

## 7. Recipes the AI follows (step lists)

These are the only sanctioned shapes. Follow the step list; do not improvise structure. Each recipe **ends** with the §4 post-work update workflow.

### 7.1 Scaffold a new module (bounded context)

> A new module is an **escalation trigger** (§9) — confirm with an architect/ADR first.

1. Create `modules/<module-name>/` from the canonical template ([FeatureArchitecture.md](./FeatureArchitecture.md)): `index.ts`, `routes.tsx`, `permissions.ts`, `README.md`, `BRAIN.md`, and the layer folders (`pages/ components/ hooks/ services/ repositories/ api/ mappers/ adapters/ types/ schemas/ validators/ constants/ utils/ store/ config/ tests/`).
2. Define the module's **public API** in `index.ts` (minimal, intentional). Wire `routes.tsx` as a **lazy-loaded** subtree and declare `permissions.ts`.
3. Add the module to CODEOWNERS (one module ≈ one team) and to the Phase 2 boundaries/ESLint config so cross-module deep imports and cycles are linted.
4. Fill `README.md` (overview, owners, public API, dependencies) and `BRAIN.md` (decisions, local registries, TODOs, debt).
5. **Update workflow (§4):** register the module's routes (Route Registry), permissions, and public components; add the Changelog entry; update Architecture/FolderStructure docs and an ADR for the new context.

### 7.2 Add a use-case (the full vertical slice)

Do these in order; each step lives in its named layer:

1. **dto** — define the raw backend shape in `types/` (DTO type).
2. **schema** — Zod schema in `schemas/` validating the DTO **at the boundary**.
3. **mapper** — pure `toModel` / `toDto` in `mappers/`; the only place that knows both shapes.
4. **model** — the stable, UI-shaped domain type in `types/`; the only thing UI sees.
5. **repository** — interface + impl in `repositories/`; depends on `HttpClient`; parses DTOs with the schema; returns **Models, never DTOs**.
6. **service** — business rules / use-case in `services/`; framework-agnostic; orchestrates repositories.
7. **query-hook** — TanStack Query/mutation hook in `api/` (or `hooks/`) calling the service; the **only** data source the UI touches; structured query keys + invalidation.
8. **component** — presentational + container UI in `components/`; tokens + i18n; all four states; a11y.
9. **page** — compose components in `pages/` (composition only; one primary task + one primary CTA).
10. **route** — register the page in `routes.tsx` (lazy chunk).
11. **permission** — gate the route/action in `permissions.ts` via the RBAC matrix.
12. **i18n** — add `namespace.area.element` keys to **all** locales (en/hi/mr/ur).
13. **test** — unit-test the mapper (pure), repository (MSW), service, and hooks; a11y test the UI; e2e if on a patient-journey path.
14. **brain update** — run the **§4 workflow**: API Registry (endpoint→hook), Component/Route/Localization registries (+ State/Form/Table/Theme/Asset if touched), Changelog, the module `BRAIN.md`, and docs.

### 7.3 Add a shared design-system component (`shared/design-system`)

1. Build with **CVA** for variants; style **only** via tokens (semantic/component tier) + `tailwind-merge`. `shared` knows **zero domain**.
2. Full **a11y**: semantic HTML first, correct roles/ARIA, token-driven `:focus-visible` ring, ≥44px targets, no color-only signaling, RTL-safe logical properties.
3. All text/labels via **i18n keys** (the component takes keys or already-translated strings, never literals).
4. Add a **Storybook story** (all variants + states) and **jest-axe** coverage. Export via `index.ts`.
5. **§4 workflow:** Component Registry (+ Theme/Asset/Localization if touched), Changelog, docs.

### 7.4 Add a new route

1. Add the route to the owning **module's `routes.tsx`** as a **lazy-loaded** chunk (never to a foreign module). Cross-module journeys go in `processes/`.
2. **Permission-gate** it in `permissions.ts` via the RBAC matrix and the route guard.
3. Set the localized title/breadcrumb via i18n keys; ensure loading/error boundaries.
4. **§4 workflow:** **Route Registry** (path, module, chunk, permission, title key), Localization Registry, Changelog, module `BRAIN.md`.

### 7.5 Add a new entity

1. Decide scope: **global** domain entity shared across modules → top-level `entities/<noun>/`; module-private → the module's `types/` + `repositories/`. Never duplicate a global entity into a module.
2. Build the full pipeline (recipe 7.2 steps 1–7): dto → schema → mapper → model → repository → service → query-hook.
3. Export the **Model, hooks, and service** via `index.ts`; keep DTOs, schemas, and mappers internal.
4. Test the mapper (pure), repository (MSW), and hooks.
5. **§4 workflow:** API Registry, Component/State registries as touched, Changelog, docs, and the entity/module `BRAIN.md`.

---

## 8. Healthcare guardrails (PHI & clinical safety)

ClinicOS handles **Protected Health Information** and supports **clinical decisions**. This section is load-bearing; conservative is correct.

- **PHI handling.** NEVER put PHI (names, IDs, diagnoses, medications, vitals, contact details, results) in logs, analytics, telemetry, error reports, URLs/query params, `localStorage`/`sessionStorage`, or comments. Log opaque IDs/correlation keys only. Persisted Query cache must be scoped and **cleared on logout**. Fetch and render the **minimum necessary** PHI.
- **Permission-gating.** Every sensitive route, action, and data view must be gated by the RBAC matrix (Super Admin · Owner · Doctor · Receptionist · Pharmacist · Patient) via `permissions.ts` + the `shared/permissions` engine. The UI gate is convenience; server-side authorization is the control. Never render clinical/personal data unguarded "for now". Enforce multi-tenant (active-clinic) isolation — no cross-tenant leakage.
- **No invented medical logic.** NEVER author dosage math, drug-interaction rules, triage thresholds, diagnostic logic, or any clinical calculation from your own knowledge. These must come from a defined, reviewed source. Do not transform, round, infer, or "clean up" vitals, dosages, prescriptions, or results — display the system of record faithfully and unambiguously.
- **Mark clinician-review-needed.** Any code touching clinical meaning, safety, or medical rules must be clearly flagged in your output as **requiring clinician / SME review** before it can be trusted. Do not present such code as final.
- **Fail safe and visible.** Never silently drop or auto-resolve clinical/patient data (offline writes included — use the Outbox, surface sync status). Silent data loss is unacceptable.

When in doubt about anything clinical or PHI-related, **STOP and escalate (§9).**

---

## 9. Escalation triggers — STOP and ask a human/architect

You must **halt and surface the situation to a human architect** (do not silently proceed) when a task would:

- **Change the Dependency Rule** or require a sideways/upward/deep-cross-module import to "work".
- **Introduce a new global store** (a new `shared/store` slice, or any new globally-shared state surface) — or any new global state.
- **Add a new dependency** or replace an authoritative tech-stack choice ([Brain.md](../Brain.md) §4) — requires an ADR.
- **Create a new module / bounded context** — requires an ADR, CODEOWNERS, and boundary-config changes (recipe 7.1).
- **Change permissions / security / a schema, contract, or DTO shape** in a way that affects multiple modules or the backend boundary.
- **Touch PHI or clinical safety** — anything in §8, including new clinical logic or new places patient data flows.
- **Require violating any §5 "NEVER"** to satisfy the request, or establish a new cross-cutting pattern not yet in the canon.

When you escalate: state the **trigger**, the **conflict**, the **options**, and your **recommendation** — then wait. Prefer writing an **ADR** (`docs/adr/NNNN-*.md`, per the Decision Contract: Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations) over deciding yourself, and record it in PROJECT_BRAIN.

---

## 10. AI Definition of Done (copy-paste checklist)

> Paste this into your response/PR and tick every applicable box. It mirrors [../Project-Checklist.md](../Project-Checklist.md); if they conflict, the Project-Checklist wins. **The change is not done until the registry/brain updates at the bottom are complete.**

```text
ARCHITECTURE & MODULE BOUNDARIES
[ ] Correct module + Clean-Architecture layer (Presentation/Application/Domain/Infrastructure)
[ ] Dependency Rule honored: downward-only (app→processes→modules→entities→shared); no sideways/upward
[ ] Cross-module access only via the target module's index.ts; no deep imports; no cycles
[ ] New public exports are intentional + minimal; shared/ holds zero domain knowledge
[ ] Naming + file placement per NamingConvention.md + FolderStructure.md

DATA & STATE
[ ] DTO → Zod (at boundary) → mapper → Model → repository → service → Query hook
[ ] No HttpClient/fetch/axios/DTO in UI; UI consumes Models only
[ ] Server data in TanStack Query, NOT Zustand; query keys structured + invalidation handled

UI, TOKENS, I18N, A11Y
[ ] Tokens only — no hardcoded color/size/space/radius/shadow/duration/font
[ ] i18n keys only — every string/aria-label/error, in all locales (en/hi/mr/ur), RTL-safe logical props
[ ] All four async states: loading (skeleton) / empty / error+retry / success
[ ] WCAG 2.2 AA: keyboard, focus-visible, ARIA, ≥44px targets, no color-only signaling; axe green
[ ] One Screen · One Primary Task · One Primary CTA

QUALITY & SAFETY
[ ] Typed, no `any`; strict tsc green; no God components/hooks/services; no temporary code
[ ] Reuse honored (searched registries + repo); no duplication
[ ] PHI-safe (no PHI in logs/analytics/URLs/storage/comments); sensitive surfaces permission-gated
[ ] Clinical/medical code flagged for clinician/SME review; no invented medical logic
[ ] Tests: unit (mapper/service/hook/store) + a11y + e2e for patient-journey paths
[ ] No new dependency without ADR; escalation triggers (§9) surfaced if hit

REGISTRY & BRAIN UPDATES (same change — the change is not done without these)
[ ] Docs updated (Architecture / FolderStructure / DependencyRules / FeatureArchitecture / Naming) + ADR if structural
[ ] PROJECT_BRAIN: Changelog + Component Registry + Route Registry + API Registry
[ ] PROJECT_BRAIN: State / Form / Table / Theme / Localization / Asset registries — each updated IF touched
[ ] Module BRAIN.md (and README.md if public API/owners/deps changed) updated
[ ] Self-verified: registries match the code in this diff (nothing added is unregistered, nothing registered is missing)
```

---

_Phase 2 · Part 8 · Extends [AI-Rules.md](../AI-Rules.md) · Governed by [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) and [BrainRules.md](./BrainRules.md) · Aligned with [README.md](./README.md), [Architecture.md](./Architecture.md), [FolderStructure.md](./FolderStructure.md), [DependencyRules.md](./DependencyRules.md), [NamingConvention.md](./NamingConvention.md), [FeatureArchitecture.md](./FeatureArchitecture.md), [../Project-Checklist.md](../Project-Checklist.md) · Status: **Foundation v2**_
