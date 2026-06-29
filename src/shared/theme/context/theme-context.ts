/**
 * theme-context.ts — the React context handle for the theme engine.
 *
 * Governed by: Phase 5 THEME ENGINE BUILD SPEC (context).
 *
 * Null default → `useThemeContext` can throw a precise "used outside
 * ThemeProvider" error instead of silently handing back stale/undefined values.
 */

import { createContext } from 'react';

import type { ThemeContextValue } from './theme-context.types';

export const ThemeContext = createContext<ThemeContextValue | null>(null);
