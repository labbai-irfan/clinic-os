# Theme

> Part 12 — the implemented theming architecture: how themes remap the semantic tier, the four modes,
> the white-label hook, and how `shared/theme/theme.ts` drives the `<html>` attributes. The theming
> rationale (runtime, no rebuild, SSR-safe) lives in
> **[Frontend-Bible.md §4](../Frontend-Bible.md#4-theming)**. Siblings: [README](./README.md) ·
> [ColorSystem](./ColorSystem.md) · [DesignTokens](./DesignTokens.md).
>
> **Implemented runtime engine (Phase 5):** this doc covers **token** theming; the TypeScript
> **runtime engine** that drives these attributes — provider, manager, registry, loader, validator,
> generator, hooks, utils, and the clinic-branding port — is documented in
> **[docs/theme-engine/](../theme-engine/README.md)**. Consume the theme via `useTheme()` + tokens;
> never bypass `ThemeProvider` or hardcode colors.

---

## 12.1 Architecture — semantic-tier remap only

**Only the semantic tier (Tier 2) is re-mapped.** Primitives and component tokens never change between
themes — that is what lets a single attribute on `<html>` re-skin the whole app at runtime with **no
rebuild and no component re-render** (pure CSS-variable swap). Overrides live in
`src/shared/styles/themes.css`; the light default is `:root` in `tokens/semantic.css`.

```
tokens/semantic.css  :root            → LIGHT (default)
themes.css           [data-theme=dark] / [high-contrast] / [data-large-text] / reduced-motion
                                       → re-map ONLY semantic tokens
```

---

## 12.2 The `<html>` attribute contract (driven by `shared/theme/theme.ts`)

`theme.ts` is a pure DOM + storage module (no React) so the theme can be applied **pre-paint** to avoid
a flash of incorrect theme. It writes these attributes:

| Attribute         | Values                                               | Set by                            |
| ----------------- | ---------------------------------------------------- | --------------------------------- |
| `data-theme`      | `light` \| `dark` \| `high-contrast`                 | `applyTheme()` / `setThemeMode()` |
| `data-large-text` | `true` (present only when on)                        | `applyLargeText()`                |
| `data-motion`     | `reduced` \| `normal` (override; absent = follow OS) | `applyReducedMotion()`            |

Key functions (all in `src/shared/theme/theme.ts`, re-exported from `shared/theme/index.ts`):

| Function                         | Does                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `initTheme()`                    | Bootstrap: applies persisted theme + large-text pre-render; subscribes to OS color-scheme so `system` mode stays live. Returns unsubscribe. |
| `setThemeMode(mode)`             | Resolve (`system` → concrete), apply to `data-theme`, persist. Returns the concrete `Theme`.                                                |
| `resolveTheme(mode)`             | `system` → `dark`/`light` via `prefers-color-scheme`.                                                                                       |
| `applyLargeText(bool)`           | Write/clear `data-large-text`, persist.                                                                                                     |
| `applyReducedMotion(bool\|null)` | `true`→`reduced`, `false`→`normal`, `null` clears (defer to OS).                                                                            |
| `isReducedMotion()`              | Override wins; else OS `prefers-reduced-motion`.                                                                                            |

`ThemeMode` = `'light' | 'dark' | 'high-contrast' | 'system'`; the concrete `Theme` that lands on
`<html>` is one of the first three.

---

## 12.3 The four modes (what each remaps)

### Light (default — `:root`)

The semantic map in `tokens/semantic.css`. See [ColorSystem](./ColorSystem.md) for values.

### Dark (`[data-theme='dark']`)

Lifts brand for contrast (`primary` → `rose-400`, `on-primary` → `stone-900`), inverts surfaces
(`surface` → `stone-900`, `raised` → `stone-800`), inverts text, darkens borders, and darkens the
`-subtle` functional/status/vital backgrounds to `stone-800`. Soft-UI shadows weaken, so
`--elevation-card` leans on surface separation. **Emergency stays vivid.**

### High-contrast (`[data-theme='high-contrast']`)

Max contrast: white surface, black text, `primary` → `rose-800` (AAA on white), **black borders**,
black focus ring at `--border-width-4` (thicker). Functional colors deepen to their `-700` primitives.
**Shadows removed** — depth comes from borders (`--elevation-card: none`). Emergency stays vivid.

### Large Text (`[data-large-text='true']`)

Composes with any theme. Sets `--font-scale: 1.25` (whole type ramp grows — see
[Typography](./Typography.md)), `--tap-target-min` → `--space-16` (64px), and `--button-height-md` →
`--space-16` so controls grow automatically.

> Reduced motion (`@media prefers-reduced-motion` + `data-motion`) is documented in
> [Motion.md](./Motion.md#85-the-reduced-motion-contract).

---

## 12.4 White-label hook — `data-clinic-theme`

A clinic brand re-skins ClinicOS by re-mapping **only** the brand/accent semantic tokens under a
`[data-clinic-theme='<id>']` selector. Because components consume `--color-primary*`/`--color-accent*`
(never primitives), no component changes. This composes with `data-theme` (light/dark/HC).

### Worked example (commented hook in `themes.css`)

```css
/* WHITE-LABEL: a clinic re-maps ONLY brand/accent semantics. Add a primitive
 * ramp for the brand, then alias it here. Composes with data-theme.
 * Example — "Northside Clinic" brands to teal instead of rose: */
[data-clinic-theme='northside'] {
  --color-primary: var(--color-teal-500);
  --color-primary-hover: var(--color-teal-600);
  --color-primary-active: var(--color-teal-700);
  --color-primary-subtle: var(--color-teal-50);
  --color-on-primary: var(--color-white);

  --color-accent: var(--color-rose-500); /* swap accent too if desired */
  --color-on-accent: var(--color-white);
}
```

Apply it alongside the theme:

```html
<html data-theme="dark" data-clinic-theme="northside" data-large-text="true"></html>
```

Rules for a white-label theme:

1. Re-map **only** the brand/accent semantic tokens (and their `on-` colors). Do not touch surfaces,
   text, functional, status, vital, or emergency tokens — those carry meaning across clinics.
2. New brand colors land as **primitives** first, then are aliased here (tier discipline).
3. **Contrast-check** the new `on-primary`/`on-accent` pairings against AA (Bible §9.5) before shipping.
4. Keep it tenant-scoped: one selector per clinic id; no per-component overrides.

---

## Accessibility & usage note

- A semantic token missing from a theme map is a CI failure — add new semantics to **all** maps
  (Bible §12.1).
- High-contrast and Large Text are first-class **modes**, not afterthoughts — they compose with
  light/dark and with white-label.
- Set the theme attribute pre-paint (`initTheme()`) to avoid a flash of incorrect theme.
