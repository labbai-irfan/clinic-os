# 🧑‍🚀 ClinicOS — Developer Guide (Phase 2)

> **Onboarding + daily-workflow guide for the ClinicOS frontend.**
> This is the document that gets you from `git clone` to a merged PR with confidence.
> It is **Phase 2** of the ClinicOS Frontend Engineering Bible — it _extends_ and **never contradicts** [Phase 1 (Brain.md)](../Brain.md) or the [Phase 2 architecture anchor](./README.md).

Welcome. 👋 You're about to work on a **Clinic Operating System** — the digital nervous system of a clinic, architected to live **10+ years without a rewrite** and to be used by a 65-year-old who can use WhatsApp, in their own language. That ambition shapes every rule below. None of it is bureaucracy; all of it protects that horizon. Read this once end-to-end, then keep it open in a tab for your first two weeks.

---

## 1. Purpose & your Day-1 reading path

**Purpose of this guide:** make you productive _fast_ without breaking the architecture. It tells you how to set up, where things live, how to build a feature end-to-end, and how to ship a PR that passes on the first try.

ClinicOS is governed by a **canon** of documents. You do not need to read all of it on day one — read it in this order:

### 📚 Day-1 reading path (in order, ~2–3 hours)

| #   | Read                                                       | Why                                                                                                     | Time |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---- |
| 1   | **[Brain.md](../Brain.md)** (Phase 1)                      | The single source of truth. The 8 non-negotiable laws, the stack, the architecture in one picture.      | 30m  |
| 2   | **[architecture/README.md](./README.md)** (Phase 2 anchor) | How the foundation scales to many teams: `src/modules/<context>/`, the module template, the module set. | 20m  |
| 3   | **This file (DeveloperGuide.md)**                          | Setup + the build-a-feature tutorial.                                                                   | 45m  |
| 4   | **[FolderStructure.md](./FolderStructure.md)**             | Every folder's Purpose · Responsibilities · Rules · Allowed/Forbidden deps.                             | 20m  |
| 5   | **[FeatureArchitecture.md](./FeatureArchitecture.md)**     | The module template + each folder's job + a worked example.                                             | 20m  |
| 6   | **[DependencyRules.md](./DependencyRules.md)**             | The import matrix, layer boundaries, anti-God rules.                                                    | 15m  |
| 7   | **[Coding-Standards.md](../Coding-Standards.md)** (skim)   | The shape of good code: ✅good/❌bad pairs. Your tie-breaker in review.                                 | skim |
| 8   | **[Project-Checklist.md](../Project-Checklist.md)** (skim) | The Definition of Done. Copy §3 into your first PR.                                                     | skim |

> **Bookmark these too:** [BrainRules.md](./BrainRules.md) (how to keep the project memory honest), [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) (the live registries you update), [AI_RULES.md](./AI_RULES.md) (if you pair with AI agents), [NamingConvention.md](./NamingConvention.md), [Frontend-Bible.md](../Frontend-Bible.md) (design system).

**The golden loop (memorize this):**

> Read Brain → Find the right module/layer → Use the **public API** (`index.ts`) → Consume **tokens & i18n keys** → Never break the **Dependency Rule** → Update the docs/registries.

---

## 2. Prerequisites & local setup

### 2.1 Prerequisites

| Tool        | Version                                     | How to get it                                                                                                        |
| ----------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Node.js** | Pinned in `.nvmrc` (LTS 20.x)               | `nvm install` then `nvm use` (reads `.nvmrc`).                                                                       |
| **pnpm**    | Pinned in `package.json` → `packageManager` | `corepack enable && corepack prepare pnpm@<version> --activate`.                                                     |
| **Git**     | Any recent                                  | —                                                                                                                    |
| Editor      | **VS Code** recommended                     | Install the workspace-recommended extensions when prompted (ESLint, Prettier, Tailwind CSS IntelliSense, i18n Ally). |

> We use **pnpm**, not npm/yarn. The lockfile is `pnpm-lock.yaml` and is committed. Never run `npm install` — it will create a conflicting `package-lock.json`.

### 2.2 First-time setup (copy-paste)

```bash
# 1. Clone
git clone <repo-url> clinicos-frontend && cd clinicos-frontend

# 2. Use the pinned Node version
nvm use                 # reads .nvmrc

# 3. Enable pnpm via corepack (one time per machine)
corepack enable

# 4. Install dependencies (frozen lockfile = reproducible)
pnpm install --frozen-lockfile

# 5. Create your local env file from the committed example
cp .env.example .env.local

# 6. Verify the toolchain is green before you touch anything
pnpm typecheck && pnpm lint && pnpm test

# 7. Start the dev server (with MSW mocks — see §2.3)
pnpm dev
```

If steps 6–7 are green, your environment is correct. If not, fix the environment **before** writing code — a broken baseline hides real errors later.

### 2.3 The `.env` strategy

We follow Vite's env convention. **Only variables prefixed `VITE_` reach the client bundle** — anything else is build-time only. Treat the client bundle as public: **never put a secret in a `VITE_` variable.** 🔒

| File               | Committed?          | Purpose                                                                                                          |
| ------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `.env.example`     | ✅ yes (no secrets) | The documented template. The source of truth for _which_ variables exist. Update it whenever you add a variable. |
| `.env.local`       | ❌ no (gitignored)  | Your personal local overrides.                                                                                   |
| `.env.development` | ✅ yes              | Shared defaults for `pnpm dev`.                                                                                  |
| `.env.production`  | ✅ yes              | Shared defaults for production builds (still no secrets).                                                        |

```bash
# .env.example  — keys only, never real secrets 🔒
VITE_API_BASE_URL=https://api.local.clinicos.dev
VITE_ENABLE_MOCKS=true          # MSW on/off
VITE_DEFAULT_LOCALE=en
VITE_SENTRY_DSN=                # left blank locally; real DSN injected by CI for prod
```

> **Rule:** any new env var lands in `.env.example` (documented, no value) in the _same PR_. CI fails if code reads a `VITE_` var that isn't declared. Access env only through `shared/config/env.ts` (a Zod-validated, typed accessor) — never `import.meta.env.VITE_FOO` scattered across the app.

### 2.4 Running everything — the key scripts

```bash
pnpm dev               # Vite dev server + HMR + MSW mocks (http://localhost:5173)
pnpm dev --no-mocks    # dev against a real backend (sets VITE_ENABLE_MOCKS=false)
pnpm storybook         # Storybook (component workshop) on http://localhost:6006
pnpm build             # production build (typechecks first)
pnpm preview           # serve the production build locally
```

**Mock server (MSW).** ClinicOS is **backend-independent**, so you develop against **MSW** (Mock Service Worker) by default. Handlers and seed data live in `src/mock/`. With `VITE_ENABLE_MOCKS=true`, every request is intercepted in the browser and answered from the mocks — you can build a full feature **before the backend endpoint exists**. This is not a convenience; it's how we prove the architecture decouples us from the backend.

### 2.5 The full script table

