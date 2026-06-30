# CI/CD Pipeline (Phase 10 · Part 3)

> Every ClinicOS GitHub Actions workflow, explained step by step. CI **mirrors
> the local gate** so "all gates green" is true on the server, not just a laptop;
> CD publishes releases and (when wired) deploys — automatically, on the right
> trigger, with the least privilege needed.

All workflows live in [`.github/workflows/`](../../.github/workflows). They share
two principles: **least-privilege `permissions:`** per job, and **`concurrency:`**
groups so superseded runs cancel.

---

## Pipeline at a glance

| Workflow                  | Trigger                          | Purpose                                              | Blocks merge |
| ------------------------- | -------------------------------- | ---------------------------------------------------- | ------------ |
| **ci.yml**                | push `main`, every PR            | The full quality gate + E2E + build artifact         | ✅           |
| **codeql.yml**            | push `main`, PR, weekly cron     | Static security analysis (SAST)                      | ✅           |
| **dependency-review.yml** | PR                               | Block vulnerable / bad-license new deps              | ✅           |
| **labeler.yml**           | PR; push to `labels.yml`         | Auto area-labels + label-taxonomy sync               | —            |
| **release-drafter.yml**   | push `main`, PR                  | Keep the draft release notes + autolabel             | —            |
| **release.yml**           | push tag `v*.*.*`                | Re-verify, build, publish GitHub Release             | —            |
| **deploy.yml**            | dispatch · push `main` · release | Build + deploy (env-gated) + health/smoke (template) | —            |

---

## 1. `ci.yml` — the quality gate

Runs on **every push to `main` and every pull request**. Two jobs:

### `verify`

`actions/checkout` → `pnpm/action-setup` → `setup-node` (Node 20, pnpm cache) →
`pnpm install --frozen-lockfile`, then each gate as its **own step** (so a failure
names itself):

```
typecheck → lint → format:check → validate:arch → check:duplicates →
check:tokens → check:i18n → test → build → check:perf → ds:registry →
check:assets → validate:docs → validate:brain → upload dist artifact
```

These are exactly the gates in [QualityGates.md](../engineering/QualityGates.md)
plus the Phase-10 **documentation** and **Brain** validators. `HUSKY=0` skips hook
install in CI. The built `dist/` is uploaded as an artifact for inspection/deploy.

### `e2e`

Installs Chromium and runs the Playwright smoke suite (`pnpm e2e`), uploading the
HTML report. Kept a **separate job** so a flaky browser test never masks a real
gate failure and the two run in parallel.

> **Why mirror the local gate in CI?** A gate that only runs locally is a
> suggestion. CI is the **enforcement boundary** — branch protection requires
> these checks, so unreviewed/ungreen code cannot reach `main`.

## 2. `codeql.yml` — static security analysis

GitHub **CodeQL** scans the TypeScript/JavaScript for injection, XSS,
prototype-pollution, unsafe DOM, and other CWE classes, on push/PR and **weekly**
(to re-scan unchanged code against newly-published queries). `build-mode: none`
(JS/TS needs no compile); `queries: security-and-quality`. Findings surface in the
repo **Security** tab and block merge via branch protection. Least privilege:
`security-events: write`, everything else read.

## 3. `dependency-review.yml` — supply-chain gate

On every PR, [`actions/dependency-review-action`](https://github.com/actions/dependency-review-action)
diffs the manifest and **fails the PR** if a newly-added dependency has a known
vulnerability (≥ moderate) or a denied license (`AGPL/GPL/LGPL` — incompatible
with a proprietary product). This is the _preventative_ complement to Dependabot
(which remediates what already shipped).

## 4. `labeler.yml` — label automation

- **pr-labeler** (`pull_request_target`): applies `area:` labels from the files a
  PR touches ([labeler.yml config](../../.github/labeler.yml)).
- **sync-labels** (push to `labels.yml`): reconciles repo labels with
  [`labels.yml`](../../.github/labels.yml) (`skip-delete: true` — never removes a
  label already in use). Keeps the taxonomy identical for everyone.

## 5. `release-drafter.yml` — continuous release notes

On each merge to `main`, [release-drafter](https://github.com/release-drafter/release-drafter)
updates a **draft** GitHub Release: groups merged PRs by label into sections and
computes the next SemVer from the PR labels ([release-drafter.yml](../../.github/release-drafter.yml)).
On PRs it autolabels by branch/title. The notes are ready the instant a release is
cut. Needs `contents: write` + `pull-requests: write`.

## 6. `release.yml` — publish a release

Triggered by pushing a **`v*.*.*` tag** (the final step of the
[phase pipeline](./PhaseCompletionPipeline.md)). Steps: full-history checkout →
install → **`pnpm verify` (re-verify the tagged commit)** → `pnpm build` → package
`dist/` as a tarball → detect pre-release (`-rc/-beta/-alpha`) → publish a
**GitHub Release** (`softprops/action-gh-release`) with auto-generated notes +
the curated [`release-body.md`](../../.github/release-body.md) + the build artifact
attached. **The tag is the trigger**, so a release cannot exist without a green
gate. Needs `contents: write`.

## 7. `deploy.yml` — deployment (provider-agnostic template)

ClinicOS is a static SPA; "deploy" = publish `dist/` to a host. The host is
**deliberately not hardcoded** — wire it by setting the `DEPLOY_PROVIDER` repo
variable + provider secrets. Until then every job is **guarded** (`if:
vars.DEPLOY_PROVIDER != ''`) so the workflow is **inert, never red**. Jobs: `build`
(env-specific bundle) → `deploy` (to a GitHub **Environment** with protection
rules; production requires **manual approval**) → `smoke` (Playwright against the
live URL). Full runbook + rollback: [Deployment.md](./Deployment.md).

---

## Local ⇄ CI parity

| Locally (`pnpm …`)    | In CI                                             |
| --------------------- | ------------------------------------------------- |
| `pnpm verify`         | `ci.yml › verify`                                 |
| `pnpm e2e`            | `ci.yml › e2e`                                    |
| `pnpm quality`        | superset of `verify` (also writes the report)     |
| `pnpm phase:complete` | (you run this; it pushes the tag → `release.yml`) |

Run `pnpm verify` before you push and CI holds no surprises.

---

_Part 3 of the [DevOps Platform](./README.md). Workflows:
[`.github/workflows/`](../../.github/workflows)._
