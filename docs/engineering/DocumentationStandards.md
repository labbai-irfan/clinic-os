# ClinicOS — Documentation Standards

> This document defines the **minimum documentation every feature and module must ship** in ClinicOS, and the templates to produce it. It **extends** [docs/Documentation-Guidelines.md](../Documentation-Guidelines.md) — the Phase-1 origin — and never contradicts the canon ([../brain/PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)). Documentation is part of the work, not an afterthought: a feature is **Done** ([DefinitionOfDone.md](./DefinitionOfDone.md)) only when its docs and brain updates land in the **same PR**.

Code answers _how_; documentation answers _why_ and _how to consume_. ClinicOS treats docs as a first-class, reviewed artifact because the frontend is backend-independent (Law 7) and feature-isolated — a module is only safely reusable if its public API, decisions, and debt are written down where the next engineer (or AI agent) will find them.

---

## 1. What every module must include

| Artifact                   | Lives at                                               | Mandatory?                            | Reviewed against                                              |
| -------------------------- | ------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------- |
| README                     | `modules/<name>/README.md`                             | ✅                                    | this doc §2                                                   |
| Architecture Notes (BRAIN) | `modules/<name>/BRAIN.md`                              | ✅                                    | this doc §3                                                   |
| Usage                      | in README                                              | ✅                                    | §4                                                            |
| Future Extension           | in README/BRAIN                                        | ✅                                    | §5                                                            |
| API Documentation          | in README + API Registry                               | ✅ if it has infra                    | §6                                                            |
| Testing Guide              | in README/BRAIN                                        | ✅                                    | §7                                                            |
| Brain Update               | [../brain/PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) | ✅ same PR                            | [../architecture/AI_RULES.md](../architecture/AI_RULES.md) §4 |
| JSDoc                      | in code                                                | ✅ for public API / non-obvious logic | §9                                                            |
| ADR                        | `docs/adr/`                                            | ✅ if structural                      | §10                                                           |

---

## 2. README — the module front door

- **Contents:** one-line overview · owners · public API (what the `index.ts` exports) · dependencies (which other modules/entities/shared) · usage snippet · testing notes · links to BRAIN and the API Registry.
- **Why:** the README is the contract a consumer reads before importing. It mirrors the barrel — if it isn't in the README it isn't public.
- **Benefits:** consumers integrate without reading internals (Law 8); ownership is unambiguous.
- **Tradeoffs:** must be kept in sync with `index.ts` — reviewers check this in the same PR.
- **Example:** a `scheduling` README listing `useSlots`, `<SlotPicker/>`, and `bookAppointment` as its entire surface.

### Module README skeleton

```markdown
# Module: <name>

> One-sentence purpose. What screen/journey it serves (Law 1: one primary task).

- **Owners:** @owner-a, @owner-b
- **Status:** Foundation v9
- **Layer:** modules/<name> (Clean Architecture rings inside)

## Public API

Everything below is exported from `modules/<name>/index.ts`. Nothing else is public.

| Export         | Kind      | Summary |
| -------------- | --------- | ------- |
| `<Component/>` | component | ...     |
| `useThing`     | hook      | ...     |
| `thingService` | service   | ...     |

## Dependencies

- entities: `entities/<x>`
- shared: `shared/design-system`, `shared/lib/<y>`
- modules: `modules/<z>` (via its index only)

## Usage

\`\`\`tsx
import { SlotPicker, useSlots } from 'modules/scheduling';
// ...
\`\`\`

## API

See [API section](#api-documentation) and the API Registry in PROJECT_BRAIN.

## Testing

See BRAIN.md → Testing. Run `pnpm test --filter <name>`.

## Future Extension

Extension points and known scaling paths.

## Links

- [BRAIN.md](./BRAIN.md)
- [PROJECT_BRAIN API Registry](../../docs/brain/PROJECT_BRAIN.md)
```

---

## 3. Architecture Notes — the module `BRAIN.md`

- **Contents:** local decisions, local registries (component/query-key/event), open TODOs, known **debt** with owner and cost.
- **Why:** decisions evaporate from memory; the BRAIN is the module's institutional memory and feeds the global [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md).
- **Benefits:** new contributors and AI agents understand _why_ before changing things; debt is visible, not buried.
- **Tradeoffs:** another file to maintain — accepted because undocumented decisions cost far more later.
- **Example:** "Chose optimistic update for booking; rollback on 409. Debt: no retry backoff yet — @owner, low."