| Script            | What it does                                    | When you run it                  |
| ----------------- | ----------------------------------------------- | -------------------------------- |
| `pnpm dev`        | Vite dev server, HMR, MSW mocks on              | All day                          |
| `pnpm storybook`  | Component workshop + a11y addon                 | Building/reviewing UI            |
| `pnpm build`      | Type-check + production bundle                  | Before release / to reproduce CI |
| `pnpm preview`    | Serve the built bundle                          | Sanity-check the prod build      |
| `pnpm typecheck`  | `tsc --noEmit` (strict)                         | Before every commit              |
| `pnpm lint`       | ESLint (boundaries, a11y, i18n, hooks, imports) | Before every commit              |
| `pnpm lint:fix`   | ESLint with `--fix`                             | To auto-fix lint                 |
| `pnpm format`     | Prettier `--write`                              | If your editor isn't formatting  |
| `pnpm test`       | Vitest unit/integration (watch off)             | Before every commit              |
| `pnpm test:watch` | Vitest in watch mode                            | While writing tests              |
| `pnpm test:cov`   | Vitest with coverage thresholds                 | Before a PR                      |
| `pnpm test:e2e`   | Playwright critical-journey E2E                 | Before a PR touching a journey   |
| `pnpm test:a11y`  | axe-core gate (unit + Playwright)               | Before a PR touching UI          |
| `pnpm i18n:check` | Missing-key reporter across en/hi/mr/ur         | Before a PR touching strings     |
| `pnpm gen:module` | Scaffold a new module from the template         | Starting a new bounded context   |
| `pnpm gen:slice`  | Scaffold a sub-slice inside a module            | Adding a feature area            |

> Exact script names are defined in `package.json`. If a script here is missing locally, it means the bootstrap (see [Project-Checklist.md §2](../Project-Checklist.md)) isn't finished — flag it, don't work around it.

---

## 3. Repo tour — where things live

A guided walk of `src/`. The authoritative, field-by-field contract for **every** folder is in **[FolderStructure.md](./FolderStructure.md)** — this is the orientation map.

```
src/
├── app/            # Composition root: providers, router assembly, layouts, bootstrap, GLOBAL error boundary
├── processes/      # Cross-MODULE journeys — the Patient Journey state machine spanning modules
├── modules/        # Domain BOUNDED CONTEXTS — self-contained, identically structured (the work happens here)
├── entities/       # GLOBAL domain entities shared across modules (patient, clinic, doctor, user, tenant)
├── shared/         # Non-domain, cross-cutting reuse (design-system, core, lib, api, infra ports…)
├── assets/         # fonts/ icons/ images/ animations/
├── routes/         # Global route manifest (path constants, route metadata)
├── testing/        # Test utilities, render helpers, fixtures, a11y harness
├── mock/           # MSW handlers, seed data, mock server
└── locales/        # i18n catalogs: en/ hi/ mr/ ur/ <namespace>.json
```

**Mental shortcuts for "where does my code go?":**

| I'm writing…                                                       | It goes in…                                  |
| ------------------------------------------------------------------ | -------------------------------------------- |
| A screen/feature for _one_ bounded context (e.g. follow-ups)       | `src/modules/<context>/`                     |
| A journey that spans _several_ modules (check-in → vitals → queue) | `src/processes/`                             |
| A domain noun used by _many_ modules (Patient, Clinic)             | `src/entities/<noun>/`                       |
| A reusable button/input/card with **zero domain knowledge**        | `src/shared/design-system/`                  |
| An HTTP/logger/analytics port or generic hook                      | `src/shared/` (`api/`, `logger/`, `hooks/`…) |
| A mock endpoint for development                                    | `src/mock/`                                  |
| Translations                                                       | `src/locales/<lang>/<namespace>.json`        |

**The two rules that make this tour matter** (full version in [DependencyRules.md](./DependencyRules.md)):

1. **Dependency flows downward only:** `app → processes → modules → entities → shared`. A module may use `entities` and `shared`, **never another module's internals** — only its `index.ts`.
2. `shared/` knows **nothing** about the domain. `entities/` and `shared/` know **nothing** about modules.

> 🔎 Inside a module, the layout is **always identical** (see §5.1). Once you've learned one module, you can navigate all of them.

---

## 4. The mental model (plain language)

Three ideas, stacked. You don't need a PhD — here's the plain-language version.

### 4.1 Modular FSD — "one folder per business area"

We split the app by **bounded context** (a business area: appointments, billing, follow-up…), each in `src/modules/<context>/`. One module ≈ one team. Inside a module, code is organized by **role** (pages, hooks, services, repositories…). This is _Feature-Sliced Design_, scaled up: instead of a flat `features/` folder shared by everyone, each team owns a self-contained module. Less collision, clearer ownership, lazy-loadable boundaries.

### 4.2 Clean Architecture — "the UI doesn't know where data comes from"

Each module is a **mini Clean Architecture** with four rings:

```
Presentation  (pages, components, hooks, store)     ← what the user sees
      ↓ calls
Application   (services / use-cases)                ← business rules
      ↓ depends on interfaces of
Domain        (types/models, schemas, validators)   ← the stable core, no framework
      ↑ implemented by
Infrastructure (api, repositories, mappers, adapters) ← talks to the network
```

The **Domain** in the middle is the stable heart. Everything points _toward_ it. The UI never reaches "down" into Infrastructure — it goes through `services`/`hooks`. That inversion is what lets the network layer change without the UI noticing.

### 4.3 Backend-independence pipeline — "rename a field in one place, not fifty"

This is the most important contract in the whole codebase:

```
HTTP ──► DTO (Zod-validated) ──► mapper ──► Domain Model ──► Service (use-case)
                                                                  │
Component ◄── TanStack Query hook ◄── Repository (interface) ◄────┘
```

- **DTO** = the raw, ugly backend shape (`patient_first_nm`). Validated with **Zod** _at the boundary_ — we parse, we don't trust.
- **Mapper** = pure `toModel`/`toDto`. The _only_ place that knows both shapes.
- **Model** = the clean, stable, UI-shaped type (`firstName`). Components only ever see this.
- **Repository** = an interface + an implementation; returns Models, never DTOs; depends on the `HttpClient` port.
- **Service / use-case** = business rules orchestrating repositories; framework-agnostic.

**Why you should care:** when the backend renames `patient_first_nm` → `firstName`, you change **one mapper**. Zero component edits. That sentence _is_ "10 years without a rewrite" in practice. It's also why you can build a whole feature today against MSW, before the real endpoint exists.

---

## 5. ⭐ CENTERPIECE — Build a feature end-to-end

**Goal:** implement **"Schedule a follow-up"** in `src/modules/follow-up/`. A doctor finishes a consultation and schedules a follow-up visit for a patient: pick a date, a reason, optional notes → it's saved and appears in the patient's upcoming visits.

We build it **inside-out**: the stable Domain first, then Infrastructure that feeds it, then Application, then Presentation. This order means each layer only depends on layers already built. Follow the steps in order. Every snippet is real and copy-pasteable.

> Reference while building: **[FeatureArchitecture.md](./FeatureArchitecture.md)** (the module template + each folder's job) and **[BrainRules.md](./BrainRules.md)** (step 13's registry updates). The module template is in [README.md §2](./README.md).

