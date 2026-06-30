# ClinicOS — Performance Budgets

> This document defines the **performance budget system** for the ClinicOS frontend and the WHY behind every number. It **extends** the engineering canon — it never contradicts it. Budgets are an operational expression of Law 2 (calm by default) and Law 3 (accessibility is a feature): a fast, stable UI is an accessible UI. Where a number here and the canon disagree, the canon ([../brain/PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)) wins.

Performance is a contract, not an aspiration. ClinicOS enforces it mechanically: [`scripts/quality/check-perf-budget.mjs`](../../scripts/quality/check-perf-budget.mjs) reads [`scripts/quality/budgets.json`](../../scripts/quality/budgets.json) and measures the real `dist/` output of a production build. If any asset class exceeds its budget, the build fails. This runs locally (`pnpm check:perf`) and in [CI](../../.github/workflows/ci.yml) as part of the [quality gate](./QualityGates.md).

---

## 1. How measurement works

- **Text assets** (`*.js`, `*.css`, `*.html`) are measured **gzipped** — this is the **wire weight** the browser actually downloads. Measuring raw bytes would punish readable code and reward nothing real.
- **Binary assets** (fonts `*.woff2`, images `*.png/.jpg/.webp/.svg`) are measured **raw** — they are already compressed; gzip would barely change them and would misrepresent transfer cost.
- **Source maps** (`*.map`) are **excluded** — they ship for debugging and are not served to end users on the critical path.
- The script sums per-class totals and tracks the **max single file** per class, then compares against `budgets.json`.

**Why this split:** budgets must reflect _what the user pays for over the network_, not what sits on disk. **Benefit:** the number on the dashboard is the number in the user's browser. **Tradeoff:** gzip ≠ brotli (most CDNs serve brotli, which is smaller), so the gzip budget is a deliberately conservative ceiling — real transfer is usually a little lighter.

```bash
pnpm build          # produce dist/ (required first — budgets measure real output)
pnpm check:perf     # scripts/quality/check-perf-budget.mjs vs budgets.json
pnpm analyze        # rollup-plugin-visualizer treemap — find the heavy chunk
```

---

## 2. The budgets (`budgets.json`)

| Class                    | Budget       | Measure              | Current (Foundation v9) | Headroom |
| ------------------------ | ------------ | -------------------- | ----------------------- | -------- |
| JS total                 | ≤ **300 KB** | gzipped              | ~234 KB gz              | ~22%     |
| JS max single chunk      | ≤ **170 KB** | gzipped              | ~128 KB gz              | ~25%     |
| CSS total                | ≤ **24 KB**  | gzipped              | ~11 KB gz               | ~54%     |
| Fonts total              | ≤ **360 KB** | raw                  | ~269 KB (10 × woff2)    | ~25%     |
| Fonts max file           | ≤ **110 KB** | raw                  | within budget           | —        |
| Images max file          | ≤ **250 KB** | raw                  | within budget           | —        |
| **Page transfer weight** | ≤ **640 KB** | gz text + raw binary | ~516 KB                 | ~19%     |

**Rationale per line:**

- **JS total ≤ 300 KB gz** — the parse/compile/execute cost of JS dominates time-to-interactive on mid-range devices. 300 KB gz (~1 MB unzipped) is the upper bound at which a typical Android device stays under our INP target. ~234 KB current leaves room for two or three more lazy modules before the ceiling bites.
- **Max single chunk ≤ 170 KB gz** — a single huge chunk defeats code-splitting and blocks first paint. Capping the largest chunk forces vendor/route splitting. ~128 KB current.
- **CSS total ≤ 24 KB gz** — Tailwind is token-mapped and purged; runaway CSS signals un-tree-shaken utilities or hand-written overrides that should be tokens (Law 5). ~11 KB confirms the purge is working.
- **Fonts total ≤ 360 KB raw / max 110 KB** — we ship Latin + Devanagari + Arabic coverage (en/hi/mr/ur). Four scripts is inherently heavy; 360 KB across ≤ 10 subsetted `woff2` is the negotiated ceiling. ~269 KB today; per-file cap stops anyone shipping an un-subset 300 KB face.
- **Images max file ≤ 250 KB raw** — no single decorative asset may dominate page weight; anything larger must be responsive/lazy or is the wrong format.
- **Page transfer weight ≤ 640 KB** — the headline budget: total bytes for a first meaningful view (gz text + raw binary). 640 KB keeps us inside a "fast 3G feels usable" envelope for clinics on poor connectivity. ~516 KB current.

