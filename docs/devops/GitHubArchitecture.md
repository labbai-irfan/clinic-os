# GitHub Architecture (Phase 10 · Part 2)

> How the ClinicOS repository itself is structured for enterprise collaboration:
> standards, labels, milestones, projects, templates, code ownership, review
> rules, and branch protection. Every item below is a committed, version-controlled
> artifact under [`.github/`](../../.github) — configuration as code, not tribal
> knowledge.

---

## 1. Repository standards

| Standard         | Rule                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| Visibility       | Private (proprietary — see [LICENSE](../../LICENSE)).                             |
| Default branch   | `main` (protected, always releasable).                                            |
| Merge method     | **Squash only**; linear history enforced; branch auto-deleted on merge.           |
| Required reviews | ≥ 1 Code Owner; stale approvals dismissed on new commits.                         |
| Required checks  | `Verify`, `E2E`, `CodeQL`, `Dependency review` must pass (and be up to date).     |
| Conversations    | Must be resolved before merge.                                                    |
| Signed commits   | Recommended (enable once contributors have signing keys).                         |
| Secrets          | Never committed; provided via GitHub Actions secrets/variables (see Security.md). |

## 2. Repository structure (top level)

The application tree is governed by [architecture/README.md](../architecture/README.md);
the **collaboration** tree is:

```
.github/
├── CODEOWNERS                  # path → accountable reviewer(s)
├── pull_request_template.md    # the PR contract (gates + 8 laws + rollback)
├── dependabot.yml              # weekly grouped dependency PRs
├── labels.yml                  # the label taxonomy (single source of truth)
├── labeler.yml                 # path → area-label rules
├── release-drafter.yml         # release-notes grouping + version resolver
├── release-body.md             # generated curated notes for the next release
├── BRANCH_PROTECTION.md        # declared branch-protection config
├── ISSUE_TEMPLATE/
│   ├── config.yml · bug_report.yml · feature_request.yml · chore.yml
└── workflows/
    ├── ci.yml · codeql.yml · dependency-review.yml
    ├── release.yml · release-drafter.yml · labeler.yml · deploy.yml
```

## 3. Labels

The taxonomy lives in [`.github/labels.yml`](../../.github/labels.yml) and is
**synced to GitHub** by the [`labeler`](../../.github/workflows/labeler.yml)
workflow, so labels never drift. Families:

- **`type:`** — feature · bug · chore · docs · ci · security (drives release-notes sections + version bump).
- **`area:`** — design-system · theme · i18n · modules · app-shell · tooling · ci-cd · docs (auto-applied by path via [labeler.yml](../../.github/labeler.yml)).
- **`status:`** — triage · blocked · in-progress · needs-review.
- **`priority:`** — critical · high · low.
- **Governance flags** — `a11y`, `breaking-change`, `needs-adr`, `needs-brain-update`, `dependencies`, `good first issue`, `size:*`.

`area:` labels are applied **automatically** from the files a PR touches; humans
add `type:`/`priority:` at triage. The combination feeds both routing and the
release notes.

## 4. Milestones

Milestones track **phases and releases** (they mirror [PROJECT_BRAIN §39–40](../brain/PROJECT_BRAIN.md)):

- One milestone per **product phase** (e.g. _Phase 6 — Appointments slice_), closed
  when its phase report ships and its tag is cut.
- One milestone per **release** `vX.Y.0` for grouping issues/PRs.
- Closing a milestone is part of the [phase-completion pipeline](./PhaseCompletionPipeline.md).

## 5. Projects

A single **GitHub Project (board)** tracks delivery with columns
_Triage → Backlog → In progress → In review → Done_. Issues flow in via the
templates (auto-labeled `status: triage`); PRs link issues with `Closes #` so the
board advances automatically on merge. The board is the live view; the
**authoritative record stays in the Brain**.

## 6. Issue & PR templates

| Template                                                                | Forces                                                                                   |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [bug_report.yml](../../.github/ISSUE_TEMPLATE/bug_report.yml)           | Repro steps, area, **severity**, a11y/i18n/patient-data flags.                           |
| [feature_request.yml](../../.github/ISSUE_TEMPLATE/feature_request.yml) | User problem first, owning module, **65-year-old litmus** conformance.                   |
| [chore.yml](../../.github/ISSUE_TEMPLATE/chore.yml)                     | Task, kind, linked `DEBT-NNNN`, definition of done.                                      |
| [pull_request_template.md](../../.github/pull_request_template.md)      | The 8 Laws checklist, **`pnpm quality` green**, registry + Brain updates, rollback plan. |

Blank issues are disabled ([config.yml](../../.github/ISSUE_TEMPLATE/config.yml)):
process questions route to the Brain; security reports route to **private**
advisories.

## 7. Code owners

[`.github/CODEOWNERS`](../../.github/CODEOWNERS) maps every path to its accountable
reviewer, mirroring the **bounded-context team topology** (ADR-0001): one module ≈
one team. Foundation paths (`docs/brain`, `architecture`, `engineering`, `devops`,
`.github`, `scripts`, build config) get the highest scrutiny. Combined with
"Require review from Code Owners", **no protected path merges unreviewed**. Module
ownership blocks are pre-written and uncommented as each module ships.

## 8. Review rules

- **≥ 1 Code Owner approval**; raise to 2 once a second maintainer exists.
- **Stale approvals dismissed** on new commits — you review the final tree.
- **All conversations resolved** before merge.
- **All required checks green** and the branch **up to date** with `main`.
- Reviewers use the per-artifact [Review Checklists](../engineering/ReviewChecklists.md).

## 9. Branch protection

The declared configuration is [BRANCH_PROTECTION.md](../../.github/BRANCH_PROTECTION.md)
(reviewable, reproducible, applyable via `gh`). Highlights for `main`: PR required,
Code-Owner review, required status checks, up-to-date + linear history, signed
commits (recommended), **administrators included** (no bypass), force-push and
deletion disabled. Tags `v*` are protected against deletion/overwrite.

---

_Part 2 of the [DevOps Platform](./README.md). All artifacts live in
[`.github/`](../../.github)._
