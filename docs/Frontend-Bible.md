# 🎨 ClinicOS — Frontend-Bible.md

> **The Design System contract.** Tokens are the law; components are the vocabulary; accessibility is always-on.
> Read **[Brain.md](./Brain.md)** first — this document is the design-system expansion of Brain §6 (tokens), §7 (a11y), §8 (i18n).
>
> _If a visual value is not a token, it does not exist. If a string is not an i18n key, it does not ship._

---

## Table of contents

1. [Purpose & philosophy](#1-purpose--philosophy)
2. [Design principles (do / don't)](#2-design-principles-do--dont)
3. [The token system](#3-the-token-system) ← the heart
4. [Theming (light / dark / high-contrast / large text / RTL)](#4-theming)
5. [Typography](#5-typography)
6. [Iconography, imagery & illustration](#6-iconography-imagery--illustration)
7. [Layout system (Bento, breakpoints, scaffolding)](#7-layout-system)
8. [Component library (the ui-kit)](#8-component-library)
9. [Accessibility guide](#9-accessibility-guide) ← critical
10. [Motion](#10-motion)
11. [Content & voice](#11-content--voice)
12. [Governance](#12-governance)

---

## 1. Purpose & philosophy

The **Frontend-Bible** is the single source of truth for _how ClinicOS looks, feels, and behaves_. It is the contract between designers, developers, and AI agents. Every screen in the patient journey (Brain §1) is assembled from the tokens, components, and patterns defined here.

ClinicOS must feel like **Apple · Linear · Stripe · Notion · Vercel** — quiet, confident, precise — while remaining usable by **elderly, low-literacy, and non-English-reading healthcare users**. The litmus test (Brain §3): _Could a non-technical 65-year-old complete the primary task on the first try, in their language?_

### 1.1 The five adjectives

| Adjective               | What it means in practice                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Simple**              | One Screen · One Task · One CTA. Nothing on screen that does not serve the primary task.                     |
| **Minimal**             | Generous whitespace, restrained color, few words. Remove until it breaks, then add one back.                 |
| **Enterprise**          | Predictable, consistent, themeable, audited, accessible, localized — at scale, for 10+ years.                |
| **Calm**                | Soft surfaces, low contrast where safe (high where needed), minimal motion, no alarming reds for non-errors. |
| **Healthcare-friendly** | Large targets, large type, icons + words, plain language, error-proofing, trust.                             |

### 1.2 The product laws this doc enforces (from Brain §2)

- **Law 5 — Every color/size/space is a token.** This doc _is_ the token registry.
- **Law 4 — Every string is localized.** Every example below consumes i18n keys, never literals.
- **Law 3 — Accessibility is a feature, not a setting.** §9 is non-optional.
- **Law 1 — One Screen · One Task · One CTA.** §7 governs where the single CTA lives.

> **Token Rule (Brain §6):** Components consume **semantic** and **component** tokens only — never primitives, never raw hex/px. Themes re-map the semantic tier; components never change.

---

## 2. Design principles (do / don't)

Concrete guidance for _healthcare_ screens specifically.

| Principle                  | ✅ Do                                                                             | ❌ Don't                                                              |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **One primary action**     | One filled `Button` ("Check in patient"). Everything else is `secondary`/`ghost`. | Three filled buttons of equal weight competing for attention.         |
| **Plain language**         | "Blood pressure", "Save and continue".                                            | "Sys/Dia mmHg", "Commit vitals payload".                              |
| **Icons + words**          | Pair every icon with a localized label (elderly/low-literacy).                    | Icon-only buttons for primary flows with no visible text.             |
| **Calm color**             | Use `--color-primary` (rose) sparingly for _the_ action.                          | Flooding the screen in brand rose; using danger-red for neutral info. |
| **Never color alone**      | Status = color **+** icon **+** text ("Overdue ⚠ Overdue").                       | A red dot as the only signal of an overdue task.                      |
| **Large targets**          | ≥44px hit area (≥56px in Large Text Mode).                                        | 24px icon buttons crammed in a toolbar.                               |
| **Progressive disclosure** | Show the 3 fields needed now; reveal advanced on request.                         | A 30-field form on one screen "to save clicks".                       |
| **Forgiving input**        | Inline validation, undo, confirm destructive actions.                             | Silent data loss; irreversible deletes with no confirm.               |
| **Stable layout**          | Skeletons that match final layout (no shift).                                     | Spinners that collapse then jump when data lands.                     |
| **Trust & privacy**        | Show clinic/patient context clearly; mask sensitive data by default.              | Ambiguous "Patient 3" with no name/photo verification.                |
| **Quiet motion**           | 150–250ms ease for feedback; respect reduced-motion.                              | Bouncy, looping, attention-grabbing animation on clinical data.       |

### 2.1 The four async states (Brain §11) — required on every data surface

1. **Loading** → `Skeleton` (preferred) — never layout shift.
2. **Empty** → `EmptyState` — illustration + one primary action.
3. **Error** → `ErrorState` — localized human message + retry.
4. **Success** → content + optimistic feedback (`Toast`/inline).

---

## 3. The token system

> Three tiers (Brain §6.1): **Primitive → Semantic → Component.** Defined as CSS custom properties on `:root`. Tailwind's theme maps _only_ to these variables (see §3.7). CVA selects between component/semantic tokens.

> **✅ Implemented in Phase 4.** This token system now ships in code under [`src/shared/styles/tokens/`](../src/shared/styles/tokens/) (`primitives.css` · `semantic.css` · `components.css`). The full **implemented token reference** — every shipped token, its Tailwind utility, and usage rules — lives in **[docs/design-system/](./design-system/README.md)**. This section remains the design **spec/rationale**; the design-system docs defer the "why" here and do not repeat it.

```
Tier 1 PRIMITIVE   raw scales      --color-rose-500, --space-4, --radius-lg, --shadow-md
        │           (never themed, never consumed by components directly)
        ▼
Tier 2 SEMANTIC    intent          --color-primary, --color-surface, --color-text
        │           (themeable: light/dark/high-contrast re-map THIS tier only)
        ▼
Tier 3 COMPONENT   per-component   --button-bg, --card-radius, --input-border
                    (reference semantic; the only thing a component reaches for)
```

### 3.1 Tier 1 — Primitive color ramps

Brand anchors (Brain §6.2): **rose** `#E87D7D` · **sand** `#F8F3F0` · **teal** `#6B8E8E` · **stone** `#827473`. Each is expanded into a 50–900 ramp. Functional ramps (success/warning/danger/info) are tuned to be **color-blind safe** (distinct in hue _and_ lightness; always paired with icon/text per the never-color-alone rule).

```css
/* tokens/primitives/color.css — Tier 1. Raw values live ONLY here. */
:root {
  /* ---- Rose (Primary brand · anchor 500 = #E87D7D) ---- */
  --color-rose-50: #fdf4f4;
  --color-rose-100: #fbe6e6;
  --color-rose-200: #f6caca;
  --color-rose-300: #f1abab;
  --color-rose-400: #ed9494;
  --color-rose-500: #e87d7d; /* brand anchor */
  --color-rose-600: #d85f5f;
  --color-rose-700: #b94b4b;
  --color-rose-800: #934040; /* AA text on rose-50 */
  --color-rose-900: #6e3232;

  /* ---- Sand (Surface / Secondary · anchor 100 = #F8F3F0) ---- */
  --color-sand-50: #fffdfc;
  --color-sand-100: #f8f3f0; /* app background anchor */
  --color-sand-200: #f0e8e3;
  --color-sand-300: #e5d9d2;
  --color-sand-400: #d6c6bd;
  --color-sand-500: #c2aea3;
  --color-sand-600: #a6907f; /* tones added for borders/dividers */
  --color-sand-700: #847061;
  --color-sand-800: #5e4f44;
  --color-sand-900: #3a302a;

  /* ---- Teal (Accent · anchor 500 = #6B8E8E) ---- */
  --color-teal-50: #f1f6f6;
  --color-teal-100: #deeaea;
  --color-teal-200: #bfd5d5;
  --color-teal-300: #9cbdbd;
  --color-teal-400: #84a6a6;
  --color-teal-500: #6b8e8e; /* accent anchor */
  --color-teal-600: #577777;
  --color-teal-700: #466060;
  --color-teal-800: #374b4b;
  --color-teal-900: #283636;

  /* ---- Stone (Neutral · anchor 500 = #827473) ---- */
  --color-stone-50: #f7f5f5;
  --color-stone-100: #eeebea;
  --color-stone-200: #dad4d3;
  --color-stone-300: #bfb6b5;
  --color-stone-400: #a0918f;
  --color-stone-500: #827473; /* neutral anchor */
  --color-stone-600: #6b5f5e;
  --color-stone-700: #554b4a;
  --color-stone-800: #3d3635;
  --color-stone-900: #241f1e;

  /* ---- Functional: SUCCESS (green-teal, distinct from accent) ---- */
  --color-success-50: #ecf7f0;
  --color-success-100: #d2eddc;
  --color-success-300: #86cfa3;
  --color-success-500: #2e9e5b; /* AA on white; pairs with check icon */
  --color-success-700: #1f7342;
  --color-success-900: #134628;

  /* ---- Functional: WARNING (amber — high L, needs dark text) ---- */
  --color-warning-50: #fdf6ea;
  --color-warning-100: #fae9c8;
  --color-warning-300: #f2c969;
  --color-warning-500: #d9961a; /* AA on white as text/icon */
  --color-warning-700: #a06a0c;
  --color-warning-900: #5e3d04;

  /* ---- Functional: DANGER (red — kept distinct from brand rose) ---- */
  --color-danger-50: #fceeee;
  --color-danger-100: #f8d7d7;
  --color-danger-300: #ec9a9a;
  --color-danger-500: #cf3a3a; /* AA on white; pairs with alert icon */
  --color-danger-700: #9e2626;
  --color-danger-900: #5f1616;

  /* ---- Functional: INFO (blue — color-blind anchor vs warning/danger) ---- */
  --color-info-50: #ebf3fb;
  --color-info-100: #cfe2f6;
  --color-info-300: #84b6e8;
  --color-info-500: #2f73c2; /* AA on white; pairs with info icon */
  --color-info-700: #1e4f8a;
  --color-info-900: #122f53;

  /* ---- Absolute neutrals ---- */
  --color-white: #ffffff;
  --color-black: #1a1514; /* warm near-black, not pure #000 (calm) */
}
```

> **Color-blind safety note:** danger (red ~`#CF3A3A`) and success (green ~`#2E9E5B`) are separated in _lightness_ as well as hue, and danger is held distinct from brand **rose** so "error" never reads as "brand". Info (blue) and warning (amber) anchor the deutan/protan axis. **Color is never the sole signal** — §9 mandates an icon + text label for every status.

### 3.2 Tier 1 — Spacing, radius, elevation, borders, z-index, motion

```css
/* tokens/primitives/space.css — 4px base scale (Brain §6.4) */
:root {
  --space-0: 0;
  --space-1: 0.25rem; /*  4px */
  --space-2: 0.5rem; /*  8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
}

/* tokens/primitives/radius.css — rounded, soft (Brain §6.4) */
:root {
  --radius-none: 0;
  --radius-sm: 0.375rem; /*  6px — chips, tags */
  --radius-md: 0.625rem; /* 10px — inputs, buttons */
  --radius-lg: 0.875rem; /* 14px — cards */
  --radius-xl: 1.25rem; /* 20px — bento tiles, modals */
  --radius-2xl: 1.75rem; /* 28px — hero surfaces */
  --radius-full: 9999px; /* pills, avatars, switches */
}

/* tokens/primitives/elevation.css — Soft-UI: low-spread, low-opacity, warm-tinted */
:root {
  --shadow-none: none;
  --shadow-xs: 0 1px 2px 0 rgba(60, 45, 42, 0.04);
  --shadow-sm: 0 1px 3px 0 rgba(60, 45, 42, 0.06), 0 1px 2px -1px rgba(60, 45, 42, 0.05);
  --shadow-md: 0 4px 12px -2px rgba(60, 45, 42, 0.08), 0 2px 6px -2px rgba(60, 45, 42, 0.05);
  --shadow-lg: 0 12px 28px -6px rgba(60, 45, 42, 0.1), 0 6px 12px -6px rgba(60, 45, 42, 0.06);
  --shadow-xl: 0 24px 48px -12px rgba(60, 45, 42, 0.14);
  /* Soft-UI inner highlight for raised tiles (subtle, optional) */
  --shadow-inset: inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
}

/* tokens/primitives/border.css */
:root {
  --border-width-0: 0;
  --border-width-1: 1px; /* default hairline */
  --border-width-2: 2px; /* focus rings, emphasis */
  --border-width-4: 4px; /* high-contrast theme */
}

/* tokens/primitives/z-index.css */
:root {
  --z-base: 0;
  --z-raised: 10; /* sticky headers, raised bento */
  --z-dropdown: 1000; /* select, combobox, menu */
  --z-sticky: 1100;
  --z-overlay: 1200; /* drawer/modal backdrop */
  --z-modal: 1300;
  --z-popover: 1400; /* tooltip, popover */
  --z-toast: 1500; /* always on top */
}

/* tokens/primitives/motion.css — minimal, calm (Brain §6.4) */
:root {
  --duration-instant: 75ms;
  --duration-fast: 150ms; /* hover, focus, small state */
  --duration-base: 220ms; /* default UI transitions */
  --duration-slow: 320ms; /* drawer/modal enter */
  --duration-slower: 480ms; /* large surface, rarely */

  --ease-standard: cubic-bezier(0.2, 0, 0, 1); /* enter/exit default */
  --ease-decelerate: cubic-bezier(0, 0, 0, 1); /* entering */
  --ease-accelerate: cubic-bezier(0.3, 0, 1, 1); /* exiting */
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1.2); /* gentle, rare */
}
```

### 3.3 Tier 2 — Semantic tokens (LIGHT theme map)

Semantic tokens express **intent**. Components reach for these (or component tokens that alias these). Themes in §4 re-map _only this block_.

```css
/* tokens/semantic/light.css — the default theme. */
:root,
[data-theme='light'] {
  /* Brand / interactive */
  --color-primary: var(--color-rose-500);
  --color-primary-hover: var(--color-rose-600);
  --color-primary-active: var(--color-rose-700);
  --color-primary-subtle: var(--color-rose-50);
  --color-on-primary: var(--color-white); /* text/icon ON primary */

  --color-accent: var(--color-teal-500);
  --color-accent-hover: var(--color-teal-600);
  --color-on-accent: var(--color-white);

  /* Surfaces */
  --color-surface: var(--color-sand-100); /* app background */
  --color-surface-raised: var(--color-white); /* cards, bento, modals */
  --color-surface-sunken: var(--color-sand-200); /* wells, table headers */
  --color-surface-overlay: rgba(36, 31, 30, 0.45); /* scrim */

  /* Text (warm neutrals — never pure black) */
  --color-text: var(--color-stone-900);
  --color-text-muted: var(--color-stone-600);
  --color-text-subtle: var(--color-stone-500);
  --color-text-on-surface: var(--color-stone-900);

  /* Lines */
  --color-border: var(--color-sand-300);
  --color-border-strong: var(--color-stone-300);
  --color-divider: var(--color-sand-200);

  /* Focus (Brain §7: token-driven :focus-visible ring) */
  --color-focus: var(--color-teal-600);
  --focus-ring-width: var(--border-width-2);
  --focus-ring-offset: var(--border-width-2);

  /* Functional — each with an on-color for text/icon placed on the fill */
  --color-success: var(--color-success-500);
  --color-success-subtle: var(--color-success-50);
  --color-on-success: var(--color-white);

  --color-warning: var(--color-warning-500);
  --color-warning-subtle: var(--color-warning-50);
  --color-on-warning: var(--color-stone-900); /* amber needs DARK text */

  --color-danger: var(--color-danger-500);
  --color-danger-subtle: var(--color-danger-50);
  --color-on-danger: var(--color-white);

  --color-info: var(--color-info-500);
  --color-info-subtle: var(--color-info-50);
  --color-on-info: var(--color-white);

  /* Semantic aliases for the primitive scales (so components stay theme-able) */
  --elevation-card: var(--shadow-md);
  --elevation-popover: var(--shadow-lg);
  --elevation-modal: var(--shadow-xl);
  --radius-control: var(--radius-md);
  --radius-card: var(--radius-lg);
  --radius-surface: var(--radius-xl);
}
```

### 3.4 Tier 3 — Component tokens (examples)

Component tokens alias semantic tokens. A component's CSS/CVA reads _these_ exclusively, so a single re-alias re-skins the component everywhere.

```css
/* tokens/component/button.css */
:root {
  --button-bg: var(--color-primary);
  --button-bg-hover: var(--color-primary-hover);
  --button-bg-active: var(--color-primary-active);
  --button-fg: var(--color-on-primary);
  --button-radius: var(--radius-control);
  --button-height-md: var(--space-12); /* 48px — ≥44px target */
  --button-height-lg: var(--space-16); /* 64px — Large Mode / hero */
  --button-padding-x: var(--space-5);
  --button-font-weight: 600;
  --button-focus-ring: var(--color-focus);
}

/* tokens/component/card.css */
:root {
  --card-bg: var(--color-surface-raised);
  --card-fg: var(--color-text);
  --card-radius: var(--radius-card);
  --card-border: var(--color-border);
  --card-shadow: var(--elevation-card);
  --card-padding: var(--space-6);
}

/* tokens/component/input.css */
:root {
  --input-bg: var(--color-surface-raised);
  --input-fg: var(--color-text);
  --input-placeholder: var(--color-text-subtle);
  --input-border: var(--color-border-strong);
  --input-border-focus: var(--color-focus);
  --input-border-error: var(--color-danger);
  --input-radius: var(--radius-control);
  --input-height: var(--space-12); /* 48px */
  --input-padding-x: var(--space-4);
}
```

### 3.5 Token naming convention

`--<category>-<role>-<state?>` for semantic; `--<component>-<part>-<state?>` for component. Categories: `color`, `space`, `radius`, `shadow/elevation`, `border-width`, `z`, `duration`, `ease`, `font`, `text`, `leading`, `tracking`, `weight`.

### 3.6 The token contract (one-line rules)

| Layer         | May read                                                   | Must NOT read                   |
| ------------- | ---------------------------------------------------------- | ------------------------------- |
| Primitive     | nothing (literals only)                                    | —                               |
| Semantic      | primitives                                                 | components                      |
| Component     | semantic (and primitives for structural scales like space) | other components                |
| TSX component | **component + semantic only**                              | raw hex/px, primitives-as-color |

### 3.7 Tailwind config sketch (theme reads ONLY from tokens)

```ts
// tailwind.config.ts — Tailwind theme is a thin map over CSS-variable tokens.
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // We override (not extend) so NO default Tailwind palette/px leaks in.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: {
        DEFAULT: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
        active: 'var(--color-primary-active)',
        subtle: 'var(--color-primary-subtle)',
        fg: 'var(--color-on-primary)',
      },
      accent: { DEFAULT: 'var(--color-accent)', fg: 'var(--color-on-accent)' },
      surface: {
        DEFAULT: 'var(--color-surface)',
        raised: 'var(--color-surface-raised)',
        sunken: 'var(--color-surface-sunken)',
      },
      text: {
        DEFAULT: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        subtle: 'var(--color-text-subtle)',
      },
      border: { DEFAULT: 'var(--color-border)', strong: 'var(--color-border-strong)' },
      focus: 'var(--color-focus)',
      success: {
        DEFAULT: 'var(--color-success)',
        subtle: 'var(--color-success-subtle)',
        fg: 'var(--color-on-success)',
      },
      warning: {
        DEFAULT: 'var(--color-warning)',
        subtle: 'var(--color-warning-subtle)',
        fg: 'var(--color-on-warning)',
      },
      danger: {
        DEFAULT: 'var(--color-danger)',
        subtle: 'var(--color-danger-subtle)',
        fg: 'var(--color-on-danger)',
      },
      info: {
        DEFAULT: 'var(--color-info)',
        subtle: 'var(--color-info-subtle)',
        fg: 'var(--color-on-info)',
      },
    },
    spacing: {
      0: 'var(--space-0)',
      1: 'var(--space-1)',
      2: 'var(--space-2)',
      3: 'var(--space-3)',
      4: 'var(--space-4)',
      5: 'var(--space-5)',
      6: 'var(--space-6)',
      8: 'var(--space-8)',
      10: 'var(--space-10)',
      12: 'var(--space-12)',
      16: 'var(--space-16)',
      20: 'var(--space-20)',
      24: 'var(--space-24)',
    },
    borderRadius: {
      none: 'var(--radius-none)',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      '2xl': 'var(--radius-2xl)',
      full: 'var(--radius-full)',
    },
    boxShadow: {
      none: 'var(--shadow-none)',
      xs: 'var(--shadow-xs)',
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
    },
    borderWidth: {
      0: 'var(--border-width-0)',
      DEFAULT: 'var(--border-width-1)',
      2: 'var(--border-width-2)',
      4: 'var(--border-width-4)',
    },
    zIndex: {
      base: 'var(--z-base)',
      raised: 'var(--z-raised)',
      dropdown: 'var(--z-dropdown)',
      sticky: 'var(--z-sticky)',
      overlay: 'var(--z-overlay)',
      modal: 'var(--z-modal)',
      popover: 'var(--z-popover)',
      toast: 'var(--z-toast)',
    },
    transitionDuration: {
      instant: 'var(--duration-instant)',
      fast: 'var(--duration-fast)',
      base: 'var(--duration-base)',
      slow: 'var(--duration-slow)',
      slower: 'var(--duration-slower)',
    },
    transitionTimingFunction: {
      standard: 'var(--ease-standard)',
      decelerate: 'var(--ease-decelerate)',
      accelerate: 'var(--ease-accelerate)',
      emphasized: 'var(--ease-emphasized)',
    },
    fontFamily: {
      heading: 'var(--font-heading)', // Plus Jakarta Sans
      body: 'var(--font-body)', // Inter
    },
    // type scale wired in §5
  },
  plugins: [require('tailwindcss-logical')], // enables ms-/me-/ps-/pe- logical utilities for RTL
};
export default config;
```

> **Decision (Tailwind-over-tokens) — Why/Benefits/Trade-offs/Alternatives/Future/Enterprise**
> **Why:** Devs get Tailwind ergonomics; the theme is a _thin alias_ to tokens so dark/HC/RTL/Large-Text are CSS-variable swaps with no class churn.
> **Benefits:** Zero hardcoded values reach JSX; runtime theming with no rebuild; `tailwind-merge` + CVA keep variants type-safe.
> **Trade-offs:** Loses Tailwind's default palette/spacing (intentional); arbitrary values (`w-[37px]`) must be lint-blocked.
> **Alternatives:** Vanilla-extract (more boilerplate), styled-components (runtime cost), plain CSS modules (no utility ergonomics).
> **Future:** New theme = new semantic map file; new brand = re-anchor primitives. No component edits.
> **Enterprise:** Tenant-level theming, white-label, and per-clinic accent become a token-file concern, not a code concern.

---

## 4. Theming

**Only the semantic tier (§3.3) is re-mapped.** Primitives and components never change between themes. Themes are selected by `data-theme` (and accessibility modes by `data-*` flags) on `<html>`, set by the Zustand UI store (Brain §9) and persisted.

```html
<html lang="hi" dir="ltr"
      data-theme="light"          <!-- light | dark | hc-light | hc-dark -->
      data-text-scale="default"   <!-- default | large -->
      data-motion="auto">         <!-- auto | reduced -->
```

### 4.1 Dark theme (semantic overrides only)

```css
/* tokens/semantic/dark.css */
[data-theme='dark'] {
  --color-primary: var(--color-rose-400); /* lift for dark bg contrast */
  --color-primary-hover: var(--color-rose-300);
  --color-primary-active: var(--color-rose-500);
  --color-on-primary: var(--color-stone-900);

  --color-accent: var(--color-teal-300);
  --color-on-accent: var(--color-stone-900);

  --color-surface: var(--color-stone-900);
  --color-surface-raised: var(--color-stone-800);
  --color-surface-sunken: #1b1716;
  --color-surface-overlay: rgba(0, 0, 0, 0.6);

  --color-text: var(--color-stone-100);
  --color-text-muted: var(--color-stone-300);
  --color-text-subtle: var(--color-stone-400);

  --color-border: var(--color-stone-700);
  --color-border-strong: var(--color-stone-600);
  --color-divider: var(--color-stone-800);

  --color-focus: var(--color-teal-300);

  --color-success: var(--color-success-300);
  --color-on-success: var(--color-stone-900);
  --color-warning: var(--color-warning-300);
  --color-on-warning: var(--color-stone-900);
  --color-danger: var(--color-danger-300);
  --color-on-danger: var(--color-stone-900);
  --color-info: var(--color-info-300);
  --color-on-info: var(--color-stone-900);

  /* Soft-UI shadows are weaker on dark; lean on surface separation */
  --elevation-card: 0 1px 0 0 rgba(255, 255, 255, 0.04), 0 8px 24px -8px rgba(0, 0, 0, 0.6);
}
```

### 4.2 High-contrast theme (WCAG AAA-leaning; pairs with light or dark)

```css
/* tokens/semantic/high-contrast.css — thicker borders, max contrast, no soft shadows */
[data-theme='hc-light'] {
  --color-surface: var(--color-white);
  --color-surface-raised: var(--color-white);
  --color-text: var(--color-black);
  --color-text-muted: var(--color-stone-900); /* no low-contrast greys */
  --color-text-subtle: var(--color-stone-900);
  --color-primary: var(--color-rose-800); /* darkened for AAA on white */
  --color-on-primary: var(--color-white);
  --color-border: var(--color-black);
  --color-border-strong: var(--color-black);
  --color-focus: var(--color-black);
  --focus-ring-width: var(--border-width-4); /* thicker ring */
  --color-success: var(--color-success-700);
  --color-warning: var(--color-warning-700);
  --color-danger: var(--color-danger-700);
  --color-info: var(--color-info-700);
  --elevation-card: none; /* borders, not shadows */
  --card-border: var(--color-black);
}
[data-theme='hc-dark'] {
  --color-surface: var(--color-black);
  --color-surface-raised: #000000;
  --color-text: var(--color-white);
  --color-text-muted: var(--color-white);
  --color-border: var(--color-white);
  --color-focus: var(--color-white);
  --focus-ring-width: var(--border-width-4);
  --color-primary: var(--color-rose-300);
  --color-on-primary: var(--color-black);
  --elevation-card: none;
}
```

### 4.3 Large Text Mode (scale the root, whole UI grows)

Because the type scale and `--space-*` derive from `rem` (and the type scale from a single `--font-scale`), bumping the root scales everything proportionally — no per-component work.

```css
/* Large Text Mode: ~1.25× the type ramp + larger min target. (Brain §6.3) */
[data-text-scale='large'] {
  --font-scale: 1.25; /* type scale in §5 multiplies by this */
  --tap-target-min: var(--space-16); /* 64px → buttons/inputs go to lg automatically */
}
:root {
  --font-scale: 1;
  --tap-target-min: var(--space-12); /* 48px default */
}
```

### 4.4 RTL (Urdu, Arabic…) — `dir` + logical properties only

- Set `dir="rtl"` on `<html>` when locale is RTL (Brain §8). i18next reports `i18n.dir()`.
- **Never** use physical `margin-left`/`left`/`text-align: left`. Use logical: `margin-inline-start`, `inset-inline-start`, `text-align: start`. In Tailwind, use `ms-*`/`me-*`/`ps-*`/`pe-*` (via `tailwindcss-logical`) and `start-*`/`end-*`.
- Directional icons (chevrons, arrows, back) flip via `[dir="rtl"] .icon-directional { transform: scaleX(-1); }` or RTL-aware icon swap. Non-directional icons (clock, user) never flip.

```css
/* Logical-property pattern — works identically in LTR and RTL. */
.field {
  margin-inline-start: var(--space-4);
  padding-inline: var(--space-4);
  text-align: start;
}
```

> **Decision (CSS-variable theming) — Why/Benefits/Trade-offs/Alternatives/Future/Enterprise**
> **Why:** A clinic OS must serve dark wards, low-vision staff, and RTL languages _at runtime, without reload_ (Brain §8) and _without a rebuild_. CSS custom properties cascade and switch instantly via one attribute on `<html>`.
> **Benefits:** One `data-theme` swap re-skins the app; SSR-safe; no FOUC if the attribute is set pre-paint; themes are diff-able files; Large-Text and HC compose with light/dark.
> **Trade-offs:** IE11 unsupported (a non-goal); requires discipline (no hardcoded values — enforced by lint); a slight indirection cost when reading styles.
> **Alternatives:** JS theme objects + re-render (slower, flashes, couples theme to React tree); duplicated stylesheets per theme (combinatorial blow-up across light×dark×HC×LTR×RTL); inline styles (no cascade, no a11y media-query overrides).
> **Future:** Per-tenant white-label themes, seasonal/brand variants, and user-authored accessibility profiles are all _just more semantic maps_.
> **Enterprise:** Auditable, centralized, A/B-able theming; meets procurement a11y mandates (Section 508 / EN 301 549) as a config concern, not a code rewrite.

---

## 5. Typography

**Headings: Plus Jakarta Sans. Body: Inter.** Both loaded as variable fonts. **No ad-hoc font sizes** (Brain §6.3) — only the scale tokens below. Every step bakes size + line-height + weight + tracking and multiplies size by `--font-scale` (so Large Text Mode just works).

### 5.1 Type scale tokens

| Token      | Family            | Size (rem) | Line-height | Weight | Tracking       | Use                             |
| ---------- | ----------------- | ---------- | ----------- | ------ | -------------- | ------------------------------- |
| `display`  | Plus Jakarta Sans | 3.0        | 1.1         | 700    | -0.02em        | Marketing / hero only           |
| `h1`       | Plus Jakarta Sans | 2.25       | 1.15        | 700    | -0.02em        | Page title (one per screen)     |
| `h2`       | Plus Jakarta Sans | 1.75       | 1.2         | 600    | -0.01em        | Section                         |
| `h3`       | Plus Jakarta Sans | 1.375      | 1.25        | 600    | -0.01em        | Sub-section, card title         |
| `h4`       | Plus Jakarta Sans | 1.125      | 1.3         | 600    | 0              | Group label                     |
| `h5`       | Plus Jakarta Sans | 1.0        | 1.4         | 600    | 0              | Dense headings                  |
| `h6`       | Plus Jakarta Sans | 0.875      | 1.4         | 600    | 0.01em         | Smallest heading                |
| `body-lg`  | Inter             | 1.125      | 1.6         | 400    | 0              | Primary reading (forms, vitals) |
| `body-md`  | Inter             | 1.0        | 1.55        | 400    | 0              | Default body                    |
| `body-sm`  | Inter             | 0.875      | 1.5         | 400    | 0              | Secondary text                  |
| `caption`  | Inter             | 0.75       | 1.45        | 500    | 0.01em         | Helper, timestamps              |
| `overline` | Inter             | 0.6875     | 1.4         | 600    | 0.08em (UPPER) | Eyebrow labels                  |

```css
/* tokens/semantic/typography.css — sizes multiply by --font-scale (Large Text Mode) */
:root {
  --font-heading: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-scale: 1;

  --text-display: calc(3rem * var(--font-scale));
  --leading-display: 1.1;
  --weight-display: 700;
  --tracking-display: -0.02em;
  --text-h1: calc(2.25rem * var(--font-scale));
  --leading-h1: 1.15;
  --weight-h1: 700;
  --tracking-h1: -0.02em;
  --text-h2: calc(1.75rem * var(--font-scale));
  --leading-h2: 1.2;
  --weight-h2: 600;
  --tracking-h2: -0.01em;
  --text-h3: calc(1.375rem * var(--font-scale));
  --leading-h3: 1.25;
  --weight-h3: 600;
  --text-h4: calc(1.125rem * var(--font-scale));
  --leading-h4: 1.3;
  --weight-h4: 600;
  --text-h5: calc(1rem * var(--font-scale));
  --leading-h5: 1.4;
  --weight-h5: 600;
  --text-h6: calc(0.875rem * var(--font-scale));
  --leading-h6: 1.4;
  --weight-h6: 600;
  --text-body-lg: calc(1.125rem * var(--font-scale));
  --leading-body-lg: 1.6;
  --weight-body: 400;
  --text-body-md: calc(1rem * var(--font-scale));
  --leading-body-md: 1.55;
  --text-body-sm: calc(0.875rem * var(--font-scale));
  --leading-body-sm: 1.5;
  --text-caption: calc(0.75rem * var(--font-scale));
  --leading-caption: 1.45;
  --weight-caption: 500;
  --text-overline: calc(0.6875rem * var(--font-scale));
  --leading-overline: 1.4;
  --weight-overline: 600;
  --tracking-overline: 0.08em;
}
```

```ts
// Tailwind fontSize map (paired [size, {lineHeight, fontWeight, letterSpacing}])
fontSize: {
  display: ["var(--text-display)", { lineHeight: "var(--leading-display)", fontWeight: "var(--weight-display)", letterSpacing: "var(--tracking-display)" }],
  h1: ["var(--text-h1)", { lineHeight: "var(--leading-h1)", fontWeight: "var(--weight-h1)", letterSpacing: "var(--tracking-h1)" }],
  // …h2–h6, body-lg/md/sm, caption, overline
}
```

### 5.2 Rules

- **Never** write `text-[17px]`, `style={{ fontSize }}`, or a raw `rem` — use a scale token / Tailwind alias (`text-h2`, `text-body-md`). Lint blocks arbitrary sizes.
- One `h1` per screen (the page title — supports One Screen · One Task).
- Body copy ≥ `body-md` (16px) for clinical reading; default to `body-lg` in forms used by elderly users.
- Line length 45–75ch for reading blocks (`max-w-[65ch]` via a tokened measure).

### 5.3 Font loading strategy

- **Variable fonts**, self-hosted (`woff2`), subset to needed scripts (Latin + Devanagari for hi/mr + Arabic for ur). No third-party font CDN (privacy/PHI + reliability).
- `font-display: swap` to avoid invisible text; preload the two primary weights.
- Provide a robust fallback stack (`ui-sans-serif, system-ui`) so a font failure never blocks a clinical task.

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/Inter-var.woff2') format('woff2');
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 200 800;
  font-display: swap;
  src: url('/fonts/PlusJakartaSans-var.woff2') format('woff2');
}
```

```html
<link rel="preload" href="/fonts/Inter-var.woff2" as="font" type="font/woff2" crossorigin />
```

---

## 6. Iconography, imagery & illustration

### 6.1 Icons — `lucide-react` (Brain §4)

- **Single library, consistent stroke.** Default stroke `2`, size from token (`--icon-size-md: var(--space-5)` = 20px; `--icon-size-lg: var(--space-6)` = 24px).
- Icons inherit `currentColor` — they re-theme automatically. Never hardcode icon color.
- **Decorative** icons: `aria-hidden="true"`. **Meaningful** icons need an accessible name (paired visible label, or `aria-label` via i18n key).
- **Always pair icon + word** in primary actions and statuses (elderly/low-literacy; never-color-alone).
- Status icon vocabulary (consistent across the app): `CheckCircle2` success, `AlertTriangle` warning, `XCircle`/`AlertOctagon` danger, `Info` info, `Clock` pending/queue.

```tsx
import { Stethoscope } from 'lucide-react';
// decorative beside a visible label:
<Stethoscope aria-hidden className="size-[var(--icon-size-md)] text-accent" />;
```

### 6.2 Imagery

- Calm, real, diverse, respectful clinical photography; warm tone aligned to sand/rose palette. Avoid stocky "perfect smile" clichés and anything alarming.
- Patient photos: rounded (`--radius-full` for avatars), consent-gated, masked by default in shared views.
- All `<img>` get localized `alt`; purely decorative images get `alt=""`.

### 6.3 Illustration style (empty states)

- Soft, flat, low-detail line+fill illustrations in **sand/teal/rose** tints; friendly, never childish.
- Light/dark variants (or theme-aware via `currentColor`/CSS vars).
- Each empty state = **one illustration + one short localized line + one primary action** (Brain §11). Never a blank screen.

---

## 7. Layout system

### 7.1 Breakpoints (tokenized)

| Token      | Min width | Target                   |
| ---------- | --------- | ------------------------ |
| `--bp-sm`  | 480px     | Large phone              |
| `--bp-md`  | 768px     | Tablet / reception kiosk |
| `--bp-lg`  | 1024px    | Laptop                   |
| `--bp-xl`  | 1280px    | Desktop                  |
| `--bp-2xl` | 1536px    | Large / wall display     |

```ts
// Tailwind screens map to tokens (kept in sync via a shared TS constant).
screens: { sm: "480px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" }
```

Mobile-first (Brain §3 patient = mobile-first). Design the phone layout, then enhance.

### 7.2 Page scaffolding

```
┌───────────────────────────────────────────────┐
│ AppShell (skip-link, top bar: clinic + lang +  │
│           theme + user)                         │
│ ┌─────────┬───────────────────────────────────┐│
│ │ Sidebar │ <main id="main">                  ││  ← skip-link target
│ │ (nav)   │  PageHeader  (h1 = the ONE title) ││
│ │         │  PageBody    (Bento / form / list)││
│ │         │  PrimaryCTA  (the ONE action)     ││
│ └─────────┴───────────────────────────────────┘│
└───────────────────────────────────────────────┘
```

- Container max-width tokened (`--container-max: 1200px`), centered, side padding `--space-4`→`--space-8` responsive.
- **The "one primary CTA" placement (Law 1):** the single filled `Button` is bottom-right of the primary surface on desktop, and pinned as a full-width sticky footer button on mobile (thumb reach, ≥56px). Exactly one per screen; all other actions are `secondary`/`ghost`/`link`.

### 7.3 The Bento Grid

Self-contained tiles of varying span on a uniform grid — at-a-glance dashboards (Brain §3 Clinic Owner). Each tile is a `Card`/`Bento` with one job.

```tsx
// Bento: responsive 12-col grid; tiles declare colSpan/rowSpan via tokens, not px.
<div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
  <Bento className="md:col-span-3 lg:col-span-4" title={t('dashboard.kpi.patientsToday')} />
  <Bento className="md:col-span-3 lg:col-span-4" title={t('dashboard.kpi.queueLength')} />
  <Bento className="md:col-span-6 lg:col-span-4" title={t('dashboard.kpi.revenue')} />
  <Bento className="md:col-span-6 lg:col-span-8" title={t('dashboard.chart.flow')} />
  <Bento className="md:col-span-6 lg:col-span-4" title={t('dashboard.list.followUps')} />
</div>
```

### 7.4 Density

- **Comfortable by default** (calm; large targets). A `data-density="compact"` mode exists for power users (doctor's dense tables) but never drops below the 44px target. Density maps to spacing tokens, not ad-hoc values.

---

## 8. Component library

The **ui-kit** lives in `shared/ui` (Brain §5.1 — zero domain knowledge). Every component: tokens-only styling, CVA variants, `forwardRef`, full a11y, i18n-ready (text passed as props/children — the kit never hardcodes copy), and a Storybook story.

### 8.1 Catalog

| Group                 | Components                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Actions**           | `Button`, `IconButton`, `ButtonGroup`, `Link`                                                                                      |
| **Inputs**            | `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Radio`/`RadioGroup`, `Switch`, `DatePicker`, `NumberStepper`, `FileUpload` |
| **Forms**             | `Field`, `Label`, `HelpText`, `ErrorText`, `Fieldset`, `FormRow` (Form primitives)                                                 |
| **Containers**        | `Card`, `Bento`, `Panel`, `Accordion`, `Divider`                                                                                   |
| **Data display**      | `Badge`, `Tag`, `Avatar`, `Table`/`DataGrid`, `Stat`, `DescriptionList`, `Timeline`                                                |
| **Navigation**        | `Tabs`, `Breadcrumb`, `Pagination`, `Stepper`, `Sidebar`/`NavItem`, `Menu`                                                         |
| **Overlays**          | `Modal`/`Dialog`, `Drawer`, `Tooltip`, `Popover`, `Toast`, `AlertDialog`                                                           |
| **Feedback / states** | `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`, `Banner`, `ProgressBar`                                                         |

### 8.2 API contract pattern (every component)

- **`forwardRef`** to the underlying DOM node; **`displayName`** set.
- **Polymorphism via `asChild`** (Radix `Slot`) — render as `<a>`, router `<Link>`, etc., without wrapper soup.
- **Controlled & uncontrolled**: accept `value` + `onValueChange` (controlled) or `defaultValue` (uncontrolled). Mirrors RHF/Radix.
- **Variants via CVA**, merged with `tailwind-merge` so consumer `className` always wins last.
- **`...props` spread** to the root for `aria-*`, `data-*`, event handlers.
- **No hardcoded copy** — all human text (labels, aria-labels) comes from props; callers pass `t(...)`.

```ts
// shared/ui/lib/cn.ts — the merge helper used everywhere
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

### 8.3 `Button` — full implementation

```tsx
// shared/ui/Button/Button.tsx
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

const button = cva(
  // base: tokens only; logical padding; focus ring; ≥44px target; reduced-motion aware
  [
    'inline-flex items-center justify-center gap-2 select-none',
    'font-body font-[var(--button-font-weight)] rounded-[var(--button-radius)]',
    'transition-colors duration-fast ease-standard',
    'motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)]',
    'focus-visible:ring-focus focus-visible:ring-offset-[var(--focus-ring-offset)]',
    'focus-visible:ring-offset-surface',
    'disabled:opacity-50 disabled:pointer-events-none',
    '[&_svg]:size-[var(--icon-size-md)] [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--button-bg)] text-[var(--button-fg)] hover:bg-[var(--button-bg-hover)] active:bg-[var(--button-bg-active)] shadow-xs',
        secondary: 'bg-surface-raised text-text border border-strong hover:bg-surface-sunken',
        accent: 'bg-accent text-accent-fg hover:opacity-90',
        ghost: 'bg-transparent text-text hover:bg-surface-sunken',
        danger: 'bg-danger text-danger-fg hover:opacity-90',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline px-0 h-auto',
      },
      size: {
        // height tokens guarantee ≥44px; lg is the Large-Text-Mode / mobile-CTA size (≥56px)
        sm: 'h-10 px-4 text-body-sm',
        md: 'h-[var(--button-height-md)] px-[var(--button-padding-x)] text-body-md',
        lg: 'h-[var(--button-height-lg)] px-6 text-body-lg',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  asChild?: boolean;
  isLoading?: boolean;
  /** Localized busy label for screen readers, e.g. t("common.saving") */
  loadingLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingLabel,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(button({ variant, size, fullWidth }), className)}
        // a11y: disabled while loading; announce busy state
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 aria-hidden className="animate-spin motion-reduce:animate-none" />}
        {isLoading && loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
```

**Variants:** `primary | secondary | accent | ghost | danger | link`. **Sizes:** `sm | md | lg`. **Flags:** `fullWidth`, `isLoading`, `asChild`.
Usage: `<Button onClick={save}>{t("vitals.action.saveContinue")}</Button>` · as link: `<Button asChild><Link to="/queue">{t("nav.queue")}</Link></Button>`.

### 8.4 `Input` — full implementation (with `Field` wiring)

```tsx
// shared/ui/Input/Input.tsx
import { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const input = cva(
  [
    'block w-full bg-[var(--input-bg)] text-[var(--input-fg)]',
    'rounded-[var(--input-radius)] border border-[var(--input-border)]',
    'h-[var(--input-height)] px-[var(--input-padding-x)] text-body-md',
    'placeholder:text-[var(--input-placeholder)]',
    'transition-colors duration-fast ease-standard motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:border-[var(--input-border-focus)]',
    'focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-focus',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      invalid: {
        true: 'border-[var(--input-border-error)] focus-visible:border-[var(--input-border-error)] focus-visible:ring-danger',
        false: '',
      },
    },
    defaultVariants: { invalid: false },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof input> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(input({ invalid }), className)}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
```

```tsx
// shared/ui/Field/Field.tsx — wires label + help + error to the control by id (a11y)
import { forwardRef, useId, cloneElement, isValidElement } from 'react';
import { cn } from '../lib/cn';

interface FieldProps {
  label: string; // localized (caller passes t(...))
  help?: string;
  error?: string; // localized
  required?: boolean;
  children: React.ReactElement; // the control (Input, Select, …)
  className?: string;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  ({ label, help, error, required, children, className }, ref) => {
    const id = useId();
    const helpId = help ? `${id}-help` : undefined;
    const errId = error ? `${id}-err` : undefined;
    const control = isValidElement(children)
      ? cloneElement(children as React.ReactElement<any>, {
          id,
          invalid: Boolean(error),
          'aria-describedby': cn(helpId, errId) || undefined,
          'aria-required': required || undefined,
        })
      : children;
    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)}>
        <label htmlFor={id} className="text-body-sm font-medium text-text">
          {label}
          {required && (
            // never-color-alone: required marked with text + token color
            <span className="ms-1 text-danger" aria-hidden>
              *
            </span>
          )}
        </label>
        {help && (
          <p id={helpId} className="text-caption text-text-muted">
            {help}
          </p>
        )}
        {control}
        {error && (
          <p id={errId} role="alert" className="flex items-center gap-1 text-caption text-danger">
            {/* icon + text, not color alone */}
            <span aria-hidden>⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Field.displayName = 'Field';
```

Usage:

```tsx
<Field
  label={t('vitals.form.bloodPressure')}
  help={t('vitals.form.bpHelp')}
  error={errors.bp?.message}
  required
>
  <Input inputMode="numeric" {...register('bp')} />
</Field>
```

### 8.5 `Card` — full implementation

```tsx
// shared/ui/Card/Card.tsx
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const card = cva(
  [
    'bg-[var(--card-bg)] text-[var(--card-fg)]',
    'rounded-[var(--card-radius)] border border-[var(--card-border)]',
  ],
  {
    variants: {
      elevation: {
        flat: 'shadow-none',
        raised: 'shadow-[var(--card-shadow)]',
        overlay: 'shadow-lg',
      },
      padding: { none: 'p-0', sm: 'p-4', md: 'p-[var(--card-padding)]', lg: 'p-8' },
      interactive: {
        true: 'transition-shadow duration-base ease-standard motion-reduce:transition-none hover:shadow-lg focus-within:ring-[var(--focus-ring-width)] focus-within:ring-focus cursor-pointer',
        false: '',
      },
    },
    defaultVariants: { elevation: 'raised', padding: 'md', interactive: false },
  },
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof card> {
  asChild?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation, padding, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(card({ elevation, padding, interactive }), className)}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

export const CardHeader = (p: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...p} className={cn('mb-4 flex flex-col gap-1', p.className)} />
);
export const CardTitle = (p: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 {...p} className={cn('font-heading text-h3 text-text', p.className)} />
);
export const CardBody = (p: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...p} className={cn('text-body-md text-text', p.className)} />
);
```

**Variants:** `elevation: flat|raised|overlay` · `padding: none|sm|md|lg` · `interactive`. `Bento` is `Card` pre-set for grid tiles (`elevation="raised" rounded-xl`).

### 8.6 Per-component behavior notes (the rest)

| Component                       | Variants / sizes                     | Key a11y / behavior                                                             |
| ------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `IconButton`                    | same variants as Button; sizes md/lg | **Requires** `aria-label` (i18n); tooltip optional; ≥44px                       |
| `Select` / `Combobox`           | default / invalid                    | Radix/Listbox; type-ahead; `aria-activedescendant`; full keyboard               |
| `Checkbox` / `Radio` / `Switch` | size md/lg                           | Native input + visual; label clickable; `Switch` has `role="switch"`            |
| `Textarea`                      | invalid; auto-grow                   | Same Field wiring as Input                                                      |
| `DatePicker`                    | —                                    | Keyboard grid (arrows/PageUp/Home/End); locale + RTL aware; text-entry fallback |
| `Badge` / `Tag`                 | success/warning/danger/info/neutral  | **Icon + text**, never color alone; `Tag` removable with labeled button         |
| `Avatar`                        | sizes; image/initials/icon fallback  | `alt` from name; decorative ring tokened                                        |
| `Tabs`                          | line / pill                          | Roving tabindex; arrow keys; `aria-selected`; `role="tablist"`                  |
| `Table`/`DataGrid`              | comfortable/compact                  | `<caption>`, scope headers, sortable `aria-sort`, sticky header                 |
| `Modal`/`Dialog`                | sm/md/lg                             | Focus trap + restore; `Esc`; labelled by title; scrim; `aria-modal`             |
| `Drawer`                        | start/end/bottom                     | Logical `inset-inline`; same focus trap; swipe-close optional                   |
| `Toast`                         | success/warning/danger/info          | `aria-live` region (polite/assertive); auto-dismiss pausable                    |
| `Tooltip`                       | —                                    | On hover **and** focus; `Esc` dismiss; never sole carrier of info               |
| `Skeleton`                      | text/rect/circle                     | `aria-hidden`; matches final layout; respects reduced-motion                    |
| `Spinner`                       | sizes                                | `role="status"` + sr-only label; prefer Skeleton                                |
| `EmptyState`                    | —                                    | Illustration + line + one CTA (Brain §11)                                       |
| `ErrorState`                    | inline/page                          | Localized `AppError` message + retry button                                     |
| `Banner`                        | info/success/warning/danger          | `role="status"`/`alert`; dismissible; icon + text                               |
| `Stepper`                       | horizontal/vertical                  | `aria-current="step"`; numbered + labeled                                       |
| `Pagination`                    | —                                    | `nav` landmark; `aria-label`; current page `aria-current="page"`                |
| `Breadcrumb`                    | —                                    | `nav` + ordered list; last item `aria-current="page"`                           |

---

## 9. Accessibility guide

> **Accessibility is a feature, not a setting (Brain §2, Law 3).** WCAG **2.2 AA** is the floor; AAA for text contrast where feasible. This section is non-optional and CI-gated.

### 9.1 WCAG 2.2 AA checklist (per screen / PR)

| ✓   | Requirement                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------- |
| ☐   | Text contrast ≥ **4.5:1** (≥ 3:1 for large text / `h1`–`h3`) — verified against the actual token (§9.5) |
| ☐   | UI/graphic contrast ≥ **3:1** (borders, icons, focus rings, control boundaries)                         |
| ☐   | Every interactive element reachable & operable by **keyboard**; logical tab order                       |
| ☐   | Visible **`:focus-visible`** ring on all focusable elements (token-driven)                              |
| ☐   | **Focus not obscured** by sticky headers/footers (WCAG 2.2 SC 2.4.11)                                   |
| ☐   | **Target size ≥ 24×24** CSS px minimum (SC 2.5.8); ClinicOS floor is **≥44px**, **≥56px** Large Mode    |
| ☐   | **Dragging** has a single-pointer alternative (SC 2.5.7)                                                |
| ☐   | No information by **color alone** — icon/text/shape pairs every status                                  |
| ☐   | Form fields have programmatic **labels**; errors are described & announced                              |
| ☐   | **Consistent help** location; **redundant entry** avoided (SC 3.3.7)                                    |
| ☐   | Accessible **authentication** — no cognitive-function-only test (SC 3.3.8)                              |
| ☐   | Images have `alt`; decorative images `alt=""`; icons `aria-hidden` or labeled                           |
| ☐   | Landmarks present (`header/nav/main/footer`); one `h1`; logical heading order                           |
| ☐   | **Skip-to-content** link on every page; live regions for async status                                   |
| ☐   | `prefers-reduced-motion` honored; no motion-triggered vestibular harm                                   |
| ☐   | Page has `lang` (and updates with locale); `dir` correct for RTL                                        |
| ☐   | axe = **0 violations**; tested with keyboard + screen reader                                            |

### 9.2 Focus management

- **`:focus-visible` ring** from `--color-focus` at `--focus-ring-width` with `--focus-ring-offset`; thicker (`--border-width-4`) in high-contrast.
- **Dialogs/Drawers:** trap focus inside; move focus to the dialog (title or first field) on open; **restore** focus to the trigger on close; `Esc` closes.
- **Skip link** `<a href="#main">` is the first focusable element, visible on focus.
- **Route changes:** move focus to the new page's `h1` (or a focus sentinel) and announce via live region.
- **Never** remove focus outlines without a visible replacement. **Never** set `tabindex` > 0.

### 9.3 Keyboard interaction patterns (per component)

| Component            | Keys                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| Button / IconButton  | `Enter` / `Space` activate                                                  |
| Link                 | `Enter` activate                                                            |
| Checkbox / Switch    | `Space` toggle                                                              |
| Radio group          | `Arrow` keys move + select; `Tab` enters/leaves group                       |
| Select / Combobox    | `Enter`/`Space` open; `Arrow` move; type-ahead; `Esc` close; `Enter` choose |
| Tabs                 | `Arrow` move (`Home`/`End` ends); `Enter`/`Space` if manual activation      |
| Modal / Drawer       | `Esc` close; `Tab`/`Shift+Tab` cycle **within** trap                        |
| Menu / Popover       | `Arrow` navigate; `Esc` close; `Tab` closes & moves on                      |
| DataGrid             | `Arrow` cell nav; `Home`/`End`; `Space`/`Enter` select/sort                 |
| DatePicker           | `Arrow` day; `PageUp`/`PageDown` month; `Home`/`End` week; `Esc` close      |
| Stepper / Pagination | `Tab` between controls; `Enter` activate                                    |

### 9.4 ARIA & screen-reader patterns

- **Semantic HTML first; ARIA only to fill gaps** (Brain §7). Prefer `<button>`, `<nav>`, `<dialog>` to `div` + role.
- **Names from i18n keys** — every `aria-label`, `aria-description`, `alt` is a `t(...)` call (Brain §8). Never an English literal.
- **Live regions:** toasts/status use `aria-live="polite"`; urgent errors `assertive`. Async surfaces announce "Loading…", "Saved", "Couldn't save — retry" via a single managed live region.
- **State:** `aria-expanded`, `aria-selected`, `aria-checked`, `aria-current`, `aria-busy`, `aria-invalid`, `aria-pressed` reflect real state.
- **Relationships:** `aria-describedby` links help/error to controls (see `Field`); `aria-labelledby` links dialog to its title.
- **`.sr-only`** utility for visually-hidden but announced text (e.g. loading labels, icon-button context).

### 9.5 Color contrast with the actual tokens

| Foreground token                           | Background token                       | Ratio (approx) | Verdict                                                                                                                                                           |
| ------------------------------------------ | -------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-text` (stone-900 `#241F1E`)       | `--color-surface` (sand-100 `#F8F3F0`) | ~13.5:1        | ✅ AAA                                                                                                                                                            |
| `--color-text-muted` (stone-600 `#6B5F5E`) | sand-100                               | ~5.6:1         | ✅ AA (body)                                                                                                                                                      |
| `--color-on-primary` (white)               | `--color-primary` (rose-500 `#E87D7D`) | ~2.6:1         | ⚠ **fails for small text** → use rose-600/700 fill for text, or large/bold only; default Button uses `rose-500` with **600/700 hover-active** and bold ≥`body-md` |
| white                                      | rose-600 `#D85F5F`                     | ~3.4:1         | ✅ AA large/bold                                                                                                                                                  |
| white                                      | rose-700 `#B94B4B`                     | ~4.7:1         | ✅ AA all text                                                                                                                                                    |
| `--color-on-danger` (white)                | `--color-danger` (`#CF3A3A`)           | ~4.6:1         | ✅ AA                                                                                                                                                             |
| `--color-on-warning` (**stone-900**)       | `--color-warning` (`#D9961A`)          | ~6.5:1         | ✅ AA (warning needs **dark** on-color)                                                                                                                           |
| white                                      | `--color-success` (`#2E9E5B`)          | ~3.4:1         | ✅ AA large/bold; use success-700 for small text                                                                                                                  |
| white                                      | `--color-info` (`#2F73C2`)             | ~4.8:1         | ✅ AA                                                                                                                                                             |
| `--color-focus` (teal-600 `#577777`) ring  | sand-100                               | ~3.6:1         | ✅ ≥3:1 non-text                                                                                                                                                  |

> **Implication baked into tokens:** primary Button text is bold and ≥ `body-md`, and hover/active deepen to `rose-600`/`rose-700` which clear AA for all text; the high-contrast theme swaps primary to `rose-800` (AAA). This is _why_ the on-colors and the warning dark-text rule exist in §3.3.

### 9.6 Never-color-alone (mandatory)

Status is always **color + icon + text**. A `Badge`/`Banner`/`Toast`/validation message that drops the icon or text is a bug.

```tsx
// ✅ success status — color + icon + localized text
<Badge tone="success">
  <CheckCircle2 aria-hidden /> {t('status.checkedIn')}
</Badge>
// ❌ never: <span className="text-success">●</span>
```

### 9.7 Reduced motion

- All transitions/animations gate on `motion-reduce:` (Tailwind) / `@media (prefers-reduced-motion: reduce)`. Essential feedback degrades to an instant, non-animated state — never removed entirely.
- `data-motion="reduced"` (user override in settings) forces the same path regardless of OS setting.

### 9.8 Touch targets

- Minimum hit area **≥44px** (`--button-height-md` = 48px). **≥56px** in Large Text Mode (`--button-height-lg`, auto via `--tap-target-min`). Spacing between adjacent targets ≥ `--space-2`.

### 9.9 How a11y is tested (CI gate — Brain §4)

- **Static:** `eslint-plugin-jsx-a11y` blocks common violations at lint.
- **Unit/integration:** `jest-axe`/`axe-core` in Vitest + RTL — assert `0` violations per component & key composites.
- **E2E:** **Playwright** runs `@axe-core/playwright` on critical patient-journey flows, plus keyboard-only and screen-reader-name assertions.
- **Manual:** keyboard-only pass + VoiceOver/NVDA spot-check on new flows; documented in the PR checklist (Brain §13 → Project-Checklist).

> **Decision (accessibility as always-on themes) — Why/Benefits/Trade-offs/Alternatives/Future/Enterprise**
> **Why:** Our users _are_ the edge cases — high-contrast, large-text, reduced-motion, and RTL must be first-class **themes/modes**, not afterthought toggles (Brain §3, §7).
> **Benefits:** Built on the same semantic-token swap as dark mode → zero per-component work, fully composable (HC + Large + RTL together), testable, and centrally auditable.
> **Trade-offs:** More token maps to maintain; every component must obey the never-color-alone and focus-ring contracts (enforced by lint + axe).
> **Alternatives:** Bolt-on a11y per component (inconsistent, rots), or a separate "accessible site" (a 2-system maintenance trap and an equity failure).
> **Future:** User-authored accessibility profiles, per-tenant a11y defaults, dyslexia-friendly font mode — all just additional modes.
> **Enterprise:** Satisfies WCAG 2.2 AA / Section 508 / EN 301 549 procurement requirements as a configuration guarantee, demonstrable via the axe CI gate.

---

## 10. Motion

**Calm by default (Brain §2).** Motion communicates state change and spatial relationship — it never decorates clinical data.

### 10.1 When motion is allowed

| Allowed                                                           | Not allowed                                     |
| ----------------------------------------------------------------- | ----------------------------------------------- |
| Hover/focus/press feedback (`--duration-fast`)                    | Looping/auto-playing animation on data          |
| Enter/exit of overlays (`--duration-slow`, decelerate/accelerate) | Parallax, confetti, bounce on clinical surfaces |
| Skeleton shimmer (subtle, reduced-motion off)                     | Motion as the **only** signal of a state        |
| Toast slide-in (`--duration-base`)                                | Anything > `--duration-slower`                  |

### 10.2 The `prefers-reduced-motion` contract

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- Components additionally use Tailwind `motion-reduce:` utilities (`motion-reduce:transition-none`, `motion-reduce:animate-none`) so feedback degrades to an **instant** state.
- The `data-motion="reduced"` user override applies the same path regardless of OS setting.
- Reduced motion **never** removes essential feedback (e.g. a saved toast still appears — it just doesn't slide).

---

## 11. Content & voice

All copy ships as **i18n keys** (Brain §8) — these are authoring guidelines for the source (`en`) strings.

### 11.1 Voice

Calm · clear · respectful · plain. Talk like a kind receptionist, not a database. Short sentences. Active voice. No jargon, no abbreviations unseen by patients (write "Blood pressure", not "BP", in patient-facing copy).

### 11.2 Microcopy do / don't

| Context             | ✅ Do                                            | ❌ Don't                     |
| ------------------- | ------------------------------------------------ | ---------------------------- |
| Primary button      | "Save and continue"                              | "Submit", "OK"               |
| Empty state         | "No patients in the queue yet."                  | "0 results returned"         |
| Error               | "We couldn't save the vitals. Try again."        | "Error 500: mutation failed" |
| Confirm destructive | "Remove this appointment? This can't be undone." | "Are you sure?"              |
| Success             | "Patient checked in."                            | "Success!"                   |
| Field help          | "Use the patient's date of birth."               | "Enter DOB (YYYY-MM-DD)"     |
| Loading             | "Loading your queue…"                            | "Please wait…" (vague)       |

### 11.3 Rules

- **One CTA verb** per screen, action-oriented (`feature.area.action`).
- Numbers/dates/currency via `Intl` (locale-aware), never string-formatted.
- ICU plurals for counts (`{count, plural, one {# patient} other {# patients}}`).
- Sentence case for everything (no ALL CAPS except the `overline` style via CSS, not the source string).
- Never blame the user; offer the next step.

```ts
// en/vitals.json
{ "form.bloodPressure": "Blood pressure",
  "form.bpHelp": "Enter the most recent reading.",
  "action.saveContinue": "Save and continue",
  "error.saveFailed": "We couldn't save the vitals. Try again." }
```

---

## 12. Governance

### 12.1 Adding or changing a token

1. **Propose** in an ADR (Brain §14 decision contract: Why · Benefits · Trade-offs · Alternatives · Future scalability · Enterprise).
2. **Tier discipline:** new raw value → **primitive**; new intent → **semantic**; per-component need → **component** alias. Never add a hardcoded value to a component.
3. **Contrast-check** any new color pairing against §9.5 (must pass AA) before merge.
4. **Add to all theme maps** (light, dark, hc-light, hc-dark) — a semantic token missing in a theme is a CI failure.
5. **Document** here; **export** via the Tailwind map (§3.7); **update** Storybook tokens page.

### 12.2 Adding or changing a component

1. Lives in `shared/ui` with the §8.2 contract (forwardRef, asChild, CVA, tokens-only, i18n-ready props, a11y).
2. Ships with: **Storybook story** (all variants/sizes/states + dark/HC/RTL/Large-Text), **`jest-axe` test**, and **keyboard-interaction test**.
3. Public API only via the slice `index.ts` (Brain §5.2 — no deep imports).
4. Reviewed against the §9.1 checklist; blocked if it violates a "NEVER" (Brain §2).

### 12.3 Versioning & catalog

- **Changesets** (Brain §4) version the ui-kit; semantic versioning; breaking token/API changes are **major** with a migration note.
- **Storybook is the living catalog** (Brain §4): every component documented with controls; the tokens, type scale, color ramps, and theme switcher are interactive pages. Storybook is the design ↔ code source of truth alongside this file.
- Deprecations: mark in Storybook + JSDoc `@deprecated`, keep one minor cycle, then remove.

### 12.4 Definition of done (design-system PR)

`☐` tokens-only (no hardcoded color/size) · `☐` i18n keys (no literals) · `☐` CVA variants typed · `☐` forwardRef + a11y roles/labels · `☐` keyboard + axe tests green · `☐` Storybook story (incl. dark/HC/RTL/Large-Text) · `☐` contrast verified · `☐` docs updated here.

---

_Last updated: 2026-06-27 · Owner: Design System / Frontend Architecture · Status: **Foundation v1** · Parent: [Brain.md](./Brain.md)_
