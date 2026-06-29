# ♿ AccessibilityTheme — a11y and direction in the engine

> **Parts 10 & 11 — accessibility and internationalized direction.** The design system defines the
> high-contrast and large-text **modes** and the reduced-motion CSS contract
> ([Theme.md §12.3](../design-system/Theme.md) · [Motion.md](../design-system/Motion.md)). **This doc
> covers how the engine enforces a11y at runtime** — contrast validation, the a11y modes it manages,
> and how it mirrors i18n's `dir` for LTR/RTL/mixed content without fighting i18n.
>
> Siblings: [README](./README.md) · [ThemeEngine](./ThemeEngine.md) · [ThemeUtilities](./ThemeUtilities.md)
> · [ClinicBranding](./ClinicBranding.md). A11y floor: WCAG 2.2 AA
> ([AI_RULES.md §5–6](../architecture/AI_RULES.md)).

---

## Part 10 — Accessibility

WCAG 2.2 AA is the **floor**, not a feature. The engine bakes it in so a theme or brand **cannot** ship
something inaccessible.

### Contrast validation (the engine enforces AA in code)

The design system requires that any white-label `on-primary`/`on-accent` pairing be contrast-checked
against AA before shipping ([Theme.md §12.4 rule 3](../design-system/Theme.md)). The engine **does this
automatically**:

```mermaid
flowchart LR
  BRAND["ClinicBrand (primary, accent)"] --> GEN["generator: on-colors via pickReadableText"]
  GEN --> VAL["validateTheme()"]
  VAL -->|contrastRatio(primary, surface)| AUDIT{"≥ AA?"}
  AUDIT -- no --> WARN["warning/error → block paint"]
  AUDIT -- yes --> OK["brand applies"]
```

- **`pickReadableText(bg)`** chooses the on-color that reads best against the brand color — so the
  generated `--color-on-primary`/`--color-on-accent` are AA by construction.
- **`validateTheme(brand)`** runs the zod shape check **plus** a contrast audit (primary vs
  white/surface) and returns `{ valid, errors, warnings }`; a brand whose on-color falls below AA is
  flagged before it ever paints.
- **`contrastRatio` / `meetsWcagAA` / `meetsWcagAAA`** ([ThemeUtilities.md](./ThemeUtilities.md)) are the
  shared math both the generator and the validator use.

### The a11y modes the engine manages

| Concern                | What the engine does                                                                                                                                                                            | CSS contract                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **High-contrast**      | `mode='high-contrast'` → `data-theme='high-contrast'`; a first-class mode, composes with everything                                                                                             | [Theme.md §12.3 High-contrast](../design-system/Theme.md) (max contrast, AAA primary, black borders, focus ring thicker, shadows removed) |
| **Color-blind safety** | The engine never signals by color alone; it ships **semantic** tokens (status carries icon/label too, per the design system) and contrast-audits brand colors                                   | [ColorSystem.md](../design-system/ColorSystem.md) status/functional tiers                                                                 |
| **Large text**         | `textScale='large'` → `data-large-text='true'`; composes with any theme                                                                                                                         | [Theme.md §12.3 Large Text](../design-system/Theme.md) (`--font-scale: 1.25`, tap target → 64px, button height grows)                     |
| **Focus**              | The engine sets `data-theme`; the design system's high-contrast map thickens the focus ring; the engine never removes focus styling                                                             | [Theme.md §12.3](../design-system/Theme.md)                                                                                               |
| **Reduced motion**     | `motion`: `system`→`data-motion` absent (CSS follows OS), `full`→`normal`, `reduced`→`reduced`; effective value surfaced as `reducedMotion: boolean` in state                                   | [Motion.md §reduced-motion](../design-system/Motion.md)                                                                                   |
| **Keyboard**           | Theme controls are state-driven; the engine exposes plain values/actions (`useReducedMotion`, `useLargeText`, …) so keyboard-operable toggles are trivial to build with no color-only signaling | component responsibility, engine-enabled                                                                                                  |

> **Engine ↔ design-system split:** the engine **chooses and persists** the a11y mode and **writes the
> attribute**; the design system defines **what each mode looks like**. The engine adds the contrast
> _enforcement_ in code so the AA floor is machine-checked for dynamic brands, not just hand-checked.

### A11y is composable, never an afterthought

High-contrast + large-text + reduced-motion + density all compose with each other and with any theme or
brand — they're orthogonal attributes ([ThemeArchitecture.md §1](./ThemeArchitecture.md)). The effective
booleans a component needs (`reducedMotion`, large-text `enabled`) come straight from `ThemeState`, so a
component branches on accessible state without re-deriving it.

---

## Part 11 — Direction & internationalized typography (LTR / RTL / mixed)

ClinicOS supports en/hi/mr/**ur** — and Urdu is **RTL**. Direction is an **i18n concern**; the engine's
job is to **mirror** it, never to own it.

### The engine mirrors `dir`, it never fights i18n

```mermaid
flowchart LR
  I18N["i18n (locale → dir)"] -->|source of truth| DIR["dir on &lt;html&gt;"]
  I18N -->|setDirection(dir)| MGR["ThemeManager"]
  MGR -->|mirror into| STATE["ThemeState.direction"]
  STATE --> HOOK["useDirection()"]
  HOOK --> COMP["components read one source"]
  classDef src fill:#6B8E8E,stroke:#3f5757,color:#fff;
  class I18N src;
```

- **i18n is authoritative for `dir`.** When the locale changes, i18n sets `dir`; the engine's
  `setDirection(dir)` simply **reflects** that into `ThemeState.direction` so consumers read direction
  from **one** place (`useDirection()`) instead of poking `document.dir`.
- **`RTL_LOCALES = ['ur', 'ar', 'he', 'fa']`** is a constant the engine carries to _recognize_ RTL when
  mirroring — not to decide locale (that's i18n's job).
- **The engine never sets `dir` against i18n.** No race, no double-source-of-truth. This is the one
  external coupling the engine explicitly **defers** on.

### LTR / RTL / mixed content

- **Logical properties, not physical.** Components use logical CSS (`margin-inline-start`, etc.) so a
  single `dir` flip mirrors the layout — the codebase already forbids physical direction props
  ([AI_RULES.md §5](../architecture/AI_RULES.md)). The engine's attribute model means the flip is one
  attribute and no re-render.
- **Mixed content** (e.g. an English drug name inside Urdu text, or LTR numerals/IDs) relies on the
  browser's bidi algorithm under the correct `dir`; because the engine keeps `dir` honest and global,
  embedded runs resolve correctly without per-component overrides.

### Dynamic typography & language fonts

- **Type scale is token-driven.** Large-text sets `--font-scale: 1.25` and the whole ramp grows
  ([Typography.md](../design-system/Typography.md)) — the engine flips `data-large-text`; the scale is
  the design system's. No hardcoded font sizes anywhere.
- **Per-language fonts** are selected by i18n/font tokens, not the engine; the engine composes with them
  (a brand or theme change never overrides the language font). Brand `document` fields can carry
  document-specific branding, but body type stays token + language-driven.

> **Net:** the engine owns **theme/density/a11y attributes**; i18n owns **`dir` + language/fonts**. They
> compose on the same `<html>` element without conflict, and components read both from typed hooks
> rather than the DOM.

---

_Phase 5 · AccessibilityTheme · WCAG enforced in the engine, direction deferred to i18n · mode visuals
defer to [design-system/Theme.md](../design-system/Theme.md) · 2026-06-27._
