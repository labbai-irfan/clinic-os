# ADR-0001 — Organize the frontend by Domain Modules (Modular FSD)

- **Status:** Accepted
- **Date:** 2026-06-27
- **Phase:** Phase 2 (Enterprise Architecture · Foundation v2)
- **Deciders:** Frontend Architecture
- **Supersedes:** —
- **Superseded by:** —
- **Related:** [architecture/README.md](../architecture/README.md) · [Architecture.md](../architecture/Architecture.md) · [FolderStructure.md](../architecture/FolderStructure.md) · [DependencyRules.md](../architecture/DependencyRules.md) · [Brain.md](../Brain.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)

---

## Context

Phase 1 ratified the architectural **laws** — Feature-Sliced Design + Domain-Driven Design + Clean Architecture, the downward-only **Dependency Rule**, the backend-independence pipeline (`HTTP → DTO → mapper → Model → Repository → Service → Query → UI`), 3-tier design tokens, WCAG 2.2 AA, and i18next localization. Phase 1 physically organized slices as **flat top-level FSD layers**: `pages/ widgets/ features/ entities/`.

Phase 2 must support enterprise scale: **thousands of clinics, millions of patients, hundreds of developers, multiple frontend and backend teams, Web/Tablet/future Mobile, for 10+ years**. At that scale, a flat layer layout makes **team ownership and bounded-context boundaries blurry**, increases merge contention, and weakens domain cohesion.

## Decision

Organize feature/widget/page/local-entity slices **by bounded context** inside `src/modules/<context>/`. Each module is an internally-layered **Clean Architecture** package that follows one **identical folder template** (Presentation → Application → Domain ← Infrastructure). Cross-module access flows **only** through each module's public `index.ts`; multi-module journeys are orchestrated in `processes/`. Globally-shared domain lives in top-level `entities/`; non-domain reuse lives in `shared/`.

The top-level dependency order becomes:

```
app → processes → modules → entities → shared
```

All Phase 1 laws are **preserved unchanged** — the Dependency Rule, the decoupling pipeline, tokens, accessibility, and localization now apply _within and across modules_.

## Consequences

**Positive**

- Clear team ownership: one module ≈ one team via `CODEOWNERS`.
- Domain cohesion; smaller blast radius per change; parallel work without collisions.
- Module-local onboarding; lazy-loadable, independently releasable boundaries.

**Negative / costs**

- Cross-module shared entities need a deliberate home (`entities/`) and discipline.
- Risk of duplication across modules — mitigated by `shared/` + the reuse-first "rule of three".
- One physical reorganization from Phase 1's flat layers (laws unchanged).

---

## Decision Contract

| Field                         | Summary                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Why**                       | Flat FSD layers don't give clear ownership or domain boundaries at hundreds-of-devs scale.                                                                                     |
| **Benefits**                  | Team ownership, cohesion, contained blast radius, lazy/independent boundaries, micro-frontend readiness.                                                                       |
| **Trade-offs**                | Shared-entity placement discipline; duplication risk; one-time reorg vs Phase 1's flat layout.                                                                                 |
| **Alternatives considered**   | (a) Keep flat FSD layers — blurry ownership. (b) Micro-frontends now — premature ops cost. (c) Nx libs — heavier tooling than needed today (kept as future option).            |
| **Future scalability**        | A module can be extracted to its own package/repo or a Module Federation remote with **zero import changes**, because all cross-module access already goes through `index.ts`. |
| **Enterprise considerations** | Maps cleanly to team topologies, `CODEOWNERS`, independent cadences, and audit/ownership requirements of a healthcare SaaS.                                                    |

---

_This ADR is registered in [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) → Architectural Decisions. Changes to this decision require a superseding ADR._
