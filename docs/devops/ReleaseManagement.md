# Release Management (Phase 10 · Part 4 + Part 10)

> How a tested commit becomes a **published, documented release** — automatically.
> Releases in ClinicOS are a _consequence_ of completing a phase, not a separate
> manual ritual. Cut the tag; the automation does the rest.

---

## 1. The release flow

```
PRs merge to main ──▶ release-drafter keeps a DRAFT release + notes up to date
        │
phase complete ──▶ pnpm phase:complete --phase N --version X.Y.Z --execute
        │            (gate ✓ · paperwork ✓ · notes generated · commit · TAG · push)
        ▼
push tag vX.Y.Z ──▶ release.yml: re-verify ✓ · build · package dist · PUBLISH
        ▼
GitHub Release (notes + tarball) ──▶ deploy.yml (on release: production, approval-gated)
```

Two complementary mechanisms produce the notes:

| Mechanism                                                                              | Role                                                                                                                         |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [release-drafter](../../.github/release-drafter.yml) (CI)                              | **Continuous** draft, grouped by PR label, with the next version resolved.                                                   |
| [generate-release-notes.mjs](../../scripts/release/generate-release-notes.mjs) (local) | **Deterministic** notes from commit history → [`release-body.md`](../../.github/release-body.md), attached by `release.yml`. |

The GitHub Release also enables `generate_release_notes: true`, so the final
release body carries our curated notes **and** GitHub's auto PR/contributor list.

## 2. Generating release notes

```bash
pnpm release:notes                     # writes .github/release-body.md
pnpm release:notes --version v0.10.0   # pin the version
pnpm release:notes --print             # stdout only (no file write)
pnpm release:notes --since v0.9.0      # custom range
```

The generator reads Conventional-Commit subjects since the previous tag, groups
them (🚀 Features · 🐞 Fixes · ⚡ Performance · ♿ Accessibility · 🌐 Localization ·
🔒 Security · 🧹 Refactoring · 📚 Docs · 🧪 Tests · 📦 Build · 🤖 CI · 🧰 Chores),
links a compare URL, and suggests the next SemVer. It is **dependency-free** and
runs identically locally and in CI.

## 3. Publishing (`release.yml`)

Pushing `vX.Y.Z` triggers [release.yml](../../.github/workflows/release.yml):

1. Checkout full history → install → **`pnpm verify`** (a release must re-pass the gate).
2. `pnpm build` → package `dist/` as `clinicos-vX.Y.Z.tar.gz`.
3. Detect pre-release from the tag suffix.
4. Publish the GitHub Release with notes + the tarball attached.

If verify fails on the tagged commit, **no release is published** — the tag stands
but the release page is not created until the commit is fixed and re-tagged.

## 4. Changelog & Brain

| Surface                                        | Scope                        | Updated by                     |
| ---------------------------------------------- | ---------------------------- | ------------------------------ |
| GitHub Release notes                           | Per release, machine-grouped | `release.yml` + drafter        |
| [`CHANGELOG.md`](../../CHANGELOG.md)           | Curated, Keep-a-Changelog    | Author, each phase (in the PR) |
| [PROJECT_BRAIN §41](../brain/PROJECT_BRAIN.md) | Authoritative, exhaustive    | Phase pipeline (Part 13/14)    |

These never contradict: the Brain is the source of truth; the changelog is its
human-readable digest; the release notes are its per-tag slice.

## 5. GitHub automation summary (Part 10)

| Automatic action          | Workflow / config                                                  |
| ------------------------- | ------------------------------------------------------------------ |
| Assign `area:` labels     | [labeler.yml](../../.github/workflows/labeler.yml)                 |
| Sync label taxonomy       | labeler.yml › sync-labels ← `labels.yml`                           |
| Request reviewers         | `CODEOWNERS` + branch protection                                   |
| Draft/group release notes | [release-drafter.yml](../../.github/workflows/release-drafter.yml) |
| Create the GitHub Release | [release.yml](../../.github/workflows/release.yml)                 |
| Open dependency PRs       | [dependabot.yml](../../.github/dependabot.yml)                     |
| Archive completed phases  | Close the phase milestone (phase pipeline)                         |

---

_Part 4 + 10 of the [DevOps Platform](./README.md). See
[VersionManagement.md](./VersionManagement.md) and
[PhaseCompletionPipeline.md](./PhaseCompletionPipeline.md)._
