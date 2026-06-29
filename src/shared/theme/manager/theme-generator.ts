/**
 * theme-generator.ts — thin façade over the pure color utils.
 *
 * Governed by: Phase 5 THEME ENGINE BUILD SPEC (manager).
 *
 * The real algorithms live in utils/ (generate-shades, color, contrast). This
 * module only NAMES the two operations the engine needs so callers depend on a
 * stable manager API rather than on individual util signatures.
 */

import type { ClinicBrand } from '../branding/clinic-brand.types';
import { generateBrandColorTokens, generateShades, type ShadeRamp } from '../utils';

/**
 * generateBrand — derive the full set of brand CSS variables (primary/accent
 * ramps + readable on-colors) for a clinic brand. Returns a `varName → value`
 * map ready for `documentElement.style.setProperty`.
 */
export function generateBrand(brand: ClinicBrand): Record<string, string> {
  return generateBrandColorTokens(brand.colors.primary, brand.colors.accent);
}

/** previewShades — the 50→900 ramp for a single hex (e.g. for a color picker). */
export function previewShades(hex: string): ShadeRamp {
  return generateShades(hex);
}
