/**
 * get-token.ts — read resolved design-token values from the live DOM.
 *
 * The CSS custom properties in `src/shared/styles/` are the source of truth for
 * every themed value. This reads the COMPUTED value of a token off an element
 * (default <html>) so JS can consume the exact, currently-themed color/size
 * without ever hardcoding one. SSR-safe: returns '' when there is no document.
 *
 * Governed by: Phase 5 BUILD SPEC §UTILS (get-token.ts), GOLDEN RULES (token-only).
 */

import type { ColorTokenName } from '../model/theme.types';

/**
 * getToken — the trimmed computed value of a CSS custom property on `el`.
 * Accepts any var name (with or without the leading `--`). Returns '' under SSR
 * or when the property is unset.
 */
export function getToken(varName: string, el: Element | null = getDefaultElement()): string {
  if (
    el === null ||
    typeof window === 'undefined' ||
    typeof window.getComputedStyle !== 'function'
  ) {
    return '';
  }
  const property = varName.startsWith('--') ? varName : `--${varName}`;
  return window.getComputedStyle(el).getPropertyValue(property).trim();
}

/** getColor — read a curated semantic color token (`--color-${name}`). */
export function getColor(name: ColorTokenName): string {
  return getToken(`--color-${name}`);
}

/** The default target element (<html>), or null under SSR. */
function getDefaultElement(): Element | null {
  return typeof document === 'undefined' ? null : document.documentElement;
}
