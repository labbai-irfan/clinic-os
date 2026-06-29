/**
 * ThemeProvider.tsx — boots the theme engine and provides its live state.
 *
 * Governed by: docs/architecture/Architecture.md (provider hierarchy) and
 * docs/Brain.md §6/§7.
 *
 * WHY it exists & its position in the hierarchy:
 *   - It sits just INSIDE RootErrorBoundary and ABOVE I18nProvider so the visual
 *     theme (data-theme / data-large-text / data-motion / data-density /
 *     data-clinic-theme on <html>) is correct for everything rendered below —
 *     including the i18n Suspense fallback and the error fallback.
 *   - Pre-paint theme is handled by the no-flash <script> in index.html. This
 *     provider keeps it LIVE: it creates the ThemeManager once, `init()`s it on
 *     mount (wiring OS color-scheme / reduced-motion + cross-tab storage sync),
 *     and republishes the manager's stable snapshot via context.
 *   - Theming is a pure DOM side-effect via the manager, so a theme change is a
 *     CSS-variable/attribute swap with ZERO component re-renders below — only
 *     consumers of the changed slice (via the theme hooks) re-read.
 *
 * The full theme-switching UI (settings toggles) is a feature concern for a
 * later phase; this provider establishes the runtime application of theme.
 */

import { type ReactNode, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import {
  type ClinicBrandSource,
  createThemeManager,
  ThemeContext,
  type ThemeContextValue,
  type ThemeManager,
} from '@shared/theme';

export interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Optional brand source for dependency injection (e.g. an HTTP-backed
   * ClinicBrandSource). Defaults to the manager's in-memory registry source.
   */
  source?: ClinicBrandSource;
}

/**
 * ThemeProvider — owns one ThemeManager for the app lifetime, binds React to it
 * with `useSyncExternalStore` (stable snapshot → minimal re-renders), and hands
 * down a memoized ThemeContextValue (state + bound actions).
 */
export function ThemeProvider({ children, source }: ThemeProviderProps): JSX.Element {
  // One manager for the app's lifetime. Created lazily on first render so the
  // same instance is reused across re-renders (and StrictMode double-invokes).
  const managerRef = useRef<ThemeManager | null>(null);
  if (managerRef.current === null) {
    managerRef.current = createThemeManager(source ? { source } : {});
  }
  const manager = managerRef.current;

  useEffect(() => {
    manager.init();
    return () => manager.destroy();
  }, [manager]);

  // getState is referentially stable until a real change → no render loop.
  const state = useSyncExternalStore(manager.subscribe, manager.getState, manager.getState);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...state,
      setMode: manager.setMode,
      setTextScale: manager.setTextScale,
      setMotion: manager.setMotion,
      setDensity: manager.setDensity,
      setDirection: manager.setDirection,
      applyClinicBrand: manager.applyClinicBrand,
      loadClinicBrand: manager.loadClinicBrand,
      resetClinicBrand: manager.resetClinicBrand,
      reset: manager.reset,
      exportPreferences: manager.exportPreferences,
      importPreferences: manager.importPreferences,
    }),
    [state, manager],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
