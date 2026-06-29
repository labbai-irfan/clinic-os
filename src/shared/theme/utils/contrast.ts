/**
 * contrast.ts — WCAG 2.x contrast math for the Theme Engine (pure, no DOM).
 *
 * Real relative-luminance contrast ratios + the AA/AAA thresholds, plus
 * `pickReadableText` which the shade generator uses to pick an on-color that
 * actually meets AA against a generated brand color. This is what keeps a
 * clinic's custom brand accessible without manual tuning.
 *
 * Governed by: Phase 5 BUILD SPEC §UTILS (contrast.ts), docs a11y rules.
 */

import { hexToRgb, relativeLuminance } from './color';

/** WCAG 2.x minimum contrast thresholds. */
const AA_NORMAL = 4.5;
const AA_LARGE = 3;
const AAA_NORMAL = 7;
const AAA_LARGE = 4.5;

/**
 * contrastRatio — WCAG contrast ratio between two colors, in [1, 21].
 * White-on-black (and black-on-white) ≈ 21; identical colors = 1.
 */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** meetsWcagAA — true if `fg` on `bg` clears AA (4.5, or 3 for large text). */
export function meetsWcagAA(fg: string, bg: string, large = false): boolean {
  return contrastRatio(fg, bg) >= (large ? AA_LARGE : AA_NORMAL);
}

/** meetsWcagAAA — true if `fg` on `bg` clears AAA (7, or 4.5 for large text). */
export function meetsWcagAAA(fg: string, bg: string, large = false): boolean {
  return contrastRatio(fg, bg) >= (large ? AAA_LARGE : AAA_NORMAL);
}

/**
 * pickReadableText — choose the foreground (light vs dark) that reads best on
 * `bg`. Prefers whichever clears AA; if neither does, returns the one with the
 * higher raw ratio so we still get the most legible option.
 */
export function pickReadableText(bg: string, light = '#ffffff', dark = '#1a1514'): string {
  const lightRatio = contrastRatio(light, bg);
  const darkRatio = contrastRatio(dark, bg);
  const lightPasses = lightRatio >= AA_NORMAL;
  const darkPasses = darkRatio >= AA_NORMAL;

  if (lightPasses && !darkPasses) return light;
  if (darkPasses && !lightPasses) return dark;
  return lightRatio >= darkRatio ? light : dark;
}
