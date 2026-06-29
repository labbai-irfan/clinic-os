# ClinicOS

> **ClinicOS** is a Clinic Operating System that digitizes the entire lifetime patient journey — architected to last **10+ years without a rewrite**.

This is the **root entry point** for the repository. For the governing architecture canon, start at **[docs/Brain.md](./docs/Brain.md)** (the single source of truth) and the **[docs index](./docs/README.md)**.

> **Status:** Phase 3 — Engineering Foundation. The scaffold, toolchain, and shared runtime kernel are now live. There are **no business features yet** — this phase ships the foundation only.

---

## Quickstart

```bash
pnpm install        # install dependencies (uses pnpm-lock.yaml)
cp .env.example .env.local   # create your local env (see Environment, below)
pnpm dev            # start the Vite dev server (http://localhost:5173)
pnpm build          # type-check + production build
pnpm test           # run the unit/integration test suite
```

> **Requirements:** Node **>= 20** and **pnpm 9** (`packageManager: pnpm@9.12.0`). Enable pnpm once per machine with `corepack enable`. We use **pnpm only** — never `npm install` (it creates a conflicting `package-lock.json`).

---

## Scripts

The full script registry from `package.json`:

| Script                 | What it does                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm dev`             | Start the Vite dev server with HMR.                                                          |
| `pnpm build`           | Type-check (`tsc -b`) then produce a production bundle.                                      |
| `pnpm build:dev`       | Type-check then build in **development** mode (source-mapped, unminified-friendly).          |
| `pnpm preview`         | Serve the built `dist/` bundle locally to sanity-check the prod build.                       |
| `pnpm typecheck`       | Strict TypeScript check across project references (`tsc -b --noEmit`).                       |
| `pnpm lint`            | ESLint (flat config: boundaries, a11y, i18n, hooks, imports) with **zero** warnings allowed. |
| `pnpm lint:fix`        | ESLint with `--fix` to auto-resolve fixable issues.                                          |
| `pnpm format`          | Prettier `--write .` to format the whole tree.                                               |
| `pnpm format:check`    | Prettier `--check .` — fails if anything is unformatted (CI gate).                           |
| `pnpm test`            | Vitest, single run (watch off).                                                              |
| `pnpm test:watch`      | Vitest in watch mode for local TDD.                                                          |
| `pnpm coverage`        | Vitest with V8 coverage report.                                                              |
| `pnpm e2e`             | Playwright end-to-end tests.                                                                 |
| `pnpm storybook`       | Prints a deferral notice — Storybook is configured in **Phase 4** (design-system).           |
| `pnpm build-storybook` | Prints a deferral notice — Storybook ships in **Phase 4**.                                   |
| `pnpm analyze`         | Production build in `analyze` mode; the visualizer writes `dist/stats.html`.                 |
| `pnpm clean`           | Remove `dist`, `node_modules/.vite`, `coverage`, `.turbo`.                                   |
| `pnpm generate`        | Run Plop generators (scaffold a module / component from templates).                          |
| `pnpm verify`          | The local "all-green" gate: `typecheck` → `lint` → `format:check` → `test`.                  |
| `pnpm prepare`         | Husky setup (runs automatically after install).                                              |

> Run **`pnpm verify`** before pushing — it mirrors the core CI gates.

---

## Environment

ClinicOS uses Vite's env convention. Variables are **Zod-validated and fail-fast** at startup via [`src/shared/config/env.ts`](./src/shared/config/env.ts).

```bash
cp .env.example .env.local   # then edit your local overrides (gitignored)
```

> 🔒 **Every `VITE_*` variable is bundled into the public client.** Never put a secret in a `VITE_*` var. Full strategy, the schema table, precedence order, and the "add a new var" recipe are in **[docs/architecture/EnvironmentGuide.md](./docs/architecture/EnvironmentGuide.md)**.

---

## Repository map (top level)

```
.
├── src/                  # Application source
│   ├── app/              # Composition root: providers, router, bootstrap, global error boundary
│   ├── processes/        # Cross-module journeys (e.g. the Patient Journey)
│   ├── modules/          # Domain bounded contexts (the work happens here)
│   ├── entities/         # Global domain entities shared across modules
│   ├── shared/           # Non-domain, cross-cutting reuse (api, config, errors, logger, theme…)
│   ├── assets/           # fonts / icons / images / animations
│   ├── locales/          # i18n catalogs: en / hi / mr / ur
│   ├── mock/             # MSW handlers + mock server
│   ├── testing/          # Test utilities, render helpers, a11y setup
│   └── vite-env.d.ts     # Typed import.meta.env (mirrors the env schema)
├── docs/                 # The governing canon (architecture, ADRs, brain)
│   ├── architecture/     # Phase 2/3 architecture docs + DeveloperGuide + EnvironmentGuide
│   ├── adr/              # Architecture Decision Records
│   └── brain/            # PROJECT_BRAIN.md — permanent project memory + registries
├── .env.example          # Documented, non-secret env template (source of truth for vars)
├── package.json          # Scripts, dependencies, engines, packageManager
├── vite.config.ts        # Vite build/dev config + manualChunks vendor split
├── eslint.config.js      # ESLint flat config (boundaries + a11y + i18n + imports)
└── tsconfig*.json        # Strict TS project references + path aliases
```

---

## Where to read next

| Go to                                                                                | For                                                                                                  |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **[docs/Brain.md](./docs/Brain.md)**                                                 | The single source of truth — the 8 laws, the stack, the architecture in one picture. **Read first.** |
| **[docs/architecture/README.md](./docs/architecture/README.md)**                     | The Phase 2 architecture anchor — domain modules, the module template, authoritative trees.          |
| **[docs/architecture/DeveloperGuide.md](./docs/architecture/DeveloperGuide.md)**     | Onboarding + build-a-feature end-to-end (see the **Phase 3** section for what's now live).           |
| **[docs/architecture/EnvironmentGuide.md](./docs/architecture/EnvironmentGuide.md)** | Env strategy, the validated schema, security rules, and the add-a-var recipe.                        |
| **[docs/adr/](./docs/adr/)**                                                         | Architecture Decision Records — _why_ each foundational decision was made.                           |
| **[docs/README.md](./docs/README.md)**                                               | The full canon index and reading paths.                                                              |

---

## Tech stack

**Runtime:** React 18 · TypeScript (strict) · Vite 5 · React Router 6 · TanStack Query 5 · Zustand 5 · React Hook Form · Zod · Tailwind CSS (token-mapped) · i18next · Axios · Framer Motion · react-error-boundary · react-hot-toast · dayjs

**Tooling:** pnpm 9 · ESLint 9 (flat config) · Prettier · Husky + lint-staged · Commitlint (Conventional Commits) · Vitest + Testing Library · Playwright · MSW · Plop

---

_ClinicOS · Foundation v3 (Phase 3 — Engineering Foundation) · 2026-06-27 · License: Proprietary · Owner: Frontend Architecture._
