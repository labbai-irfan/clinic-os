# Monitoring & Observability (Phase 10 · Part 8)

> What ClinicOS watches, where the signal comes from, and what each alert means.
> A 10-year healthcare product must **notice problems before clinics do**.
> Monitoring spans two planes: **build-time** (caught in CI, before release) and
> **run-time** (caught in production, behind ports — ADR-0005/-0009).

---

## 1. The two planes

| Plane          | Caught                 | Mechanism                                            |
| -------------- | ---------------------- | ---------------------------------------------------- |
| **Build-time** | before a release ships | CI gates: perf budget, bundle size, a11y, lint, deps |
| **Run-time**   | in production          | error tracking, Web Vitals, analytics — behind ports |

Build-time monitoring is **live today** (CI). Run-time monitoring is **wired as
ports** in the architecture (`shared/monitoring`, `shared/analytics`) and activated
when a backend/observability vendor is chosen — no component changes required
(vendor SDKs never enter components; ADR-0005).

## 2. What we monitor

| Signal                  | Source / gate                                                                                         | Status           |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ---------------- |
| **Application health**  | deploy health check (HTTP 200) + smoke ([Deployment.md](./Deployment.md))                             | live (on deploy) |
| **Performance**         | Web Vitals via `shared/monitoring` port (LCP/INP/CLS)                                                 | port ready       |
| **Bundle size**         | `pnpm check:perf` vs [budgets.json](../../scripts/quality/budgets.json) + CI artifact                 | live (CI)        |
| **Error tracking**      | `shared/monitoring` (Sentry behind a port — ADR-0005)                                                 | port ready       |
| **Analytics**           | `shared/analytics` provider-agnostic port                                                             | port ready       |
| **Broken links**        | `validate:docs` (internal doc links)                                                                  | live (CI)        |
| **Dependency updates**  | [Dependabot](../../.github/dependabot.yml) weekly PRs                                                 | live             |
| **Security alerts**     | [CodeQL](../../.github/workflows/codeql.yml) + dependency review + GitHub advisories                  | live (CI)        |
| **Performance budgets** | `check-perf-budget.mjs` (JS/CSS/font/image/page)                                                      | live (CI)        |
| **Accessibility**       | vitest-axe (unit) + Playwright + [AccessibilityValidation](../engineering/AccessibilityValidation.md) | live (CI)        |

## 3. Performance budgets

Budgets are **data**, enforced every build by
[`check-perf-budget.mjs`](../../scripts/quality/check-perf-budget.mjs) against
[`budgets.json`](../../scripts/quality/budgets.json). The current ceiling is the
gzipped JS/CSS + raw fonts/images rolled up to a **page budget of 640 KB**
(latest build ≈ 516 KB). A PR that pushes past budget **fails CI** — performance
is a contract, not a hope. The CI `dist` artifact lets you inspect what grew.

> Tightening a budget is free; **loosening** one requires an ADR (a deliberate,
> recorded trade-off). See [PerformanceBudgets.md](../engineering/PerformanceBudgets.md).

## 4. Run-time observability (ports — activate when a vendor is chosen)

```
UI ─▶ shared/monitoring (port) ─▶ [Sentry | OTel-web]   errors · traces
UI ─▶ shared/analytics  (port) ─▶ [provider]            product analytics
app ─▶ web-vitals ───────────────▶ shared/monitoring     LCP · INP · CLS
```

Because instrumentation sits **behind ports**, swapping vendors (or running none)
is a config change, never a component edit. Activation steps: implement the port's
adapter in `shared/monitoring`, set the DSN via `VITE_*` env, validate at boot
(ADR-0006). Tracked in [PROJECT_BRAIN §17–18](../brain/PROJECT_BRAIN.md).

## 5. Alerting & triage

| Alert                           | Surfaced in          | Routes to                                                   |
| ------------------------------- | -------------------- | ----------------------------------------------------------- |
| CI gate red on `main`           | Actions + PR checks  | author + Code Owner                                         |
| CodeQL / advisory finding       | Security tab         | maintainers (`type: security`)                              |
| Dependabot vulnerability        | Security + PR        | maintainers (`dependencies`)                                |
| Budget regression               | CI `check:perf` step | author (blocks merge)                                       |
| Production error spike (future) | monitoring vendor    | on-call → incident → [rollback](./Deployment.md#6-rollback) |

Severity language matches the [bug template](../../.github/ISSUE_TEMPLATE/bug_report.yml):
**S1** (clinic workflow blocked / data loss) → drop everything; **S2** major; **S3**
minor/cosmetic.

## 6. Dashboards (future)

A run-time dashboard (uptime · Web Vitals percentiles · error rate · top journeys)
is rostered for when the observability vendor lands. Until then, the **CI
dashboard** (Actions tab + the generated
[engineering-quality-report.md](../reports/engineering-quality-report.md)) is the
live health view, and the **Brain** is the durable record.

---

_Part 8 of the [DevOps Platform](./README.md). Budgets:
[budgets.json](../../scripts/quality/budgets.json) ·
[PerformanceBudgets.md](../engineering/PerformanceBudgets.md)._
