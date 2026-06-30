# Version Management (Phase 10 · Part 4)

> ClinicOS versions follow **[Semantic Versioning 2.0.0](https://semver.org/)**.
> The version is **derived, not guessed** — Conventional Commits and PR labels
> determine the bump, and the [release-notes generator](../../scripts/release/generate-release-notes.mjs)
> computes it. `package.json#version` and the latest `vX.Y.Z` git tag are the two
> sources of truth and are kept in lockstep by the phase pipeline.

---

## 1. Semantic Versioning

```
MAJOR . MINOR . PATCH  [ - prerelease ]   e.g. 0.10.0 · 1.0.0-rc.2
```

| Bump      | When                                                    | Triggered by                                           |
| --------- | ------------------------------------------------------- | ------------------------------------------------------ |
| **MAJOR** | Backwards-incompatible change (API, contract, removal). | `feat!` / `BREAKING CHANGE:` / `breaking-change` label |
| **MINOR** | New capability, backwards-compatible.                   | any `feat:` / `type: feature` label                    |
| **PATCH** | Fix / perf / docs / refactor / chore — no new surface.  | `fix` `perf` `docs` `chore` `ci` `refactor`            |

**Pre-1.0 note.** ClinicOS is in **0.x** (foundation). Per SemVer, 0.x minors may
carry breaking changes; we still bump **minor per phase** (each phase adds a major
capability layer) and reserve **`1.0.0`** for the first production-grade vertical
slice serving a real clinic. Phase ↔ version mapping lives in
[PROJECT_BRAIN §39](../brain/PROJECT_BRAIN.md).

## 2. Pre-release channels

Stabilise risky releases through ordered pre-release tags before the stable tag:

```
…-alpha.N  →  …-beta.N  →  …-rc.N  →  (stable)
```

| Channel    | Meaning                                           | Audience          |
| ---------- | ------------------------------------------------- | ----------------- |
| **alpha**  | Feature-incomplete; internal only.                | Engineering       |
| **beta**   | Feature-complete; stabilising.                    | Internal + pilots |
| **rc**     | Release candidate; ship unless a blocker appears. | Pilot clinics     |
| **stable** | `vX.Y.Z` with no suffix.                          | All clinics       |

[`release.yml`](../../.github/workflows/release.yml) detects the `-alpha/-beta/-rc`
suffix and marks the GitHub Release as a **pre-release** automatically, so pre-release
builds never appear as "latest".

## 3. Tags

- Format: annotated `vX.Y.Z` (or `vX.Y.Z-rc.N`).
- Created **only** by [`pnpm phase:complete`](./PhaseCompletionPipeline.md) — never
  by hand mid-stream — so a tag always points at a gate-green commit.
- **Protected**: cannot be deleted or overwritten (immutable release history,
  honest rollback targets).
- Pushing a tag triggers the [release workflow](./CICDPipeline.md#6-releaseyml--publish-a-release).

```bash
git tag -a v0.10.0 -m "ClinicOS v0.10.0 — phase 10"
git push origin v0.10.0     # → release.yml publishes the GitHub Release
```

## 4. `package.json` version

`package.json#version` tracks the **current released** version (this phase: `0.10.0`).
It is bumped as part of the phase pipeline alongside the tag, so tooling that reads
the manifest (and the tag) agree. Prior phases left it at `0.0.0`; **Phase 10
adopts manifest-tracked versioning** as part of standing up version management.

## 5. Release notes & changelog

- **Generated** per release from Conventional-Commit history →
  [`.github/release-body.md`](../../.github/release-body.md) and the GitHub Release.
- **Curated** narrative lives in [`CHANGELOG.md`](../../CHANGELOG.md) (Keep a
  Changelog format).
- **Authoritative, exhaustive** per-phase record lives in
  [PROJECT_BRAIN §41](../brain/PROJECT_BRAIN.md).

See [ReleaseManagement.md](./ReleaseManagement.md) for the full release flow.

## 6. Milestones

Each `vX.Y.0` and each product phase has a **GitHub milestone** grouping its
issues/PRs; it is closed by the phase pipeline when the tag is cut (see
[GitHubArchitecture §4](./GitHubArchitecture.md#4-milestones)).

## 7. Inferring the next version

```bash
pnpm release:notes --print          # prints notes + the SUGGESTED next version
```

The generator inspects commits since the last tag: any `!`/`BREAKING CHANGE` → major;
else any `feat` → minor; else patch. You can always override with
`--version vX.Y.Z`. The suggestion is advisory; **the human/agent confirms the
version** when completing the phase.

---

_Part 4 of the [DevOps Platform](./README.md). See also
[ReleaseManagement.md](./ReleaseManagement.md) and [GitStrategy §6–7](./GitStrategy.md)._
