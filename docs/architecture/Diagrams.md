# ClinicOS — Architecture Diagrams (Part 7)

> **Phase 2 of the ClinicOS Frontend Engineering Bible — the visual canon.**
> This document **extends** and **never contradicts** [Phase 1 (Brain.md)](../Brain.md) or the [Phase 2 enterprise blueprint (README.md)](./README.md).
> Every diagram below is a faithful picture of laws already ratified elsewhere — it adds **clarity, not new rules**. If a diagram ever appears to conflict with a written law, **the law wins** and the diagram is the bug.

---

## 0. How to read this document

These ten diagrams are the **single visual reference** for how ClinicOS is structured and how data, control, and rendering flow through it. They use real ClinicOS vocabulary — **patient, appointment, queue, consultation, prescription, pharmacy, billing, follow-up** — so that a diagram and the code it describes share one language (DDD ubiquitous language).

**The laws every diagram obeys (restated, not redefined):**

1. **The Dependency Rule** — imports flow **downward only**: `app → processes → modules → entities → shared`. Never upward, never sideways except through a public `index.ts`. (Brain.md §5.1, README §1.)
2. **Public-API-only** — a module is reached **only** through its `index.ts`; deep imports are linted out. (README §2–3.)
3. **The Backend-Independence Pipeline** — `HTTP → DTO (Zod) → mapper → Model → Repository → Service → Query → UI`. The UI **never** touches the backend directly. (Brain.md §5.3.)
4. **State homes** — server state lives **only** in TanStack Query; UI state in Zustand; form state in React Hook Form; shareable state in the URL. (Brain.md §9.)
5. **Four async states everywhere** — Loading · Empty · Error · Success. (Brain.md §11.)
6. **Tokens, a11y, i18n are always-on** — no hardcoded color/size/string. (Brain.md §6–8.)

