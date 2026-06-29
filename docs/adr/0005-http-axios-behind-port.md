# ADR-0005 — Axios as HTTP transport behind a shared `HttpClient` port (and runtime deps behind wrappers)

- **Status:** Accepted
- **Date:** 2026-06-27
- **Phase:** Phase 3 (Engineering Foundation)
- **Deciders:** Frontend Architecture
- **Supersedes:** —
- **Superseded by:** —
- **Related:** [architecture/DeveloperGuide.md](../architecture/DeveloperGuide.md) · [architecture/EnvironmentGuide.md](../architecture/EnvironmentGuide.md) · [architecture/DependencyRules.md](../architecture/DependencyRules.md) · [Brain.md](../Brain.md) · [adr/0001-domain-module-architecture.md](./0001-domain-module-architecture.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)

---

## Context

Phase 1 ratified the **backend-independence pipeline** (`HTTP → DTO → mapper → Model → Repository → Service → Query → UI`) and the rule that the UI never sees the network. Phase 3 must now stand up the **real transport** and the **runtime library kernel** without leaking any vendor API into feature code.

Two related risks at a 10-year horizon: (1) a concrete HTTP library (its config, interceptors, error shapes) bleeding into repositories across hundreds of modules; and (2) third-party UI/utility libraries being imported directly everywhere, making a future swap a thousand-file change. Both violate the spirit of ADR-0001 (access through stable public surfaces) and the Dependency Rule (`shared/*` owns cross-cutting concerns).

## Decision

**Adopt Axios as the HTTP transport, but only behind a `shared/api` `HttpClient` port.** Define an `HttpClient` interface (`get/post/put/patch/delete`) in `src/shared/api/http-client.ts`; provide `AxiosHttpClient` as the single implementation; export a `httpClient` singleton. Axios's request interceptor injects base URL + timeout (from validated `env`), a request-id, and tenant/auth header **hooks** (placeholders until Phase 4 auth); the response interceptor maps failures to typed `AppError`s (`shared/errors`) and logs via `shared/logger`. **No module imports `axios` directly** — repositories depend on the `HttpClient` port.

**Ratify the Phase 3 runtime dependencies, each consumed through a wrapper/port — never imported raw in feature code:**

| Dependency                                              | Wrapper / port (where it's consumed)                                                   | Why behind a wrapper                                                                                                                                                            |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `axios`                                                 | `shared/api` `HttpClient` (`AxiosHttpClient`)                                          | Isolate transport; centralize interceptors, error mapping, auth/tenant hooks.                                                                                                   |
| `framer-motion`                                         | `shared/` motion primitives (respect `prefers-reduced-motion`)                         | Enforce reduced-motion a11y; allow swapping the animation engine.                                                                                                               |
| **`react-helmet-async`** _(substitutes `react-helmet`)_ | `HelmetProvider` at the provider root + a document-head helper                         | `react-helmet` is **unmaintained and not concurrent-safe** under React 18; `react-helmet-async` is the maintained, Suspense/concurrent-safe successor with the same ergonomics. |
| `react-hot-toast`                                       | `shared/notifications` `NotificationPort` (`<Toaster/>` configured with tokens + a11y) | Notifications go through a port (i18n keys, reduced-motion, tokens); the toast vendor stays swappable.                                                                          |
| `react-dropzone`                                        | a shared upload primitive                                                              | Keep file-input ergonomics/a11y consistent; isolate the vendor.                                                                                                                 |
| `dayjs`                                                 | a shared date/time utility                                                             | One date library, one config (locale/tz); no scattered direct imports.                                                                                                          |
| `react-error-boundary`                                  | `shared/errors` `RootErrorBoundary` + `ErrorFallback`                                  | Standardize the typed-`AppError` → localized four-state fallback with reset + logging.                                                                                          |

Every wrapper lives in `shared/*`, obeys the Dependency Rule, and exposes a stable public API via its `index.ts`.

## Consequences

**Positive**

- Repositories depend on an interface, not Axios — the transport can be replaced (fetch, a different client, an offline outbox) by changing **one file**.
- Cross-cutting concerns (base URL, timeout, request-id, auth/tenant headers, error mapping, logging) are configured **once**, consistently, for every request.
- Each runtime library has exactly **one** integration point, so a future swap or upgrade is contained — directly honoring ADR-0001's "access through a public surface."
- The `react-helmet → react-helmet-async` substitution removes a known React-18 concurrency hazard up front.

**Negative / costs**

- A thin layer of indirection (port + wrapper) over each library — a small, deliberate cost paid once.
- Discipline required: a lint **boundaries** rule must keep raw `axios`/vendor imports out of modules (enforced in [ADR-0007](./0007-tooling-pnpm-eslint-flat-husky.md)).

---

## Decision Contract

| Field                         | Summary                                                                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**                       | A concrete HTTP client and third-party libraries must not leak into feature code, or a future swap becomes a thousand-file change and cross-cutting config drifts.                                                                                                                          |
| **Benefits**                  | Single transport integration point; centralized interceptors/error-mapping/logging/auth hooks; every runtime dep swappable behind one wrapper; React-18-safe head management.                                                                                                               |
| **Trade-offs**                | One layer of indirection per library; requires lint-enforced discipline to prevent raw vendor imports.                                                                                                                                                                                      |
| **Alternatives considered**   | (a) Native `fetch` directly — no interceptors/instance config, more boilerplate per call. (b) Import libraries raw everywhere — fast now, unswappable later, config drift. (c) `react-helmet` (unmaintained) — rejected for React-18 concurrency unsafety in favor of `react-helmet-async`. |
| **Future scalability**        | Swap Axios for another transport, add an offline outbox, retry/circuit-breaker, or per-tenant routing — all behind the `HttpClient` port with zero repository edits; any library upgrade/replacement is contained to its wrapper.                                                           |
| **Enterprise considerations** | Centralized request-id, tenant/auth header injection, PHI-safe error mapping and logging, and a swappable transport meet the auditability, multi-tenancy, and longevity needs of a healthcare SaaS.                                                                                         |

---

_This ADR is registered in [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) → Architectural Decisions. Changes to this decision require a superseding ADR._
