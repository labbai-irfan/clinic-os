# 🏛️ ThemeArchitecture — deep architecture & decision contracts

> **The architecture of the runtime engine** that drives the design system's theming. The design
> system ([design-system/Theme.md](../design-system/Theme.md)) owns the token tiers, the semantic
> remap, and the white-label CSS hook. **This doc owns the runtime architecture**: the data-attribute
> contract, the end-to-end state flow, and a Decision Contract for every major engine choice.
>
> Siblings: [README](./README.md) · [ThemeEngine](./ThemeEngine.md) ·
> [ThemeFolderStructure](./ThemeFolderStructure.md) · [ThemeTypes](./ThemeTypes.md). Architecture canon:
> [architecture/Architecture.md](../architecture/Architecture.md).

---

## 1. The data-attribute contract (the engine's only output to the DOM)

The engine never sets inline styles on components and never injects classes. Its **entire** output is a
set of attributes on `<html>` (extending the Phase-4 contract) plus, for brands, a handful of inline
CSS variables. The CSS cascade does the rest.

| Attribute           | Values                                        | Owner                       | Source                                                          |
| ------------------- | --------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| `data-theme`        | `light` · `dark` · `high-contrast`            | engine                      | resolved from `mode` (+ OS for `system`)                        |
| `data-large-text`   | `true` (present only when on)                 | engine                      | `textScale === 'large'`                                         |
| `data-motion`       | `reduced` · `normal` · _absent_ (= follow OS) | engine                      | `motion`: `system`→absent, `full`→`normal`, `reduced`→`reduced` |
| `data-density`      | `comfortable` · `compact`                     | engine **(new)**            | `density` preference                                            |
| `data-clinic-theme` | `<brandId>`                                   | engine **(new attr usage)** | active clinic brand id; CSS hook exists in `themes.css`         |
| `dir`               | `ltr` · `rtl`                                 | **i18n**                    | engine **mirrors** it; never the authority                      |

> **Why attributes, not classes or inline styles?** Attributes are orthogonal (each mode composes
> independently), they're what the design system's selectors already key on
> ([Theme.md §12.2](../design-system/Theme.md)), and a single write re-skins everything without React.
> The brand path adds inline `--color-*` vars on `<html>` only because a brand's _values_ are dynamic
> (derived at runtime), whereas the modes are static CSS maps.

### The storage keys behind the attributes

Persistence uses **individual** keys (in `STORAGE_KEYS`), not one JSON blob — so the no-flash script can
read each one with no module graph. Existing: `theme`, `locale`, `largeText`, `reducedMotion`,
`queryCache`. **New:** `density`, `clinicBrand`. Detail in [ClinicBranding.md §7](./ClinicBranding.md).

---

## 2. The state flow (boot → live)

```mermaid
sequenceDiagram
  autonumber
  participant HTML as index.html (head)
  participant DOM as &lt;html&gt; element
  participant Prov as ThemeProvider
  participant Mgr as ThemeManager
  participant Sto as Storage
  participant OS as matchMedia (OS)
  participant React as useSyncExternalStore
  participant Comp as Components

  Note over HTML,DOM: PRE-PAINT — before the bundle loads
  HTML->>DOM: read localStorage keys → set data-theme / -large-text / -motion / -density / -clinic-theme
  Note over DOM: correct theme is painted → NO flash

  Note over Prov,Mgr: REACT MOUNT
  Prov->>Mgr: createThemeManager() (once)
  Prov->>Mgr: manager.init()
  Mgr->>Sto: loadPreferences() (individual keys, validated, defaults on miss)
  Mgr->>OS: subscribe prefers-color-scheme + prefers-reduced-motion
  Mgr->>Sto: subscribeStorage() (cross-tab 'storage' event)
  Mgr->>DOM: applyThemeState(state) (adopt / reconcile attributes)
  Prov->>React: useSyncExternalStore(manager.subscribe, manager.getState, manager.getState)
  React-->>Prov: stable snapshot (ThemeState)
  Prov->>Comp: provide ThemeContextValue (state + bound actions)

  Note over Comp,Mgr: LIVE — a user toggles dark mode
  Comp->>Mgr: setMode('dark')  (via useThemeMode())
  Mgr->>Mgr: recompute resolvedTheme / reducedMotion → NEW snapshot
  Mgr->>DOM: applyThemeState() (data-theme='dark')
  Mgr->>Sto: savePreferences()
  Mgr->>React: notify listeners (new snapshot)
  React-->>Comp: re-render only subscribed subtrees
  Note over OS,Mgr: OS color-scheme change only affects mode='system'
```

