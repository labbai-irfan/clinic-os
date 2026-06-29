# 🌱 ClinicOS — Environment Guide (Phase 3)

> **The authoritative guide to environment configuration in ClinicOS.**
> Covers the env files, the Zod-validated schema, load precedence, typing, the **public-bundle security rule**, and the recipe for adding a new variable.
> This is **Phase 3** of the ClinicOS Engineering Bible. It _extends_ and never contradicts [Brain.md](../Brain.md), the [Phase 2 architecture anchor](./README.md), or the [DeveloperGuide](./DeveloperGuide.md).

ClinicOS reads configuration through **one typed, validated accessor** — `src/shared/config/env.ts` — and **never** through scattered `import.meta.env.VITE_FOO` references. Env is parsed once at startup with **Zod**, and the app **fails fast** with a clear message if anything is missing or malformed. This guide tells you how that works and how to extend it safely.

Cross-links: [README.md](../README.md) (root quickstart) · [Project-Checklist.md](../Project-Checklist.md) (Phase 1 — the env-security & DoD rules) · [adr/0006-runtime-env-validation-zod.md](../adr/0006-runtime-env-validation-zod.md) (the decision).

---

## 1. The env files and what each is for

ClinicOS follows Vite's env-file convention. Vite loads files by **mode** (the `--mode` flag; `dev` defaults to `development`, `build` defaults to `production`). All committed files contain **non-secret values only**.

| File                | Committed?             | Loaded in                   | Purpose                                                                                                               |
| ------------------- | ---------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `.env`              | ✅ yes                 | every mode                  | Base, non-secret defaults shared by all modes.                                                                        |
| `.env.example`      | ✅ yes (no values)     | never (template)            | The **documented template** — the source of truth for _which_ variables exist. Update it whenever you add a variable. |
| `.env.development`  | ✅ yes                 | `development` (`pnpm dev`)  | Shared dev defaults (e.g. mocks on, debug logging).                                                                   |
| `.env.production`   | ✅ yes                 | `production` (`pnpm build`) | Shared production defaults — **still no secrets**.                                                                    |
| `.env.test`         | ✅ yes                 | `test` (Vitest/CI)          | Deterministic values for the test runner.                                                                             |
| `.env.local`        | ❌ **no** (gitignored) | every mode except `test`    | **Your personal local overrides.** Not committed. Use it to point at a real backend, tweak log level, etc.            |
| `.env.<mode>.local` | ❌ no (gitignored)     | the matching mode           | Per-mode personal overrides (rarely needed).                                                                          |

> **`.env.local` is intentionally not created by the scaffold.** Copy it yourself: `cp .env.example .env.local`. Because it is gitignored, it is the only safe place for machine-specific values — but it is **still bundled into the client** if the var is `VITE_`-prefixed, so the secret rule below still applies.

---

## 2. The environment schema (validated by Zod)

Every variable is declared, typed, defaulted, and validated in **`src/shared/config/env.ts`**. This table mirrors that schema exactly — it is the single source of truth for the _shape_ of env.

