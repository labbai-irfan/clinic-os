<!--
ClinicOS Pull Request (Phase 10 · DevOps Platform · Part 2).
A PR is not "done" because it works — it is done when every gate is green, the
Brain is updated, and the Definition of Done is satisfied. See
docs/engineering/DefinitionOfDone.md and docs/devops/DeveloperWorkflow.md.
-->

## What & why

<!-- One paragraph: what this changes and the user/architecture problem it solves. -->

Closes #

## Type of change

- [ ] `feat` — new user-facing capability
- [ ] `fix` — bug fix
- [ ] `refactor` — no behaviour change
- [ ] `docs` — documentation / Brain only
- [ ] `chore` / `ci` / `build` — tooling, pipeline, deps
- [ ] `perf` / `a11y` / `i18n` — performance / accessibility / localization

## The 8 Laws & architecture

- [ ] **One screen · one primary task · one primary CTA** preserved
- [ ] **Accessibility** — keyboard, focus, semantics, color+icon+text (WCAG 2.2 AA)
- [ ] **Localization** — no hardcoded strings; keys added to **en / hi / mr / ur** (+ RTL)
- [ ] **Tokens only** — no hardcoded color / size / space / radius / shadow / duration
- [ ] **Backend-independent** — UI talks to services/repositories, never raw HTTP
- [ ] **Dependency rule** — downward-only, public-`index.ts` imports, no cycles
- [ ] Any structural change carries an **ADR** + a **PROJECT_BRAIN** update

## Quality gates (must be green — CI enforces)

- [ ] `pnpm quality` green locally (typecheck · lint · format · arch · duplicates · tokens · i18n · ds:registry · assets · test · build · perf)
- [ ] Tests added/updated; behaviour (not implementation) tested
- [ ] Relevant **registry rows** updated (Component / Hook / API / Route / Form / Table / State / Theme / Localization / Asset)
- [ ] Docs updated (README / module BRAIN / `docs/**`) where behaviour or contracts changed

## Screenshots / evidence

<!-- UI: before/after + a11y notes. Tooling/docs: paste the green gate output. -->

## Rollback

<!-- How to revert safely if this regresses in production. -->
