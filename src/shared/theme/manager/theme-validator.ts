/**
 * theme-validator.ts — structural + accessibility validation for a clinic brand.
 *
 * Governed by: docs/Brain.md §9 (a11y-first), Phase 5 THEME ENGINE BUILD SPEC.
 *
 * Two layers:
 *   1. STRUCTURE — zod (validateClinicBrand) proves the shape + hex colors.
 *   2. CONTRAST AUDIT — the derived on-colors must read on their backgrounds.
 *      A brand can be structurally valid yet fail AA; that is a WARNING, not a
 *      hard error, so a clinic is never fully blocked — but the audit is loud.
 */

import { validateClinicBrand } from '../branding/clinic-brand.schema';
import type { ClinicBrand } from '../branding/clinic-brand.types';
import { contrastRatio, meetsWcagAA, pickReadableText } from '../utils';

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** AA threshold for normal-size text/UI. */
const AA_NORMAL = 4.5;

/**
 * validateTheme — run the structural schema then audit brand-color contrast.
 * `valid` reflects structural validity; contrast issues surface as warnings.
 */
export function validateTheme(brand: ClinicBrand): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const structural = validateClinicBrand(brand);
  if (!structural.success) {
    errors.push(...(structural.errors ?? ['Invalid clinic brand.']));
    return { valid: false, errors, warnings };
  }

  // Contrast audit — primary's chosen on-color must read on primary.
  const onPrimary = pickReadableText(brand.colors.primary);
  if (!meetsWcagAA(onPrimary, brand.colors.primary)) {
    warnings.push(
      `Primary ${brand.colors.primary} fails AA against its on-color ` +
        `(ratio ${contrastRatio(onPrimary, brand.colors.primary).toFixed(2)} < ${AA_NORMAL}).`,
    );
  }

  const onAccent = pickReadableText(brand.colors.accent);
  if (!meetsWcagAA(onAccent, brand.colors.accent)) {
    warnings.push(
      `Accent ${brand.colors.accent} fails AA against its on-color ` +
        `(ratio ${contrastRatio(onAccent, brand.colors.accent).toFixed(2)} < ${AA_NORMAL}).`,
    );
  }

  return { valid: true, errors, warnings };
}