**Reading the flow:**

1. **Pre-paint** — the no-flash script is the _only_ thing that runs before the bundle; it makes the
   first paint correct.
2. **Adopt, don't fight** — `init()` loads persisted prefs and reconciles the attributes the script
   already set (idempotent: same values → same snapshot reference).
3. **Subscribe once** — the manager owns the OS + cross-tab subscriptions; components never do.
4. **React bridge** — `useSyncExternalStore` reads the **stable snapshot**; the provider memoizes the
   context value so action identities are stable too.
5. **Mutate through the manager** — a component calls an action; the manager recomputes, applies,
   persists, and notifies with a **new** snapshot.

---

## 3. Decision Contracts

Every contract follows the canon shape — **Why · Benefits · Trade-offs · Future scalability ·
Alternatives · Enterprise** — per [Brain §14 / Architecture.md](../architecture/Architecture.md).

### 3.1 CSS variables over JS theme objects

- **Why:** The theme must change with **no component re-render**. A CSS-variable swap is one attribute
  write; a JS theme object means threading values through context/props and re-rendering on change.
- **Benefits:** O(1) theme change; no tree walk; the design system already keys its selectors on the
  attributes; pre-paint works because CSS needs no JS.
- **Trade-offs:** Values live in CSS, not TS, so reading a token from TS needs `getComputedStyle`
  (`getToken`/`getColor`) and SSR returns `''` until hydration.
- **Future scalability:** New tokens/modes are CSS-only; the engine never grows for them. Seasonal and
  white-label skins are additive CSS blocks.
- **Alternatives:** (a) JS theme object + Context — re-renders the tree (rejected). (b) CSS-in-JS
  runtime — per-node style churn + bundle cost (rejected). (c) Class-swap — less composable than
  orthogonal attributes (rejected).
- **Enterprise:** A single contract the whole org consumes; lints stay simple ("no hardcoded color");
  ports cleanly to SSR because the cascade is host-agnostic.

### 3.2 A manager as the single source of truth (vs. scattered hooks)

- **Why:** Theme state has many inputs (prefs, OS color-scheme, OS reduced-motion, cross-tab) and one
  output (the DOM). Centralizing them prevents drift and duplicate subscriptions.
- **Benefits:** One place owns `matchMedia` and `storage` listeners; one immutable snapshot; testable
  in isolation (pure outside `init`); the provider is a thin bridge.
- **Trade-offs:** A bespoke external store to maintain; mitigated by `useSyncExternalStore` (the
  standard React primitive for exactly this).
- **Future scalability:** New preferences are one mutator + one attribute; multiple providers/tests can
  instantiate isolated managers.
- **Alternatives:** (a) Zustand — fine, but the manager must also own DOM application + OS wiring, so a
  purpose-built store is clearer and avoids server-state-in-store confusion. (b) Per-feature hooks each
  reading storage — duplicate subscriptions, drift, no single snapshot (rejected).
- **Enterprise:** Matches the codebase's "one source of truth per data kind"
  ([Architecture.md §8](../architecture/Architecture.md)); theme is UI/session state, not server data.

### 3.3 The stable snapshot (`getState()` returns a new object only on change)

- **Why:** `useSyncExternalStore` calls `getSnapshot` on every render and **tears / loops** if the
  reference changes without a real change.
- **Benefits:** Minimal re-renders; referential equality lets `React.memo` and selector hooks skip work.
- **Trade-offs:** Mutators must build a new object _only_ when something actually changed (and reuse the
  old reference otherwise) — a discipline enforced in `theme-manager.ts`.
- **Future scalability:** Selector hooks (`useColorScheme`, `useDensity`, …) can derive from the stable
  snapshot without extra plumbing.
- **Alternatives:** Recompute a fresh object every call — guarantees an infinite loop (rejected).
- **Enterprise:** A documented invariant + a smoke test guard it; it's the kind of subtle correctness
  bug that must be pinned in a 10-year codebase.

### 3.4 Clinic brand via an injectable PORT (vs. hardcoded brands)

- **Why:** The frontend is **backend-independent** ([Architecture.md §7](../architecture/Architecture.md)).
  Brands must load without coupling the engine to any backend or bundling per-tenant data.
- **Benefits:** `ClinicBrandSource` is a one-method interface the backend implements; the default is a
  registry-backed source for tests/demos; brands are validated + generated at runtime; **no source
  change, no redeploy** to add a clinic.