### Step 0 — The order of operations (the map)

```
1  Scaffold module from template          → modules/follow-up/ skeleton
2  DTO + Zod schema                        → schemas/ + types/   (Domain boundary)
3  Mapper DTO→Model                        → mappers/            (Infrastructure→Domain)
4  Domain Model + validators               → types/ + validators/ (Domain core)
5  Repository interface + http impl        → repositories/ + api/ (Infrastructure)
6  Service / use-case                      → services/           (Application)
7  TanStack Query mutation hook            → hooks/ (+ api keys)  (Application⇄Presentation)
8  RHF + Zod form component                → components/         (Presentation)
9  Page + route + permission               → pages/ routes.tsx permissions.ts
10 i18n keys (en/hi/mr/ur)                 → locales/
11 Loading / empty / error / success       → in the page/component
12 Tests                                   → tests/ + co-located
13 Update PROJECT_BRAIN + changelog + BRAIN.md
```

### Step 1 — Scaffold the module from the template

```bash
pnpm gen:module follow-up
```

This stamps out the **canonical module template** (identical for every module — see [README.md §2](./README.md)):

```
src/modules/follow-up/
├── index.ts          # PUBLIC API — the ONLY legal import surface
├── routes.tsx        # Module route subtree (lazy-loaded)
├── permissions.ts    # Module RBAC definitions
├── README.md         # Overview, owners, public API, dependencies
├── BRAIN.md          # Module Brain Notes (decisions, registries, TODOs, debt)
├── pages/            # Route-level screens (Presentation)
├── components/       # Module-local presentational components (Presentation)
├── hooks/            # Module-local hooks (Presentation ⇄ Application)
├── services/         # Use-cases / business logic (Application)
├── repositories/     # Data access: interface + impl, returns Models (Infrastructure)
├── api/              # Endpoints + TanStack Query/mutation hooks (Infrastructure)
├── mappers/          # DTO ⇄ Model pure mapping
├── types/            # Domain Models + DTO types (Domain)
├── schemas/          # Zod: DTO validation + form schemas (Domain)
├── validators/       # Domain validation rules (Domain)
├── constants/        # Module constants
├── store/            # Module-local Zustand (UI state only — never server data)
├── config/           # Module config + feature flags
└── tests/            # Module integration tests
```

> If the generator isn't available yet, copy an existing module's skeleton and empty it. Do **not** invent a different layout — the identical template is what makes the codebase navigable.

### Step 2 — Define the DTO + Zod schema (the boundary)

The backend shape is raw and snake*cased. We declare it as a **Zod schema** and \_infer* the type — one source of truth ([Coding-Standards §2.9](../Coding-Standards.md)).

```ts
// src/modules/follow-up/schemas/follow-up.dto.schema.ts
import { z } from 'zod';

/** Raw backend shape. Parsed at the boundary; never leaves the module's api/. */
export const FollowUpDtoSchema = z.object({
  follow_up_id: z.string(),
  patient_id: z.string(),
  scheduled_for: z.string(), // ISO date-time from backend
  reason_code: z.enum(['routine', 'lab_review', 'medication', 'post_op']),
  notes: z.string().nullable(),
  created_at: z.string(),
});

export type FollowUpDto = z.infer<typeof FollowUpDtoSchema>;

/** Request body the backend expects when creating a follow-up. */
export const CreateFollowUpDtoSchema = z.object({
  patient_id: z.string(),
  scheduled_for: z.string(),
  reason_code: FollowUpDtoSchema.shape.reason_code,
  notes: z.string().nullable(),
});
export type CreateFollowUpDto = z.infer<typeof CreateFollowUpDtoSchema>;
```

### Step 3 — Mapper: DTO → Model (and Model → DTO)

The mapper is the **only** place that knows both shapes. Pure functions, no side effects.

```ts
// src/modules/follow-up/mappers/follow-up.mapper.ts
import { asPatientId } from '@/shared/types/branded';
import type { FollowUpDto, CreateFollowUpDto } from '../schemas/follow-up.dto.schema';
import { asFollowUpId, type FollowUp, type NewFollowUp } from '../types/follow-up.types';

/** DTO → stable UI Model. The clean side components consume. */
export function toFollowUp(dto: FollowUpDto): FollowUp {
  return {
    id: asFollowUpId(dto.follow_up_id),
    patientId: asPatientId(dto.patient_id),
    scheduledFor: dto.scheduled_for,
    reason: dto.reason_code,
    notes: dto.notes ?? undefined,
    createdAt: dto.created_at,
  };
}

/** Model (new) → request DTO. Used by the repository when writing. */
export function toCreateFollowUpDto(input: NewFollowUp): CreateFollowUpDto {
  return {
    patient_id: input.patientId,
    scheduled_for: input.scheduledFor,
    reason_code: input.reason,
    notes: input.notes ?? null,
  };
}
```

### Step 4 — Domain Model types + validators

The Model is **UI-shaped and stable**. Branded IDs prevent mixing a `FollowUpId` with a `PatientId` ([Coding-Standards §2.7](../Coding-Standards.md)).

```ts
// src/modules/follow-up/types/follow-up.types.ts
import type { Brand } from '@/shared/types/branded';
import type { PatientId } from '@/entities/patient';

export type FollowUpId = Brand<string, 'FollowUpId'>;
export const asFollowUpId = (s: string): FollowUpId => s as FollowUpId;

export type FollowUpReason = 'routine' | 'lab_review' | 'medication' | 'post_op';

export interface FollowUp {
  readonly id: FollowUpId;
  readonly patientId: PatientId;
  readonly scheduledFor: string; // ISO date-time
  readonly reason: FollowUpReason;
  readonly notes?: string;
  readonly createdAt: string;
}

/** Shape needed to create a follow-up (no server-assigned fields). */
export interface NewFollowUp {
  readonly patientId: PatientId;
  readonly scheduledFor: string;
  readonly reason: FollowUpReason;
  readonly notes?: string;
}
```

```ts
// src/modules/follow-up/validators/follow-up.validators.ts
import type { NewFollowUp } from '../types/follow-up.types';

/** Pure domain rule: a follow-up must be scheduled in the future. */
export function isFutureDate(iso: string, now: Date = new Date()): boolean {
  const when = new Date(iso);
  return !Number.isNaN(when.getTime()) && when.getTime() > now.getTime();
}

/** Returns an i18n error key if the follow-up is invalid, else null. */
export function validateNewFollowUp(input: NewFollowUp): string | null {
  if (!isFutureDate(input.scheduledFor)) return 'followUp.error.pastDate';
  return null;
}
```

### Step 5 — Repository: interface + HTTP implementation

The repository returns **Models, never DTOs**, and depends only on the `HttpClient` **port** ([Coding-Standards §8](../Coding-Standards.md)). This is the only place that touches `HttpClient`.

