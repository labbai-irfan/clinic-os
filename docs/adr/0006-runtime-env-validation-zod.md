# ADR-0006 — Fail-fast runtime environment validation with Zod

- **Status:** Accepted
- **Date:** 2026-06-27
- **Phase:** Phase 3 (Engineering Foundation)
- **Deciders:** Frontend Architecture
- **Supersedes:** —
- **Superseded by:** —
- **Related:** [architecture/EnvironmentGuide.md](../architecture/EnvironmentGuide.md) · [architecture/DeveloperGuide.md](../architecture/DeveloperGuide.md) · [Project-Checklist.md](../Project-Checklist.md) · [Brain.md](../Brain.md) · [adr/0001-domain-module-architecture.md](./0001-domain-module-architecture.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)

---

## Context

Vite exposes environment variables to client code as **untyped strings** on `import.meta.env`, and **every `VITE_`-prefixed value is inlined into the public bundle**. Accessed ad-hoc, this produces three recurring failure modes: (1) a missing or mistyped var surfaces as a cryptic `undefined` three screens deep, far from its cause; (2) string values (`"30000"`, `"true"`) are used where a `number`/`boolean` is expected; and (3) the public-vs-secret boundary is invisible, inviting a secret to be placed in client env.

Phase 1 already mandated typed, validated boundaries (Zod at the DTO boundary) and a strict secret/PHI policy. The environment is just another untrusted boundary — it deserves the same treatment.

## Decision

**Parse and validate environment once, at startup, with a Zod schema in `src/shared/config/env.ts`, and fail fast on any violation.** The schema declares every variable with its type, default, coercion, and refinement (enums, `url`, coerced `number`/`boolean`). On success it exports a frozen, fully-typed `env` object consumed app-wide via `@shared/config`; on failure it **throws immediately** with an aggregated message naming each offending key and reason — the app does not boot half-configured.

Rules ratified alongside the decision:

- **Single accessor.** Feature code reads the validated `env` (or `app-config` / `feature-flags` derived from it) — **never** `import.meta.env.VITE_*` directly.
- **Typed both ways.** `src/vite-env.d.ts` types `import.meta.env` at compile time; `env.ts` validates and coerces at runtime.
- **Public boundary.** All `VITE_*` vars are public; **no secrets, credentials, or PHI** in client env (secrets stay server-side; auth via httpOnly cookies/secure storage — see [Project-Checklist.md](../Project-Checklist.md)).
- **Documented inventory.** `.env.example` lists every variable (no values) as the source of truth for which vars exist.

The full file table, schema table, precedence order, and add-a-var recipe live in [EnvironmentGuide.md](../architecture/EnvironmentGuide.md).

## Consequences

**Positive**

- Misconfiguration fails **loudly at boot**, not silently at runtime — env errors become obvious deployment bugs.
- Downstream code receives **correctly-typed** values (real `number`/`boolean`/enums), eliminating string-coercion bugs.
- One source of truth for the env shape; compile-time autocomplete plus runtime guarantees.
- The public/secret boundary is explicit and enforced by convention + review.

**Negative / costs**

- Adding a variable touches four places (schema, `vite-env.d.ts`, `.env.example`, the guide) — deliberate friction that keeps the contract honest.
- A strict parse means a typo or bad value blocks startup (intended, not a regression).

---

## Decision Contract

| Field                         | Summary                                                                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**                       | Client env is public, untyped, and string-valued; ad-hoc access leaks secrets and fails late with cryptic `undefined`s.                                                                                                    |
| **Benefits**                  | Fail-fast clear errors at boot; correct runtime types via coercion; one typed accessor; compile-time autocomplete; explicit public-vs-secret boundary; auditable variable inventory.                                       |
| **Trade-offs**                | A new var touches four places; a strict parse blocks boot on any invalid value (intended).                                                                                                                                 |
| **Alternatives considered**   | (a) Read `import.meta.env.VITE_*` directly — untyped, unvalidated, secret sprawl. (b) Plain TS constants — no runtime validation/coercion. (c) Runtime `window.__ENV__` injection — heavier ops, loses compile-time types. |
| **Future scalability**        | The schema grows per-feature with no call-site churn; staging/preview/multi-tenant envs slot in as enum values or new keys; server-fetched runtime config can layer behind the same accessor.                              |
| **Enterprise considerations** | Healthcare SaaS needs a hard secret/PHI boundary (nothing sensitive client-side), reproducible per-environment config, and an auditable variable inventory — all enforced here.                                            |

---

_This ADR is registered in [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) → Architectural Decisions. Changes to this decision require a superseding ADR._
