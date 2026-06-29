# 👩‍💻 DeveloperGuide — using, migrating to, and contributing to the theme engine

> **Part 12 — the practical guide, scoped to the theme engine.** For general contribution rules, the
> async-state contract, testing strategy, and the org-wide developer workflow, read the global
> **[architecture/DeveloperGuide.md](../architecture/DeveloperGuide.md)** — this doc does **not**
> duplicate it. Token rationale lives in [design-system/Theme.md](../design-system/Theme.md). This is
> only the theme-engine how-to.
>
> Siblings: [README](./README.md) · [ThemeEngine](./ThemeEngine.md) · [ThemeUtilities](./ThemeUtilities.md)
> · [ClinicBranding](./ClinicBranding.md) · [AccessibilityTheme](./AccessibilityTheme.md).

---

## Usage guide

### 1. Read the theme

```ts
import {
  useTheme,
  useThemeMode,
  useColorScheme,
  useReducedMotion,
  useLargeText,
  useDensity,
  useDirection,
  useClinicBrand,
} from '@/shared/theme';

function Example() {
  const { resolvedTheme } = useTheme(); // full context value
  const { mode, setMode } = useThemeMode(); // 'system' | 'light' | 'dark' | 'high-contrast'
  const scheme = useColorScheme(); // resolved Theme
  const reduced = useReducedMotion(); // effective boolean
  const { enabled, setEnabled } = useLargeText(); // textScale ↔ boolean
  const { density, setDensity } = useDensity(); // 'comfortable' | 'compact'
  const dir = useDirection(); // 'ltr' | 'rtl' (mirrored from i18n)
  const { brand } = useClinicBrand(); // active ClinicBrand | null
}
```

### 2. Change a preference

```ts
const { setMode } = useThemeMode();
setMode('dark'); // → recompute → data-theme='dark' → persist → notify. No re-render storm.

const { setDensity } = useDensity();
setDensity('compact'); // → data-density='compact'
```

### 3. Style with tokens (the only correct way)

```css
/* ✅ consume semantic tokens — works under every theme + brand */
.card {
  background: var(--color-surface-raised);
  color: var(--color-text);
}
.btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
```

```ts
// ✅ need a concrete value in TS (chart, canvas, <meta theme-color>)? read it.
import { getColor, getToken } from '@/shared/theme';
const primary = getColor('primary');
const space = getToken('--space-4');
```

### 4. Apply a clinic brand

```ts
const { loadClinicBrand, resetClinicBrand } = useClinicBrand();
await loadClinicBrand('northside'); // load via port → validate → generate → paint
resetClinicBrand(); // back to base theme
```

### 5. Export / import preferences

```ts
const { exportPreferences, importPreferences } = useTheme();
const blob = exportPreferences(); // versioned JSON ({ v: 1, preferences })
try {
  importPreferences(blob);
} catch {
  /* malformed → keep current */
}
```

---

## Migration guide (Phase 4 → Phase 5)

The engine **wraps** Phase 4; it does not break it. But new code should consume the engine, not the
low-level functions.

| If your code currently…                                                               | Migrate to…                                                                   |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Calls `setThemeMode()` / `applyLargeText()` / `applyReducedMotion()` from a component | `useThemeMode().setMode`, `useLargeText().setEnabled`, `useTheme().setMotion` |
| Reads `localStorage.getItem('clinicos:theme')`                                        | `useThemeMode().mode` / `useColorScheme()`                                    |
| Subscribes to `matchMedia('(prefers-color-scheme: dark)')` in a component             | `useColorScheme()` (the manager owns the one subscription)                    |
| Reads `document.documentElement.getAttribute('data-theme')`                           | `useColorScheme()`                                                            |
| Hardcodes a hex/size, or a per-clinic CSS override in a component                     | `var(--color-*)` / `getColor()`; brand via the `ClinicBrandSource` port       |
| Needs direction                                                                       | `useDirection()` (never read `document.dir`)                                  |

**What stays:** `theme.ts`'s functions (`resolveTheme`, `applyTheme`, `initTheme`, …) and `tokens.ts`
remain and keep working — the manager uses them internally. The pre-paint no-flash script in
`index.html` still owns first paint. You generally won't call `theme.ts` directly anymore — go through
the provider/hooks.

---

## Contribution guide (theme-engine scoped)

Follow the global workflow in [architecture/DeveloperGuide.md](../architecture/DeveloperGuide.md) and
the AI operating manual ([AI_RULES.md](../architecture/AI_RULES.md)). Engine-specific rules:

