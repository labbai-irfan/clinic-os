/**
 * apply-theme.ts — write a whole ThemeState to the <html> data-attributes.
 *
 * The engine's ONLY DOM mutation for mode/text/motion/density/dir. It reuses the
 * existing Phase-1..4 setters in `../theme` where they already own an attribute
 * (theme, large-text, reduced-motion) and adds the new ones (density, dir). A
 * theme change is therefore a pure attribute swap — no component re-render.
 *
 * Governed by: Phase 5 BUILD SPEC §UTILS (apply-theme.ts) + §DATA-ATTRIBUTE
 * CONTRACT. SSR-guarded.
 */

import { DATA_ATTR } from '../model/theme.constants';
import type { ThemeState } from '../model/theme.types';
import { applyLargeText, applyReducedMotion, applyTheme } from '../theme';

/** The live <html> element, or null under SSR. */
function getRoot(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.documentElement;
}

/**
 * applyThemeState — reflect the full snapshot onto <html>:
 *  - `data-theme`       ← resolvedTheme (via existing applyTheme)
 *  - `data-large-text`  ← textScale === 'large' (via existing applyLargeText)
 *  - `data-motion`      ← motion preference (system clears it; full→normal; reduced→reduced)
 *  - `data-density`     ← preferences.density
 *  - `dir`              ← direction
 *
 * Note: `applyLargeText`/`applyReducedMotion` also persist to localStorage; the
 * manager owns canonical persistence, this just keeps the legacy keys in sync.
 */
export function applyThemeState(state: ThemeState): void {
  const root = getRoot();
  if (!root) return;

  applyTheme(state.resolvedTheme);
  applyLargeText(state.preferences.textScale === 'large');

  switch (state.preferences.motion) {
    case 'system':
      // Clear the override so CSS prefers-reduced-motion takes over.
      root.removeAttribute(DATA_ATTR.motion);
      break;
    case 'full':
      applyReducedMotion(false);
      break;
    case 'reduced':
      applyReducedMotion(true);
      break;
  }

  root.setAttribute(DATA_ATTR.density, state.preferences.density);
  root.setAttribute(DATA_ATTR.dir, state.direction);
}
