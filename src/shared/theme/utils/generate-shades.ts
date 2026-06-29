/**
 * generate-shades.ts — derive a 50..900 ramp + brand CSS-var map from a seed.
 *
 * `generateShades` anchors the input at 500 and lightens toward 50 / darkens
 * toward 900, so a clinic only supplies primary + accent hex and we produce a
 * full, consistent ramp. `generateBrandColorTokens` turns those into the exact
 * CSS custom properties the runtime sets on <html>, with AA-safe on-colors.
 *
 * Governed by: Phase 5 BUILD SPEC §UTILS (generate-shades.ts). Logic only — it
 * MAPS to token names but never hardcodes a themed visual value.
 */

import { darken, lighten, normalizeHex } from './color';
import { pickReadableText } from './contrast';

/** The numeric stops of a generated color ramp. */
export type ShadeStop = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/** A full ramp: every stop mapped to a canonical hex. */
export type ShadeRamp = Record<ShadeStop, string>;

/**
 * Lighten amounts for the stops ABOVE 500 (lighter) and darken amounts for the
 * stops BELOW 500 (darker). 500 is the untouched anchor (the seed color).
 */
const LIGHTEN_STEPS: Record<50 | 100 | 200 | 300 | 400, number> = {
  50: 0.9,
  100: 0.8,
  200: 0.6,
  300: 0.4,
  400: 0.2,
};

const DARKEN_STEPS: Record<600 | 700 | 800 | 900, number> = {
  600: 0.15,
  700: 0.3,
  800: 0.45,
  900: 0.6,
};

/**
 * generateShades — build a 50..900 ramp anchored at 500 ≈ the input color.
 * Returns canonical `#rrggbb` for every stop.
 */
export function generateShades(hex: string): ShadeRamp {
  const base = normalizeHex(hex);
  return {
    50: lighten(base, LIGHTEN_STEPS[50]),
    100: lighten(base, LIGHTEN_STEPS[100]),
    200: lighten(base, LIGHTEN_STEPS[200]),
    300: lighten(base, LIGHTEN_STEPS[300]),
    400: lighten(base, LIGHTEN_STEPS[400]),
    500: base,
    600: darken(base, DARKEN_STEPS[600]),
    700: darken(base, DARKEN_STEPS[700]),
    800: darken(base, DARKEN_STEPS[800]),
    900: darken(base, DARKEN_STEPS[900]),
  };
}

/**
 * generateBrandColorTokens — map a primary + accent seed to the CSS custom
 * properties the engine writes on <html>. `--color-on-*` are chosen via
 * `pickReadableText` so they clear WCAG AA against their background.
 *
 * Returns a plain `varName → value` record (e.g. `'--color-primary': '#...'`).
 */
export function generateBrandColorTokens(primary: string, accent: string): Record<string, string> {
  const primaryRamp = generateShades(primary);
  const accentRamp = generateShades(accent);

  return {
    '--color-primary': primaryRamp[500],
    '--color-primary-hover': primaryRamp[600],
    '--color-primary-active': primaryRamp[700],
    '--color-primary-subtle': primaryRamp[50],
    '--color-on-primary': pickReadableText(primaryRamp[500]),
    '--color-accent': accentRamp[500],
    '--color-accent-hover': accentRamp[600],
    '--color-on-accent': pickReadableText(accentRamp[500]),
  };
}
