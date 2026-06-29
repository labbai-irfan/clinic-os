# Contributing to ClinicOS

ClinicOS is a proprietary healthcare SaaS frontend (see [LICENSE](./LICENSE)).
This guide is the short version; the authoritative rules live in the canon under
[`docs/`](./docs/README.md).

> **Read first:** [docs/Brain.md](./docs/Brain.md) (the laws) → [docs/architecture/README.md](./docs/architecture/README.md) → [docs/architecture/DeveloperGuide.md](./docs/architecture/DeveloperGuide.md). AI agents: [docs/architecture/AI_RULES.md](./docs/architecture/AI_RULES.md).

## Prerequisites

- **Node 20+** and **pnpm** (via Corepack: `corepack enable`).
- Install: `pnpm install`. Run the app: `pnpm dev`. Storybook: `pnpm storybook`.

## The quality gate (must be green before every PR)

```bash
pnpm verify        # typecheck + lint + format:check + test
pnpm build         # production build
pnpm ds:registry   # component registry ↔ folders ↔ barrel validation
pnpm check:assets  # duplicate / unused asset check
pnpm e2e           # Playwright smoke (needs `pnpm exec playwright install`)
```

CI runs the same gate on every push/PR (`.github/workflows/ci.yml`) — a red gate blocks merge.

## Non-negotiables (enforced by lint + review)

- **Tokens only** — never hardcode a colour, size, radius, shadow, or font. Use the design tokens / Tailwind utilities.
- **i18n only** — never hardcode user-facing strings; use `t('…')` keys (all of en/hi/mr/ur).
- **Accessibility first** — WCAG 2.2 AA: keyboard-operable, visible focus, ARIA, never colour-alone.
- **Dependency rule** — downward-only imports, only via a slice's `index.ts` (`app → processes → modules → entities → shared`).
- **The UI never talks to the backend** — go through services/repositories (DTO → mapper → Model). No PHI in logs/analytics/storage.

## Adding a component (the registry-first workflow)

1. **Check the [Component Registry](./src/shared/design-system/registry/component-registry.ts) first** — never duplicate; reuse/compose.
2. Scaffold `src/shared/design-system/components/<kebab>/`: `<Pascal>.tsx` (CVA + `forwardRef` + `displayName`), `<Pascal>.stories.tsx`, `<Pascal>.test.tsx`, `index.ts`.
3. Export it from the design-system barrel and **register it** in `component-registry.ts`.
4. Run `pnpm ds:registry` (validates + regenerates `docs/design-system/ComponentRegistry.md`) and the full gate.
5. Update the relevant docs and `docs/brain/PROJECT_BRAIN.md`.

Full standards: [docs/design-system/ContributionGuide.md](./docs/design-system/ContributionGuide.md) · [ComponentStandards.md](./docs/design-system/ComponentStandards.md).

## Git workflow

- Branch from `main`: `feat/…`, `fix/…`, `chore/…`, or `feature/phase-NNN-…`.
- **Conventional Commits** (enforced by commitlint): `feat: …`, `fix: …`, `docs: …`, etc. Lowercase subject, no trailing period.
- Small, focused PRs with a green gate. Update `CHANGELOG.md` for user-facing changes.

## Definition of Done

See [docs/Project-Checklist.md](./docs/Project-Checklist.md) — architecture, data layer, states (loading/empty/error/success), a11y, i18n, performance, security, tests, docs.
