# Git Strategy (Phase 10 · Part 1)

> How branches, commits, tags, versions, and rollbacks are shaped in ClinicOS —
> and **why each decision was made**. Every rule here is enforced by
> [branch protection](../../.github/BRANCH_PROTECTION.md), [CI](./CICDPipeline.md),
> and the [commitlint](../../commitlint.config.cjs) hook.

ClinicOS optimises for **a small-but-growing team shipping a 10-year healthcare
product**. The strategy therefore favours **a protected, always-releasable
`main`**, **short-lived feature branches**, **linear history**, and **automated
releases** — the model used by GitHub, Vercel, and Stripe engineering for
trunk-centric SaaS.

---

## 1. Branch model — Trunk-based, with optional release trains

```
main ──●───────●───────●───────●──────▶   (protected · always releasable · tagged)
        \      /\      /        \
         ●──●─/  ●──●─/          ●──●      feature/* · fix/* · chore/*  (short-lived)
```

| Branch               | Purpose                                                      | Lifetime           | Protected |
| -------------------- | ------------------------------------------------------------ | ------------------ | --------- |
| **`main`**           | The single source of truth; always green, always releasable. | Permanent          | ✅        |
| **`feature/<slug>`** | One unit of new capability.                                  | Hours–days         | —         |
| **`fix/<slug>`**     | A bug fix.                                                   | Hours              | —         |
| **`chore/<slug>`**   | Tooling/deps/refactor/docs.                                  | Hours              | —         |
| **`hotfix/<slug>`**  | Urgent production fix, branched from the release tag.        | Minutes–hours      | —         |
| **`release/x.y`**    | _(optional)_ A stabilisation train for a big release.        | Days               | ✅        |
| **`develop`**        | _(optional)_ Integration branch when trains run in parallel. | Permanent (if any) | ✅        |

**Why trunk-based (not Git Flow by default).** Git Flow's permanent `develop` +
`release` branches add merge overhead that only pays off when **multiple release
trains run concurrently**. ClinicOS does not yet have that; a protected `main`
with short feature branches gives the smallest distance from idea → production,
fewer long-lived merge conflicts, and a history that reads like a changelog.
**Git Flow is not abandoned** — `release/x.y` and `develop` are pre-defined above
and adopted the moment parallel trains appear (see §8).

**Branch naming:** `<type>/<kebab-slug>` where `<type> ∈ {feature, fix, chore,
hotfix, refactor, docs, perf}`. Example: `feature/appointments-booking-form`.

---

## 2. Feature branches

- Branch from the latest `main`. Keep them **short-lived** (< ~2 days) and **small**
  (one reviewable concern) — large branches rot against `main` and hide risk.
- Rebase onto `main` to stay current (`git pull --rebase origin main`); never
  merge `main` into a feature branch (keeps history linear).
- Open a **draft PR early** so CI runs continuously and reviewers see direction.
- A branch is mergeable only when the [Definition of Done](../engineering/DefinitionOfDone.md)
  is met and every required check is green.

## 3. Release branches _(optional — `release/x.y`)_

Cut a `release/x.y` branch when a release needs a **stabilisation window** (only
fixes, docs, and translations land; no new features). Tag the release from it,
then merge it back to `main`. Until ClinicOS ships parallel trains, releases are
cut **directly from `main`** and this branch is unused.

## 4. Hotfix branches

For an urgent production defect: branch `hotfix/<slug>` **from the released tag**
(not from `main`'s tip, which may contain unreleased work), fix + test, open a PR,
and on merge cut a **patch** release (e.g. `v0.10.0 → v0.10.1`). The hotfix is
included in `main` by the same merge, so the fix never regresses in the next
release.

## 5. Merge strategy — Squash + linear history

| Decision               | Choice                | Why                                                         |
| ---------------------- | --------------------- | ----------------------------------------------------------- |
| Merge method           | **Squash and merge**  | One branch = one atomic, revertable commit on `main`.       |
| History                | **Linear** (enforced) | A readable, bisectable timeline; no merge-commit spaghetti. |
| Branch up-to-date      | **Required**          | The exact merged tree is the tree CI validated.             |
| Delete branch on merge | **Yes**               | No stale-branch clutter.                                    |

The squashed commit's title **must** be a Conventional Commit (it becomes the
changelog line and drives the version bump — see §6). Merge commits and rebase
merges are disabled in repo settings so history stays linear and each `main`
commit is independently revertable — the foundation of the rollback strategy (§9).

