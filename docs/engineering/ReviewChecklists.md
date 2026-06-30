# ClinicOS — Review Checklists

> Copy-paste PR review checklists, one per artifact type. Each is focused, specific, and pasted directly into the PR by the reviewer. This document **extends** the canon — it operationalizes the [Definition of Done](./DefinitionOfDone.md) and [Project-Checklist.md §3](../Project-Checklist.md#3-per-feature--per-pr-definition-of-done) into per-artifact gates. It never contradicts the canon; where this guide and the checklist disagree, the checklist wins.

---

## 1. How to use these checklists

1. Identify what the PR changes (a component? a page? an API slice?).
2. Paste the matching checklist(s) from below into the PR review.
3. A checklist is a contract: an **unchecked box blocks merge** unless explicitly waived with a note.
4. Run the 60-second blocker quick-gate first (§2). If anything trips, **block immediately** — do not proceed to the detailed checklist.

These checklists assume the universal foundations (right layer behind a public `index.ts`, tokens-only, i18n-only, four async states, no `any`, green CI). They add what is **specific** to each artifact. The full per-artifact bar still rolls up to [DefinitionOfDone.md](./DefinitionOfDone.md).

---

## 2. 60-second blocker quick-gate

> Run this first on every PR. Mirrors [Project-Checklist.md §9](../Project-Checklist.md#9-pr-reviewer-quick-gate-60-second-blockers). Any ✅ here = **block**.

- [ ] 🔴 Dependency Rule broken — upward/sideways import, `feature→feature`, or deep import past `index.ts`.
- [ ] 🔴 UI talks to backend directly — `HttpClient`, raw `fetch`, or a DTO imported in a component.
- [ ] 🔴 Server data stored in Zustand instead of TanStack Query.
- [ ] 🔴 Hardcoded visual value — color/size/space/radius/shadow/font not from a token.
- [ ] 🔴 Hardcoded human-readable string — text / `aria-label` / error not from an i18n key.
- [ ] 🔴 Missing async state — no skeleton loading, empty, error+retry, or success handling.
- [ ] 🔴 Accessibility fail — no focus-visible/keyboard path, missing label, color-only signal, or new axe violation.
- [ ] 🔴 More than one primary CTA on the screen.
- [ ] 🔴 PHI leak — PHI in logs/analytics/Sentry/URL/storage, or an ungated privileged surface.
- [ ] 🔴 `any` / `@ts-ignore`, `console.*`/debugger, or dead/commented-out code; or CI red.

---

## 3. Components

> For a shared/UI or entity-level component. Reusable, presentational, token-driven.

- [ ] Reuse checked first — searched `shared/ui` and entity UI before adding a new component.
- [ ] Lives in the correct layer; exported only via the slice `index.ts` (no deep import surface).
- [ ] **Tokens only** — no hardcoded color/size/space/radius/shadow/duration/font.
- [ ] Variants via **CVA** + tailwind-merge; no conditional class soup.
- [ ] Semantic HTML first; ARIA only fills gaps; correct name/role/value.
- [ ] Visible token-driven `:focus-visible` ring; fully keyboard operable.
- [ ] Touch targets ≥ 44px (≥ 56px Large Text Mode); ≥ 24px floor.
- [ ] All strings (incl. `aria-label`/`title`/`alt`/`placeholder`) from i18n keys.
- [ ] Motion gated by `prefers-reduced-motion`; status never by color alone.
- [ ] RTL-safe — logical CSS properties only; directional icons flip.
- [ ] **Storybook story** covers all variants + the four states; `addon-a11y` clean.
- [ ] `vitest-axe` passes; props typed (no `any`); no server-data or `HttpClient` coupling.

---

## 4. Pages

> A route-level screen composing widgets/features. Owns layout and the screen's primary task.

- [ ] **One Screen · One Primary Task · One Primary CTA** — exactly one primary action.
- [ ] Lives in `pages/`; composes features/entities downward only (no `feature→feature`).
- [ ] All four async states present at the page level — loading skeleton (no layout shift), empty (illustration + one action), error (typed `AppError` + retry), success (live region).
- [ ] Page data comes only via TanStack Query hooks; no DTO/`HttpClient`/raw fetch in the page.
- [ ] Shareable/restorable state (filters, tabs, pagination) lives in **URL**, not local state.
- [ ] Skip-to-content target present; logical heading outline; landmarks correct.
- [ ] Localized page title; strings from i18n; runtime language switch + RTL verified.
- [ ] Permission-gated where privileged; no PHI in URL/query params.
- [ ] Error and Suspense boundaries wrap the route; fallback uses the four-state Error UI.
- [ ] E2E covers the critical journey this page touches; `vitest-axe`/axe clean.

---

## 5. Layouts

> App shell, route group shells, or structural wrappers (nav, header, sidebar, content region).

- [ ] Structure via landmarks (`header`/`nav`/`main`/`footer`); single `<main>` per view.
- [ ] Skip-to-content link is the first focusable element and targets `<main>`.
- [ ] Spacing/sizing from tokens; calm-by-default rhythm (generous spacing, large type).
- [ ] Responsive + reflow at 320px and 200% zoom — no horizontal scroll, no clipping.
- [ ] RTL mirrors correctly using logical properties; sticky regions never obscure focus (2.4.11).
- [ ] Language switcher + online/offline + sync indicator present, labeled, AT-accessible.
- [ ] No business/domain logic in the layout; it composes, it doesn't fetch.
- [ ] Layout strings localized; nav labels from i18n keys.
- [ ] Theme switches (light/dark/high-contrast/Large Text) render without breakage.
- [ ] Error boundary at the shell level with a recoverable fallback.

---

## 6. Hooks

> Custom React hooks (UI hooks, query hooks, state hooks).

- [ ] Named `use*`; single clear responsibility; placed in the correct layer/slice.
- [ ] No `any`; inputs/outputs fully typed; return shape stable and documented.
- [ ] Dependency arrays correct; stable callbacks where consumers depend on identity.
- [ ] No direct `HttpClient`/`fetch`/DTO — server data goes through a repository/service + TanStack Query.
- [ ] Side effects cleaned up (subscriptions, timers, listeners) on unmount.
- [ ] No server data mirrored into Zustand; right state tool for the data kind.
- [ ] Unit-tested for behavior (success, loading, error, edge/empty), not implementation.
- [ ] No DOM/string literals that should be localized leaking out of the hook.
- [ ] Pure where possible; framework-agnostic logic extracted to `lib`/`service`.
- [ ] Public export intentional via `index.ts`; no deep import surface.

---

## 7. Forms

> React Hook Form + Zod. Accessible, validated, double-submit safe.

- [ ] **React Hook Form + Zod resolver** (uncontrolled, performant); schema derives from the domain schema.
- [ ] Every field has an associated `<label>` (or labeled control); no placeholder-as-label.
- [ ] Accessible errors: `aria-invalid` on the field, `aria-describedby` → error node, message from i18n.
- [ ] **Focus moves to the first error** on failed submit; errors announced (live region/role=alert).
- [ ] Submit guarded against **double-submit** (disabled/pending while in flight); pending state shown.
- [ ] Success path: optimistic/inline feedback + live-region announcement.
- [ ] Validation messages and field labels localized; ICU plurals where grammar needs them.
- [ ] `autocomplete` set on personal-data inputs (1.3.5); no redundant re-entry (3.3.7).
- [ ] No PHI written to logs/analytics/URL; payload mapped to a Model, not a raw DTO.
- [ ] Keyboard-complete; targets ≥ 44px; RTL-safe layout; `vitest-axe` clean.
- [ ] Submission goes through a mutation hook (TanStack Query) with cache invalidation.

---

## 8. Tables

> Data grids and long lists — performance, sorting, and a11y sensitive.

- [ ] **Long lists virtualized**; no full-DOM render of unbounded data.
- [ ] Four async states: skeleton rows (no shift), empty (illustration + one action), error + retry, success.
- [ ] Real `<table>` semantics or correct grid ARIA; header cells associated with data cells.
- [ ] **Sortable headers accessible** — `aria-sort`, keyboard-activatable, announced state change.
- [ ] **Pagination via URL state** (shareable/restorable); page size sane and bounded.
- [ ] Column headers and cell-rendered labels from i18n; numbers/dates/currency via `Intl`.
- [ ] Row actions reachable by keyboard; targets ≥ 44px; focus order follows visual order.
- [ ] Status cells never color-only — icon/text/shape too; RTL mirrors column order.
- [ ] No PHI in URL when filters/search are URL-synced; minimum-necessary columns shown.
- [ ] No layout shift on sort/filter/page transitions; `vitest-axe`/axe clean.

---

## 9. Modules

> A domain module / clean-architecture slice (Presentation / Application / Domain / Infrastructure rings).

- [ ] Ring boundaries respected — Presentation → Application → Domain; Infrastructure injected, not imported inward.
- [ ] Public API via `index.ts` only; minimal, intentional export surface; no deep imports.
- [ ] No `feature→feature` import; cross-module composition happens in `processes`/`pages`.
- [ ] Domain layer is framework-agnostic (no React/HTTP/`Intl` leakage into Domain).
- [ ] `shared/` stays domain-free; the module owns its domain knowledge.
- [ ] Data pipeline complete: DTO → Zod → mapper → Model → repository → service → query-hook.
- [ ] Module owns its i18n namespace; all strings keyed; SME review recorded for clinical terms.
- [ ] No PHI leakage across tenant/clinic scope; active-clinic scoping enforced.
- [ ] Slice README updated (what it owns, public API, gotchas); ADR added if architectural.
- [ ] Unit tests for mappers/services/hooks; module composes cleanly with no circular deps.

---

## 10. APIs

> The data-access slice: DTO → Model pipeline and query hooks. The backend-independence boundary.

- [ ] **DTO** type defined for the raw backend shape (`api/dto`); never used in UI.
- [ ] **Zod schema** validates the DTO **at the boundary** (parse, don't trust the backend).
- [ ] **Mapper** (`toModel`/`toDto`) is the only place knowing both shapes; pure functions.
- [ ] **Repository** returns Models (never DTOs); depends on the `HttpClient` interface.
- [ ] **Service/use-case** holds business rules; framework-agnostic.
- [ ] **Query hooks** are the only component-facing entry; no `HttpClient`/`fetch`/DTO in UI.
- [ ] **Query keys** structured and documented; **cache invalidation** handled on mutations.
- [ ] Errors mapped to typed `AppError` at the boundary; localized messages downstream.
- [ ] **MSW** handlers added/updated so the slice works backend-independently in dev + tests.
- [ ] No PHI in logs/analytics/URL; no server data persisted into Zustand.
- [ ] Unit tests for mapper + schema (valid, invalid, edge payloads).

---

## 11. Routes

> Route definitions and route-level wiring in the data router.

- [ ] Route component is **lazy-loaded** (code-split into its own chunk).
- [ ] **Permission-gated** where privileged; gate backed by server-side authorization.
- [ ] **Localized title**/metadata set per route from i18n keys.
- [ ] **Error boundary** + **loading/Suspense boundary** wrap the route; four-state fallbacks.
- [ ] No PHI in path or query params; shareable state uses safe (non-PHI) URL params.
- [ ] Route params validated/typed; no untyped param access.
- [ ] Redirects/guards handle unauthenticated/unauthorized without leaking protected data.
- [ ] Deep-link + back/forward restore state correctly (URL is the source for shareable state).
- [ ] Within bundle budget; route chunk does not bloat the initial load.
- [ ] E2E covers entry to this route on the critical journey it belongs to.

---

## 12. Documentation

> Docs/ADRs/READMEs changed or required by this PR.

- [ ] Relevant docs updated **in the same PR** — no doc debt.
- [ ] Slice/module README reflects current ownership, public API, and gotchas.
- [ ] ADR added for architectural changes — Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations.
- [ ] JSDoc/comments updated for non-obvious logic and public APIs.
- [ ] Cross-links use relative paths and resolve; no dangling references.
- [ ] House style followed (numbered sections, ✅/❌ examples, Why/Benefits/Tradeoffs for rules).
- [ ] Examples compile/are accurate; no placeholders, TODOs, or stale snippets.
- [ ] Footer/status line and ownership metadata present and current.
- [ ] Canon references point to the source of truth (Project-Checklist / Brain / Bible) and **extend**, never contradict.
- [ ] No PHI or secrets in examples or fixtures.

---

_Phase 9 · Engineering Quality Platform · Part 10 · Status: **Foundation v9** · 2026-06-30_

Related: [README.md](./README.md) · [EngineeringStandards.md](./EngineeringStandards.md) · [QualityGates.md](./QualityGates.md) · [LintRules.md](./LintRules.md) · [DefinitionOfDone.md](./DefinitionOfDone.md) · [QualityRegistry.md](./QualityRegistry.md) · [AccessibilityValidation.md](./AccessibilityValidation.md) · [LocalizationValidation.md](./LocalizationValidation.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) · [Project-Checklist.md](../Project-Checklist.md) · [Frontend-Bible.md](../Frontend-Bible.md) · [AI_RULES.md](../architecture/AI_RULES.md)
