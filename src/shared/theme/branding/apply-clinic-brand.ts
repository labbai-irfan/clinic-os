/**
 * apply-clinic-brand.ts — paint a validated ClinicBrand onto the live document.
 *
 * Sets the brand's derived CSS custom properties INLINE on <html> (so they win
 * over the stylesheet defaults without a rebuild), stamps `data-clinic-theme`
 * for any CSS hooks in themes.css, and swaps the favicon. `removeClinicBrand`
 * cleanly reverses all of it. SSR-safe — every DOM access is guarded.
 *
 * The brand ramps + AA on-colors are derived by `generateBrandColorTokens`
 * (utils). We import from utils — NOT `manager/theme-generator` — to avoid an
 * import cycle (the generator itself composes this same util).
 *
 * Governed by: Phase 5 BUILD SPEC §BRANDING (apply-clinic-brand.ts).
 */

import { DATA_ATTR } from '../model/theme.constants';
import { generateBrandColorTokens } from '../utils/generate-shades';
import type { ClinicBrand } from './clinic-brand.types';

/** The inline brand CSS-var names we own, so removal is exact. */
const BRAND_VAR_NAMES = [
  '--color-primary',
  '--color-primary-hover',
  '--color-primary-active',
  '--color-primary-subtle',
  '--color-on-primary',
  '--color-accent',
  '--color-accent-hover',
  '--color-on-accent',
] as const;

/** The <html> element, or null under SSR. */
function getRoot(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.documentElement;
}

/**
 * applyClinicBrand — derive the brand ramps + on-colors and write them as inline
 * custom properties on <html>, set `data-clinic-theme`, and update the favicon.
 * No-op under SSR.
 */
export function applyClinicBrand(brand: ClinicBrand): void {
  const root = getRoot();
  if (!root) return;

  const tokens = generateBrandColorTokens(brand.colors.primary, brand.colors.accent);
  for (const [name, value] of Object.entries(tokens)) {
    root.style.setProperty(name, value);
  }

  root.setAttribute(DATA_ATTR.clinicBrand, brand.id);

  if (brand.faviconUrl) {
    setFavicon(brand.faviconUrl);
  }
}

/**
 * removeClinicBrand — clear every inline brand var, drop `data-clinic-theme`,
 * and revert to the stylesheet defaults. No-op under SSR.
 */
export function removeClinicBrand(): void {
  const root = getRoot();
  if (!root) return;

  for (const name of BRAND_VAR_NAMES) {
    root.style.removeProperty(name);
  }
  root.removeAttribute(DATA_ATTR.clinicBrand);
}

/** Point (or create) the `<link rel="icon">` at the brand favicon. */
function setFavicon(href: string): void {
  if (typeof document === 'undefined') return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}