- **Trade-offs:** Brand values are dynamic, so they arrive as inline `--color-*` vars (not a static CSS
  map); mitigated by the generator deriving a full, contrast-checked ramp.
- **Future scalability:** Swap the source (REST → GraphQL → a CMS) by changing one adapter; the loader
  caches; the registry can be pre-seeded.
- **Alternatives:** (a) A CSS block per clinic checked into the repo — doesn't scale to thousands of
  tenants, needs a redeploy (rejected as the _only_ mechanism; still valid for a handful of static
  skins). (b) Fetch brand CSS files — opaque, unvalidated, no contrast audit (rejected).
- **Enterprise:** Multi-tenant white-labelling at scale; the port is the seam teams own; the validator
  is the compliance gate (a brand can't ship an inaccessible on-color).

### 3.5 Individual storage keys (vs. one JSON blob)

- **Why:** The **no-flash script** must read theme/large-text/motion/density/brand with **no module
  graph**, before the bundle loads. Individual keys are readable with a bare `localStorage.getItem`.
- **Benefits:** Pre-paint works; cross-tab `storage` events are granular; partial reads don't need a
  parse; the script stays tiny and dependency-free.
- **Trade-offs:** Several keys instead of one; export/import re-serializes into a versioned envelope
  (`exportPreferences`/`importPreferences`) for portability.
- **Future scalability:** Add a preference → add a key; the script reads it with one more line.
- **Alternatives:** One `preferences` JSON blob — the script would have to `JSON.parse` and know the
  shape, and a partial write would risk clobbering (rejected for the source-of-truth keys).
- **Enterprise:** Storage is namespaced (`clinicos:`); language stays i18n-owned; nothing here is PHI.

### 3.6 Reuse Phase-4 `theme.ts` (the manager wraps, never replaces)

- **Why:** The existing pure DOM/storage functions already work and are the design system's documented
  contract. Rewriting them would risk regressions and duplicate behavior.
- **Benefits:** The public Phase-4 API keeps working; the manager composes it; the new applier is
  `applyThemeState` so there's no name clash with `applyTheme`.
- **Trade-offs:** Two entry points (the low-level functions and the manager) — resolved by docs: apps
  use the manager via hooks; the functions are internal/legacy-compatible.
- **Future scalability:** New attributes (density) are added alongside without disturbing the originals.
- **Alternatives:** Replace `theme.ts` with the manager — needless churn, breaks the design-system docs
  (rejected).
- **Enterprise:** Backward-compatible evolution; no flag-day migration for existing call sites.

### 3.7 No-flash inline script (vs. applying theme in React)

- **Why:** Applying the theme after React mounts paints the default theme first → a visible flash of
  incorrect theme, which is jarring and an accessibility regression.
- **Benefits:** First paint is correct; the script is self-contained, try/catch-guarded, and reads the
  individual keys directly.
- **Trade-offs:** A small duplicated piece of logic in `index.html` that must stay in sync with the key
  names — pinned by `STORAGE_KEYS` and documented here and in the spec.
- **Future scalability:** New pre-paint attributes get one line in the script.
- **Alternatives:** `useLayoutEffect` (still after first paint), SSR theme cookie (no SSR today)
  (both rejected for a CSR PWA).
- **Enterprise:** Standard pattern for token-driven SPAs; works on the static-CDN deploy model.

---

## 4. Boundary discipline (where the engine sits)

`src/shared/theme/` lives in `shared/` — so it may import **only** other `shared/*` and **never** a
module, entity, or process ([Architecture.md §4](../architecture/Architecture.md)). Internally the
engine respects its own layering: **hooks → context**, **manager → utils / model / branding /
storage**, **branding/generator → utils**, **utils → (pure, deps-free)**. The full allowed/forbidden
matrix is in [ThemeFolderStructure.md](./ThemeFolderStructure.md).

> The one external coupling the engine **mirrors but never owns** is `dir` (LTR/RTL), which belongs to
> i18n. The engine reflects i18n's direction into `ThemeState` so consumers read it from one place —
> it never sets `dir` against i18n. See [AccessibilityTheme.md §11](./AccessibilityTheme.md).

---

_Phase 5 · ThemeArchitecture · runtime architecture for
[design-system/Theme.md](../design-system/Theme.md) · aligned with
[architecture/Architecture.md](../architecture/Architecture.md) · 2026-06-27._
