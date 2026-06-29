# 🛠️ ThemeUtilities — every util: signature + example

> **Part 8 — the pure functions the engine is built from.** These are deterministic, dependency-free
> helpers (color math, contrast, shade generation, token reads, preference handling). They're the
> _mechanism_; the token _values_ and their meanings are the design system's domain —
> [design-system/Theme.md](../design-system/Theme.md) ·
> [ColorSystem.md](../design-system/ColorSystem.md).
>
> Siblings: [README](./README.md) · [ThemeTypes](./ThemeTypes.md) · [ClinicBranding](./ClinicBranding.md)
> · [AccessibilityTheme](./AccessibilityTheme.md).

All utils live under `src/shared/theme/utils/` and are re-exported from the package barrel. They are
**pure** (DOM/storage readers are SSR-guarded and return safe empties off-DOM). Import from
`@/shared/theme`.

---

## `color.ts` — color math

| Function                | Signature                                              | Notes                                            |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| `normalizeHex`          | `(hex: string) => string`                              | Expands `#abc`→`#aabbcc`, lowercases, validates. |
| `hexToRgb`              | `(hex: string) => { r: number; g: number; b: number }` | —                                                |
| `rgbToHex`              | `(rgb: { r; g; b }) => string`                         | —                                                |
| `rgbToHsl` / `hslToRgb` | round-trip HSL ↔ RGB                                   | Used by lighten/darken.                          |
| `lighten`               | `(hex: string, amt: number /*0..1*/) => string`        | Moves toward white in HSL space.                 |
| `darken`                | `(hex: string, amt: number) => string`                 | Moves toward black.                              |
| `relativeLuminance`     | `(rgb: { r; g; b }) => number`                         | WCAG relative luminance (0..1).                  |

```ts
import { lighten, darken, hexToRgb, relativeLuminance } from '@/shared/theme';

lighten('#e11d48', 0.2); // → a lighter rose
darken('#e11d48', 0.2); // → a darker rose
relativeLuminance(hexToRgb('#ffffff')); // → 1
```

## `contrast.ts` — WCAG contrast

| Function           | Signature                                                     | Notes                                                              |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `contrastRatio`    | `(fg: string, bg: string) => number`                          | WCAG ratio, `1`–`21`.                                              |
| `meetsWcagAA`      | `(fg: string, bg: string, large = false) => boolean`          | AA: `4.5` (or `3` for large text).                                 |
| `meetsWcagAAA`     | `(fg: string, bg: string, large = false) => boolean`          | AAA: `7` (or `4.5` for large text).                                |
| `pickReadableText` | `(bg: string, light = '#ffffff', dark = '#1a1514') => string` | Returns whichever of `light`/`dark` reads best on `bg` against AA. |

```ts
import { contrastRatio, meetsWcagAA, pickReadableText } from '@/shared/theme';

contrastRatio('#1a1514', '#ffffff'); // → ~17.9 (AAA)
meetsWcagAA('#ffffff', '#e11d48'); // → true/false for that on-color
pickReadableText('#e11d48'); // → '#ffffff' (the readable on-color)
```

> This is the same AA/AAA floor the design system requires when shipping a white-label pairing
> ([Theme.md §12.4 rule 3](../design-system/Theme.md)) — the engine enforces it in code via the
> validator (see [AccessibilityTheme.md §10](./AccessibilityTheme.md)).

## `generate-shades.ts` — ramps & brand tokens

| Function                   | Signature                                                     | Notes                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateShades`           | `(hex: string) => Record<50\|100\|...\|900, string>`          | Anchors the input at `500`; lightens toward `50`, darkens toward `900`.                                                                                               |
| `generateBrandColorTokens` | `(primary: string, accent: string) => Record<string, string>` | The brand CSS-var map: `--color-primary` + `-hover`(600) + `-active`(700) + `-subtle`(50) + `--color-on-primary` (`pickReadableText`), plus the `--color-accent` set. |

```ts
import { generateShades, generateBrandColorTokens } from '@/shared/theme';

generateShades('#e11d48');
// → { 50:'#fff1f3', ..., 500:'#e11d48', ..., 900:'#5d0c20' }

