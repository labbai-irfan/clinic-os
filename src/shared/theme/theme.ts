/**
 * theme.ts — the ClinicOS theming engine (no React; pure DOM + storage).
 *
 * Governed by: docs/Frontend-Bible.md §4 (Theming) and docs/Brain.md §6/§7.
 *
 * WHY a plain module (not a hook):
 *   - Theme is applied by writing data-* attributes on <html>. Doing it imperatively
 *     (here) lets us set the theme PRE-PAINT (before React mounts) to avoid a
 *     flash-of-incorrect-theme, and lets a thin ThemeProvider just orchestrate it.
 *   - Only the semantic token tier reacts to these attributes (see themes.css). No
 *     component re-renders for a theme change — it is a pure CSS-variable swap.
 *
 * Attribute contract (matches themes.css):
 *   data-theme       = "light" | "dark" | "high-contrast"
 *   data-large-text  = "true" (present only when Large Text Mode is on)
 *   data-motion      = "reduced" (user override; OS prefers-reduced-motion handled in CSS)
 */

import { STORAGE_KEYS } from '@shared/constants';

/** Concrete, resolvable themes (what actually lands on <html>). */
export type Theme = 'light' | 'dark' | 'high-contrast';

/** User-selectable mode, including "system" (follow prefers-color-scheme). */
export type ThemeMode = Theme | 'system';

const VALID_MODES: readonly ThemeMode[] = ['light', 'dark', 'high-contrast', 'system'];

function getRoot(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.documentElement;
}

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Resolve a mode (which may be "system") to a concrete Theme. */
export function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') return prefersDark() ? 'dark' : 'light';
  return mode;
}

/**
 * getInitialTheme — read the persisted mode (if any) else fall back to "system".
 * Used at bootstrap to set the theme before first paint.
 */
export function getInitialTheme(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored && (VALID_MODES as readonly string[]).includes(stored)) {
    return stored as ThemeMode;
  }
  return 'system';
}

/** Apply a concrete theme to <html data-theme>. */
export function applyTheme(theme: Theme): void {
  getRoot()?.setAttribute('data-theme', theme);
}

/**
 * setThemeMode — resolve, apply, and persist a mode in one call. Returns the concrete
 * theme that was applied (useful for syncing UI state).
 */
export function setThemeMode(mode: ThemeMode): Theme {
  const theme = resolveTheme(mode);
  applyTheme(theme);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.theme, mode);
  }
  return theme;
}

/** Toggle Large Text Mode → writes/clears data-large-text on <html>. */
export function applyLargeText(enabled: boolean): void {
  const root = getRoot();
  if (!root) return;
  if (enabled) root.setAttribute('data-large-text', 'true');
  else root.removeAttribute('data-large-text');
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.largeText, String(enabled));
  }
}

/** Read the persisted Large Text Mode preference (default off). */
export function getInitialLargeText(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.largeText) === 'true';
}

/**
 * applyReducedMotion — write/clear the data-motion override. `null` clears the override
 * and defers to the OS prefers-reduced-motion media query (handled purely in CSS).
 */
export function applyReducedMotion(enabled: boolean | null): void {
  const root = getRoot();
  if (!root) return;
  if (enabled === true) root.setAttribute('data-motion', 'reduced');
  else if (enabled === false) root.setAttribute('data-motion', 'normal');
  else root.removeAttribute('data-motion');
}

/** True if the user/OS currently prefers reduced motion (override wins). */
export function isReducedMotion(): boolean {
  const root = getRoot();
  const override = root?.getAttribute('data-motion');
  if (override === 'reduced') return true;
  if (override === 'normal') return false;
  return prefersReducedMotion();
}

/**
 * initTheme — bootstrap helper: applies the persisted theme + large-text + reduced-motion
 * before React renders, and subscribes to OS changes so "system" mode stays live.
 * Returns an unsubscribe function.
 */
export function initTheme(): () => void {
  const mode = getInitialTheme();
  applyTheme(resolveTheme(mode));
  applyLargeText(getInitialLargeText());

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }

  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = (): void => {
    // Only react to OS changes while the user is in "system" mode.
    if (getInitialTheme() === 'system') applyTheme(resolveTheme('system'));
  };
  colorScheme.addEventListener('change', onChange);
  return () => colorScheme.removeEventListener('change', onChange);
}