### Module BRAIN.md skeleton

```markdown
# BRAIN — modules/<name>

## Decisions

- [2026-06-30] <decision> — Why · Trade-off · Alternative considered.

## Local Registries

### Components

| Name | Purpose | A11y notes |
| ---- | ------- | ---------- |

### Query Keys

| Key | Shape | Invalidated by |
| --- | ----- | -------------- |

### Events / Store slices

| Name | Owner | Notes |
| ---- | ----- | ----- |

## TODO

- [ ] <task> (@owner)

## Debt

| Item | Impact | Cost | Owner |
| ---- | ------ | ---- | ----- |

## Brain sync

Mirrored to PROJECT_BRAIN: API Registry rows, design-system additions, ADR refs.
```

---

## 4. Usage

- **Contents:** a runnable snippet showing how to consume the public API from another layer — imports, props/args, the happy path.
- **Why:** examples are the fastest, least-ambiguous spec.
- **Benefits:** copy-paste onboarding; the snippet doubles as a smoke test.
- **Tradeoffs:** snippets rot — keep them minimal and import-only from the barrel so the type checker catches drift.
- **Example:**

  ```tsx
  import { SlotPicker, useSlots } from 'modules/scheduling';
  const { data } = useSlots({ clinicId, date });
  return <SlotPicker slots={data} onPick={bookAppointment} />;
  ```

---

## 5. Future Extension

- **Contents:** documented extension points (props, strategy hooks, registry slots) and how the module scales (more locales, more clinics, larger lists).
- **Why:** anticipating growth prevents the next change from being a rewrite (Law 8).
- **Benefits:** safe extension without touching internals.
- **Tradeoffs:** premature flexibility is a smell — document _intended_ seams only, do not build speculative abstraction.
- **Example:** "New appointment types are added via the `slotStrategy` registry — no UI change required."

---

## 6. API Documentation

- **Contents — per endpoint:** HTTP **method**, **path**, request/response **DTO**, **Zod schema**, **repository** method, **service** method, **query hook**, and **query key**. Cross-linked to the **API Registry** in [../brain/PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md).
- **Why:** UI never talks to backend directly (Law 6) — every call flows UI → service → repository → mapper → api. Documenting the whole chain makes the indirection navigable and prevents duplicate query keys.
- **Benefits:** one place to see the full data path; cache invalidation is predictable via documented keys.
- **Tradeoffs:** verbose — but the chain exists regardless; writing it down costs little.
- **Example:**

  | Field         | Value                                     |
  | ------------- | ----------------------------------------- |
  | Method · Path | `GET /clinics/:id/slots`                  |
  | DTO           | `SlotDTO` → `Slot` (via `slot.mapper.ts`) |
  | Schema        | `slotSchema` (Zod)                        |
  | Repository    | `slotRepository.list(params)`             |
  | Service       | `slotService.getSlots(params)`            |
  | Query hook    | `useSlots(params)`                        |
  | Query key     | `['scheduling','slots',clinicId,date]`    |

---

## 7. Testing Guide

- **Contents — what to test at each layer:**

  | Layer           | Test focus                                  | Tooling          |
  | --------------- | ------------------------------------------- | ---------------- |
  | Mapper          | pure DTO ↔ domain, no I/O                   | Vitest           |
  | Repository      | request/response shape via mocked transport | Vitest + **MSW** |
  | Service         | orchestration, error/rollback logic         | Vitest           |
  | Hooks           | state, caching, query-key behavior          | Vitest + RTL     |
  | Components      | render, interaction, **a11y** (WCAG 2.2 AA) | RTL + axe        |
  | Patient journey | the critical end-to-end flow                | **Playwright**   |

- **Why:** each layer has a distinct failure mode; testing at the right altitude keeps tests fast and meaningful.
- **Benefits:** confidence with minimal flakiness; mappers/services run with no network.
- **Tradeoffs:** layered tests are more files — but cheaper than debugging an untested integration.
- **Example:** mapper test asserts `mapSlot(dto).startsAt` is a `Date`; e2e asserts a patient can book a slot end-to-end.

