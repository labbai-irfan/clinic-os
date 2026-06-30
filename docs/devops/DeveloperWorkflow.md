# Developer Workflow (Phase 10 · Part 11)

> The practical, day-to-day guide: how to take a change from idea to production in
> ClinicOS. This is the **consolidated developer experience** doc — it stitches
> together the strategy docs ([Git](./GitStrategy.md), [CI/CD](./CICDPipeline.md),
> [Release](./ReleaseManagement.md), [Deploy](./Deployment.md)) into one walkthrough,
> so there is a single page to read on your first day.

---

## 0. One-time setup

```bash
corepack enable                 # pnpm via Corepack (pnpm is NOT installed globally)
corepack pnpm install           # installs deps + git hooks (husky)
cp .env.example .env            # local config (placeholders; validated at boot)
corepack pnpm dev               # http://localhost:5173
```

> **Tooling note.** `pnpm` is provided by **Corepack**, not a global install. If a
> command says `pnpm: not found`, prefix with `corepack ` (the git hooks already
> fall back to `corepack pnpm`).

## 1. Start a change

```bash
git switch main && git pull --rebase origin main
git switch -c feature/<slug>        # or fix/ chore/ refactor/ perf/ docs/
```

One branch = one reviewable concern. Keep it short-lived (< ~2 days).

## 2. Develop

- Build UI **only** from the design system (`shared/design-system`) on tokens —
  no hardcoded color/size/string.
- Data flows through services/repositories (backend-independent), never raw HTTP.
- Add/extend tests as you go (behaviour, not implementation).
- Update the **registry rows** and **docs** for anything you add (it's part of Done).

Useful commands:

| Command                       | Does                                          |
| ----------------------------- | --------------------------------------------- |
| `corepack pnpm dev`           | Dev server (HMR).                             |
| `corepack pnpm test:watch`    | Tests in watch mode.                          |
| `corepack pnpm storybook`     | Component catalog + a11y addon.               |
| `corepack pnpm quality:quick` | Fast gate (skips build/test) before a commit. |
| `corepack pnpm generate`      | Scaffold a module/component (plop).           |

## 3. Commit

Commits are **Conventional Commits** (enforced by the `commit-msg` hook):

```bash
git add -p
git commit -m "feat(appointments): add booking form with Zod validation"
```

The `pre-commit` hook runs lint-staged (eslint --fix + prettier) on staged files;
the `commit-msg` hook runs commitlint. Both resolve pnpm via Corepack.

## 4. Open a pull request

```bash
git push -u origin feature/<slug>
# open a DRAFT PR early so CI runs continuously
```

- Fill the [PR template](../../.github/pull_request_template.md): what/why, the
  8-Laws checklist, **`pnpm quality` green**, registry + Brain updates, rollback.
- CI runs [`ci.yml`](./CICDPipeline.md) (verify + e2e), CodeQL, dependency review.
- `area:` labels auto-apply; a Code Owner is auto-requested.
- Address review, keep the branch **rebased on `main`**, resolve all conversations.

## 5. Merge

**Squash and merge** (the only enabled method). The squash title **must** be a
Conventional Commit — it becomes the changelog line and drives the version bump.
The branch is auto-deleted; history stays linear. release-drafter updates the draft
release notes.

## 6. Pre-merge gate, locally

Before you push (or before merge), make CI boring:

```bash
corepack pnpm verify     # the exact gate CI runs (typecheck…build…validate:brain)
corepack pnpm quality    # superset: also writes the quality report
```

If `verify` is green locally, CI will be green.

## 7. Close a phase / cut a release

When a phase (or release-worthy batch) is done:

```bash
# 1) Update PROJECT_BRAIN, CHANGELOG, write docs/reports/phase-0NN-report.md
# 2) Run the phase pipeline (dry run first):
corepack pnpm phase:complete -- --phase 10 --version 0.10.0
# 3) When green, execute it (commit · tag · push):
corepack pnpm phase:complete -- --phase 10 --version 0.10.0 --execute
```

Pushing the tag triggers [`release.yml`](./ReleaseManagement.md) → the GitHub
Release is published automatically. See
[PhaseCompletionPipeline.md](./PhaseCompletionPipeline.md).

## 8. Deploy

Deploys are automated + environment-gated once a host is wired
([Deployment.md](./Deployment.md)): `main` → staging (auto); a published Release →
production (**manual approval**). Each deploy runs a health check + smoke test.

## 9. Roll back

Something regressed in production? In order of speed:

1. **Re-deploy the previous tag** (provider rollback / dispatch `production`).
2. **`git revert` + patch release** for a code fix.
3. **Hotfix** from the tag for urgent, revert-unsafe cases.

The plan was written in your PR's **Rollback** section before merge — follow it.
See [GitStrategy §9](./GitStrategy.md#9-rollback-strategy).

---

## Cheat sheet

| Goal                  | Command                                                               |
| --------------------- | --------------------------------------------------------------------- |
| Start work            | `git switch -c feature/<slug>`                                        |
| Run the gate          | `corepack pnpm verify`                                                |
| Fast pre-commit       | `corepack pnpm quality:quick`                                         |
| Release notes preview | `corepack pnpm release:notes --print`                                 |
| Close a phase         | `corepack pnpm phase:complete -- --phase N --version X.Y.Z --execute` |
| Roll back             | re-deploy prev tag · `git revert` · hotfix                            |

---

_Part 11 of the [DevOps Platform](./README.md). New here? Read this page, then
[GitStrategy.md](./GitStrategy.md) and the [Definition of Done](../engineering/DefinitionOfDone.md)._
