# AI Rules — DevOps & Automation (Phase 10 · Part 12)

> The **binding contract** for any AI agent (or human) operating the ClinicOS
> delivery pipeline. It extends the code-quality contract in
> [AIQualityRules.md](../engineering/AIQualityRules.md) (Phase 9) and the master
> workflow in [architecture/AI_RULES.md](../architecture/AI_RULES.md) (Phase 2)
> with the rules that govern **how code ships**. These are not suggestions — most
> are enforced by CI; the rest are matters of trust.

---

## The non-negotiables

> An AI agent working on ClinicOS **must**:

1. **Never commit broken code.** `pnpm verify` must be green before any commit.
   Red gate → fix or don't commit. (Enforced: CI + pre-commit.)
2. **Never bypass CI.** No `--no-verify`, no skipping hooks, no disabling a gate,
   no merging around required checks. A failing gate is a finding, not an obstacle.
3. **Never skip Brain updates.** Any structural/registry/decision change updates
   [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) **in the same change**. (Enforced:
   `validate:brain`.)
4. **Never skip documentation.** New/changed behaviour updates its README, the
   relevant `docs/**`, and registry rows in the same PR. (Enforced: `validate:docs`.)
5. **Never skip tests.** New behaviour ships with tests (behaviour, not
   implementation). Don't delete/weaken a test to go green.
6. **Always generate release notes** when cutting a release
   (`pnpm release:notes`), and let `release.yml` publish the GitHub Release.
7. **Always follow the git workflow.** Conventional Commits, short-lived branches,
   squash-merge, linear history, protected `main`, tags only via the phase pipeline.
   ([GitStrategy.md](./GitStrategy.md).)
8. **Always update project progress.** Completed Phase row, Changelog, phase report,
   footer version, and the closed milestone — every phase, every time.

## Commit & PR discipline

- Commit subjects are Conventional Commits; the repo co-author trailer is
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- One PR = one concern; fill the [PR template](../../.github/pull_request_template.md)
  honestly, including the **Rollback** plan.
- Report outcomes faithfully: if a gate failed, say so with the output; if a step
  was skipped, say that. Never claim "all green" without having run it.

## What an agent must NOT do

- ❌ Force-push, amend pushed history, delete/overwrite a release tag.
- ❌ Loosen a gate, budget, lint rule, or branch-protection control **without an ADR**.
- ❌ Introduce a dependency without a registry row + ADR (and never a copyleft one).
- ❌ Add a secret to the repo or bake one into the build.
- ❌ Create duplicate docs/folders when an existing one is the right home —
  **edit in place** and explain why (the project's standing rule).
- ❌ Fabricate registry rows for artifacts that don't exist yet (keep them _seeded_).

## The phase-completion contract

When asked to "complete a phase" / "ship", an agent runs the deterministic
pipeline, not an improvised sequence:

```bash
pnpm phase:complete -- --phase <N> --version <X.Y.Z>            # verify it's green
pnpm phase:complete -- --phase <N> --version <X.Y.Z> --execute  # then commit·tag·push
```

The pipeline **refuses to tag** unless gate + Brain + docs + report are all in
order — so an agent cannot accidentally release an incomplete phase. See
[PhaseCompletionPipeline.md](./PhaseCompletionPipeline.md).

## Verification, then claims

State results plainly and only after verifying them: run the gate, read the output,
then report. "Tests pass" means you ran them and they passed. When something is
done and verified, say so without hedging; when it isn't, say what's left.

---

_Part 12 of the [DevOps Platform](./README.md). Companion contracts:
[AIQualityRules.md](../engineering/AIQualityRules.md) ·
[architecture/AI_RULES.md](../architecture/AI_RULES.md)._
