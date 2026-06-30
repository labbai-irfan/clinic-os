# Security (Phase 10 · Part 9)

> Security in ClinicOS is **enforced in the pipeline**, not appended after. This
> document lists every control, what it catches, and where it lives. Healthcare
> data raises the bar: the goal is **defence in depth** across dependencies, code,
> secrets, licenses, and the build itself.

---

## 1. Controls at a glance

| Control                  | Catches                                 | Where                                                                  | Blocks merge  |
| ------------------------ | --------------------------------------- | ---------------------------------------------------------------------- | ------------- |
| **Dependency scanning**  | known CVEs in new deps                  | [dependency-review.yml](../../.github/workflows/dependency-review.yml) | ✅            |
| **Dependency updates**   | drifted/vulnerable deps over time       | [dependabot.yml](../../.github/dependabot.yml)                         | — (opens PRs) |
| **Code scanning (SAST)** | injection, XSS, unsafe DOM, CWE classes | [codeql.yml](../../.github/workflows/codeql.yml)                       | ✅            |
| **Secret detection**     | committed tokens/keys                   | GitHub secret scanning + push protection + `.gitignore`                | ✅ (push)     |
| **License validation**   | copyleft/incompatible licenses          | dependency-review `deny-licenses`                                      | ✅            |
| **Package validation**   | lockfile drift, unexpected installs     | `pnpm install --frozen-lockfile` in CI                                 | ✅            |
| **Build validation**     | broken/oversized/unsafe build           | `pnpm build` + `check:perf` in CI + release re-verify                  | ✅            |
| **Branch protection**    | unreviewed/ungreen code reaching `main` | [BRANCH_PROTECTION.md](../../.github/BRANCH_PROTECTION.md)             | ✅            |

## 2. Dependency security

- **Preventative — dependency review.** On every PR, new dependencies are diffed
  and the PR **fails** on a known vulnerability (≥ moderate) or a denied license.
  Nothing risky lands in the first place.
- **Remediative — Dependabot.** Weekly grouped PRs bump deps + Actions; each runs
  the full gate, so an update is only merged if it's green. **Major** bumps land as
  separate, deliberately-reviewed PRs (often needing an ADR).
- **`--frozen-lockfile`** in CI guarantees the installed tree exactly matches
  `pnpm-lock.yaml` — no surprise transitive changes between local and CI.

## 3. Code scanning (SAST)

[CodeQL](../../.github/workflows/codeql.yml) runs the `security-and-quality` query
suite over the TS/JS on push, PR, and weekly. Findings appear in the **Security**
tab and block merge. The weekly cron re-scans unchanged code against newly-released
queries — yesterday's safe code can be flagged by tomorrow's rule.

## 4. Secret management

- **Never commit secrets.** `.env*` real values are git-ignored; only `.env.example`
  (placeholders) is tracked. A SPA ships to the client, so **no secret is ever a
  build input** — only public `VITE_*` config (validated at boot, ADR-0006).
- **GitHub secret scanning + push protection** block known secret formats at push.
- **CI/deploy credentials** live in **GitHub Actions secrets/variables**, injected
  only into the job that needs them (least privilege), never echoed to logs.
- **Private vulnerability reports** route to GitHub **Security Advisories**
  (wired in the [issue chooser](../../.github/ISSUE_TEMPLATE/config.yml)) — never a
  public issue.

## 5. Least-privilege CI

Every workflow declares the **minimum** `permissions:` it needs (e.g. CodeQL gets
`security-events: write` and nothing else; dependency-review gets read + PR-comment;
release gets `contents: write`). The default token is read-only unless a job opts
up. `concurrency:` groups cancel superseded runs to shrink the attack/race surface.

## 6. License & compliance

- ClinicOS is **proprietary** ([LICENSE](../../LICENSE)); `package.json` is
  `private: true`.
- Copyleft licenses (`AGPL/GPL/LGPL`) are **denied** for new dependencies — they
  are incompatible with a proprietary distribution and require explicit sign-off
  (an ADR) to introduce.

## 7. Healthcare-specific posture (forward-looking)

Patient data raises requirements that activate as real data/backends arrive:

- **No PHI in logs, analytics, error payloads** — scrub at the `shared/monitoring`
  and `shared/logger` ports.
- **RBAC + multi-tenant scoping** via `shared/permissions` + `<Can>` (Phase 5 auth).
- **Audit visibility** for privileged actions (`admin` module).
- **Transport/storage compliance** handled at the (future) backend; the frontend
  stays backend-independent and PHI-minimising.

These are tracked in [PROJECT_BRAIN §6.1 / §37](../brain/PROJECT_BRAIN.md) and the
auth phase, not implemented here (Phase 10 ships the _pipeline_ security).

## 8. Incident response

1. **Contain** — disable the offending path / [roll back](./Deployment.md#6-rollback).
2. **Assess** — severity (S1–S3), blast radius, PHI exposure.
3. **Fix** — hotfix branch from the tag → patch release.
4. **Record** — Security Advisory + a Brain entry; postmortem for S1/S2.

---

_Part 9 of the [DevOps Platform](./README.md). Workflows:
[codeql.yml](../../.github/workflows/codeql.yml) ·
[dependency-review.yml](../../.github/workflows/dependency-review.yml) ·
[dependabot.yml](../../.github/dependabot.yml)._
