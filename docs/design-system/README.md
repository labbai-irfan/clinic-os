# ClinicOS Design System — Token Reference (Phase 4)

> **This is the implemented token reference.** It documents the tokens that actually ship in
> `src/shared/styles/tokens/` plus their Tailwind utility names and usage rules.
> For the **design rationale, philosophy, and "why" behind every decision**, read
> **[Frontend-Bible.md](../Frontend-Bible.md)** — these docs deliberately defer the reasoning to
> the Bible and never re-derive it.

ClinicOS = _Apple · Linear · Stripe · Notion · Vercel_ calm, but usable by elderly, low-literacy,
and non-English-reading healthcare users. If a visual value is not a token, it does not exist.

---

## The 3-tier token architecture

Tokens are CSS custom properties on `:root`, split across three tiers (Bible §3):

```
Tier 1  PRIMITIVE   raw scales      --color-rose-500, --space-4, --radius-lg, --shadow-md
        │           Raw hex/px/ms live ONLY here. Never themed, never consumed by components.
        ▼
Tier 2  SEMANTIC    intent          --color-primary, --color-surface, --text-title
        │           Themeable: light/dark/high-contrast re-map THIS tier only. References primitives.
        ▼
Tier 3  COMPONENT   per-component   --button-bg, --card-radius, --input-border
                    References semantic only. The only thing a component reaches for.
```

**File layout** (`src/shared/styles/`):

| File                    | Tier             | Notes                                              |
| ----------------------- | ---------------- | -------------------------------------------------- |
| `tokens.css`            | barrel           | Only `@import` lines, in tier order                |
| `tokens/primitives.css` | Tier 1           | Raw values                                         |
| `tokens/semantic.css`   | Tier 2           | `:root` = light default                            |
| `tokens/components.css` | Tier 3           | Component aliases + keyframes                      |
| `themes.css`            | Tier 2 overrides | dark / high-contrast / large-text / reduced-motion |

JS consumers (framer-motion, charts, breakpoints) read mirrored numbers/arrays from
`src/shared/theme/tokens.ts` — see [Motion.md](./Motion.md).

---

## The consumption rule (memorize this)

> **Tailwind utility first → semantic CSS var second → NEVER a primitive or a hardcoded value.**

| Order | Reach for                                   | Example                                  |
| ----- | ------------------------------------------- | ---------------------------------------- |
| 1     | A Tailwind utility mapped to a token        | `className="bg-primary text-primary-fg"` |
| 2     | A semantic CSS var (when no utility exists) | `style` only via `var(--color-surface)`  |
| 🚫    | A **primitive** token in a component        | ~~`bg-[var(--color-rose-500)]`~~         |
| 🚫    | A **hardcoded** value                       | ~~`bg-[#e87d7d]`~~ ~~`p-[17px]`~~        |

The contract per layer (Bible §3.6):

| Layer         | May read                            | Must NOT read                   |
| ------------- | ----------------------------------- | ------------------------------- |
| Primitive     | nothing (literals only)             | —                               |
| Semantic      | primitives                          | components                      |
| Component     | semantic (+ primitives for spacing) | other components                |
| TSX component | **component + semantic only**       | raw hex/px, primitives-as-color |

---

## The docs

| Doc                                          | Covers                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [DesignTokens.md](./DesignTokens.md)         | Philosophy summary, tier architecture, naming, master registry                              |
| [ColorSystem.md](./ColorSystem.md)           | Every color token: brand, surface, text, state, functional, status, vital, chart, emergency |
| [Typography.md](./Typography.md)             | Type scale, role aliases, responsive / Large-Text scaling, a11y                             |
| [Spacing.md](./Spacing.md)                   | 8-point grid + usage per context                                                            |
| [Elevation.md](./Elevation.md)               | Shadow levels + semantic elevation aliases + when-to-use                                    |
| [Motion.md](./Motion.md)                     | Durations, eases, presets, framer-motion, reduced-motion contract                           |
| [Theme.md](./Theme.md)                       | Light / dark / high-contrast / large-text + white-label hook                                |
| [DesignGuidelines.md](./DesignGuidelines.md) | Grid / bento, icons, the consumption rules, do/don't gallery                                |

**Spec / rationale (the "why"):** [Frontend-Bible.md](../Frontend-Bible.md) ·
**Source:** [`src/shared/styles/tokens/`](../../src/shared/styles/tokens/)

---

## The component & engineering docs (the UI Kit)

The docs above cover **tokens**. The docs below cover the **component library** built on them — its
architecture, the contract every component must meet, and the developer-experience guides for building,
documenting, testing, and evolving components. The machine-checkable source of truth is the
**[Component Registry](../../src/shared/design-system/registry/component-registry.ts)**, validated +
catalogued by **[`scripts/ds-registry.mjs`](../../scripts/ds-registry.mjs)** (`pnpm ds:registry`).

| Doc                                              | Covers                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [DesignSystem.md](./DesignSystem.md)             | The flagship blueprint — why a design system exists, its layers, categories, how it's kept honest         |
| [ArchitectureGuide.md](./ArchitectureGuide.md)   | The engineering blueprint for the `shared/design-system` package + the performance contract               |
| [ComponentStandards.md](./ComponentStandards.md) | Parts 5–7 — the contract every component must satisfy to enter `@shared/design-system`                    |
| [ContributionGuide.md](./ContributionGuide.md)   | Part 13 — step-by-step add/change a component; the Design-System AI Rules; the registry workflow          |
| [StorybookGuide.md](./StorybookGuide.md)         | Part 9 — CSF3 + autodocs, the a11y addon, theme toolbar, what every story must include, interaction tests |
| [TestingGuide.md](./TestingGuide.md)             | Part 10 — unit/a11y/interaction/snapshot/performance; which components MUST have which tests              |
| [MigrationGuide.md](./MigrationGuide.md)         | Part 11 — SemVer, the registry status lifecycle, breaking-change policy, deprecation windows, codemods    |
| [ComponentRegistry.md](./ComponentRegistry.md)   | The generated catalog of every component (do not hand-edit — run `pnpm ds:registry`)                      |
| [BestPractices.md](./BestPractices.md)           | Part 13 — the field guide: compose-don't-copy, tokens-only, reuse-first, common-mistakes gallery          |

**Binding rules:** [AI_RULES.md](../architecture/AI_RULES.md) ·
**Definition of Done:** [Project-Checklist.md](../Project-Checklist.md) ·
**Registry source:** [`component-registry.ts`](../../src/shared/design-system/registry/component-registry.ts) ·
**Validator/generator:** [`ds-registry.mjs`](../../scripts/ds-registry.mjs)

---

## Accessibility note (applies to every doc)

WCAG 2.2 AA is the floor (Bible §9). Three rules cut across all tokens:

1. **Never color alone** — every status is color **+** icon **+** text.
2. **Targets ≥ 44px** (≥ 56px in Large Text Mode), via `--tap-target-min`.
3. **Reduced motion never removes essential feedback** — it degrades to instant (see [Motion.md](./Motion.md)).
