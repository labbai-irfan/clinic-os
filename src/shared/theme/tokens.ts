/**
 * tokens.ts — JS-consumable design-token values for ClinicOS.
 *
 * SOURCE OF TRUTH: The CSS custom properties in
 * `src/shared/styles/tokens/` remain the authoritative source for every
 * COLOR and SPACE value — they theme at runtime (light / dark / high-contrast /
 * large-text) and must never be hardcoded in components.
 *
 * This file exists ONLY for values that JS libraries need as raw numbers or
 * arrays and that CSS cannot hand to them directly — e.g. framer-motion
 * (durations in seconds, cubic-bezier arrays, variants), chart libraries
 * (a categorical color array; prefer the CSS-var strings so theming still
 * applies), and breakpoint matchMedia logic. The numeric values here MIRROR the
 * corresponding CSS primitives; keep them in sync if a primitive ever changes.
 *
 * Everything is `as const` (deeply immutable, literal-typed). No `any`.
 *
 * Governed by: docs/Frontend-Bible.md §8 (Motion) + §3 (tokens) and
 * docs/design-system/Motion.md (Phase 4).
 */

/* -------------------------------------------------------------------------- */
/* Motion — durations & easings                                               */
/* -------------------------------------------------------------------------- */

/** Animation durations in milliseconds (mirror `--duration-*`). */
export const durations = {
  instant: 75,
  fast: 150,
  base: 220,
  slow: 320,
  slower: 480,
} as const;

/** Animation durations in seconds — framer-motion expects seconds. */
export const durationsSec = {
  instant: 0.075,
  fast: 0.15,
  base: 0.22,
  slow: 0.32,
  slower: 0.48,
} as const;

/**
 * Easing curves as cubic-bezier control-point tuples (mirror `--ease-*`).
 * Typed as 4-tuples so framer-motion's `ease` accepts them directly.
 */
export const easings = {
  standard: [0.2, 0, 0, 1],
  decelerate: [0, 0, 0, 1],
  accelerate: [0.3, 0, 1, 1],
  emphasized: [0.2, 0, 0, 1.2],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/* -------------------------------------------------------------------------- */
/* Motion — framer-motion presets                                             */
/* -------------------------------------------------------------------------- */

/**
 * Reusable framer-motion variant presets. Each factory takes a `reducedMotion`
 * flag (read from the theme/OS preference): when true, transitions collapse to
 * ~0s and offsets to 0 so the element snaps to its final state — motion is
 * degraded, never the content. Essential feedback is preserved.
 *
 * Usage:
 *   const variants = motionPresets.fadeIn(isReducedMotion);
 *   <motion.div variants={variants} initial="hidden" animate="visible" />
 */
export const motionPresets = {
  /** Opacity-only fade. */
  fadeIn: (reducedMotion = false) =>
    ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: reducedMotion ? 0 : durationsSec.base,
          ease: easings.standard,
        },
      },
    }) as const,

  /** Rise + fade — for cards, list items, toasts. */
  slideUp: (reducedMotion = false) =>
    ({
      hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: reducedMotion ? 0 : durationsSec.base,
          ease: easings.decelerate,
        },
      },
    }) as const,

  /** Right-edge drawer slide-in. */
  drawerRight: (reducedMotion = false) =>
    ({
      hidden: { x: reducedMotion ? 0 : '100%' },
      visible: {
        x: 0,
        transition: {
          duration: reducedMotion ? 0 : durationsSec.slow,
          ease: easings.decelerate,
        },
      },
    }) as const,

  /** Dialog scale + fade pop. */
  dialogPop: (reducedMotion = false) =>
    ({
      hidden: { opacity: 0, scale: reducedMotion ? 1 : 0.96 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: reducedMotion ? 0 : durationsSec.fast,
          ease: easings.emphasized,
        },
      },
    }) as const,
} as const;

/* -------------------------------------------------------------------------- */
/* Layout — breakpoints                                                       */
/* -------------------------------------------------------------------------- */

/** Breakpoint min-widths in px (mirror `--breakpoint-*` / Tailwind screens). */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/* -------------------------------------------------------------------------- */
/* Charts — categorical palette                                               */
/* -------------------------------------------------------------------------- */

/**
 * Chart palette as CSS-var strings — PREFER THESE in chart configs so series
 * colors re-theme (dark / high-contrast) at runtime with no JS re-render.
 */
export const chartColorVars = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
  'var(--color-chart-7)',
  'var(--color-chart-8)',
] as const;

/**
 * Chart palette as raw hex — fallback ONLY for canvas/SVG export contexts that
 * cannot resolve CSS vars. These mirror the `--color-chart-*` primitives and do
 * NOT theme; use `chartColorVars` everywhere a CSS var is honored.
 */
export const chartColors = [
  '#6b8e8e',
  '#e87d7d',
  '#2f73c2',
  '#d9961a',
  '#2e9e5b',
  '#7d6ba8',
  '#827473',
  '#c2723e',
] as const;

/* -------------------------------------------------------------------------- */
/* Stacking — z-index                                                         */
/* -------------------------------------------------------------------------- */

/** Stacking order (mirror `--z-*`). */
export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
} as const;

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

/** Icon box sizes in px (mirror `--icon-size-*`). */
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

/** Default icon stroke width (mirror `--icon-stroke`). */
export const iconStroke = 2 as const;

/* -------------------------------------------------------------------------- */
/* Derived types                                                              */
/* -------------------------------------------------------------------------- */

export type DurationKey = keyof typeof durations;
export type EasingKey = keyof typeof easings;
export type BreakpointKey = keyof typeof breakpoints;
export type ZIndexKey = keyof typeof zIndex;
export type IconSizeKey = keyof typeof iconSizes;
