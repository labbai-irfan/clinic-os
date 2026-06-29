/**
 * shared/theme — public API barrel.
 * Governed by docs/Frontend-Bible.md §4. Consume theming from here.
 */
export type { Theme, ThemeMode } from './theme';
export {
  applyLargeText,
  applyReducedMotion,
  applyTheme,
  getInitialLargeText,
  getInitialTheme,
  initTheme,
  isReducedMotion,
  resolveTheme,
  setThemeMode,
} from './theme';

/* Phase 4 — JS-consumable token values (motion / charts / breakpoints / icons). */
export * from './tokens';

/* ---------------------------------------------------------------------------
 * Phase 5 — Theme Engine (model / branding / utils / manager / context / hooks).
 *
 * NOTE: the new applier is `applyThemeState` (from utils), NOT `applyTheme`
 * (already exported from './theme'), so the two never clash.
 * ------------------------------------------------------------------------- */
export { validateClinicBrand } from './branding/clinic-brand.schema';
export * from './branding/clinic-brand.types';
export { ThemeContext } from './context/theme-context';
export type { ThemeContextValue } from './context/theme-context.types';
export * from './hooks/use-clinic-brand';
export * from './hooks/use-theme';
export type { ThemeManager } from './manager/theme-manager';
export { createThemeManager } from './manager/theme-manager';
export * from './model/theme.constants';
export * from './model/theme.types';
export * from './utils';