```ts
// src/modules/follow-up/repositories/follow-up.repository.ts
import type { HttpClient } from '@/shared/api';
import type { PatientId } from '@/entities/patient';
import { FollowUpDtoSchema } from '../schemas/follow-up.dto.schema';
import { toFollowUp, toCreateFollowUpDto } from '../mappers/follow-up.mapper';
import type { FollowUp, NewFollowUp } from '../types/follow-up.types';
import { FOLLOW_UP_ENDPOINTS } from '../api/follow-up.endpoints';

/** The contract. Services depend on THIS, not on the impl. */
export interface FollowUpRepository {
  create(input: NewFollowUp): Promise<FollowUp>;
  listForPatient(patientId: PatientId): Promise<readonly FollowUp[]>;
}

/** HTTP implementation. Parses DTOs at the boundary, returns Models. */
export function createHttpFollowUpRepository(http: HttpClient): FollowUpRepository {
  return {
    async create(input) {
      const body = toCreateFollowUpDto(input);
      const raw = await http.post(FOLLOW_UP_ENDPOINTS.create(), body);
      const dto = FollowUpDtoSchema.parse(raw); // parse, don't trust 🔒
      return toFollowUp(dto);
    },
    async listForPatient(patientId) {
      const raw = await http.get(FOLLOW_UP_ENDPOINTS.listForPatient(patientId));
      const dtos = FollowUpDtoSchema.array().parse(raw);
      return dtos.map(toFollowUp);
    },
  };
}
```

```ts
// src/modules/follow-up/api/follow-up.endpoints.ts
import type { PatientId } from '@/entities/patient';

export const FOLLOW_UP_ENDPOINTS = {
  create: () => '/follow-ups',
  listForPatient: (patientId: PatientId) => `/patients/${patientId}/follow-ups`,
} as const;
```

### Step 6 — Service / use-case

The service holds **business rules** and orchestrates the repository. Framework-agnostic — no React here.

```ts
// src/modules/follow-up/services/follow-up.service.ts
import { AppError } from '@/shared/errors';
import type { FollowUpRepository } from '../repositories/follow-up.repository';
import { validateNewFollowUp } from '../validators/follow-up.validators';
import type { FollowUp, NewFollowUp } from '../types/follow-up.types';

export interface FollowUpService {
  schedule(input: NewFollowUp): Promise<FollowUp>;
}

export function createFollowUpService(repo: FollowUpRepository): FollowUpService {
  return {
    async schedule(input) {
      const errorKey = validateNewFollowUp(input); // domain rule first
      if (errorKey) throw new AppError(errorKey, { context: { input } });
      return repo.create(input);
    },
  };
}
```

> Wire the concrete service in the module's composition (e.g. `config/` or a small factory) by passing the shared `HttpClient` into `createHttpFollowUpRepository`, then into `createFollowUpService`. Presentation never constructs these — it consumes the hook in Step 7.

### Step 7 — TanStack Query mutation hook

Server writes go through a **mutation hook**. Query keys come from a per-module **key factory** ([Coding-Standards §6.1–6.3](../Coding-Standards.md)). Server data lives **only** in TanStack Query — never in Zustand.

```ts
// src/modules/follow-up/api/follow-up.keys.ts
import type { PatientId } from '@/entities/patient';

export const followUpKeys = {
  all: ['follow-up'] as const,
  lists: () => [...followUpKeys.all, 'list'] as const,
  listForPatient: (id: PatientId) => [...followUpKeys.lists(), id] as const,
};
```

```ts
// src/modules/follow-up/hooks/useScheduleFollowUp.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFollowUpService } from './useFollowUpService'; // provides the wired service
import { followUpKeys } from '../api/follow-up.keys';
import type { NewFollowUp } from '../types/follow-up.types';

/** Schedules a follow-up and refreshes the patient's upcoming list. */
export function useScheduleFollowUp() {
  const service = useFollowUpService();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: NewFollowUp) => service.schedule(input),
    onSuccess: (created) => {
      // narrowest invalidation: only this patient's follow-up list
      void qc.invalidateQueries({ queryKey: followUpKeys.listForPatient(created.patientId) });
    },
  });
}
```

> For writes that must survive offline, swap `useMutation` for the shared **`useOutboxMutation`** wrapper ([Coding-Standards §6.4](../Coding-Standards.md)). Follow-ups are a good candidate — a doctor in a low-signal clinic should never lose one.

### Step 8 — RHF + Zod form component (tokens + i18n + a11y)

The form uses **React Hook Form + Zod resolver**, **tokens only**, **i18n keys only**, and the shared `<Field>` which wires `aria-invalid`/`aria-describedby`/`role="alert"` for free ([Coding-Standards §7, §9, §12, §13](../Coding-Standards.md)).

```tsx
// src/modules/follow-up/schemas/follow-up.form.schema.ts
import { z } from 'zod';
import { FollowUpDtoSchema } from './follow-up.dto.schema';

export const ScheduleFollowUpFormSchema = z.object({
  scheduledFor: z.string().min(1), // 'required' surfaced as i18n key by error.type
  reason: FollowUpDtoSchema.shape.reason_code,
  notes: z.string().max(500).optional(),
});
export type ScheduleFollowUpFormValues = z.infer<typeof ScheduleFollowUpFormSchema>;
```

```tsx
// src/modules/follow-up/components/ScheduleFollowUpForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button, Field, Select, Textarea } from '@/shared/design-system';
import type { PatientId } from '@/entities/patient';
import { useScheduleFollowUp } from '../hooks/useScheduleFollowUp';
import {
  ScheduleFollowUpFormSchema,
  type ScheduleFollowUpFormValues,
} from '../schemas/follow-up.form.schema';
import { FOLLOW_UP_REASONS } from '../constants/follow-up.constants';

interface ScheduleFollowUpFormProps {
  patientId: PatientId;
  onScheduled: () => void;
}

export function ScheduleFollowUpForm({ patientId, onScheduled }: ScheduleFollowUpFormProps) {
  const { t } = useTranslation('followUp');
  const schedule = useScheduleFollowUp();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFollowUpFormValues>({ resolver: zodResolver(ScheduleFollowUpFormSchema) });

  const onSubmit = handleSubmit((values) => {
    schedule.mutate({ patientId, ...values }, { onSuccess: onScheduled });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Field
        type="datetime-local"
        label={t('form.scheduledFor.label')}
        error={errors.scheduledFor && t(`form.scheduledFor.error.${errors.scheduledFor.type}`)}
        {...register('scheduledFor')}
      />

      <Field
        as={Select}
        label={t('form.reason.label')}
        error={errors.reason && t(`form.reason.error.${errors.reason.type}`)}
        {...register('reason')}
      >
        {FOLLOW_UP_REASONS.map((reason) => (
          <option key={reason} value={reason}>
            {t(`reason.${reason}`)}
          </option>
        ))}
      </Field>

      <Field
        as={Textarea}
        label={t('form.notes.label')}
        error={errors.notes && t(`form.notes.error.${errors.notes.type}`)}
        {...register('notes')}
      />

      {schedule.isError && (
        <p role="alert" className="text-body-sm text-danger">
          {/* AppError carries an i18n key */}
          {t((schedule.error as { messageKey?: string }).messageKey ?? 'form.error.generic')}
        </p>
      )}

      <Button type="submit" intent="primary" disabled={isSubmitting || schedule.isPending}>
        {t('form.submit')}
      </Button>
    </form>
  );
}
```

