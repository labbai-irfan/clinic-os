# Deployment (Phase 10 · Part 7)

> ClinicOS is a **static SPA** (Vite build → `dist/`). "Deploy" means publishing
> `dist/` to a CDN-backed host and verifying it serves. The pipeline is **host-
> agnostic by design** ([deploy.yml](../../.github/workflows/deploy.yml)): pick a
> provider by setting a repo variable; the workflow stays inert (never red) until
> you do. This document is the runbook.

---

## 1. Environments

| Environment     | Source              | URL                      | Approval        | Trigger                        |
| --------------- | ------------------- | ------------------------ | --------------- | ------------------------------ |
| **Development** | local `pnpm dev`    | `localhost:5173`         | —               | manual                         |
| **Preview**     | a PR / branch       | ephemeral per-PR URL     | —               | push / PR (auto)               |
| **Staging**     | `main` after merge  | `staging.clinicos.app`\* | —               | push to `main` (auto)          |
| **Production**  | a published Release | `app.clinicos.app`\*     | **manual gate** | `release` published / dispatch |

<sub>\*Placeholder hostnames — set real ones via the `DEPLOY_URL` variable per
environment.</sub>

Environments map to **GitHub Environments** (Settings → Environments) so each can
carry its own protection rules, secrets, and **required reviewers**. Production
**must** require manual approval — a human confirms before a clinic-facing deploy.

## 2. Wiring a provider

The workflow gates every job on `if: vars.DEPLOY_PROVIDER != ''`. To enable:

1. Set repo **variable** `DEPLOY_PROVIDER` (e.g. `cloudflare-pages`, `vercel`,
   `netlify`, `s3-cloudfront`, `github-pages`).
2. Set per-environment **variables** `DEPLOY_URL`, optional `VITE_ASSET_BASE_URL`.
3. Add the provider's **secret(s)** (token/account id).
4. Replace the `Publish to host` step's placeholder with the provider's
   action/CLI. Examples:

```bash
# Cloudflare Pages
npx wrangler pages deploy dist --project-name clinicos
# Netlify
npx netlify deploy --prod --dir=dist
# AWS S3 + CloudFront
aws s3 sync dist s3://$BUCKET --delete && aws cloudfront create-invalidation --distribution-id $CF --paths '/*'
```

Because the build is a pure static bundle, **any** static host works; the choice
is an ops decision, recorded via an ADR when made.

## 3. The deploy job flow

```
build  → env-specific `pnpm build` → upload dist artifact
deploy → download artifact → publish to host (Environment-gated) → health check
smoke  → Playwright smoke suite against the live DEPLOY_URL
```

- **Health check:** polls `DEPLOY_URL` until it returns HTTP 200 (10 attempts ×
  6 s) before declaring success — a deploy that publishes but doesn't serve is a
  failure.
- **Smoke test:** the existing Playwright suite ([e2e/app.e2e.spec.ts](../../e2e/app.e2e.spec.ts))
  run against the deployed URL (`E2E_BASE_URL`) — boots, renders the welcome
  screen, switches theme live.

## 4. Environment promotion

```
Preview (PR)  ──merge──▶  Staging (main)  ──release──▶  Production (approved)
```

Promotion is **forward-only through tested gates**: a build reaches production only
after it passed CI on `main`, was tagged, published a Release, and a human approved
the production environment. No build skips a stage.

## 5. Health checks & smoke tests

| Check        | When               | What                                                      |
| ------------ | ------------------ | --------------------------------------------------------- |
| Build health | every deploy       | `pnpm build` succeeds + perf budget holds (`check:perf`). |
| HTTP health  | post-deploy        | `DEPLOY_URL` returns 200 within the retry window.         |
| Smoke (E2E)  | post-deploy        | Playwright critical-path against the live URL.            |
| Synthetic\*  | scheduled (future) | Periodic uptime + key-journey probe.                      |

## 6. Rollback

ClinicOS deploys are **immutable artifacts tied to tags**, so rollback is a
re-deploy, not a rebuild:

1. **Re-deploy the previous tag.** `workflow_dispatch` → choose `production` →
   the prior `vX.Y.(Z-1)` artifact. Fastest path; zero code change.
2. **Provider instant rollback.** Most hosts (Vercel/Netlify/Pages) keep prior
   deployments one click away — use that for seconds-level recovery.
3. **Revert + patch-release.** For a code-level fix, `git revert` → patch tag →
   `release.yml` → deploy (see [GitStrategy §9](./GitStrategy.md#9-rollback-strategy)).

Every PR records a **Rollback** plan before merge, so the path is known in advance.

## 7. Secrets & config

- Build-time config is **`VITE_*`** env (validated at boot by Zod — ADR-0006);
  never bake secrets into the bundle (a SPA ships to the client).
- Provider credentials live in **GitHub Actions secrets**, injected only into the
  deploy job. See [Security.md](./Security.md).

---

_Part 7 of the [DevOps Platform](./README.md). Workflow:
[`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)._