---

## 3. Budgets & targets per concern

### 3.1 JavaScript

- **Budget:** ≤ 300 KB gz total, ≤ 170 KB gz per chunk. **Why:** JS is the most expensive byte (download + parse + execute). **Benefits:** snappy INP, lower memory. **Tradeoffs:** aggressive splitting adds request count — acceptable over HTTP/2/3. **Example:** moving a charting lib behind a lazy route drops the entry chunk under cap.

### 3.2 CSS

- **Budget:** ≤ 24 KB gz total. **Why:** render-blocking; bloat means un-purged Tailwind or off-token CSS. **Benefits:** faster FCP, enforces token discipline (Law 5). **Tradeoffs:** none meaningful — large CSS is almost always a smell. **Example:** a hand-written `style.css` with hex colors fails token checks _and_ inflates CSS.

### 3.3 Images

- **Target:** ≤ 250 KB per file; prefer `webp`/`avif`, responsive `srcset`, `loading="lazy"` below the fold. **Why:** images are the easiest weight to waste. **Benefits:** lower LCP and page weight. **Tradeoffs:** more build/asset pipeline work. **Example:** a 900 KB hero `png` → 60 KB `webp`.

### 3.4 Fonts

- **Budget:** ≤ 360 KB raw total, ≤ 110 KB per file; subset per script, `woff2` only, `font-display: swap`, preload the critical face. **Why:** four writing systems are costly and fonts block text paint. **Benefits:** stable text rendering, no FOIT. **Tradeoffs:** swap risks a brief FOUT — accepted over blank text. **Example:** subsetting Devanagari to used glyphs cuts a face by half.

### 3.5 Icons

- **Rule:** use `lucide-react` **tree-shaken** (named imports only) or an **SVG sprite** for repeated glyphs — never an icon font, never `import * as Icons`. **Why:** barrel/star imports defeat tree-shaking and inflate JS. **Benefits:** only used icons ship. **Tradeoffs:** sprite needs a build step. **Example:** ✅ `import { Calendar } from 'lucide-react'` ❌ `import * as Icons from 'lucide-react'`.

### 3.6 Bundle (code-splitting)

- **Rule:** split per route and per module; vendor libs in their own chunk; heavy/optional features lazy. **Why:** users download only what the current screen needs (Law 1 — one screen, one task). **Benefits:** small entry chunk, fast first paint. **Tradeoffs:** chunk graph complexity — observable via `pnpm analyze`. **Example:** `const BillingModule = lazy(() => import('modules/billing'))`.

### 3.7 Lazy-Loaded Chunks

- **Rule:** route/module chunks load on demand behind `Suspense` with a skeleton that reserves layout. **Why:** defers non-critical JS off the critical path. **Benefits:** lower initial JS, better INP. **Tradeoffs:** a navigation fetch — masked by prefetch on intent (hover/focus) and skeletons. **Example:** prefetch the next-step chunk when the primary CTA gains focus.

### 3.8 Page Weight

- **Budget:** ≤ 640 KB total transfer for first meaningful view. **Why:** the single number that correlates with perceived speed on weak networks. **Benefits:** keeps every other budget honest in aggregate. **Tradeoffs:** a global cap can mask a local regression — that is why per-class caps exist alongside it. **Example:** adding a new font _and_ a new vendor chunk can pass each class yet breach page weight — fix by lazy-loading one.

### 3.9 Memory