Note: tokens only (`text-danger`, `text-body-sm`, `gap-4` — no hex/px), every string via `t(...)`, exactly **one primary CTA**, errors associated and announced.

### Step 9 — Page + route + permission

```tsx
// src/modules/follow-up/pages/ScheduleFollowUpPage.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { asPatientId } from '@/shared/types/branded';
import { ScheduleFollowUpForm } from '../components/ScheduleFollowUpForm';

export function ScheduleFollowUpPage() {
  const { t } = useTranslation('followUp');
  const { patientId } = useParams();
  const navigate = useNavigate();

  if (!patientId) return null; // route guarantees this; guard for types

  return (
    <main aria-labelledby="follow-up-title" className="mx-auto max-w-prose p-6">
      <h1 id="follow-up-title" className="mb-6 text-h2">
        {t('schedule.title')}
      </h1>
      <ScheduleFollowUpForm
        patientId={asPatientId(patientId)}
        onScheduled={() => navigate(`/patients/${patientId}`)}
      />
    </main>
  );
}
```

```tsx
// src/modules/follow-up/routes.tsx — lazy-loaded module subtree
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Can } from '@/shared/permissions';
import { followUpPermissions } from './permissions';

const ScheduleFollowUpPage = lazy(() =>
  import('./pages/ScheduleFollowUpPage').then((m) => ({ default: m.ScheduleFollowUpPage })),
);

export const followUpRoutes: RouteObject[] = [
  {
    path: 'patients/:patientId/follow-ups/new',
    element: (
      <Can permission={followUpPermissions.schedule} fallbackKey="common.error.forbidden">
        <ScheduleFollowUpPage />
      </Can>
    ),
  },
];
```

```ts
// src/modules/follow-up/permissions.ts
export const followUpPermissions = {
  schedule: 'follow-up:schedule',
  view: 'follow-up:view',
} as const;
```

> The route is **permission-gated** ([Project-Checklist §3.10](../Project-Checklist.md)). The UI gate is convenience; the server is the real control. Register the module's routes into the global router in `src/app/` and the permission strings into the shared catalog (`shared/config/permissions`).

### Step 10 — i18n keys in all four locales

Add the namespace file to **every** locale (`en`, `hi`, `mr`, `ur`) — a missing key in any locale fails `pnpm i18n:check` 🌐. Example for English; translate the same keys for the others.

```jsonc
// src/locales/en/followUp.json
{
  "schedule": { "title": "Schedule a follow-up" },
  "form": {
    "scheduledFor": {
      "label": "Follow-up date & time",
      "error": {
        "required": "Please choose a date and time",
        "invalid_string": "Enter a valid date",
      },
    },
    "reason": { "label": "Reason", "error": { "invalid_enum_value": "Choose a reason" } },
    "notes": {
      "label": "Notes (optional)",
      "error": { "too_big": "Keep notes under 500 characters" },
    },
    "submit": "Schedule follow-up",
    "error": { "generic": "Could not schedule the follow-up. Please try again." },
  },
  "reason": {
    "routine": "Routine check-up",
    "lab_review": "Lab result review",
    "medication": "Medication review",
    "post_op": "Post-operative check",
  },
  "error": { "pastDate": "Follow-ups must be scheduled in the future" },
  "list": { "empty": { "title": "No upcoming follow-ups", "cta": "Schedule one" } },
}
```

Create `src/locales/hi/followUp.json`, `mr/followUp.json`, `ur/followUp.json` with the same keys, translated. Use **ICU plurals** for any counted text (`{count, plural, ...}`) — never string concatenation ([Coding-Standards §13](../Coding-Standards.md)). Verify Urdu (RTL) renders with logical properties.

### Step 11 — The four async states

Every async surface ships **all four** states ([Brain.md §11](../Brain.md), [Project-Checklist §3.4](../Project-Checklist.md)). For the _upcoming follow-ups_ list a doctor sees after scheduling:

```tsx
// src/modules/follow-up/components/UpcomingFollowUps.tsx (sketch)
export function UpcomingFollowUps({ patientId }: { patientId: PatientId }) {
  const { t } = useTranslation('followUp');
  const { data, isPending, isError, refetch } = useFollowUpsForPatient(patientId);

  if (isPending) return <FollowUpListSkeleton />; // Loading: skeleton, no layout shift
  if (isError) return <ErrorState messageKey="followUp.error.load" onRetry={refetch} />; // Error: localized + retry
  if (data.length === 0)
    // Empty: message + one CTA
    return <EmptyState titleKey="followUp.list.empty.title" ctaKey="followUp.list.empty.cta" />;

  return (
    // Success: content + live region
    <ul aria-live="polite">
      {data.map((f) => (
        <FollowUpRow key={f.id} followUp={f} />
      ))}
    </ul>
  );
}
```

On a successful _schedule_, fire a localized success toast and let the mutation's `invalidateQueries` (Step 7) refresh this list.

### Step 12 — Tests

| Layer           | What to test                                                                            | Where                                           |
| --------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Mapper**      | `toFollowUp` maps every field; nulls → `undefined`                                      | `mappers/follow-up.mapper.test.ts` (co-located) |
| **Validator**   | `isFutureDate` / `validateNewFollowUp` edge cases                                       | `validators/*.test.ts`                          |
| **Service**     | rejects past dates with the right `AppError` key; calls repo on valid input (mock repo) | `services/*.test.ts`                            |
| **Form**        | submit calls mutation; invalid date shows the localized error; a11y (jest-axe) clean    | `components/ScheduleFollowUpForm.test.tsx`      |
| **Integration** | page renders form, schedules against **MSW**, navigates on success                      | `tests/schedule-follow-up.test.tsx`             |
| **E2E**         | the journey end-to-end (Playwright), incl. an axe scan                                  | `e2e/follow-up.spec.ts`                         |

```ts
// src/modules/follow-up/mappers/follow-up.mapper.test.ts
import { describe, expect, it } from 'vitest';
import { toFollowUp } from './follow-up.mapper';

describe('toFollowUp', () => {
  it('maps DTO fields and turns null notes into undefined', () => {
    const model = toFollowUp({
      follow_up_id: 'f1',
      patient_id: 'p1',
      scheduled_for: '2026-07-01T09:00:00Z',
      reason_code: 'routine',
      notes: null,
      created_at: '2026-06-27T10:00:00Z',
    });
    expect(model.id).toBe('f1');
    expect(model.patientId).toBe('p1');
    expect(model.reason).toBe('routine');
    expect(model.notes).toBeUndefined();
  });
});
```

Test **behavior, not implementation**. Mock the repository (not `fetch`) in service tests; use **MSW** for integration tests so you exercise the real pipeline.

### Step 13 — Update the registries, changelog & module BRAIN.md

A feature isn't done until the **project memory** reflects it ([BrainRules.md](./BrainRules.md), [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)). This is what keeps a 100-developer codebase coherent.

