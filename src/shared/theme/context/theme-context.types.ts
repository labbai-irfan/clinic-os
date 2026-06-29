/**
 * theme-context.types.ts — the React-facing contract.
 *
 * Governed by: Phase 5 THEME ENGINE BUILD SPEC (context).
 *
 * ThemeContextValue = the manager's STABLE state snapshot (flattened in) +
 * its bound action methods. Hooks read this; the provider builds it from
 * `useSyncExternalStore(manager…)` + memoized action bindings.
 */

import type { ClinicBrand } from '../branding/clinic-brand.types';
import type {
  Density,
  Direction,
  MotionPreference,
  TextScale,
  ThemeState,
} from '../model/theme.types';
import type { ThemeMode } from '../theme';

/**
 * ThemeContextValue — the manager's stable state snapshot + its bound actions.
 *
 * Actions are arrow-function PROPERTIES (not method signatures) so consumers can
 * destructure them in hooks without `@typescript-eslint/unbound-method` firing
 * — they are `this`-free closures over the manager's module-scoped state.
 */
export interface ThemeContextValue extends ThemeState {
  setMode: (mode: ThemeMode) => void;
  setTextScale: (scale: TextScale) => void;
  setMotion: (pref: MotionPreference) => void;
  setDensity: (density: Density) => void;
  setDirection: (dir: Direction) => void;
  applyClinicBrand: (brand: ClinicBrand) => void;
  loadClinicBrand: (id: string) => Promise<void>;
  resetClinicBrand: () => void;
  reset: () => void;
  exportPreferences: () => string;
  importPreferences: (json: string) => void;
}
