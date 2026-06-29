/**
 * clinic-brand.schema.ts — runtime validation for an untrusted ClinicBrand.
 *
 * A brand can arrive from any backend through the ClinicBrandSource port, so it
 * MUST be validated before it themes the app. Zod enforces hex colors, optional
 * url-ish strings, and the surface-style enum; `validateClinicBrand` returns a
 * discriminated result the loader/validator can branch on without throwing.
 *
 * Governed by: Phase 5 BUILD SPEC §BRANDING (clinic-brand.schema.ts).
 */

import { z } from 'zod';

import type { ClinicBrand } from './clinic-brand.types';

/** `#rgb` or `#rrggbb`. */
const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a hex color like #2f73c2');

/** A lenient url-ish string (absolute, relative, or data URI). */
const urlish = z.string().min(1);

const surfaceStyle = z.enum(['solid', 'subtle', 'branded']);

/** Zod schema mirroring {@link ClinicBrand}. */
export const clinicBrandSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  colors: z.object({
    primary: hexColor,
    accent: hexColor,
  }),
  logo: z
    .object({
      full: urlish.optional(),
      mark: urlish.optional(),
    })
    .optional(),
  faviconUrl: urlish.optional(),
  loaderUrl: urlish.optional(),
  illustrations: z.record(z.string(), urlish).optional(),
  sidebarStyle: surfaceStyle.optional(),
  headerStyle: surfaceStyle.optional(),
  login: z
    .object({
      backgroundUrl: urlish.optional(),
      tagline: z.string().optional(),
    })
    .optional(),
  document: z
    .object({
      headerLogoUrl: urlish.optional(),
      footerText: z.string().optional(),
      accentColor: hexColor.optional(),
    })
    .optional(),
});

/** The inferred input type (structurally equal to {@link ClinicBrand}). */
export type ClinicBrandInput = z.infer<typeof clinicBrandSchema>;

/** Result of {@link validateClinicBrand} — never throws. */
export interface ValidateClinicBrandResult {
  success: boolean;
  brand?: ClinicBrand;
  errors?: string[];
}

/**
 * validateClinicBrand — safe-parse an untrusted value into a {@link ClinicBrand}.
 * On success returns `{ success: true, brand }`; on failure returns
 * `{ success: false, errors }` with flattened, human-readable messages.
 */
export function validateClinicBrand(input: unknown): ValidateClinicBrandResult {
  const result = clinicBrandSchema.safeParse(input);
  if (result.success) {
    return { success: true, brand: result.data as ClinicBrand };
  }
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return { success: false, errors };
}