Each diagram is a valid [Mermaid](https://mermaid.js.org/) code block, followed by a short prose explanation and a **deep-dive cross-link** to the document that owns that topic.

---

## Table of contents

| #   | Diagram                                                      | Owned by                                                        |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| 1   | [Application Layers](#1-application-layers)                  | [Architecture.md](./Architecture.md)                            |
| 2   | [Feature/Module Architecture](#2-featuremodule-architecture) | [FeatureArchitecture.md](./FeatureArchitecture.md)              |
| 3   | [Folder Relationships](#3-folder-relationships)              | [FolderStructure.md](./FolderStructure.md)                      |
| 4   | [Request Flow](#4-request-flow)                              | [DependencyRules.md](./DependencyRules.md)                      |
| 5   | [State Flow](#5-state-flow)                                  | [Architecture.md](./Architecture.md)                            |
| 6   | [API Flow](#6-api-flow)                                      | [FeatureArchitecture.md](./FeatureArchitecture.md)              |
| 7   | [Authentication Flow](#7-authentication-flow)                | [DependencyRules.md](./DependencyRules.md)                      |
| 8   | [Rendering Flow](#8-rendering-flow)                          | [Architecture.md](./Architecture.md)                            |
| 9   | [Component Hierarchy](#9-component-hierarchy)                | [FeatureArchitecture.md](./FeatureArchitecture.md)              |
| 10  | [Brain Update Flow](#10-brain-update-flow)                   | [BrainRules.md](./BrainRules.md) · [AI_RULES.md](./AI_RULES.md) |

---

## 1. Application Layers

```mermaid
flowchart TD
    subgraph TOP["Top-level layers — imports flow downward only"]
        direction TB
        APP["app/<br/><i>composition root</i><br/>providers · router · layouts · global error boundary"]
        PROC["processes/<br/><i>cross-module journeys</i><br/>Patient Journey state machine"]
        MOD["modules/<br/><i>bounded contexts</i><br/>patients · appointments · queue · consultation<br/>prescriptions · pharmacy · billing · follow-up"]
        ENT["entities/<br/><i>global domain nouns</i><br/>patient · clinic · doctor · user · tenant"]
        SH["shared/<br/><i>zero domain knowledge</i><br/>design-system · core · api · lib · config"]
    end

    APP -->|may import| PROC
    PROC -->|may import| MOD
    MOD -->|may import| ENT
    ENT -->|may import| SH

    APP -. may import .-> MOD
    APP -. may import .-> ENT
    APP -. may import .-> SH
    PROC -. may import .-> ENT
    PROC -. may import .-> SH
    MOD -. may import .-> SH

    MOD -. "module ↔ module<br/>ONLY via index.ts" .-> MOD

    classDef forbidden stroke-dasharray: 4 4;
    SH -.->|"❌ NEVER imports upward"| ENT
```

**What it shows.** The five top-level layers and the **only** legal import directions. Solid arrows are the canonical downward chain (`app → processes → modules → entities → shared`); dotted arrows are the permitted "skip-down" shortcuts (e.g. `app` may use `shared` directly). The self-loop on `modules/` is the **single most enforced rule**: one module may reference another **only** through its public `index.ts`, never via a deep path. `shared/` and `entities/` know **nothing** about modules, and `shared/` knows nothing about the domain — that is why the upward red arrow is forbidden. This is Brain.md §5.1 and README §1, drawn.

**Deep dive:** [Architecture.md](./Architecture.md) (enterprise layer narrative) · [DependencyRules.md](./DependencyRules.md) (full import matrix).

---

## 2. Feature/Module Architecture

```mermaid
flowchart TB
    subgraph MODULE["modules/consultation/ — a mini Clean Architecture"]
        direction TB

        IDX["index.ts — PUBLIC API (only legal import surface)"]

        subgraph PRES["Presentation"]
            P1["pages/ — ConsultationPage"]
            P2["components/ — VitalsCard, DiagnosisPanel"]
            P3["hooks/ — useConsultation, useSaveNote"]
            P4["store/ — consultation UI store (Zustand)"]
        end

        subgraph APPL["Application"]
            S1["services/ — consultation.service (use-cases)"]
        end

        subgraph DOM["Domain — the stable core"]
            D1["types/ — Consultation, Diagnosis (Models + DTOs)"]
            D2["schemas/ — Zod: DTO validation + form schemas"]
            D3["validators/ — domain rules"]
            D4["constants/ — module constants"]
        end

        subgraph INFRA["Infrastructure"]
            I1["api/ — endpoints + Query/Mutation hooks"]
            I2["repositories/ — interface + impl → returns Models"]
            I3["mappers/ — DTO ⇄ Model (pure)"]
            I4["adapters/ — cross-module / 3rd-party contracts"]
        end
    end

    IDX --> PRES
    PRES -->|calls| APPL
    APPL -->|depends on interfaces of| DOM
    INFRA -->|implements| DOM
    APPL -->|orchestrates| INFRA

    PRES -. "❌ never imports Infrastructure directly" .-> INFRA
```

**What it shows.** The inside of a module (here `consultation`) is itself a **four-layer Clean Architecture**: **Presentation → Application → Domain ← Infrastructure**. Domain is the **stable core** that depends on nothing; Infrastructure implements Domain interfaces; Application orchestrates Infrastructure to fulfil use-cases; Presentation talks to Application only (via `services`/`hooks`), **never** to Infrastructure directly. The crucial labels are the **folders inside each layer**, lifted verbatim from the README §2 module template. Everything reaches the outside world through one `index.ts`. This **is** the Phase 1 backend-independence pipeline, localized to a single bounded context.

**Deep dive:** [FeatureArchitecture.md](./FeatureArchitecture.md) (module template + worked example) · [ProjectStructure.md](./ProjectStructure.md).

---

## 3. Folder Relationships

```mermaid
graph TD
    APP["app/"]
    PROC["processes/"]
    MOD["modules/&lt;context&gt;/"]
    ENT["entities/"]
    ROUTES["routes/ (global manifest)"]
    TEST["testing/"]
    MOCK["mock/ (MSW)"]
    LOC["locales/"]

    subgraph SHARED["shared/ — non-domain, cross-cutting"]
        DS["design-system/"]
        CORE["core/ (Result · AppError · DI · ports)"]
        API["api/ (HttpClient · base repo · queryClient · interceptors)"]
        LIB["lib/ (i18n · query · telemetry · storage)"]
        PERM["permissions/ (RBAC · &lt;Can&gt;)"]
        GUARD["guards/"]
        STORE["store/ (theme · locale · session)"]
        ERR["errors/ · offline/ · monitoring/"]
    end

    APP --> PROC
    APP --> ROUTES
    APP --> SHARED
    PROC --> MOD
    PROC --> ENT
    MOD --> ENT
    MOD --> SHARED
    ENT --> SHARED

    MOCK -. "mocks for" .-> API
    TEST -. "renders with" .-> SHARED
    LOC -. "consumed by" .-> LIB

    SHARED -. "❌ never imports modules/ or entities/" .-> MOD

    classDef root fill:#F8F3F0,stroke:#827473;
    class APP,PROC root;
```

**What it shows.** How the `src/` **top-level folders** relate and, critically, **who may import whom**. The backbone is the same downward chain, but this view adds the support folders: `routes/` (global path manifest consumed by `app/`), `testing/` and `mock/` (cross-cutting harnesses), and `locales/` (i18n catalogs consumed by `shared/lib`). It also expands `shared/` into its real sub-folders (`design-system`, `core`, `api`, `permissions`, `guards`, `store`, …) so you can see that even _inside_ `shared/` the dependency arrows point down toward `core`. The forbidden arrow restates the boundary law: **`shared/` may never reach up into `modules/` or `entities/`.**

**Deep dive:** [FolderStructure.md](./FolderStructure.md) (every folder's 7-field contract) · [ProjectStructure.md](./ProjectStructure.md) (barrels & ownership).

---

## 4. Request Flow

```mermaid
sequenceDiagram
    actor User as Receptionist
    participant UI as Component<br/>(BookAppointmentForm)
    participant Hook as Query/Mutation Hook<br/>(useBookAppointment)
    participant Svc as Service<br/>(appointment.service)
    participant Repo as Repository<br/>(appointment.repository)
    participant Map as Mapper<br/>(appointment.mapper)
    participant Http as HttpClient
    participant BE as Backend API

    User->>UI: Click "Book appointment"
    UI->>Hook: mutate(formModel)
    Hook->>Svc: bookAppointment(model)
    Svc->>Repo: create(model)
    Repo->>Map: toDto(model)
    Map-->>Repo: AppointmentDto
    Repo->>Http: POST /appointments {dto}
    Http->>BE: HTTP request (+ interceptors)
    BE-->>Http: 201 {raw appointment dto}
    Http-->>Repo: response
    Repo->>Map: toModel(dto)  ·  Zod-validate at boundary
    Map-->>Repo: Appointment (Model)
    Repo-->>Svc: Appointment
    Svc-->>Hook: Appointment
    Hook-->>UI: onSuccess → invalidate ['appointments']
    UI-->>User: Success toast + updated queue
```

**What it shows.** One full round-trip for a real action — a receptionist **booking an appointment** — walking the exact pipeline from Brain.md §5.3. The user's action enters a **component**, which calls a **query/mutation hook** (the only React-facing surface), which calls a **service** (business rules), which calls a **repository**. The repository uses the **mapper** to convert the domain `Model` → `Dto`, sends it through `HttpClient` (where interceptors attach auth/trace headers), and on the way back maps the raw `Dto` → `Model` with **Zod validation at the boundary**. The component only ever sees stable `Model`s; it never sees a DTO. On success the hook invalidates the `['appointments']` query key (see Diagram 5).

**Deep dive:** [DependencyRules.md](./DependencyRules.md) (call-direction rules) · [FeatureArchitecture.md](./FeatureArchitecture.md).

---

## 5. State Flow

```mermaid
flowchart LR
    subgraph SERVER["Server state — TanStack Query (single source of truth)"]
        QC[("Query cache<br/>['patients'] · ['queue']<br/>['appointments'] · ['prescriptions']")]
    end
    subgraph CLIENT["Client UI state — Zustand"]
        ZU["theme · locale · activeClinic<br/>sidebar · consultation drafts"]
    end
    subgraph URL["URL state — Router search params"]
        UR["?status=waiting · ?tab=vitals<br/>?page=2 · filters"]
    end
    subgraph FORM["Form state — React Hook Form"]
        RHF["field values · validation (Zod)<br/>dirty · touched"]
    end

    QC -->|"reads"| UICOMP["UI Components"]
    ZU -->|"reads"| UICOMP
    UR -->|"reads"| UICOMP
    RHF -->|"reads"| UICOMP

    UICOMP -. "❌ never copy server data into Zustand" .-> ZU
```

```mermaid
sequenceDiagram
    participant Form as RHF Form
    participant Mut as useDispensePrescription (mutation)
    participant Svc as pharmacy.service
    participant Cache as Query Cache
    participant List as PharmacyQueue (subscriber)

    Form->>Mut: submit(dispenseModel)
    Mut->>Svc: dispense(model)
    Svc-->>Mut: updated Prescription
    Note over Mut,Cache: onSuccess
    Mut->>Cache: invalidateQueries(['prescriptions'])
    Mut->>Cache: invalidateQueries(['queue'])
    Cache->>List: refetch → re-render
    List-->>List: Loading → Success (4 states)
```

**What it shows.** The **four homes of state** (Brain.md §9) and the **golden anti-pattern**: server data lives **only** in the TanStack Query cache and is **never copied into Zustand**. The first diagram maps each state kind to its owner — server (Query), client UI (Zustand), URL (router search params), form (React Hook Form). The second shows the mutation→invalidation contract: dispensing a **prescription** in the pharmacy module triggers `onSuccess → invalidateQueries(['prescriptions'], ['queue'])`, which makes every subscriber (the pharmacy queue) refetch and re-render through the **four async states**. No manual cache surgery, no duplicated state.

**Deep dive:** [Architecture.md](./Architecture.md) (state strategy) · [FeatureArchitecture.md](./FeatureArchitecture.md) (where stores live).

---

## 6. API Flow

```mermaid
flowchart TD
    HTTP["Backend HTTP response<br/>(raw JSON)"]
    INT["Interceptors<br/>auth header · tenant id · trace id · retry · error map"]
    DTO["DTO<br/>(raw backend shape — api/dto)"]
    ZOD{"Zod validation<br/>at the boundary"}
    MAP["Mapper<br/>toModel (pure)"]
    MODEL["Domain Model<br/>(stable, UI-shaped)"]
    REPO["Repository<br/>(returns Models, never DTOs)"]
    SVC["Service / use-case<br/>(business rules)"]
    CACHE[("TanStack Query cache")]
    UI["UI Component<br/>(4 states: load/empty/error/success)"]
    ERR["AppError<br/>(typed · localized message)"]

    HTTP --> INT --> DTO --> ZOD
    ZOD -->|valid| MAP --> MODEL --> REPO --> SVC --> CACHE --> UI
    ZOD -->|invalid| ERR
    INT -->|non-2xx| ERR
    ERR --> UI
```

**What it shows.** The **inbound** half of the backend-independence pipeline in detail. A raw HTTP response passes through **interceptors** (which attach auth/tenant/trace headers on the way out and map transport errors on the way back), surfaces as a **DTO** matching the backend's exact shape, and is **Zod-validated at the boundary**. Valid data flows `mapper → Model → Repository → Service → Query cache → UI`; **invalid** data (or a non-2xx response) becomes a typed, localized `AppError` that the UI renders as its **Error** state. This is the mechanical guarantee behind "10 years without a rewrite": a backend field rename touches **one mapper**, and nothing above the `Model` line ever notices.

**Deep dive:** [FeatureArchitecture.md](./FeatureArchitecture.md) (api/mappers/repositories) · [DependencyRules.md](./DependencyRules.md).

---

## 7. Authentication Flow

```mermaid
sequenceDiagram
    actor User as Doctor
    participant Login as LoginPage
    participant AuthSvc as auth.service
    participant Token as Token storage<br/>(memory + secure)
    participant Session as session store (Zustand)
    participant Guard as Route Guard / &lt;Can&gt;
    participant Route as Protected route<br/>(/consultation/:id)
    participant Http as HttpClient interceptor

    User->>Login: submit credentials
    Login->>AuthSvc: login(credentials)
    AuthSvc->>Token: store access + refresh token
    AuthSvc->>Session: set user · roles · permissions · tenant
    Session-->>Guard: session ready
    User->>Route: navigate /consultation/:id
    Guard->>Session: hasPermission('consultation:write')?
    alt authorized
        Guard-->>Route: render (permission-gated UI via <Can>)
    else denied
        Guard-->>User: redirect /forbidden
    end

    Note over Http,Token: during any request
    Http->>Token: attach access token
    Http->>AuthSvc: 401 → refresh()
    AuthSvc->>Token: rotate tokens
    Http-->>Route: retry original request

    Note over Session: idle timeout / logout
    Session->>Token: clear tokens
    Session->>User: redirect /login
```

**What it shows.** The full session lifecycle. **Login** runs through `auth.service`, which stores tokens (access in memory, refresh in secure storage) and hydrates the **session store** (Zustand) with user, roles, **permissions**, and active tenant — consistent with Brain.md §9 (auth session is global UI state) and §3 (multi-tenant, role/permission matrix). **Route guards** and the `<Can>` component gate both routes and individual UI affordances by permission (e.g. `consultation:write`). The `HttpClient` interceptor transparently attaches the access token and, on a `401`, calls `refresh()` to rotate tokens and **retry** the original request. **Idle-timeout or explicit logout** clears tokens and returns the user to login.

**Deep dive:** [DependencyRules.md](./DependencyRules.md) (guards & permissions placement) · [FolderStructure.md](./FolderStructure.md) (`shared/permissions`, `shared/guards`).

---

## 8. Rendering Flow

```mermaid
flowchart TD
    BOOT["app bootstrap (main.tsx)"]
    PROV["Providers<br/>QueryClient · i18n · Theme · Session · Router"]
    ROUTER["Router (data router)"]
    LAZY["Lazy module route<br/>(React.lazy + Suspense)"]
    LAYOUT["Layout<br/>(AppShell · nav · header)"]
    PAGE["Page<br/>(ConsultationPage)"]
    WIDGET["Widgets<br/>(VitalsPanel · PrescriptionEditor)"]
    COMP["Feature & entity components<br/>(VitalsCard · PatientHeader)"]

    BOOT --> PROV --> ROUTER --> LAZY

    LAZY -->|Suspense fallback| SKEL["Loading skeletons"]
    LAZY -->|errors caught by| EB["Error Boundary → Error state"]
    LAZY --> LAYOUT --> PAGE --> WIDGET --> COMP

    COMP --> ST{"async state?"}
    ST -->|loading| SKEL
    ST -->|empty| EMPTY["Empty: illustration + 1 CTA"]
    ST -->|error| EBERR["Error: localized + retry"]
    ST -->|success| OK["Success: content + feedback"]
```

**What it shows.** How a screen comes to life, top to bottom. App **bootstrap** mounts the **providers** (QueryClient, i18n, Theme, Session, Router), the **data router** resolves a **lazily code-split module route** wrapped in `Suspense` (skeleton fallback) and an **error boundary**, then renders **Layout → Page → Widgets → Feature/entity components**. Crucially, every data-driven node resolves into exactly one of the **four async states** from Brain.md §11 — Loading (skeletons, no layout shift), Empty (illustration + one CTA), Error (typed, localized, retry), Success (content + feedback). Code-splitting at the module boundary is what keeps the initial bundle small at enterprise scale.

**Deep dive:** [Architecture.md](./Architecture.md) (bootstrap & providers) · [FeatureArchitecture.md](./FeatureArchitecture.md) (pages & widgets).

---

## 9. Component Hierarchy

```mermaid
flowchart TD
    APP["App (composition root)"]
    PROV["Providers<br/>Query · i18n · Theme · Session"]
    LAYOUT["AppShell Layout<br/>(SideNav · TopBar · ClinicSwitcher)"]
    PAGE["ConsultationPage"]

    subgraph WIDGETS["Widgets (self-sufficient blocks)"]
        W1["PatientSummaryWidget"]
        W2["VitalsPanelWidget"]
        W3["PrescriptionEditorWidget"]
    end

    subgraph FEATURE["Feature components (consultation module)"]
        F1["DiagnosisForm"]
        F2["AddPrescriptionItem"]
        F3["SaveConsultationButton"]
    end

    subgraph ENTITY["Entity components (global)"]
        E1["PatientHeader (entities/patient)"]
        E2["VitalsCard (entities/patient)"]
        E3["MedicineSelect (entities/prescription)"]
    end

    subgraph DS["Design-system primitives (shared)"]
        P1["Button · Input · Select"]
        P2["Card · Dialog · Toast"]
        P3["Skeleton · EmptyState"]
    end

    APP --> PROV --> LAYOUT --> PAGE
    PAGE --> W1 & W2 & W3
    W1 --> E1
    W2 --> E2
    W3 --> F1 & F2 & F3
    F2 --> E3
    F1 --> P1 & P2
    E1 --> P2
    E2 --> P2
    E3 --> P1
    F3 --> P1
    P3 -. "loading/empty fallbacks" .-> W1 & W2 & W3
```

**What it shows.** A **real ClinicOS screen — the Consultation page — drawn as a render tree**, demonstrating the composition order: `App → Providers → Layout → Page → Widgets → Feature components → Entity components → design-system primitives`. Note the layering discipline: **widgets** are large self-sufficient blocks; **feature components** belong to the `consultation` module; **entity components** (`PatientHeader`, `VitalsCard`, `MedicineSelect`) are global and reused across modules from `entities/`; and at the leaves, everything bottoms out in **tokenized design-system primitives** from `shared/design-system`. Dependencies only ever point downward — exactly Diagram 1, expressed as components instead of folders.

**Deep dive:** [FeatureArchitecture.md](./FeatureArchitecture.md) (component layering) · [FolderStructure.md](./FolderStructure.md) (`entities/`, `shared/design-system`).

---

## 10. Brain Update Flow

```mermaid
flowchart TD
    CHANGE["A change lands<br/>(new module · new endpoint · ADR · token · permission)"]

    Q1{"What kind of change?"}
    CHANGE --> Q1

    Q1 -->|new/edited module| MB["Update module BRAIN.md<br/>(decisions · local registries · TODOs · debt)"]
    Q1 -->|structural / cross-cutting| ADR["Write ADR<br/>(docs/adr/NNNN-*.md)"]

    MB --> REG["Update PROJECT_BRAIN registries<br/>(modules · routes · permissions · endpoints · tokens)"]
    ADR --> REG

    REG --> CL["Append to changelog<br/>(what · why · when · who)"]
    CL --> XREF["Re-check cross-links & diagrams<br/>(this doc, Architecture.md)"]
    XREF --> GATE{"PR gate:<br/>Brain updated?"}

    GATE -->|no| BLOCK["❌ PR blocked"]
    GATE -->|yes| MERGE["✅ Merge — Brain stays the source of truth"]

    BLOCK -. "fix & resubmit" .-> CHANGE
```

**What it shows.** How any change keeps the project's "brain" honest. When a change lands — a new module, a new endpoint, an ADR, a token, or a permission — it must propagate: **module-local** changes update that module's `BRAIN.md`; **structural** changes additionally require an **ADR**. Both paths then update the live **PROJECT_BRAIN registries** (modules, routes, permissions, endpoints, tokens), append a **changelog** entry, and **re-verify cross-links and diagrams** (including this document). The **PR gate** blocks any merge whose brain/registry wasn't updated — this is what makes the documentation a _living_ source of truth rather than stale prose. The same workflow is mandatory for **AI agents**, who must read the brain before acting and update it after.

**Deep dive:** [BrainRules.md](./BrainRules.md) (registry & changelog maintenance) · [AI_RULES.md](./AI_RULES.md) (mandatory AI update workflow) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) (the registries themselves).

---

_Phase 2 · Part 7 (Diagrams) · Foundation v2 · 2026-06-27 · Owner: Frontend Architecture · Extends [Brain.md](../Brain.md) & [README.md](./README.md), contradicts neither._
