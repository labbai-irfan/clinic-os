# Branch Protection — declared config (Phase 10 · Part 2 + Part 9)

GitHub branch-protection rules live in repo settings, not in a committable file.
This document is the **declared, version-controlled source of truth** for them so
the configuration is reviewable and reproducible. Apply it via **Settings →
Branches → Rules**, the GitHub API, or the snippet at the bottom (`gh`).

> Rationale lives in [docs/devops/GitStrategy.md](../docs/devops/GitStrategy.md)
> (branch model) and [docs/devops/Security.md](../docs/devops/Security.md)
> (why each control exists).

## `main` (production-tracking, protected)

| Control                                            | Setting                                                                                                                    |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Require a pull request before merging              | ✅ (no direct pushes)                                                                                                      |
| Required approvals                                 | **1+** (raise to 2 once a second maintainer exists)                                                                        |
| Dismiss stale approvals on new commits             | ✅                                                                                                                         |
| Require review from **Code Owners**                | ✅ (uses `.github/CODEOWNERS`)                                                                                             |
| Require **status checks** to pass                  | ✅ — `Verify (lint · types · format · test · build · registries)`, `E2E (Playwright smoke)`, `CodeQL`, `Dependency review` |
| Require branches to be **up to date** before merge | ✅                                                                                                                         |
| Require **conversation resolution**                | ✅                                                                                                                         |
| Require **linear history**                         | ✅ (squash-merge only — matches the git strategy)                                                                          |
| Require **signed commits**                         | ✅ (recommended once contributors have GPG/SSH signing)                                                                    |
| Include administrators                             | ✅ (no bypass — the rules apply to everyone)                                                                               |
| Allow force pushes / deletions                     | ❌                                                                                                                         |

## `develop` (integration, protected — when adopted)

Same as `main` but **1 approval**, status checks required, force-push disabled.
`develop` is optional for a solo/early repo (trunk-based on `main` is the default);
adopt it when parallel release trains begin (see GitStrategy.md §"When to adopt develop").

## Tags

- `v*` tags are created **only** by the release flow and are **protected** (a tag
  protection rule prevents deletion/overwrite). Pushing `vX.Y.Z` triggers
  `.github/workflows/release.yml`, which publishes the GitHub Release.

## Apply with `gh` (one-time)

```bash
# Requires: gh auth login  +  admin on the repo.
gh api -X PUT repos/labbai-irfan/clinic-os/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Verify (lint · types · format · test · build · registries)",
      "E2E (Playwright smoke)"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "restrictions": null
}
JSON
```
