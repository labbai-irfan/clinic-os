/**
 * theme-manager.ts — the single source of truth for runtime theme state.
 *
 * Governed by: docs/Brain.md §6/§7/§9, Phase 5 THEME ENGINE BUILD SPEC.
 *
 * WHY a vanilla store (not a React hook/Zustand):
 *   - Theming is a DOM side-effect (data-* attrs + CSS vars on <html>). The
 *     manager owns that imperative work and exposes a `getState()/subscribe()`
 *     contract so React can bind to it via `useSyncExternalStore` with MINIMAL
 *     re-renders — a theme change is a CSS-variable swap, not a render cascade.
 *   - It can run pre-React (the index.html no-flash script already painted the
 *     attributes); `init()` simply re-applies from the persisted prefs and wires
 *     the live OS + cross-tab listeners.
 *
 * STABLE SNAPSHOT INVARIANT:
 *   `getState()` returns the SAME object reference until a mutation produces a
 *   genuinely new state. This is mandatory for `useSyncExternalStore` — an
 *   unstable snapshot would loop the render forever.
 */

import {
  applyClinicBrand as applyBrandToDom,
  removeClinicBrand,
} from '../branding/apply-clinic-brand';
import type { ClinicBrand, ClinicBrandSource } from '../branding/clinic-brand.types';
import { DATA_ATTR, DEFAULT_PREFERENCES } from '../model/theme.constants';
import type {
  Density,
  Direction,
  MotionPreference,
  TextScale,
  ThemeChangeListener,
  ThemePreferences,
  ThemeState,
} from '../model/theme.types';
import type { Theme, ThemeMode } from '../theme';
import { resolveTheme } from '../theme';
import {
  applyThemeState,
  exportPreferences as exportPrefsJson,
  importPreferences as importPrefsJson,
  mergePreferences,
} from '../utils';
import { createThemeLoader, registryBrandSource, type ThemeLoader } from './theme-loader';
import { createThemeRegistry, type ThemeRegistry } from './theme-registry';
import { loadPreferences, savePreferences, subscribeStorage } from './theme-storage';

/**
 * ThemeManager — the engine's imperative API. Members are declared as
 * arrow-function PROPERTIES (not method signatures) on purpose: every method is
 * a closure over module-scoped state and never reads `this`, so consumers (the
 * provider, the hooks) can safely destructure/spread them without triggering
 * `@typescript-eslint/unbound-method`.
 */
export interface ThemeManager {
  getState: () => ThemeState; // STABLE ref until change
  subscribe: (listener: ThemeChangeListener) => () => void;
  init: () => void;
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
  destroy: () => void;
}

export interface ThemeManagerOptions {
  source?: ClinicBrandSource;
  registry?: ThemeRegistry;
}

function hasMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function osPrefersReducedMotion(): boolean {
  return hasMatchMedia() && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Effective reduced-motion: explicit override wins, else OS preference. */
function computeReducedMotion(motion: MotionPreference): boolean {
  if (motion === 'reduced') return true;
  if (motion === 'full') return false;
  return osPrefersReducedMotion();
}

/** Build a fresh, immutable ThemeState from preferences + a resolved brand. */
function deriveState(
  prefs: ThemePreferences,
  clinicBrand: ClinicBrand | null,
  direction: Direction,
): ThemeState {
  const resolvedTheme: Theme = resolveTheme(prefs.mode);
  return {
    preferences: prefs,
    resolvedTheme,
    reducedMotion: computeReducedMotion(prefs.motion),
    direction,
    clinicBrand,
  };
}

/**
 * createThemeManager — construct an isolated theme store. `opts.source` injects
 * the brand port (defaults to the in-memory registry); `opts.registry` supplies
 * a pre-seeded registry for the default source.
 */
export function createThemeManager(opts: ThemeManagerOptions = {}): ThemeManager {
  const registry: ThemeRegistry = opts.registry ?? createThemeRegistry();
  const source: ClinicBrandSource = opts.source ?? registryBrandSource(registry);
  const loader: ThemeLoader = createThemeLoader(source);

  const listeners = new Set<ThemeChangeListener>();

  let state: ThemeState = deriveState(DEFAULT_PREFERENCES, null, 'ltr');
  let initialized = false;

  // Live OS listeners (kept so destroy() can detach them).
  let colorSchemeQuery: MediaQueryList | null = null;
  let reducedMotionQuery: MediaQueryList | null = null;
  let onColorScheme: (() => void) | null = null;
  let onReducedMotion: (() => void) | null = null;
  let unsubscribeStorage: (() => void) | null = null;

  function notify(): void {
    for (const listener of listeners) listener(state);
  }

  /** Apply the DOM side-effects for the current state (attrs + brand vars). */
  function applyToDom(next: ThemeState): void {
    // applyThemeState writes theme/large-text/motion/density/dir attributes.
    applyThemeState(next);
    if (next.clinicBrand) applyBrandToDom(next.clinicBrand);
    else removeClinicBrand();
  }

  /**
   * commit — replace the snapshot, run side-effects, persist, and notify. The
   * single funnel every mutator goes through so the pipeline never drifts.
   */
  function commit(next: ThemeState, persist = true): void {
    state = next;
    applyToDom(next);
    if (persist) savePreferences(next.preferences);
    notify();
  }

  /** Re-derive + commit from a preferences patch, preserving brand + direction. */
  function patchPreferences(patch: Partial<ThemePreferences>): void {
    const prefs = mergePreferences(state.preferences, patch);
    commit(deriveState(prefs, state.clinicBrand, state.direction));
  }

  function init(): void {
    if (initialized) return;
    initialized = true;

    const prefs = loadPreferences();
    // Direction is i18n-owned; mirror whatever is already on <html> at boot.
    const domDir =
      typeof document !== 'undefined' ? document.documentElement.getAttribute(DATA_ATTR.dir) : null;
    const direction: Direction = domDir === 'rtl' ? 'rtl' : 'ltr';

    const brandId = prefs.clinicBrandId;
    // Synchronously resolve a known brand so first paint is correct; unknown
    // ids resolve lazily (a host can registerBrand later + call loadClinicBrand).
    const knownBrand = brandId !== null ? (registry.getBrand(brandId) ?? null) : null;

    // Persist on init so the no-flash keys reflect the validated/merged prefs.
    commit(deriveState(prefs, knownBrand, direction));

    if (brandId !== null && knownBrand === null) {
      // Best-effort async hydrate; failures leave the (brandless) state intact.
      void loadClinicBrand(brandId).catch(() => undefined);
    }

    if (hasMatchMedia()) {
      colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      onColorScheme = (): void => {
        // OS color-scheme only matters while the user is in 'system' mode.
        if (state.preferences.mode !== 'system') return;
        const resolved = resolveTheme('system');
        if (resolved === state.resolvedTheme) return;
        commit(deriveState(state.preferences, state.clinicBrand, state.direction), false);
      };
      colorSchemeQuery.addEventListener('change', onColorScheme);

      reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      onReducedMotion = (): void => {
        // OS reduced-motion only matters while motion='system'.
        if (state.preferences.motion !== 'system') return;
        const effective = computeReducedMotion('system');
        if (effective === state.reducedMotion) return;
        commit(deriveState(state.preferences, state.clinicBrand, state.direction), false);
      };
      reducedMotionQuery.addEventListener('change', onReducedMotion);
    }

    // Cross-tab sync: another tab changed a key → reload + re-apply (no re-save).
    unsubscribeStorage = subscribeStorage(() => {
      const reloaded = loadPreferences();
      const known =
        reloaded.clinicBrandId !== null
          ? (registry.getBrand(reloaded.clinicBrandId) ?? null)
          : null;
      commit(deriveState(reloaded, known, state.direction), false);
    });
  }

  function setMode(mode: ThemeMode): void {
    patchPreferences({ mode });
  }

  function setTextScale(scale: TextScale): void {
    patchPreferences({ textScale: scale });
  }

  function setMotion(pref: MotionPreference): void {
    patchPreferences({ motion: pref });
  }

  function setDensity(density: Density): void {
    patchPreferences({ density });
  }

  function setDirection(dir: Direction): void {
    if (dir === state.direction) return;
    commit(deriveState(state.preferences, state.clinicBrand, dir));
  }

  function applyClinicBrand(brand: ClinicBrand): void {
    registry.registerBrand(brand);
    const prefs = mergePreferences(state.preferences, { clinicBrandId: brand.id });
    commit(deriveState(prefs, brand, state.direction));
  }

  async function loadClinicBrand(id: string): Promise<void> {
    const brand = await loader.load(id);
    if (brand === null) return;
    registry.registerBrand(brand);
    const prefs = mergePreferences(state.preferences, { clinicBrandId: brand.id });
    commit(deriveState(prefs, brand, state.direction));
  }

  function resetClinicBrand(): void {
    const prefs = mergePreferences(state.preferences, { clinicBrandId: null });
    commit(deriveState(prefs, null, state.direction));
  }

  function reset(): void {
    commit(deriveState(DEFAULT_PREFERENCES, null, state.direction));
  }

  function exportPreferences(): string {
    return exportPrefsJson(state.preferences);
  }

  function importPreferences(json: string): void {
    const prefs = importPrefsJson(json);
    const known =
      prefs.clinicBrandId !== null ? (registry.getBrand(prefs.clinicBrandId) ?? null) : null;
    commit(deriveState(prefs, known, state.direction));
  }

  function destroy(): void {
    if (colorSchemeQuery && onColorScheme) {
      colorSchemeQuery.removeEventListener('change', onColorScheme);
    }
    if (reducedMotionQuery && onReducedMotion) {
      reducedMotionQuery.removeEventListener('change', onReducedMotion);
    }
    unsubscribeStorage?.();
    colorSchemeQuery = null;
    reducedMotionQuery = null;
    onColorScheme = null;
    onReducedMotion = null;
    unsubscribeStorage = null;
    listeners.clear();
    initialized = false;
  }

  return {
    getState: () => state,
    subscribe: (listener: ThemeChangeListener): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    init,
    setMode,
    setTextScale,
    setMotion,
    setDensity,
    setDirection,
    applyClinicBrand,
    loadClinicBrand,
    resetClinicBrand,
    reset,
    exportPreferences,
    importPreferences,
    destroy,
  };
}