- **Add a preference?** New field on `ThemePreferences` + `DEFAULT_PREFERENCES` → a manager mutator →
  `applyThemeState` writes the attribute → a `STORAGE_KEYS` key → one line in the no-flash script → a
  focused hook → barrel export → update [ThemeTypes.md](./ThemeTypes.md) + this guide. A new **mode that
  touches token tiers** is an escalation trigger (design-system + Theme Registry).
- **Add a util?** Put it in `utils/` (pure, leaf, SSR-safe), export via the utils barrel + package
  barrel, document it in [ThemeUtilities.md](./ThemeUtilities.md), and cover it in the smoke test.
- **Add a brand field?** Extend `ClinicBrand` + `clinicBrandSchema` + (if visual) the generator, and
  document it in [ClinicBranding.md](./ClinicBranding.md). Keep optional fields
  `exactOptionalPropertyTypes`-safe.
- **Respect boundaries.** Theme is in `shared/` → import only `shared/*`. Hooks → context; manager →
  utils/model/branding/storage; utils import nothing upward. See
  [ThemeFolderStructure.md](./ThemeFolderStructure.md).
- **Keep the snapshot stable.** Mutators must return a **new** `ThemeState` only on real change.
- **Green repo.** `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build`. No
  `any`. Keep the smoke test (`generateShades` + `contrastRatio` + `mergePreferences`) passing.
- **Update docs + Brain in the same change** (Theme Registry for tokens/mappings, Changelog) per
  [AI_RULES.md §4](../architecture/AI_RULES.md).

---

## Best practices

- ✅ Consume tokens (`var(--color-*)`, `getColor`, `getToken`) — never literals.
- ✅ Read/mutate theme **only** through hooks; never touch `localStorage`/`matchMedia`/`document` for
  theming.
- ✅ Let modes **compose** (theme + brand + large-text + reduced-motion + density + dir) — don't special-case combinations.
- ✅ Brand via the **port**; validate (contrast) before paint.
- ✅ Use logical CSS properties so one `dir` flip mirrors layout.
- ✅ Read direction from `useDirection()`; treat `dir` as i18n-owned.

## Common mistakes

- ❌ Hardcoding `#e11d48` / `16px` instead of a token.
- ❌ `document.documentElement.setAttribute('data-theme', …)` from a component — bypasses the manager
  and breaks the snapshot/persistence.
- ❌ Reading `localStorage` or `matchMedia` directly in a component.
- ❌ Returning a fresh `ThemeState` from `getState()` on every call → `useSyncExternalStore` infinite
  loop.
- ❌ Setting `dir` from the engine and fighting i18n.
- ❌ Shipping a brand on-color that fails AA (the validator will flag it — don't bypass it).
- ❌ Re-exporting `applyTheme` and the new applier under clashing names (the new one is
  `applyThemeState`).

---

## Definition-of-Done checklist (theme-engine changes)

```text
ENGINE
[ ] Preference/util/brand-field added in the right file; barrel-exported; no upward imports
[ ] Manager mutator recomputes + applyThemeState + persists + notifies; snapshot stable on no-op
[ ] STORAGE_KEYS + no-flash script updated if a new persisted/pre-paint attribute was added
[ ] SSR-guarded any new DOM/localStorage/matchMedia touch

TOKENS · A11Y · I18N
[ ] Tokens only — no hardcoded color/size/space/radius/shadow/duration/font
[ ] New brand/mode contrast-checked (validateTheme / pickReadableText) — AA floor
[ ] Direction read from useDirection(); dir left to i18n; logical CSS properties used
[ ] High-contrast / large-text / reduced-motion still compose

QUALITY
[ ] No `any`; strict tsc green; lint (boundaries) green; format green
[ ] Smoke test (generateShades + contrastRatio + mergePreferences) passes
[ ] pnpm build green

DOCS · BRAIN (same change)
[ ] theme-engine docs updated (Types/Utilities/Branding/Architecture as touched) + cross-links
[ ] PROJECT_BRAIN: Theme Registry (tokens/mappings) + Changelog updated
[ ] design-system/Theme.md pointer + architecture pointers still accurate
```

---

_Phase 5 · DeveloperGuide (theme-engine) · the global guide is
[architecture/DeveloperGuide.md](../architecture/DeveloperGuide.md); token rationale is
[design-system/Theme.md](../design-system/Theme.md) · 2026-06-27._
