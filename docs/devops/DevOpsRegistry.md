# DevOps Registry (Phase 10 · Part 13)

> The single registry of the ClinicOS delivery platform: every workflow, script,
> config, environment, and policy — with its purpose and source of truth. This is
> the DevOps analogue of the [Quality Registry](../engineering/QualityRegistry.md):
> a registry-of-automation that prevents drift and duplication. When a pipeline
> artifact is added/changed/removed, its row here changes in the same PR.

---

## 1. Workflows (`.github/workflows/`)

| Workflow                | Trigger                          | Permissions (max)               | Part |
| ----------------------- | -------------------------------- | ------------------------------- | ---- |
| `ci.yml`                | push `main`, PR                  | read                            | 3    |
| `codeql.yml`            | push `main`, PR, weekly cron     | `security-events: write`        | 9    |
| `dependency-review.yml` | PR                               | `pull-requests: write`          | 9    |
| `labeler.yml`           | PR; push `labels.yml`            | `pull-requests/issues: write`   | 2·10 |
| `release-drafter.yml`   | push `main`, PR                  | `contents/pull-requests: write` | 4·10 |
| `release.yml`           | push tag `v*.*.*`                | `contents: write`               | 4·10 |
| `deploy.yml`            | dispatch · push `main` · release | `deployments: write`            | 7    |

## 2. Scripts (`scripts/`)

| Script                                 | `pnpm` alias     | Purpose                             | Part   |
| -------------------------------------- | ---------------- | ----------------------------------- | ------ |
| `phase/complete-phase.mjs`             | `phase:complete` | Deterministic phase closure         | 5·14   |
| `release/generate-release-notes.mjs`   | `release:notes`  | Notes + version inference           | 4·6·10 |
| `quality/validate-docs.mjs`            | `validate:docs`  | Doc-canon presence + link integrity | 3·6    |
| `quality/validate-brain.mjs`           | `validate:brain` | Brain consistency + ADR-marker sync | 3·5    |
| `quality/quality-gate.mjs` _(Phase 9)_ | `quality`        | Runs all gates + report             | —      |
| `ds-registry.mjs` _(Phase 8)_          | `ds:registry`    | Component registry validation       | —      |

## 3. GitHub config (`.github/`)

| File                          | Role                                        | Part |
| ----------------------------- | ------------------------------------------- | ---- |
| `CODEOWNERS`                  | Path → accountable reviewer (team topology) | 2    |
| `pull_request_template.md`    | PR contract (gates · 8 laws · rollback)     | 2    |
| `ISSUE_TEMPLATE/*`            | Bug / feature / chore + chooser             | 2    |
| `labels.yml`                  | Label taxonomy (source of truth)            | 2·10 |
| `labeler.yml`                 | Path → `area:` label rules                  | 10   |
| `release-drafter.yml`         | Notes grouping + SemVer resolver            | 4·10 |
| `release-body.md` (generated) | Curated notes for the next release          | 4    |
| `dependabot.yml`              | Weekly grouped dependency PRs               | 8·9  |
| `BRANCH_PROTECTION.md`        | Declared branch-protection config           | 2·9  |

## 4. Environments

| Environment | Source            | Approval        | Doc                              |
| ----------- | ----------------- | --------------- | -------------------------------- |
| development | local             | —               | [Deployment.md](./Deployment.md) |
| preview     | PR / branch       | —               | Deployment.md                    |
| staging     | `main`            | —               | Deployment.md                    |
| production  | published Release | **manual gate** | Deployment.md                    |

## 5. Policies

| Policy                           | Source                                                                | Part |
| -------------------------------- | --------------------------------------------------------------------- | ---- |
| Trunk-based + squash + linear    | [GitStrategy.md](./GitStrategy.md)                                    | 1    |
| Conventional Commits             | [commitlint.config.cjs](../../commitlint.config.cjs) + GitStrategy §6 | 1    |
| SemVer (derived)                 | [VersionManagement.md](./VersionManagement.md)                        | 4    |
| Branch protection (`main`, tags) | [BRANCH_PROTECTION.md](../../.github/BRANCH_PROTECTION.md)            | 2·9  |
| Least-privilege CI               | [Security.md](./Security.md) §5                                       | 9    |
| Loosening a control needs an ADR | [AutomationAIRules.md](./AutomationAIRules.md)                        | 12   |

## 6. Version / release state

| Field             | Value                                                 |
| ----------------- | ----------------------------------------------------- |
| Current version   | `0.10.0` (`package.json` + tag `v0.10.0`)             |
| Versioning        | SemVer, derived from Conventional Commits / PR labels |
| Release trigger   | push `v*.*.*` tag → `release.yml`                     |
| Pre-release       | `-alpha.N` / `-beta.N` / `-rc.N` (auto-marked)        |
| Authoritative log | [PROJECT_BRAIN §41](../brain/PROJECT_BRAIN.md)        |

## Update rule

Add/edit a row here whenever a workflow, script, config, environment, or policy is
added, changed, or removed — in the **same PR**. This registry is the fast index;
the prose docs in this folder are the detail; the [Brain](../brain/PROJECT_BRAIN.md)
is the permanent memory.

---

_Part 13 of the [DevOps Platform](./README.md)._
