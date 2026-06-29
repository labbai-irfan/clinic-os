/**
 * theme.constants.ts — the closed value sets + DOM contract for the engine.
 *
 * Single place where the engine's enumerable preference values, the RTL locale
 * list, the data-attribute names, and the default preferences live. Keeping
 * these `as const` makes them literal-typed and immutable so validators,
 * appliers, and the no-flash script all agree on the same contract.
 *
 * Governed by: Phase 5 BUILD SPEC §CONSTANTS + §DATA-ATTRIBUTE CONTRACT.
 */

import type {
  Density,
  Direction,
  MotionPreference,
  TextScale,
  ThemeMode,
  ThemePreferences,
} from './theme.types';

/** Every selectable mode (concrete themes + `system`). */
export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'high-contrast', 'system'];

/** Every text-scale value. */
export const TEXT_SCALES: readonly TextScale[] = ['normal', 'large'];

/** Every motion preference. */
export const MOTION_PREFERENCES: readonly MotionPreference[] = ['system', 'full', 'reduced'];

/** Every density value. */
export const DENSITIES: readonly Density[] = ['comfortable', 'compact'];

/** Every writing direction. */
export const DIRECTIONS: readonly Direction[] = ['ltr', 'rtl'];

/** Locales that render right-to-left (Urdu, Arabic, Hebrew, Farsi). */
export const RTL_LOCALES = ['ur', 'ar', 'he', 'fa'] as const;

/**
 * The <html> data-attribute names the engine writes. Mirrors themes.css and the
 * index.html no-flash script — do not rename without updating both.
 */
export const DATA_ATTR = {
  theme: 'data-theme',
  largeText: 'data-large-text',
  motion: 'data-motion',
  density: 'data-density',
  clinicBrand: 'data-clinic-theme',
  dir: 'dir',
} as const;

/** Factory defaults applied when nothing is persisted (or on reset). */
export const DEFAULT_PREFERENCES: ThemePreferences = {
  mode: 'system',
  textScale: 'normal',
  motion: 'system',
  density: 'comfortable',
  clinicBrandId: null,
};