| Variable                | Type                                                  | Default                       | Notes                                                                                                                                                |
| ----------------------- | ----------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_APP_NAME`         | `string`                                              | `"ClinicOS"`                  | Display name of the app.                                                                                                                             |
| `VITE_APP_ENV`          | `enum` `development \| staging \| production \| test` | `"development"`               | Logical deployment environment (distinct from Vite's build mode).                                                                                    |
| `VITE_APP_VERSION`      | `string`                                              | `"0.0.0"`                     | Overridden at build time via Vite `define` (from package version / CI).                                                                              |
| `VITE_API_BASE_URL`     | `url`                                                 | `"http://localhost:4000/api"` | Base URL the `HttpClient` prefixes onto every request.                                                                                               |
| `VITE_API_TIMEOUT_MS`   | `number` (coerced)                                    | `30000`                       | Request timeout in milliseconds, applied by the Axios client.                                                                                        |
| `VITE_ENABLE_MSW`       | `boolean` (coerced `"true"`/`"false"`)                | `true` (dev) / `false` (prod) | Toggles the MSW mock service worker.                                                                                                                 |
| `VITE_DEFAULT_LOCALE`   | `enum` `en \| hi \| mr \| ur`                         | `"en"`                        | Initial i18next locale before language detection.                                                                                                    |
| `VITE_LOG_LEVEL`        | `enum` `debug \| info \| warn \| error`               | `"info"`                      | Minimum level the logger emits (level-gated).                                                                                                        |
| `VITE_ENABLE_ANALYTICS` | `boolean` (coerced)                                   | `false`                       | Feature flag for the analytics adapter.                                                                                                              |
| `VITE_SENTRY_DSN`       | `string` (optional)                                   | —                             | Error-reporting DSN. Left blank locally; injected by CI for prod. **A DSN is not a secret credential, but treat it as environment-specific config.** |

**Coercion note.** Browser env values are always strings. The schema uses `z.coerce.number()` / boolean coercion so `VITE_API_TIMEOUT_MS=30000` and `VITE_ENABLE_MSW=true` parse into a real `number`/`boolean`. After parsing, downstream code consumes correctly-typed values — never raw strings.

---

## 3. Load order & precedence

Vite resolves env files in a fixed precedence (later overrides earlier). For a given `mode`:

```
.env                       (lowest precedence — base defaults)
  ↓ overridden by
.env.local                 (your personal, gitignored overrides — except in 'test' mode)
  ↓ overridden by
.env.<mode>                (.env.development / .env.production / .env.test)
  ↓ overridden by
.env.<mode>.local          (per-mode personal overrides — highest file precedence)
  ↓ overridden by
process / shell env        (e.g. CI-injected VITE_* vars)
```

> Only `VITE_`-prefixed keys are exposed to client code via `import.meta.env`. Anything without the prefix is **build-time only** and never reaches the browser. `mode` is set by the `--mode` flag (`pnpm dev` → `development`, `pnpm build` → `production`, `pnpm build:dev` → `development`, `pnpm analyze` → `analyze`).

---

## 4. Typing — `vite-env.d.ts`

`src/vite-env.d.ts` declares the `ImportMetaEnv` interface so that, even before the Zod parse, TypeScript knows the shape of `import.meta.env`. It mirrors the schema's keys:

```ts
// src/vite-env.d.ts (shape — mirrors src/shared/config/env.ts)
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production' | 'test';
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT_MS: string; // raw string; coerced by the Zod schema
  readonly VITE_ENABLE_MSW: string;
  readonly VITE_DEFAULT_LOCALE: 'en' | 'hi' | 'mr' | 'ur';
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_SENTRY_DSN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

> `vite-env.d.ts` gives **autocomplete and compile-time** typing; `env.ts` gives **runtime** validation and the final, coerced types. You consume the validated `env` object from `@shared/config` — not `import.meta.env` directly.

---

## 5. 🔒 The critical security rule — `VITE_*` is PUBLIC

**Every `VITE_`-prefixed variable is inlined into the client JavaScript bundle at build time. Anyone who loads the app can read it.** This is not a ClinicOS choice — it is how Vite (and every client bundler) works.

**Therefore:**

- ❌ **Never** put a secret in a `VITE_*` variable: no API keys, no DB credentials, no signing secrets, no admin tokens, no service-account JSON. If it would harm us to publish it on a billboard, it does not belong in client env.
- ✅ **Secrets stay server-side.** A secret-bearing call goes through _your backend_, which holds the secret and is never shipped to the browser.
- ✅ **Auth tokens are never read from `VITE_*` env.** Session/auth tokens are delivered via **httpOnly, Secure, SameSite cookies** (not readable by JS) or held in secure runtime storage — see the Phase 1 security rules in [Project-Checklist.md](../Project-Checklist.md) and the auth boundary (built in Phase 4). **No PHI and no credentials in env, logs, URLs, or `localStorage`.**
- ✅ `VITE_SENTRY_DSN` is environment-specific config, not a credential — but still treat it as per-environment and inject it from CI, not from a committed secret.

