/**
 * theme.types.ts — the Theme Engine type surface (Phase 5).
 *
 * EXTENDS the Phase-1..4 public API in `../theme` (Theme/ThemeMode) — never
 * recreates it. These types describe the RUNTIME engine: user preferences, the
 * immutable state snapshot the manager exposes, and the curated set of color
 * token names hooks can read type-safely.
 *
 * Governed by: docs/Brain.md §6/§7/§9, docs/design-system/Theme.md,
 * docs/Coding-Standards.md (strict TS, token-only), Phase 5 BUILD SPEC §TYPES.
 */

import type { ClinicBrand } from '../branding/clinic-brand.types';
import type { Theme, ThemeMode } from '../theme';

export type { Theme, ThemeMode } from '../theme';

/** A user-selectable color scheme — the same surface as {@link ThemeMode}. */
export type ColorScheme = ThemeMode;

/** Text size preference (maps to the existing `data-large-text` attribute). */
export type TextScale = 'normal' | 'large';

/** Motion preference: defer to OS, force full motion, or force reduced. */
export type MotionPreference = 'system' | 'full' | 'reduced';

/** Layout density (maps to the `data-density` attribute). */
export type Density = 'comfortable' | 'compact';

/** Writing direction (i18n-owned; the engine mirrors it, never fights it). */
export type Direction = 'ltr' | 'rtl';

/**
 * The persisted, user-controlled theme preferences. This is the serializable
 * source of truth — everything in {@link ThemeState} is derived from it (plus OS
 * signals + the loaded clinic brand).
 */
export interface ThemePreferences {
  mode: ThemeMode;
  textScale: TextScale;
  motion: MotionPreference;
  density: Density;
  clinicBrandId: string | null;
}

/**
 * The immutable state snapshot the manager publishes. A NEW object is produced
 * only on a real change, so `useSyncExternalStore` can treat the reference as
 * stable and avoid render loops.
 */
export interface ThemeState {
  preferences: ThemePreferences;
  /** `'system'` resolved to a concrete {@link Theme}. */
  resolvedTheme: Theme;
  /** Effective reduced-motion (explicit override wins over the OS signal). */
  reducedMotion: boolean;
  direction: Direction;
  clinicBrand: ClinicBrand | null;
}

/** Subscriber invoked with the new snapshot whenever the state changes. */
export type ThemeChangeListener = (state: ThemeState) => void;

/**
 * Curated (not exhaustive) semantic color token names. `getToken()` still
 * accepts any raw CSS var string — this type only powers `getColor()` so the
 * common tokens are autocompleted and typo-checked.
 */
export type ColorTokenName =
  | 'primary'
  | 'primary-hover'
  | 'primary-active'
  | 'primary-subtle'
  | 'on-primary'
  | 'accent'
  | 'accent-hover'
  | 'on-accent'
  | 'surface'
  | 'surface-raised'
  | 'surface-sunken'
  | 'text'
  | 'text-muted'
  | 'text-subtle'
  | 'border'
  | 'focus'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
