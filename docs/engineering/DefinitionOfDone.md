# ClinicOS — Definition of Done

> **Phase 9 · Part 9.** The single, authoritative, gated Definition of Done.
> **No feature may merge unless every applicable box below is ticked** and CI is
> green. This is the operational contract that ties the standards
> ([EngineeringStandards.md](./EngineeringStandards.md)), gates
> ([QualityGates.md](./QualityGates.md)), and reviewer checklists
> ([ReviewChecklists.md](./ReviewChecklists.md)) into one merge bar. It extends —
> and where it conflicts, defers to — [Project-Checklist.md](../Project-Checklist.md)
> and [AI_RULES.md §10](../architecture/AI_RULES.md).

> **How to use.** Copy [§2](#2-the-checklist-copy-into-every-pr) into the PR
> description. Tick what applies; strike through with a note what genuinely does
> not. A reviewer blocks the PR if any 🔴 item is unchecked.

---

## 1. The nine pillars

A change is **Done** only when all nine are satisfied:

| #   | Pillar                     | Verified by                                              | Gate                               |
| --- | -------------------------- | -------------------------------------------------------- | ---------------------------------- |
| 1   | **Architecture verified**  | layer/boundary/barrel/isolation                          | `lint` + `validate:arch`           |
| 2   | **Quality gates passed**   | lint, types, format, build, duplicates, tokens, registry | `pnpm quality`                     |
| 3   | **Accessibility passed**   | WCAG 2.2 AA, axe, keyboard, SR                           | `test` + manual audit              |
| 4   | **Localization passed**    | keys in all 4 locales, no hardcoded strings, RTL         | `check:i18n` + `lint`              |
| 5   | **Performance passed**     | within budget; no CLS; LCP/INP/CLS targets               | `check:perf`                       |
| 6   | **Testing passed**         | unit + a11y + e2e (journey paths); coverage threshold    | `test` + `e2e`                     |
| 7   | **Brain updated**          | registries match the diff (same PR)                      | review + self-verify               |
| 8   | **Documentation updated**  | README/BRAIN/JSDoc/ADR as touched                        | review                             |
| 9   | **Phase report generated** | for phase-level work only                                | `docs/reports/phase-NNN-report.md` |

---

## 2. The checklist (copy into every PR)

```text
ARCHITECTURE & MODULE BOUNDARIES 🔴
[ ] Correct module + Clean-Architecture layer (Presentation/Application/Domain/Infrastructure)
[ ] Dependency Rule honored: downward-only (app→processes→modules→entities→shared); no sideways/upward
[ ] Cross-module access only via the target module's index.ts; no deep imports; no cycles
[ ] shared/ holds zero domain knowledge; new public exports are intentional + minimal
[ ] Naming + placement per NamingConvention.md + FolderStructure.md
[ ] `pnpm validate:arch` green

DATA & STATE 🔴
[ ] DTO → Zod (boundary) → mapper → Model → repository → service → Query hook
[ ] No HttpClient/fetch/axios/DTO in UI; UI consumes Models only
[ ] Server data in TanStack Query, NOT Zustand; query keys structured + invalidation handled

UI · TOKENS · I18N · A11Y 🔴
[ ] Tokens only — no hardcoded color/size/space/radius/shadow/duration/font (`pnpm check:tokens` green)
[ ] i18n keys only — every string/aria-label/error, in all locales (en/hi/mr/ur), RTL-safe logical props
[ ] `pnpm check:i18n` green (no missing keys)
[ ] All four async states: loading (skeleton) / empty / error+retry / success (live region)
[ ] WCAG 2.2 AA: keyboard, focus-visible, ARIA, ≥44px targets, no color-only signaling; axe green
[ ] One Screen · One Primary Task · One Primary CTA

QUALITY · PERF · SAFETY 🔴
[ ] Typed, no `any`; strict tsc green; no God components/hooks/services; no temporary/TODO code
[ ] No console.* (logger port); no dead/commented-out code; no debugger
[ ] Reuse honored (searched registries + repo); `pnpm check:duplicates` green
[ ] Within performance budget (`pnpm build && pnpm check:perf` green); no layout shift
[ ] PHI-safe (no PHI in logs/analytics/Sentry/URLs/storage/comments); sensitive surfaces permission-gated
[ ] Clinical/medical code flagged for clinician/SME review; no invented medical logic
[ ] No new dependency without ADR; escalation triggers surfaced if hit

TESTS 🔴
[ ] Unit tests for logic (mapper pure / repository via MSW / service / hook / store) — behavior, not impl
[ ] a11y test (axe) for changed UI; Storybook story for shared components (all variants + states)
[ ] E2E for the patient-journey path this change touches (where applicable)

DOCS & BRAIN (the change is not done without these) 🔴
[ ] Docs updated (Architecture/FolderStructure/DependencyRules/Naming/engineering) + ADR if structural
[ ] PROJECT_BRAIN: Changelog + Component/Route/API registries (always-check)
[ ] PROJECT_BRAIN: State/Form/Table/Theme/Localization/Asset/Quality registries — each updated IF touched
[ ] Module BRAIN.md (+ README.md if public API/owners/deps changed) updated
[ ] Self-verified: registries match the code in this diff

GIT & CI 🔴
[ ] Conventional commit; small, focused PR (one concern); Changeset if user-facing/versioned
[ ] CI green: lint · types · format · arch · duplicates · tokens · i18n · test · build · perf · registry · assets · e2e
[ ] No merge conflicts; branch up to date with base
```

---

## 3. The 60-second blocker pass (reviewer)

Block immediately if any is true (full list: [Project-Checklist.md §9](../Project-Checklist.md#9-pr-reviewer-quick-gate-60-second-blockers)):

- 🔴 Dependency Rule broken (upward/sideways/deep/`feature→feature`).
- 🔴 UI imports `HttpClient`/raw `fetch`/a DTO/`api`/`repositories`/`mappers`.
- 🔴 Server data in Zustand.
- 🔴 Hardcoded color/size or hardcoded user-facing string.
- 🔴 Missing async state (no skeleton/empty/error+retry/success).
- 🔴 a11y fail (no keyboard path/focus-visible, missing label, color-only, new axe violation).
- 🔴 More than one primary CTA on the screen.
- 🔴 PHI leak or ungated privileged surface.
- 🔴 `any` / `@ts-ignore` / `console.*` / dead code.
- 🔴 CI red, or missing locale keys without a documented fallback.

---

## 4. Phase-level Definition of Done

For a **phase** (like this one), additionally:

- [ ] All quality gates green via `pnpm quality` (report regenerated).
- [ ] `PROJECT_BRAIN.md` updated: Completed Phases row, ADR, relevant registries, Changelog, footer version bump.
- [ ] `CHANGELOG.md` entry added.
- [ ] `docs/reports/phase-NNN-report.md` generated (tasks, decisions, files, verification table, known issues, next-phase requirements).
- [ ] Engineering Quality Report generated at `docs/reports/engineering-quality-report.md`.
- [ ] Conventional commit + annotated tag (`vX.Y.0` or `phase-NNN`) + release notes.

---

## 5. One-line summary

> **Done = right layer behind a public API · DTO→…→Query pipeline · tokens + i18n only · four async states · WCAG 2.2 AA + axe · within perf budget · typed & tested · PHI-safe & permission-gated · Brain + docs updated · green CI with a conventional commit.**

_Phase 9 · Engineering Quality Platform · Part 9 · Status: **Foundation v9** · 2026-06-30_
_Companion: [ReviewChecklists.md](./ReviewChecklists.md) · [QualityGates.md](./QualityGates.md) · [AIQualityRules.md](./AIQualityRules.md) · [Project-Checklist.md](../Project-Checklist.md)_