generateBrandColorTokens('#0d9488', '#e11d48');
// → { '--color-primary':'#0d9488', '--color-primary-hover':'#0c8276',
//     '--color-primary-active':'#0a6b61', '--color-primary-subtle':'#effbf9',
//     '--color-on-primary':'#ffffff', '--color-accent':'#e11d48', ... }
```

> This is the runtime equivalent of "land brand colors as primitives, then alias the brand/accent
> semantics" from [Theme.md §12.4](../design-system/Theme.md) — except the engine **derives** the ramp
> at runtime instead of hand-authoring a CSS block, so a clinic only supplies two hex values.

## `get-token.ts` — read CSS variables

| Function   | Signature                                                             | Notes                                                                 |
| ---------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `getToken` | `(varName: string, el: Element = document.documentElement) => string` | `getComputedStyle().getPropertyValue`, trimmed. **SSR returns `''`.** |
| `getColor` | `(name: ColorTokenName) => string`                                    | Reads `--color-${name}`; typed name (autocomplete + typo-safety).     |

```ts
import { getToken, getColor } from '@/shared/theme';

getToken('--space-4'); // → '1rem' (whatever the active scale resolves to)
getColor('primary'); // → the active theme/brand's resolved primary
```

> **Read tokens, never literals.** This is the TS-side of the Token Rule: a chart, a canvas, or a
> `<meta theme-color>` that needs a concrete value reads it here rather than hardcoding a hex.

## `apply-theme.ts` — write the DOM contract

| Function          | Signature                     | Notes                                                                                                                                                                               |
| ----------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applyThemeState` | `(state: ThemeState) => void` | Sets every data-attr from state: `data-theme`, `data-large-text` (present/absent), `data-motion`, `data-density`, `dir`. Reuses `theme.ts` setters where sensible. **SSR-guarded.** |

```ts
import { applyThemeState } from '@/shared/theme';
// Called by the manager on every change — components never call this directly.
applyThemeState(manager.getState());
```

> This is the engine's single write-point to `<html>` for modes. Brand vars are written separately by
> `applyClinicBrand` (see [ClinicBranding.md](./ClinicBranding.md)).

## `preferences.ts` — preference handling

| Function             | Signature                                                                        | Notes                                                                             |
| -------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `defaultPreferences` | `() => ThemePreferences`                                                         | Returns `DEFAULT_PREFERENCES` (fresh copy).                                       |
| `mergePreferences`   | `(base: ThemePreferences, patch: Partial<ThemePreferences>) => ThemePreferences` | Immutable patch — the basis of every mutator.                                     |
| `exportPreferences`  | `(p: ThemePreferences) => string`                                                | Pretty, **versioned** JSON: `{ v: 1, preferences }`.                              |
| `importPreferences`  | `(json: string) => ThemePreferences`                                             | Parse + validate + merge over defaults; **throws on malformed** (caller catches). |
| `comparePreferences` | `(a, b) => Partial<ThemePreferences>`                                            | The changed keys only — useful for diffing/telemetry (UI prefs, never PHI).       |

```ts
import { mergePreferences, exportPreferences, importPreferences } from '@/shared/theme';

mergePreferences(current, { density: 'compact' }); // → new prefs object

const blob = exportPreferences(current); // → '{ "v": 1, "preferences": { ... } }'
const restored = importPreferences(blob); // → validated prefs (throws if malformed)
```

> **Versioned envelope (`{ v: 1 }`):** lets a future preference shape migrate on import without
> breaking older exports — the kind of forward-compatibility a 10-year system needs.

---

## Why these are pure utils (not methods on the manager)

- **Testable in isolation** — the smoke test exercises `generateShades` + `contrastRatio` +
  `mergePreferences` with **no DOM**, proving the engine's core math.
- **Reusable** — the validator uses `contrast.ts`, the generator uses `generate-shades.ts`,
  `apply-clinic-brand.ts` uses the generator — one implementation, many callers.
- **Boundary-clean** — utils sit at the leaf of the engine's dependency graph
  ([ThemeFolderStructure.md](./ThemeFolderStructure.md)); they import nothing upward, so they never
  cause cycles.

---

_Phase 5 · ThemeUtilities · the mechanism; token values defer to
[design-system/Theme.md](../design-system/Theme.md) and
[ColorSystem.md](../design-system/ColorSystem.md) · 2026-06-27._
