# ClinicOS — Frontend Foundation

> The complete architectural foundation for **ClinicOS**, a Clinic Operating System designed to digitize the entire lifetime patient journey and to last **10+ years without an architectural rewrite**.

This `docs/` folder is the **governing canon** for all ClinicOS frontend work. Read it before writing code.

---

## 📜 Start here

**→ [Brain.md](./Brain.md)** — the single source of truth. Every developer and every AI agent reads this first.

---

## 🗺️ The canon

| #   | Document                                                                   | What it gives you                                                        | When to read                                  |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| 0   | **[Brain.md](./Brain.md)**                                                 | Source of truth: laws, stack, architecture, tokens, index                | First. Always.                                |
| 1   | **[Frontend-Foundation-Blueprint.md](./Frontend-Foundation-Blueprint.md)** | The 40-section master architecture document with full decision rationale | To understand _why_ anything is the way it is |
| 2   | **[Architecture.md](./Architecture.md)**                                   | Layers, data flow, DI, bounded contexts, diagrams + code                 | Building features; wiring data                |
| 3   | **[Frontend-Bible.md](./Frontend-Bible.md)**                               | Design system: tokens, themes, typography, components, a11y              | Building UI                                   |
| 4   | **[Folder-Structure.md](./Folder-Structure.md)**                           | Canonical tree + slice anatomy + "where does this go?"                   | Creating any file                             |
| 5   | **[Naming-Convention.md](./Naming-Convention.md)**                         | Files, folders, symbols, i18n keys, tokens, git                          | Naming anything                               |
| 6   | **[Coding-Standards.md](./Coding-Standards.md)**                           | Day-to-day React/TS with ✅/❌ examples                                  | Writing code                                  |
| 7   | **[Developer-Rules.md](./Developer-Rules.md)**                             | The enforceable ALWAYS / NEVER rulebook                                  | Before a PR; while reviewing                  |
| 8   | **[Documentation-Guidelines.md](./Documentation-Guidelines.md)**           | How we document + the ADR process                                        | Recording a decision                          |
| 9   | **[AI-Rules.md](./AI-Rules.md)**                                           | Constitution for AI agents working in this repo                          | Before any AI-generated change                |
| 10  | **[Project-Checklist.md](./Project-Checklist.md)**                         | Foundation setup + per-PR Definition of Done                             | Bootstrapping; every PR                       |

---

## 🧭 The foundation in 60 seconds

- **Architecture:** Feature-Sliced Design (structure) + Domain-Driven Design (language) + Clean Architecture (decoupling).
- **Dependency Rule (enforced):** `app → processes → pages → widgets → features → entities → shared`. Imports flow **downward only**, and only through a slice's public `index.ts`.
- **Backend independence:** `HTTP → DTO (Zod-validated) → mapper → Domain Model → Repository → Service → Query hook → Component`. The UI never sees the backend. Backend reshapes an API → change **one mapper**.
- **Visual contract:** 3-tier design tokens (Primitive → Semantic → Component). Brand: Primary `#E87D7D`, Surface `#F8F3F0`, Accent `#6B8E8E`, Neutral `#827473`. Type: Plus Jakarta Sans + Inter. **Never hardcode** a color, size, or string.
- **Always-on:** WCAG 2.2 AA accessibility, full localization (en/hi/mr/ur + RTL, runtime switch), and loading/empty/error/success on every async surface.
- **Stack:** React 18 · TypeScript (strict) · Vite · TanStack Query · Zustand · React Hook Form · Zod · React Router · Tailwind (token-mapped) · i18next · Vitest/RTL/Playwright · Storybook · MSW.

---

## ✅ The reading paths

```
New developer   : Brain → Architecture → Folder-Structure → Coding-Standards
AI agent        : Brain → AI-Rules → (Folder-Structure + Naming + Coding-Standards)
Reviewer        : Developer-Rules → Project-Checklist
Designer        : Frontend-Bible
Architect       : Frontend-Foundation-Blueprint
```

---

## 🏗️ Phase 2 — Enterprise Architecture (Foundation v2)

Phase 2 scales the foundation to **thousands of clinics, hundreds of developers, and many teams** — preserving every Phase 1 law and evolving only the physical organization to **domain modules**. Start at the Phase 2 anchor:

**→ [architecture/README.md](./architecture/README.md)** — Phase 2 anchor (reconciliation + authoritative trees + index)
**→ [brain/PROJECT_BRAIN.md](./brain/PROJECT_BRAIN.md)** — the permanent project memory + all registries

| Document                                                                           | Purpose                                                                 |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [architecture/Architecture.md](./architecture/Architecture.md)                     | Enterprise architecture narrative (scale, multi-tenant, platform reach) |
| [architecture/FolderStructure.md](./architecture/FolderStructure.md)               | Every folder with its 7-field contract                                  |
| [architecture/ProjectStructure.md](./architecture/ProjectStructure.md)             | File organization, module communication, barrels, ownership             |
| [architecture/FeatureArchitecture.md](./architecture/FeatureArchitecture.md)       | The identical module template + worked example                          |
| [architecture/NamingConvention.md](./architecture/NamingConvention.md)             | Naming for everything (extends Phase 1)                                 |
| [architecture/DependencyRules.md](./architecture/DependencyRules.md)               | Import matrix + anti-God rules + lint enforcement                       |
| [architecture/Diagrams.md](./architecture/Diagrams.md)                             | 10 architecture diagrams                                                |
| [architecture/BrainRules.md](./architecture/BrainRules.md)                         | How the permanent memory + registries are maintained                    |
| [architecture/AI_RULES.md](./architecture/AI_RULES.md)                             | AI development rules + mandatory update workflow                        |
| [architecture/DeveloperGuide.md](./architecture/DeveloperGuide.md)                 | Onboarding + build-a-feature end-to-end                                 |
| [adr/0001-domain-module-architecture.md](./adr/0001-domain-module-architecture.md) | ADR-0001 — the domain-module decision                                   |

