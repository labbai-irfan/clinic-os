# Documentation Automation (Phase 10 · Part 6)

> Documentation in ClinicOS is **load-bearing** — the Brain _is_ the system's
> memory. So docs are not "written and forgotten": they are **generated where
> mechanical**, **validated in CI**, and **required by the Definition of Done**.
> Docs that drift from reality are treated as bugs.

---

## 1. Generated documentation

Some docs are derived from code so they can never disagree with it:

| Generated artifact                                                        | Generator                                                                   | Source of truth                                           |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| [ComponentRegistry.md](../design-system/ComponentRegistry.md)             | `pnpm ds:registry` ([ds-registry.mjs](../../scripts/ds-registry.mjs))       | `src/shared/design-system/registry/component-registry.ts` |
| [engineering-quality-report.md](../reports/engineering-quality-report.md) | `pnpm quality` ([quality-gate.mjs](../../scripts/quality/quality-gate.mjs)) | the live gate results                                     |
| [`.github/release-body.md`](../../.github/release-body.md)                | `pnpm release:notes`                                                        | Conventional-Commit history                               |
| GitHub Release notes                                                      | `release.yml` + release-drafter                                             | merged PRs + tags                                         |

Generated files carry a `GENERATED — DO NOT EDIT` header and are listed in
[`.prettierignore`](../../.prettierignore) where appropriate, so a human edit is
never silently overwritten without notice.

## 2. Validated documentation

Authored docs are kept honest by two CI gates added this phase (wired into
`pnpm verify` and [ci.yml](../../.github/workflows/ci.yml)):

### `validate:docs` ([validate-docs.mjs](../../scripts/quality/validate-docs.mjs))

1. Every **required canon doc** exists and is non-empty (Brain, Frontend-Bible,
   PROJECT_BRAIN, architecture/engineering/devops READMEs, design-system, theme,
   assets, CHANGELOG, README).
2. **Relative-link integrity** within `docs/devops` and `docs/engineering` — every
   `[text](path)` resolves to a real file.
3. **No empty markdown** anywhere under `docs/`.

### `validate:brain` ([validate-brain.mjs](../../scripts/quality/validate-brain.mjs))

1. The Brain's required sections still exist (ADR log, Completed/Pending Phases,
   Changelog).
2. The **ADR marker** (`append below ADR-NNNN`) matches the highest ADR present —
   you cannot add an ADR without advancing the marker.
3. The footer carries a **Foundation version** + an ISO date.
4. The **DevOps platform is registered** in the Brain (Part 13).
5. `CHANGELOG.md` points back at the Brain.

## 3. The documentation map

ClinicOS docs are layered (each phase added a folder; none duplicates another):

| Folder                | Concern                                           | Phase |
| --------------------- | ------------------------------------------------- | ----- |
| `docs/` (root canon)  | Constitution: Brain, Frontend-Bible, standards    | 1     |
| `docs/architecture/`  | Enterprise architecture, dependency rules, ADRs   | 2     |
| `docs/design-system/` | Tokens → components → registry                    | 4·8   |
| `docs/theme-engine/`  | Runtime theming                                   | 5     |
| `docs/assets/`        | Asset system                                      | 7     |
| `docs/engineering/`   | **Code** quality: standards, gates, validators    | 9     |
| `docs/devops/`        | **Delivery**: git, CI/CD, release, deploy, secure | 10    |
| `docs/reports/`       | Per-phase reports + generated quality report      | all   |

> **Why a new `docs/devops/` folder (not an extension of `docs/engineering/`)?**
> Engineering quality answers _"is this code good?"_; DevOps answers _"how does
> code ship safely?"_ — different audiences (reviewers vs release/on-call),
> different cadence (per-PR vs per-release), different artifacts (lint/validators
> vs workflows/deploy). Per the project's _edit-in-place_ rule, devops content has
> **no existing home** to extend, so a sibling folder is the correct, non-duplicative
> placement — exactly as `engineering/`, `assets/`, and `theme-engine/` are siblings.

## 4. What every feature must document

Unchanged from [DocumentationStandards.md](../engineering/DocumentationStandards.md)
(Phase 9) — this phase only adds the **automation** that enforces it: a feature/
module updates its README, the relevant registries, and the Brain in the **same
PR**, and CI's `validate:docs` / `validate:brain` block the merge if the canon is
broken.

## 5. Future automation (rostered)

- **TypeDoc / API docs** generated from `shared/` and module public `index.ts` exports.
- **Dependency-graph + ADR-graph** images regenerated into [Diagrams.md](../architecture/Diagrams.md).
- **Storybook ↔ Component Registry** sync check (also in the Engineering roster).
- **i18n coverage report** wired to the Localization Registry.

These are tracked in [PROJECT_BRAIN §42](../brain/PROJECT_BRAIN.md) (Future Improvements).

---

_Part 6 of the [DevOps Platform](./README.md). Validators:
[`scripts/quality/validate-docs.mjs`](../../scripts/quality/validate-docs.mjs) ·
[`validate-brain.mjs`](../../scripts/quality/validate-brain.mjs)._