- **PROJECT_BRAIN registries:** add the `follow-up` module (if new), the `follow-up:schedule` / `follow-up:view` permissions, the route, and the `followUp` i18n namespace to their live registries.
- **Changelog:** `pnpm changeset` → write a user-facing summary (Conventional Commits + Changesets drive versioning).
- **Module `BRAIN.md`:** record the decision ("follow-ups are write-through the Outbox because clinics may be offline"), the public API now exported from `index.ts`, owners, and any TODO/debt with an owner + ticket.

```ts
// src/modules/follow-up/index.ts — the PUBLIC API (the only legal import surface)
export { followUpRoutes } from './routes';
export { followUpPermissions } from './permissions';
export { useScheduleFollowUp } from './hooks/useScheduleFollowUp';
export { ScheduleFollowUpForm } from './components/ScheduleFollowUpForm';
export type { FollowUp, FollowUpId, FollowUpReason, NewFollowUp } from './types/follow-up.types';
// NOTE: DTOs, mappers, repositories, services, schemas are INTERNAL — never exported.
```

✅ **Done.** You built every ring of Clean Architecture, kept the backend-independence pipeline intact, and the only thing components ever touched was a Model behind a public API.

---

## 6. Daily workflow

### 6.1 Branch naming

```
<type>/<ticket>-<short-kebab-summary>
feat/WTI-412-schedule-follow-up
fix/WTI-419-queue-row-focus-ring
chore/WTI-420-bump-vitest
```

Types mirror Conventional Commits: `feat · fix · chore · refactor · docs · test · perf`.

### 6.2 Conventional commits

```
feat(follow-up): schedule a follow-up from the consultation summary
fix(queue): restore focus-visible ring on queue rows
refactor(billing): extract invoice mapper

# body explains the WHY; footer references the ticket
WTI-412
```

Commitlint enforces this in the commit-msg hook. A non-conforming message is rejected locally.

### 6.3 Small PRs

One concern per PR. If your diff touches three modules and a shared component, it's probably three PRs. Small PRs review faster, revert cleanly, and keep blast radius tiny — which matters more here than anywhere because of the 10-year horizon.

### 6.4 The PR template & required checks

Open a PR → the template auto-populates. **Paste [Project-Checklist §3 (Per-PR DoD)](../Project-Checklist.md) into the description and tick every applicable box.** Required CI checks (all must be green to merge 🔴):

```
lint → typecheck → unit tests → a11y tests → build → bundle-budget → e2e (critical journeys)
```

### 6.5 Code review etiquette

- **Author:** keep it small, self-review first, write _why_ in the description, link the ticket, fill the DoD.
- **Reviewer:** start with the [§9 60-second Quick Gate](../Project-Checklist.md) — block on any 🔴 (Dependency Rule broken, UI talks to backend, server data in Zustand, hardcoded color/string, missing async state, a11y fail, PHI leak, `any`). Then do the deep pass.
- Be kind and specific. Critique the code, not the coder. Prefer "Consider X because Y" over "this is wrong." Approve when the DoD is met — don't gold-plate someone else's PR with scope creep.

### 6.6 CODEOWNERS