- **Targets:** no leaks; clean up effects, subscriptions, timers, observers on unmount; bound TanStack Query caches (`gcTime`/`staleTime`) and any in-memory list. **Why:** long clinic sessions never reload; leaks degrade the tab over hours. **Benefits:** stable long-running sessions. **Tradeoffs:** explicit teardown is more code. **Example:** ✅ `useEffect(() => { const id = setInterval(...); return () => clearInterval(id) }, [])`.

### 3.10 CPU

- **Targets:** never block the main thread; debounce/throttle high-frequency input (search, resize, scroll); move heavy compute (CSV/PDF, large transforms) to a Web Worker. **Why:** main-thread work delays INP and freezes the UI. **Benefits:** responsive interactions under load. **Tradeoffs:** workers add messaging complexity. **Example:** debounce patient search 250 ms; parse a large export in a worker.

### 3.11 Rendering — Core Web Vitals

- **Targets:** **LCP ≤ 2.5 s**, **INP ≤ 200 ms**, **CLS ≤ 0.1**.

  | Metric | Budget   | Primary lever                                                         |
  | ------ | -------- | --------------------------------------------------------------------- |
  | LCP    | ≤ 2.5 s  | small entry JS, preload hero font/image, SSR-less fast paint          |
  | INP    | ≤ 200 ms | thin main thread, code-split, debounce, memoize hot paths             |
  | CLS    | ≤ 0.1    | reserve space with skeletons, sized media, no layout-shifting injects |

- **Practices:** virtualize long lists (appointment/patient tables); skeletons that match final layout to reserve space; **stable keys** (never array index for dynamic lists); memoization (`useMemo`/`memo`) only **where measured** — not by reflex (Law 8). **Why:** these three metrics are the user's felt experience and our a11y floor. **Tradeoffs:** virtualization complicates find-in-page and a11y — pair it with proper ARIA and tested keyboard nav. **Example:** a 5,000-row patient list renders ~20 rows via virtualization with stable `patient.id` keys.

---

## 4. Investigating a budget failure

1. `pnpm build` to produce the real `dist/`.
2. `pnpm check:perf` — the script prints **which class** breached and by how much, with the offending file(s).
3. `pnpm analyze` — open the treemap; find the chunk/module that grew.
4. Apply the right lever: lazy-load a route/module, replace a heavy dependency, subset a font, convert an image, or tree-shake an icon import.
5. Re-build and re-check. Confirm the whole gate with `pnpm quality`.

```text
✖ JS total exceeds budget: 312.4 KB gz > 300 KB gz (+12.4)
   largest chunk: vendor-charts-a1b2.js  151 KB gz
→ lazy-load the charts module behind its route.
```

---

## 5. The ratchet rule

Budgets in `budgets.json` may only ever **tighten** as the app gets leaner. **Loosening any budget requires an ADR** ([DocumentationStandards.md](./DocumentationStandards.md)) documenting Why · Benefits · Trade-offs · Alternatives · Future scalability, reviewed and recorded in [QualityRegistry.md](./QualityRegistry.md) and [../brain/PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md). **Why:** without a ratchet, budgets drift upward one "small" exception at a time until they mean nothing. **Benefit:** performance can only improve or stay flat. **Tradeoff:** a real, justified increase (e.g. a fifth locale's font) takes paperwork — by design.

See also: [README.md](./README.md) · [EngineeringStandards.md](./EngineeringStandards.md) · [QualityGates.md](./QualityGates.md) · [LintRules.md](./LintRules.md) · [DefinitionOfDone.md](./DefinitionOfDone.md) · [AIQualityRules.md](./AIQualityRules.md) · [../architecture/AI_RULES.md](../architecture/AI_RULES.md) · [../Project-Checklist.md](../Project-Checklist.md) · [../Frontend-Bible.md](../Frontend-Bible.md).

---

_Phase 9 · Engineering Quality Platform · Part 5 · Status: **Foundation v9** · 2026-06-30_
_Cross-links: [QualityGates.md](./QualityGates.md) · [budgets.json](../../scripts/quality/budgets.json) · [check-perf-budget.mjs](../../scripts/quality/check-perf-budget.mjs) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md)_
