/**
 * theme-storage.ts — persistence adapter for theme preferences.
 *
 * Governed by: docs/Brain.md §7 (persistence), Phase 5 THEME ENGINE BUILD SPEC.
 *
 * WHY individual keys (not one JSON blob):
 *   - The no-flash <script> in index.html must read `theme`, `large-text`,
 *     `reduced-motion`, `density` and `clinic-brand` PRE-PAINT with no module
 *     imports. Those individual STORAGE_KEYS are therefore the source of truth;
 *     this adapter reads/writes the same keys so the engine and the bootstrap
 *     script never disagree.
 *
 * SSR-safe: every access is guarded — on the server `loadPreferences` returns
 * the defaults and the writers/subscribers are no-ops.
 */

import { STORAGE_KEYS } from '@shared/constants';

import type { Density, MotionPreference, TextScale, ThemePreferences } from '../model/theme.types';
import { defaultPreferences, mergePreferences } from '../utils';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

const VALID_MODES: readonly string[] = ['light', 'dark', 'high-contrast', 'system'];
const VALID_MOTION: readonly MotionPreference[] = ['system', 'full', 'reduced'];

function readMotion(): MotionPreference | undefined {
  const raw = window.localStorage.getItem(STORAGE_KEYS.reducedMotion);
  if (raw === null) return undefined;
  // Legacy/no-flash boolean form: 'true' → reduced, 'false' → full.
  if (raw === 'true') return 'reduced';
  if (raw === 'false') return 'full';
  return (VALID_MOTION as readonly string[]).includes(raw) ? (raw as MotionPreference) : undefined;
}

/**
 * loadPreferences — read the individual keys, validate each, and merge over the
 * defaults. Any malformed/absent key falls back to its default value.
 */
export function loadPreferences(): ThemePreferences {
  if (!hasStorage()) return defaultPreferences();

  const ls = window.localStorage;
  const patch: Partial<ThemePreferences> = {};

  const mode = ls.getItem(STORAGE_KEYS.theme);
  if (mode !== null && VALID_MODES.includes(mode)) {
    patch.mode = mode as ThemePreferences['mode'];
  }

  if (ls.getItem(STORAGE_KEYS.largeText) === 'true') {
    patch.textScale = 'large' satisfies TextScale;
  } else if (ls.getItem(STORAGE_KEYS.largeText) === 'false') {
    patch.textScale = 'normal' satisfies TextScale;
  }

  const motion = readMotion();
  if (motion !== undefined) patch.motion = motion;

  const density = ls.getItem(STORAGE_KEYS.density);
  if (density === 'comfortable' || density === 'compact') {
    patch.density = density satisfies Density;
  }

  const brand = ls.getItem(STORAGE_KEYS.clinicBrand);
  if (brand !== null && brand !== '') patch.clinicBrandId = brand;

  return mergePreferences(defaultPreferences(), patch);
}

/**
 * savePreferences — write each preference to its individual key so the no-flash
 * script and any other tab read a consistent, module-free source of truth.
 */
export function savePreferences(prefs: ThemePreferences): void {
  if (!hasStorage()) return;

  const ls = window.localStorage;
  ls.setItem(STORAGE_KEYS.theme, prefs.mode);
  ls.setItem(STORAGE_KEYS.largeText, String(prefs.textScale === 'large'));

  // 'system' clears the override so CSS can defer to the OS media query.
  if (prefs.motion === 'system') ls.removeItem(STORAGE_KEYS.reducedMotion);
  else ls.setItem(STORAGE_KEYS.reducedMotion, prefs.motion);

  ls.setItem(STORAGE_KEYS.density, prefs.density);

  if (prefs.clinicBrandId === null) ls.removeItem(STORAGE_KEYS.clinicBrand);
  else ls.setItem(STORAGE_KEYS.clinicBrand, prefs.clinicBrandId);
}

/**
 * subscribeStorage — fire `cb` when another tab mutates one of our keys
 * (window 'storage' event). Returns an unsubscribe function. No-op on SSR.
 */
export function subscribeStorage(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const ours: readonly string[] = [
    STORAGE_KEYS.theme,
    STORAGE_KEYS.largeText,
    STORAGE_KEYS.reducedMotion,
    STORAGE_KEYS.density,
    STORAGE_KEYS.clinicBrand,
  ];

  const handler = (event: StorageEvent): void => {
    // key === null happens on storage.clear(); treat it as a relevant change.
    if (event.key === null || ours.includes(event.key)) cb();
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