Each module maps to a team via `CODEOWNERS` (one module ≈ one team — that's _why_ we have modules). Touching `src/modules/billing/**` auto-requests the billing team. Touching `src/shared/**` requests the platform/design-system owners. Cross-module changes need both sets of owners — a signal to consider splitting the PR.

---

## 7. Quick recipes ("how do I add a…")

### 7.1 …shared design-system component

1. **Search first** — does `shared/design-system` already have it? Reuse beats create ([Project-Checklist §3.3](../Project-Checklist.md)).
2. Create `shared/design-system/<Component>/`: `Component.tsx`, `component.variants.ts` (CVA), `Component.stories.tsx`, `Component.test.tsx`.
3. **CVA + tokens only** — variants in CVA, `twMerge` so caller `className` wins; never hardcode hex/px ([Coding-Standards §9.2](../Coding-Standards.md)).
4. **a11y** — semantic element, `:focus-visible` ring from tokens, keyboard-operable, ARIA only to fill gaps.
5. **i18n** — the component takes **already-translated** strings as props or i18n keys; it never hardcodes copy. (Design-system is domain-free — keep clinic words out of it.)
6. **Story** — cover every variant + state (incl. loading/empty/error/RTL). The a11y addon must be clean.
7. Export it from `shared/design-system/index.ts`.

### 7.2 …new i18n string

1. Pick the owning namespace (`feature.area.element`); add the key to the slice/module namespace **in all four locales** (`en/hi/mr/ur`).
2. Use `const { t } = useTranslation('<namespace>')` then `t('area.element')`. ICU for plurals/gender.
3. Run `pnpm i18n:check` — it fails on any missing key. Never hardcode the string, even for `aria-label`.

### 7.3 …new theme token

1. Add a **primitive** if a truly new raw value is needed (`shared/styles/tokens.css`).
2. Map it to a **semantic** token (`--color-…`, `--space-…`) — this is what components consume. Re-map it per theme (light/dark/high-contrast) in the theme files.
3. (Optional) add a **component** token referencing the semantic one.
4. Expose it through the Tailwind theme (which reads **only** from CSS variables — no raw hex/px in `tailwind.config`). Full system: [Frontend-Bible.md](../Frontend-Bible.md).

### 7.4 …new route

1. Add the path to the **owning module's `routes.tsx`** (lazy-loaded), wrapped in `<Can>` if privileged.
2. Add the path constant to the global route manifest (`src/routes/` or `shared/config`).
3. Register the module's routes into the app router in `src/app/` (if the module is new).
4. Give the page an error boundary + Suspense fallback ([Coding-Standards §3.10](../Coding-Standards.md)) and all four async states.

### 7.5 …new permission

1. Add the permission string to the **module's `permissions.ts`** and to the shared permission catalog (`shared/config/permissions`).
2. Gate the route/action/data with `<Can permission={...}>` (UI) — remember the **server** is the real gate ([Project-Checklist §7.2](../Project-Checklist.md)).
3. Record it in the PROJECT_BRAIN permissions registry (Step 13 / [BrainRules.md](./BrainRules.md)).

---

## 8. Definition of Done & the "before you open a PR" checklist

The full DoD is **[Project-Checklist.md](../Project-Checklist.md)** — copy its §3 into your PR. Before you push, run this 60-second self-check:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:a11y && pnpm i18n:check
```

- [ ] **Lint** clean (boundaries, a11y, i18n, hooks, import order). 🔴
- [ ] **Types** green — `tsc --noEmit`, no `any`, no `@ts-ignore`. 🔴
- [ ] **Tests** pass — unit (mapper/service/hook), integration (MSW), E2E for the touched journey.
- [ ] **a11y** — axe clean, keyboard path, focus-visible, labels via i18n, not color-alone. 🔴
- [ ] **i18n** — keys in **all four** locales; ICU where needed; RTL (ur) verified; no hardcoded strings. 🔴
- [ ] **Tokens** — no hardcoded color/size/space/radius/shadow/font. 🔴
- [ ] **Architecture** — correct layer, public-API imports only, no `module→module` internals, no `HttpClient`/DTO in UI, no server data in Zustand. 🔴
- [ ] **Four async states** present; **one** primary CTA.
- [ ] **PHI** — none in logs/analytics/Sentry/URL/localStorage; privileged surfaces gated. 🔒🔴
- [ ] **Brain updated** — PROJECT_BRAIN registries, changeset, module `BRAIN.md`.
- [ ] Small, focused PR; Conventional Commit; DoD pasted and ticked.

> One-line DoD ([Project-Checklist §8](../Project-Checklist.md)): right layer behind a public API; data flows DTO→Zod→mapper→Model→Service→Repository→Query with no HttpClient/DTO in UI and no server data in Zustand; tokens + i18n only; four async states; WCAG 2.2 AA + axe; no PHI; permission-gated; typed + tested; green CI; conventional commit; docs updated.

---

## 9. Debugging & tooling

| Tool                       | What it gives you                                                          | How to use                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **React Query Devtools**   | Inspect query keys, cache state, staleness, refetches, mutations           | Mounted in dev; open the floating panel. If a list isn't refreshing after a write, check your `invalidateQueries` key here. |
| **Zustand devtools**       | Inspect/replay UI-store actions (theme, locale, session) in Redux DevTools | Stores wrap `devtools(...)`. If you see _server_ data here, that's a bug ([§10](#10-common-pitfalls)).                      |
| **The logger**             | Structured logging behind a port (`shared/logger`)                         | `logger.info/warn/error` — **never** `console.*` (lint-blocked), and **never** log PHI 🔒.                                  |
| **Error boundaries**       | Typed `AppError` → localized fallback per route/widget                     | Throw `AppError('x.error.key')`; the boundary renders the four-state Error UI with retry.                                   |
| **MSW**                    | Mock backend in dev + tests                                                | Toggle with `VITE_ENABLE_MOCKS`. Add/inspect handlers in `src/mock/`. Network tab shows them as normal requests.            |
| **Storybook + a11y addon** | Build/inspect components in isolation; live axe checks                     | `pnpm storybook`. The a11y panel flags violations as you edit — fix before merging.                                         |
| **Web Vitals / Sentry**    | Field perf + errors (PHI-scrubbed)                                         | Behind ports; verify a seeded error is scrubbed before release.                                                             |

**Debugging flow when something's off:** reproduce → check React Query Devtools (is the data even there / stale?) → check the Network/MSW tab (right request, right shape?) → check the mapper (DTO→Model correct?) → check the boundary parse (did Zod reject the DTO?). Nine times out of ten it's a key, a mapper, or a missing invalidation.

---

## 10. Common pitfalls (and how to dodge them)

The full anti-coupling / anti-God rulebook is **[DependencyRules.md](./DependencyRules.md)**. The five that bite new devs most:

| ❌ Pitfall                                                                   | Why it's bad                                                              | ✅ Do instead                                                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Deep import** past a module's `index.ts` (`@/modules/billing/services/x`)  | Breaks the public-API contract; couples you to internals that will change | Import only from `@/modules/billing` (its `index.ts`). Lint blocks the rest.                                 |
| **Server data in Zustand**                                                   | Two sources of truth → stale/contradictory UI                             | Server data lives **only** in TanStack Query. Zustand is for UI state (theme, locale, session).              |
| **Hardcoded string / English `aria-label`**                                  | Untranslatable; breaks for hi/mr/ur users                                 | `t('namespace.key')` in all four locales. Even labels and errors.                                            |
| **Hardcoded color/px** (`bg-[#E87D7D]`, `p-[16px]`)                          | Breaks theming, dark mode, high-contrast                                  | Semantic token utilities (`bg-primary`, `p-4`) + CVA.                                                        |
| **God component** (one file doing fetching + form + layout + business rules) | Untestable, unreviewable, owned by everyone = owned by no one             | Split by layer: container (data) → presentational (JSX); push rules into `services/`, data into `hooks/api`. |
| `module → module` internal import / a feature reaching into another          | Circular deps, blurry ownership                                           | Cross-module journeys live in `processes/`; shared domain in `entities/`; shared non-domain in `shared/`.    |
| `useEffect` + `fetch` for server data                                        | No caching/retries; races; bypasses the data layer                        | A Query hook (`useX`) from the module's `api/`.                                                              |

When in doubt: **smaller, lower, behind a public API.** Smaller files, lower layer, accessed through `index.ts`.

---

## 11. Where to get help

1. **The module's `README.md` and `BRAIN.md`** — overview, public API, owners, decisions, and known debt. Always your first stop for module-specific questions.
2. **CODEOWNERS** — who owns the code you're touching. Tag them on the PR or ping them.
3. **The canon** — re-read the relevant doc: architecture → [README.md](./README.md) / [FolderStructure.md](./FolderStructure.md); a feature pattern → [FeatureArchitecture.md](./FeatureArchitecture.md); a rule → [DependencyRules.md](./DependencyRules.md) / [Coding-Standards.md](../Coding-Standards.md); the "why" → [Brain.md](../Brain.md).
4. **ADRs** (`docs/adr/NNNN-*.md`) — _why_ a decision was made. If you want to change a ratified decision, you write a new ADR (Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations) — see [Brain.md §14](../Brain.md) / [BrainRules.md](./BrainRules.md). Don't silently work around an ADR.
5. **PROJECT_BRAIN** ([PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)) — the live registries (modules, routes, permissions, i18n namespaces). If reality and the registry disagree, fix the registry in your PR.

> If you're blocked for more than ~30 minutes, ask. A 5-minute question from a teammate beats a day of guessing — and it surfaces gaps in this guide we should fix. Open a PR against _this file_ when you find one.

---

## Phase 3 — Engineering Foundation (now live)

> **What changed:** the project **scaffold, toolchain, and shared runtime kernel now physically exist.** The `git clone → install → green checks → dev server` loop in §2 is real and executable. Sections 1–11 above (the architecture, the build-a-feature tutorial, the rules) are unchanged and remain authoritative — this section records what the foundation actually ships, with paths.

This phase builds the **engineering foundation only** — no business features, no UI pages, no auth, no design-system components. Those arrive in later phases. The full pinned spec governs this section; the env strategy has its own companion doc: **[EnvironmentGuide.md](./EnvironmentGuide.md)**.

### 12.1 Local setup is now executable

```bash
pnpm install                 # uses pnpm-lock.yaml (pnpm 9, Node >=20)
cp .env.example .env.local   # your gitignored local overrides
pnpm dev                     # Vite dev server (http://localhost:5173)
pnpm verify                  # the all-green gate: typecheck → lint → format:check → test
```

`App.tsx` renders a minimal **"Foundation Ready"** placeholder screen (token-styled, i18n-driven, no business pages) — proof the kernel boots end-to-end. With `VITE_ENABLE_MSW=true`, MSW starts with an empty (documented) handler set.

### 12.2 The real scripts table

These are the **actual** scripts in `package.json` for Phase 3. (The aspirational §2.5 table above describes the eventual full surface; this is what exists now.)

| Script                               | What it does                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `pnpm dev`                           | Vite dev server with HMR.                                                        |
| `pnpm build`                         | `tsc -b` (type-check) then `vite build` (production bundle).                     |
| `pnpm build:dev`                     | Type-check then build in development mode.                                       |
| `pnpm preview`                       | Serve the built `dist/` locally.                                                 |
| `pnpm typecheck`                     | Strict TS across project references (`tsc -b --noEmit`).                         |
| `pnpm lint`                          | ESLint flat config (boundaries, a11y, i18n, hooks, imports), `--max-warnings 0`. |
| `pnpm lint:fix`                      | ESLint with `--fix`.                                                             |
| `pnpm format`                        | Prettier `--write .`.                                                            |
| `pnpm format:check`                  | Prettier `--check .` (CI gate).                                                  |
| `pnpm test`                          | Vitest single run.                                                               |
| `pnpm test:watch`                    | Vitest watch mode.                                                               |
| `pnpm coverage`                      | Vitest with V8 coverage.                                                         |
| `pnpm e2e`                           | Playwright E2E.                                                                  |
| `pnpm storybook` / `build-storybook` | Print a deferral notice — Storybook ships in **Phase 4** (design-system).        |
| `pnpm analyze`                       | Production build in `analyze` mode; visualizer writes `dist/stats.html`.         |
| `pnpm clean`                         | Remove `dist`, `node_modules/.vite`, `coverage`, `.turbo`.                       |
| `pnpm generate`                      | Run Plop generators (scaffold a module / component).                             |
| `pnpm verify`                        | `typecheck` → `lint` → `format:check` → `test`.                                  |
| `pnpm prepare`                       | Husky setup (auto-runs after install).                                           |

> Storybook's `pnpm gen:*`, `i18n:check`, `test:a11y`, etc. from §2.5 are the **target** surface and land in later phases — until then they print a deferral notice or are not yet present. Use this table as the source of truth for what runs today.

### 12.3 The provider hierarchy (composition root)

`src/app/providers/AppProviders.tsx` composes the runtime providers in this exact **outer → inner** order. Each provider carries a JSDoc explaining _why_ it exists and its order rationale.

```
HelmetProvider                       (react-helmet-async — document head)
└ RootErrorBoundary                  (shared/errors — typed AppError → localized fallback)
  └ ThemeProvider                    (shared/theme — data-theme + reduced-motion + large-text)
    └ I18nProvider                   (react-i18next — Suspense for lazy locales)
      └ QueryClientProvider          (TanStack Query + persist + Devtools in dev)
        └ /* AuthProvider — PLACEHOLDER (built in Phase 4) */
          └ NotificationProvider     (react-hot-toast <Toaster/> behind the notifications port)
            └ ModalProvider          (overlay registry — empty for now)
              └ DrawerProvider
                └ RouterProvider / <App/>
```

**Order rationale:** head management and the **error boundary outermost** (so any failure below renders a localized fallback); theme and i18n next (everything visual/textual depends on them); the query client above the app; auth as a documented placeholder where it will slot in; notifications and overlays innermost, closest to the UI that triggers them.

### 12.4 Where the foundation lives (paths)

| Concern                                | Lives in                                    | Notes                                                                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Config (env, app, flags, settings)** | `src/shared/config/`                        | `env.ts` (Zod-validated, fail-fast), `app-config.ts`, `feature-flags.ts`, `settings.ts`, `index.ts` barrel. See **[EnvironmentGuide.md](./EnvironmentGuide.md)**.                                        |
| **HTTP transport**                     | `src/shared/api/http-client.ts`             | `HttpClient` port + `AxiosHttpClient`; interceptors for request-id, base URL/timeout (from `env`), auth/tenant hooks, error mapping, logging. See **[ADR-0005](../adr/0005-http-axios-behind-port.md)**. |
| **Errors**                             | `src/shared/errors/`                        | `AppError` + subclasses, `toAppError(unknown)`, `RootErrorBoundary` + `ErrorFallback` (react-error-boundary, tokens + i18n + a11y, reset).                                                               |
| **Logging**                            | `src/shared/logger/`                        | `LoggerPort` + `ConsoleLoggerAdapter`; categories (`app/api/navigation/performance/error/analytics/dev`); level-gated by `env.VITE_LOG_LEVEL`. **Never logs PHI.**                                       |
| **Performance**                        | `src/shared/lib/performance/`               | `lazyWithRetry(factory)` for chunk-load resilience + a `preload` helper.                                                                                                                                 |
| **Query**                              | `src/shared/lib/query/`                     | `createQueryClient` (staleTime/gcTime, no-retry on 4xx, cache `onError` → logger) + persist wiring.                                                                                                      |
| **Theme**                              | `src/shared/theme/`                         | `apply(theme)`, `getInitialTheme()`, light/dark/high-contrast, reduced-motion + large-text, respects `prefers-*`.                                                                                        |
| **Notifications**                      | `src/shared/notifications/`                 | `NotificationPort` (success/error/info/warning/promise) delegating to react-hot-toast; messages via i18n keys.                                                                                           |
| **Localization**                       | `src/shared/localization/` + `src/locales/` | i18next init, RTL handling, `en/hi/mr/ur` catalogs.                                                                                                                                                      |
| **Styles/tokens**                      | `src/shared/styles/`                        | `tokens.css` (3-tier token foundation subset) + `themes.css` (per-theme semantic overrides).                                                                                                             |
| **App composition**                    | `src/app/`                                  | `main.tsx` (bootstrap, env validation early, conditional MSW), `App.tsx`, `providers/`, `router/`, `styles/global.css`.                                                                                  |
| **Testing & mocks**                    | `src/testing/` + `src/mock/`                | render-with-providers helper, jest-dom + vitest-axe setup; MSW worker with empty (documented) handlers.                                                                                                  |

### 12.5 Toolchain & decisions

The enforced toolchain — **pnpm 9**, **ESLint 9 flat config with `boundaries`** (the teeth behind the Dependency Rule), Prettier, Husky + lint-staged, Commitlint/Conventional Commits, tsconfig path aliases, and the Vite build (`manualChunks` vendor split, `analyze` visualizer) — is ratified in **[ADR-0007](../adr/0007-tooling-pnpm-eslint-flat-husky.md)**. The HTTP transport + runtime deps behind ports/wrappers are in **[ADR-0005](../adr/0005-http-axios-behind-port.md)**; fail-fast env validation in **[ADR-0006](../adr/0006-runtime-env-validation-zod.md)**.

> **Dependency note:** "React Helmet" is provided by **`react-helmet-async`** — the maintained, concurrent-safe successor to the unmaintained `react-helmet` (React-18 safe). See [ADR-0005](../adr/0005-http-axios-behind-port.md).

> **Next:** read **[EnvironmentGuide.md](./EnvironmentGuide.md)** for the env files, the validated schema table, precedence, the public-bundle security rule, and the add-a-var recipe.

---

_Phase 2 · Developer Guide · Companion to [Brain.md](../Brain.md) & [architecture/README.md](./README.md) · Extended with **Phase 3 — Engineering Foundation** · Last updated: 2026-06-27 · Owner: Frontend Architecture / Engineering Enablement · Status: **Foundation v3**_