---

## 🛡️ Phase 9 — Engineering Quality Platform (Foundation v9)

The permanent **Quality Assurance System** that governs every future feature: 22 engineering standards, a 12-gate automated PR pipeline (`pnpm quality`), enterprise lint rules, architecture/performance/accessibility/localization validators, the Definition of Done, per-artifact review checklists, and the AI quality contract. Start at the engineering anchor:

**→ [engineering/README.md](./engineering/README.md)** — Phase 9 anchor (standards → gates → checklists)

| Document                                                                           | Purpose                                                  |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [engineering/EngineeringStandards.md](./engineering/EngineeringStandards.md)       | The standard for every artifact (architecture → git)     |
| [engineering/QualityGates.md](./engineering/QualityGates.md)                       | The 12 automated PR gates                                |
| [engineering/LintRules.md](./engineering/LintRules.md)                             | Every enterprise lint rule, explained                    |
| [engineering/ArchitectureValidation.md](./engineering/ArchitectureValidation.md)   | Folder/naming/layer/barrel/isolation validation          |
| [engineering/PerformanceBudgets.md](./engineering/PerformanceBudgets.md)           | JS/CSS/font/image/page budgets + Web Vitals              |
| [engineering/AccessibilityValidation.md](./engineering/AccessibilityValidation.md) | WCAG 2.2 AA validation (keyboard → RTL)                  |
| [engineering/LocalizationValidation.md](./engineering/LocalizationValidation.md)   | Missing/unused keys, RTL, ICU, Intl, terminology         |
| [engineering/DocumentationStandards.md](./engineering/DocumentationStandards.md)   | What every feature must document                         |
| [engineering/DefinitionOfDone.md](./engineering/DefinitionOfDone.md)               | The complete, gated Definition of Done                   |
| [engineering/ReviewChecklists.md](./engineering/ReviewChecklists.md)               | Per-artifact reviewer checklists                         |
| [engineering/AIQualityRules.md](./engineering/AIQualityRules.md)                   | The binding quality contract for AI agents               |
| [engineering/QualityRegistry.md](./engineering/QualityRegistry.md)                 | The living registry of standards, gates, budgets, owners |

---

## 🚀 Phase 10 — DevOps & Automation Platform (Foundation v10)

The permanent **delivery platform** governing how every change ships: a trunk-based git strategy, the GitHub collaboration architecture, the full CI/CD pipeline, SemVer versioning, automated releases, a deterministic phase-completion pipeline, documentation automation, deployment, monitoring, and security. Start at the DevOps anchor:

**→ [devops/README.md](./devops/README.md)** — Phase 10 anchor (git → CI/CD → release → deploy → secure)

| Document                                                                 | Purpose                                                    |
| ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| [devops/GitStrategy.md](./devops/GitStrategy.md)                         | Branch/merge/commit/tag/version/rollback strategy + why    |
| [devops/GitHubArchitecture.md](./devops/GitHubArchitecture.md)           | Repo standards, labels, templates, CODEOWNERS, protection  |
| [devops/CICDPipeline.md](./devops/CICDPipeline.md)                       | Every GitHub Actions workflow, step by step                |
| [devops/VersionManagement.md](./devops/VersionManagement.md)             | SemVer, pre-release channels, tags, milestones             |
| [devops/ReleaseManagement.md](./devops/ReleaseManagement.md)             | Release notes, GitHub Releases, changelog automation       |
| [devops/PhaseCompletionPipeline.md](./devops/PhaseCompletionPipeline.md) | The deterministic end-of-phase automation                  |
| [devops/DocumentationAutomation.md](./devops/DocumentationAutomation.md) | What is generated/validated and how docs never rot         |
| [devops/Deployment.md](./devops/Deployment.md)                           | Environments, promotion, approvals, health/smoke, rollback |
| [devops/Monitoring.md](./devops/Monitoring.md)                           | Health, performance, bundle, errors, alerts                |
| [devops/Security.md](./devops/Security.md)                               | Dependency/secret/code scanning, license, protection       |
| [devops/DeveloperWorkflow.md](./devops/DeveloperWorkflow.md)             | The practical day-to-day: branch → PR → release → rollback |
| [devops/AutomationAIRules.md](./devops/AutomationAIRules.md)             | The binding DevOps/release contract for AI agents          |
| [devops/DevOpsRegistry.md](./devops/DevOpsRegistry.md)                   | The single registry of workflows, scripts, configs, envs   |

---

## 🏛️ Governance

Every architectural decision in this canon states **Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise considerations**. Changes to the foundation go through an **ADR** (see [Documentation-Guidelines.md](./Documentation-Guidelines.md) and [adr/](./adr/)). This blueprint governs **every future phase** of ClinicOS development.

_Foundation v1 (Phase 1) → v10 (Phase 10) · 2026-06-30 · Owner: Frontend Architecture / Platform Engineering_