---

## 8. Brain Update — mandatory, same PR

- **Rule:** any change that adds an endpoint, query key, design-system component, store slice, or decision **must** update the relevant registries in [../brain/PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) **in the same PR** — **never later**, per [../architecture/AI_RULES.md](../architecture/AI_RULES.md) §4.
- **Why:** the brain is the single source of truth for the whole frontend; a stale brain is worse than none because it misleads.
- **Benefits:** the global picture is always current for humans and AI agents.
- **Tradeoffs:** slightly larger PRs — accepted; the alternative is permanent drift.
- **Example:** ❌ "I'll update the brain next sprint." ✅ brain rows added in the same commit set, reviewed together.

---

## 9. JSDoc / code-comment standards

- **Rule:** every **public API** export carries a JSDoc block (purpose, params, returns, throws); **non-obvious logic** gets a comment explaining _why_, not _what_. No comments that merely restate the code.
- **Why:** types say _what_; comments must add the _why_ the type can't express (Law 8 — clarity).
- **Benefits:** editor hovers document the barrel; tricky decisions survive refactors.
- **Tradeoffs:** comments can rot — so comment intent/constraints, not mechanics.
- **Example:**

  ```ts
  /**
   * Books a slot optimistically; rolls back the cache on 409 (slot taken).
   * @throws SlotConflictError when the slot was claimed concurrently.
   */
  export function bookAppointment(input: BookInput): Promise<Booking> {
    /* ... */
  }
  ```

  ❌ `// increment i` ✅ `// 409 means another clinician booked it first — re-fetch slots`

---

## 10. ADR requirement — structural changes

- **Rule:** any **structural** change (new layer convention, dependency-direction exception, budget loosening, cross-module contract, swapping a core lib) requires an **ADR** in `docs/adr/` covering: **Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations** (multi-tenant, locale, a11y, compliance).
- **Why:** structural decisions outlive their authors; an ADR is the durable, reviewable record.
- **Benefits:** future engineers see the reasoning and constraints, not just the outcome.
- **Tradeoffs:** writing an ADR is friction — intentional, proportional to the blast radius.
- **Example:** loosening a [performance budget](./PerformanceBudgets.md) for a fifth locale's font ships with an ADR and a [QualityRegistry.md](./QualityRegistry.md) entry.

### ADR skeleton

```markdown
# ADR-NNN: <title>

- Status: Proposed | Accepted | Superseded
- Date: 2026-06-30

## Context

## Decision

## Why · Benefits · Trade-offs · Alternatives

## Future scalability

## Enterprise considerations (tenancy, locale, a11y/WCAG 2.2 AA, compliance)
```

---

## 11. Definition of "documented" (gate)

A PR is documentation-complete when: README + BRAIN exist/updated · public API matches `index.ts` · API rows in PROJECT_BRAIN · testing notes present · JSDoc on public surface · ADR if structural. This is enforced in review and tracked against [DefinitionOfDone.md](./DefinitionOfDone.md) and [QualityGates.md](./QualityGates.md).

See also: [README.md](./README.md) · [EngineeringStandards.md](./EngineeringStandards.md) · [QualityGates.md](./QualityGates.md) · [LintRules.md](./LintRules.md) · [AIQualityRules.md](./AIQualityRules.md) · [QualityRegistry.md](./QualityRegistry.md) · [ArchitectureValidation.md](./ArchitectureValidation.md) · [PerformanceBudgets.md](./PerformanceBudgets.md) · [../architecture/AI_RULES.md](../architecture/AI_RULES.md) · [../architecture/NamingConvention.md](../architecture/NamingConvention.md) · [../Project-Checklist.md](../Project-Checklist.md) · [../Frontend-Bible.md](../Frontend-Bible.md).

---

_Phase 9 · Engineering Quality Platform · Part 8 · Status: **Foundation v9** · 2026-06-30_
_Cross-links: [Documentation-Guidelines.md](../Documentation-Guidelines.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) · [AI_RULES.md](../architecture/AI_RULES.md) · [DefinitionOfDone.md](./DefinitionOfDone.md)_
