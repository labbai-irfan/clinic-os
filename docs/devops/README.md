# ClinicOS — DevOps & Automation Platform

> **Phase 10 · The permanent DevOps and Automation platform for ClinicOS.**
> This canon turns "ship software" into an **automated, enforced, reproducible
> system**: git strategy → GitHub architecture → CI/CD → versioning → release →
> phase automation → docs → deploy → monitoring → security. It **extends** and
> never contradicts [Brain.md](../Brain.md) (Phase 1 constitution),
> [architecture/README.md](../architecture/README.md) (Phase 2 anchor),
> [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) (living memory), and the
> [Engineering Quality Platform](../engineering/README.md) (Phase 9, the merge bar).

ClinicOS is a **Clinic Operating System** — healthcare SaaS architected for a
**10+ year horizon at a billion-dollar quality bar**. The Engineering Quality
Platform (Phase 9) defined _what good code is_ and enforced it per-PR. This
platform defines **how code travels from a developer's branch to a clinic's
screen — safely, automatically, and the same way every time.**

This is **not a UI / component / feature phase.** It ships pipelines, policies,
and automation — the rails everything else rides on.

---

## 📜 The canon (read in this order)

| #   | Document                                                       | What it gives you                                                     | Part |
| --- | -------------------------------------------------------------- | --------------------------------------------------------------------- | ---- |
| 1   | **[GitStrategy.md](./GitStrategy.md)**                         | Branch model, merge/commit/tag/version/rollback strategy + the _why_  | 1    |
| 2   | **[GitHubArchitecture.md](./GitHubArchitecture.md)**           | Repo standards, labels, milestones, templates, CODEOWNERS, protection | 2    |
| 3   | **[CICDPipeline.md](./CICDPipeline.md)**                       | Every GitHub Actions workflow, step by step                           | 3    |
| 4   | **[VersionManagement.md](./VersionManagement.md)**             | SemVer, pre-release channels, tags, milestones                        | 4    |
| 5   | **[ReleaseManagement.md](./ReleaseManagement.md)**             | Release notes, GitHub Releases, changelog automation                  | 4·10 |
| 6   | **[PhaseCompletionPipeline.md](./PhaseCompletionPipeline.md)** | The deterministic end-of-phase automation                             | 5·14 |
| 7   | **[DocumentationAutomation.md](./DocumentationAutomation.md)** | What is generated/validated and how docs never rot                    | 6    |
| 8   | **[Deployment.md](./Deployment.md)**                           | Environments, promotion, approvals, health/smoke, rollback            | 7    |
| 9   | **[Monitoring.md](./Monitoring.md)**                           | Health, performance, bundle, errors, analytics, alerts                | 8    |
| 10  | **[Security.md](./Security.md)**                               | Dependency/secret/code scanning, license, build/branch protection     | 9    |
| 11  | **[DeveloperWorkflow.md](./DeveloperWorkflow.md)**             | The practical day-to-day: branch → PR → merge → release → rollback    | 11   |
| 12  | **[AutomationAIRules.md](./AutomationAIRules.md)**             | The binding DevOps/release contract for AI agents                     | 12   |
| —   | **[DevOpsRegistry.md](./DevOpsRegistry.md)**                   | The single registry of every workflow, script, config, environment    | 13   |

---

## 🚦 The platform in 60 seconds

```
Git strategy      →  how branches/commits/tags are shaped     (GitStrategy.md)
GitHub config     →  templates · labels · CODEOWNERS · rules   (.github/**)
CI/CD             →  gate every push/PR, publish every tag     (.github/workflows/**)
Versioning        →  SemVer from commit/PR labels              (VersionManagement.md)
Phase pipeline    →  one command closes a phase               (scripts/phase/complete-phase.mjs)
Release           →  tag → auto GitHub Release + notes         (.github/workflows/release.yml)
Deploy            →  env-gated, approval-guarded, smoke-tested (.github/workflows/deploy.yml)
Monitor / secure  →  budgets · CodeQL · Dependabot · scans     (Monitoring.md · Security.md)
```

**One command closes a phase:**

```bash
pnpm phase:complete -- --phase 10 --version 0.10.0      # dry run: gate + paperwork + notes
pnpm phase:complete -- --phase 10 --version 0.10.0 --execute   # also commit · tag · push
```

It refuses to tag unless the quality gate is green **and** the Brain, docs, and
phase report are in order — so "phase complete" means the same thing every time.

---

## 🧱 What this phase added

| Area              | Artifacts                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GitHub governance | `.github/CODEOWNERS`, `pull_request_template.md`, `ISSUE_TEMPLATE/*`, `labels.yml`, `labeler.yml`, `BRANCH_PROTECTION.md`     |
| Workflows         | `ci.yml` (extended), `codeql.yml`, `dependency-review.yml`, `release-drafter.yml`, `labeler.yml`, `release.yml`, `deploy.yml` |
| Dependency mgmt   | `.github/dependabot.yml`                                                                                                      |
| Release config    | `.github/release-drafter.yml`, generated `.github/release-body.md`                                                            |
| Automation        | `scripts/phase/complete-phase.mjs`, `scripts/release/generate-release-notes.mjs`                                              |
| Validators        | `scripts/quality/validate-docs.mjs`, `scripts/quality/validate-brain.mjs` (wired into `verify` + CI)                          |
| Scripts           | `pnpm phase:complete`, `release:notes`, `validate:docs`, `validate:brain`                                                     |
| Docs              | this `docs/devops/` canon (14 documents)                                                                                      |

---

## 🏛️ Governance

This platform is the operational sibling of the [Engineering Quality Platform](../engineering/README.md).
Pipelines and policies only **tighten** over time; loosening a gate, a budget, a
branch-protection rule, or a security control requires an **ADR**
(`docs/adr/NNNN-*.md`) and a [PROJECT_BRAIN](../brain/PROJECT_BRAIN.md) update.
The DevOps platform itself is registered as **ADR-0014**.

_Phase 10 · DevOps & Automation Platform · Owner: Platform Engineering · Status: **Foundation v10** · 2026-06-30_
