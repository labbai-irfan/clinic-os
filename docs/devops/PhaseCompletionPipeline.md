# Phase Completion Pipeline (Phase 10 · Part 5 + Part 14)

> The single, deterministic command that **closes a development phase**. It exists
> so that "phase complete" means _exactly the same thing_ every time — gate green,
> Brain updated, docs valid, report written, release notes generated, tag pushed —
> no step forgotten, no order improvised.

Entry point: [`scripts/phase/complete-phase.mjs`](../../scripts/phase/complete-phase.mjs)
→ `pnpm phase:complete`.

---

## 1. What "complete" means

A phase is complete only when **all** of these hold. The pipeline checks them and
**refuses to tag** if any fail:

1. The full quality gate is **green** (`pnpm verify`).
2. The **Brain** is updated and internally consistent (`pnpm validate:brain`).
3. The **docs canon** is present and link-clean (`pnpm validate:docs`).
4. A **phase report** exists at `docs/reports/phase-0NN-report.md`.
5. **Release notes** are generated for the version.
6. The commit/tag/push (and thus the GitHub Release) can proceed.

## 2. Running it

```bash
# Dry run — runs the gate + all checks, generates notes, PRINTS the git commands:
pnpm phase:complete -- --phase 10 --version 0.10.0

# Same, but also commit · tag · push (triggers release.yml):
pnpm phase:complete -- --phase 10 --version 0.10.0 --execute

# Fast local pre-check (skips heavy build/test in the gate):
pnpm phase:complete -- --phase 10 --version 0.10.0 --quick
```

| Flag                | Effect                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| `--phase <N>`       | Phase number (→ `docs/reports/phase-0NN-report.md`). **Required.**        |
| `--version <X.Y.Z>` | Release version → tag `vX.Y.Z`. **Required.**                             |
| `--quick`           | Use `quality:quick` (skip build/test) for a fast local pre-check.         |
| `--execute`         | Actually run `git add/commit/tag/push`. Default is a **dry run**.         |
| `--message "…"`     | Override the commit message (default `chore(release): phase N — vX.Y.Z`). |

**Safe by default.** Without `--execute` the pipeline performs **no git writes** —
it validates and prints. It never force-pushes, never amends, and aborts the
moment a check fails (printing the failure, running no git commands).

## 3. The steps (in order)

```
[1] Quality gate          pnpm verify           (or quality:quick with --quick)
[2] Paperwork             phase report exists · validate:brain · validate:docs
[3] Release notes         generate-release-notes.mjs --version vX.Y.Z  → release-body.md
[4] Commit · tag · push   git add -A · commit · tag -a vX.Y.Z · push HEAD · push tag
                          (printed in dry run · executed with --execute)
```

Pushing the tag hands off to [`release.yml`](./CICDPipeline.md#6-releaseyml--publish-a-release),
which re-verifies, builds, and publishes the GitHub Release.

## 4. The end-of-phase checklist (Part 5 + 14)

The pipeline automates the **mechanical** steps and **gates** the rest. The full
phase-closure checklist — what an author/agent updates _before_ running it:

| Item (Part 5/14)                                 | Where                                          | Automated?                             |
| ------------------------------------------------ | ---------------------------------------------- | -------------------------------------- |
| Update **PROJECT_BRAIN.md**                      | Completed Phase row · ADR · Changelog · footer | validated by `validate:brain`          |
| Update **CHANGELOG.md**                          | `[Unreleased]` → new section                   | validated by `validate:brain`          |
| Update **documentation**                         | `docs/**` (this canon, READMEs)                | validated by `validate:docs`           |
| Update **Component Registry**                    | `src/.../registry/component-registry.ts`       | gated by `ds:registry`                 |
| Update **Route/API/State/Form/Table registries** | PROJECT_BRAIN §25–29                           | reviewed (populate as modules ship)    |
| Update **Theme/Localization/Asset registries**   | PROJECT_BRAIN §30–32                           | gated by `check:i18n` / `check:assets` |
| Run **quality gates**                            | `pnpm verify`                                  | ✅ step 1                              |
| Generate **phase report**                        | `docs/reports/phase-0NN-report.md`             | ✅ checked                             |
| **Commit · tag · push**                          | git                                            | ✅ `--execute`                         |
| Generate **release notes**                       | `.github/release-body.md`                      | ✅ step 3                              |
| Create **GitHub Release**                        | `release.yml` on tag push                      | ✅ CI                                  |
| Update **progress dashboard**                    | Close phase milestone / Project board          | manual (gh)                            |

Registries that have **no concrete artifacts yet** (API/Route/Form/Table/State)
stay _seeded_ until the first module ships — the pipeline validates what exists
and does not fabricate rows.

## 5. Why a script (not a runbook)

A markdown runbook drifts and gets skipped under deadline pressure. Encoding the
closure as **code** means: the gate cannot be skipped, the version cannot be
mistyped past validation, the report cannot be forgotten, and the same sequence
runs on every machine and in automation. It is the operational twin of the
[Engineering Quality Platform](../engineering/README.md): that one gates _the code_,
this one gates _the release_.

---

_Part 5 + 14 of the [DevOps Platform](./README.md). Script:
[`scripts/phase/complete-phase.mjs`](../../scripts/phase/complete-phase.mjs)._