> **Rule of thumb:** client env answers _"which environment am I, and what are my public knobs?"_ — never _"what secret proves who I am?"_. The second question is always answered server-side.

---

## 6. Fail-fast validation behavior

At startup (before the app mounts — `env.ts` is imported early in `src/app/main.tsx`), the Zod schema parses `import.meta.env`:

- **Valid** → a frozen, fully-typed `env` object is exported and consumed app-wide via `@shared/config`.
- **Invalid** (missing required var, wrong enum value, un-coercible number/boolean, malformed URL) → the parse **throws immediately** with a clear, aggregated message naming each offending key and why. The app does **not** boot with half-configured env.

> Failing fast at boot is deliberate: a misconfigured environment is a _deployment_ bug, and we want it loud and at startup — not a mysterious `undefined` surfacing three screens deep. See [ADR-0006](../adr/0006-runtime-env-validation-zod.md).

```ts
// Consume validated env — never import.meta.env directly.
import { env } from '@shared/config';

httpClient.defaults.baseURL = env.VITE_API_BASE_URL; // typed string (validated URL)
httpClient.defaults.timeout = env.VITE_API_TIMEOUT_MS; // typed number (coerced)
```

---

## 7. Recipe — add a new environment variable

Adding a var is a **four-step, same-PR** change. Skipping any step breaks the build or the contract.

1. **Schema** — add the field to the Zod schema in `src/shared/config/env.ts` (type, default, coercion, and any enum/`url` refinement). This makes it validated and typed everywhere.
2. **Typing** — add the key to `ImportMetaEnv` in `src/vite-env.d.ts` so `import.meta.env` stays correctly typed.
3. **Template** — add the key to `.env.example` with a **documented comment and no secret value** (it is the source of truth for which vars exist). If it needs per-mode defaults, also add it to the relevant `.env.development` / `.env.production` / `.env.test`.
4. **Document** — add a row to the schema table in §2 of this guide (and, if it gates behavior, note it where that behavior is documented).

Then **verify**:

```bash
pnpm typecheck   # vite-env.d.ts + env.ts agree
pnpm build       # fails fast if the schema rejects the configured value
```

> If the new var is a flag, expose it through `src/shared/config/feature-flags.ts` (`isFeatureEnabled(...)`) rather than reading `env` directly in feature code. If it is app metadata, surface it via `src/shared/config/app-config.ts`. Feature code reads **config**, not raw env.

---

## 8. Decision Contract

| Field                         | Summary                                                                                                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**                       | Client env is public and string-typed; unchecked access leaks secrets and fails late with cryptic `undefined`s. A single validated accessor makes env safe, typed, and discoverable.                                          |
| **Benefits**                  | One source of truth; fail-fast at boot with clear errors; correct runtime types (coercion); compile-time autocomplete; an explicit public-vs-secret boundary; an auditable variable inventory in `.env.example`.              |
| **Trade-offs**                | Adding a var touches four places (schema, `vite-env.d.ts`, `.env.example`, this guide); a strict parse means a typo blocks boot (intended).                                                                                   |
| **Alternatives considered**   | (a) Read `import.meta.env.VITE_*` ad-hoc — untyped, unvalidated, secrets sprawl. (b) Runtime `window.__ENV__` injection — heavier ops, no compile-time types. (c) `dotenv` only — no client-bundle public/secret distinction. |
| **Future scalability**        | The schema grows per-feature without changing call sites; staging/preview/multi-tenant envs slot in as enum values or new keys; server-fetched runtime config can be layered behind the same typed accessor.                  |
| **Enterprise considerations** | Healthcare SaaS demands a hard secret boundary (no PHI/credentials client-side), reproducible per-environment config, and an auditable inventory — all enforced here by validation + the `.env.example` contract.             |

---

_Phase 3 · Environment Guide · Companion to [DeveloperGuide.md](./DeveloperGuide.md), [Brain.md](../Brain.md) & [ADR-0006](../adr/0006-runtime-env-validation-zod.md) · Last updated: 2026-06-27 · Owner: Frontend Architecture · Status: **Foundation v3**_