## 6. Commit strategy — Conventional Commits

Commits follow **[Conventional Commits](https://www.conventionalcommits.org/)**,
enforced by `commitlint` in the `commit-msg` hook:

```
<type>(<optional scope>)<optional !>: <description>

[body]

[footer: BREAKING CHANGE: …  ·  Refs: #123  ·  Co-Authored-By: …]
```

| Type                         | Meaning                    | Version effect |
| ---------------------------- | -------------------------- | -------------- |
| `feat`                       | New user-facing capability | **minor**      |
| `fix`                        | Bug fix                    | **patch**      |
| `perf`                       | Performance improvement    | patch          |
| `refactor`                   | No behaviour change        | patch          |
| `docs`                       | Documentation / Brain      | patch          |
| `test`                       | Tests only                 | patch          |
| `build`                      | Build system / deps        | patch          |
| `ci`                         | Pipeline / automation      | patch          |
| `chore`                      | Anything else              | patch          |
| `feat!` / `BREAKING CHANGE:` | Backwards-incompatible     | **major**      |

**Why.** Conventional Commits make history machine-readable: the
[release-notes generator](../../scripts/release/generate-release-notes.mjs) groups
the changelog by type and **infers the next SemVer bump automatically** — no
human guesses the version. AI agents follow the same grammar (the repo trailer is
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`).

## 7. Tag & version strategy

- Releases are **annotated git tags** `vX.Y.Z` (SemVer; see [VersionManagement.md](./VersionManagement.md)).
- Pre-releases use `-alpha.N`, `-beta.N`, `-rc.N` suffixes (e.g. `v0.11.0-rc.1`).
- Tags are **protected** (cannot be deleted/overwritten) and are created **only**
  by the phase-completion pipeline.
- Pushing a `v*` tag triggers [`release.yml`](../../.github/workflows/release.yml),
  which re-verifies, builds, and publishes the GitHub Release — **the tag is the
  release trigger**, so a release can never exist without a passing gate.

## 8. When to adopt `develop` / release trains

Promote from trunk-based to a `develop` + `release/x.y` model when **any** of:
(a) two releases are stabilising at once; (b) a regulated release needs a long
freeze while `main` keeps moving; (c) team size makes direct-to-`main` review
queues a bottleneck. The branches are already specified (§1) so adoption is a
policy switch, not a redesign — recorded via an ADR when it happens.

## 9. Rollback strategy

Linear history + atomic squashed commits + immutable tags make rollback boring
(which is the goal). In order of preference:

1. **Re-deploy the previous release.** The fastest mitigation — point the host at
   the prior `vX.Y.(Z-1)` build (no code change). See [Deployment.md](./Deployment.md).
2. **Revert the commit.** `git revert <sha>` the offending squashed commit, open a
   PR, ship a patch release. Keeps history honest (the revert is recorded).
3. **Hotfix forward.** When a revert is unsafe (e.g. a migration), branch
   `hotfix/*` from the tag, fix forward, patch-release (§4).

Every PR template carries a **Rollback** section so the safe path is decided
_before_ merge, not during an incident. Production deploys are **environment-gated
with manual approval** so a bad build is caught before it reaches a clinic.

---

_Part 1 of the [DevOps Platform](./README.md). Enforced by
[BRANCH_PROTECTION.md](../../.github/BRANCH_PROTECTION.md),
[commitlint.config.cjs](../../commitlint.config.cjs), and [CI](./CICDPipeline.md)._
