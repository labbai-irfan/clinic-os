/**
 * use-theme.ts — the React read/act surface for the theme engine.
 *
 * Governed by: docs/Brain.md §6, Phase 5 THEME ENGINE BUILD SPEC (hooks).
 *
 * All hooks read the SAME ThemeContext value (the manager's stable snapshot +
 * bound actions). The granular hooks are convenience selectors — they exist so
 * a component states exactly what it depends on (mode, density, direction, …).
 */

import { useContext } from 'react';

import { ThemeContext } from '../context/theme-context';
import type { ThemeContextValue } from '../context/theme-context.types';
import type { Density, Direction } from '../model/theme.types';
import type { Theme, ThemeMode } from '../theme';

/** useThemeContext — the raw context value; throws outside <ThemeProvider>. */
export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return ctx;
}

/** useTheme — primary alias for the full context value. */
export function useTheme(): ThemeContextValue {
  return useThemeContext();
}

/** useThemeMode — the selected mode, its resolved concrete theme, and the setter. */
export function useThemeMode(): {
  mode: ThemeMode;
  resolvedTheme: Theme;
  setMode: (mode: ThemeMode) => void;
} {
  const { preferences, resolvedTheme, setMode } = useThemeContext();
  return { mode: preferences.mode, resolvedTheme, setMode };
}

/** useColorScheme — the resolved concrete theme on <html> right now. */
export function useColorScheme(): Theme {
  return useThemeContext().resolvedTheme;
}

/** useReducedMotion — the effective reduced-motion flag (override > OS). */
export function useReducedMotion(): boolean {
  return useThemeContext().reducedMotion;
}

/** useLargeText — large-text toggle mapped to the 'large' | 'normal' text scale. */
export function useLargeText(): { enabled: boolean; setEnabled: (enabled: boolean) => void } {
  const { preferences, setTextScale } = useThemeContext();
  return {
    enabled: preferences.textScale === 'large',
    setEnabled: (enabled: boolean) => setTextScale(enabled ? 'large' : 'normal'),
  };
}

/** useDensity — the UI density preference + its setter. */
export function useDensity(): { density: Density; setDensity: (density: Density) => void } {
  const { preferences, setDensity } = useThemeContext();
  return { density: preferences.density, setDensity };
}

/** useDirection — the current writing direction (i18n-owned; engine mirrors it). */
export function useDirection(): Direction {
  return useThemeContext().direction;
}
