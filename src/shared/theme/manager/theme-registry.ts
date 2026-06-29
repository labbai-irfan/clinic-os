/**
 * theme-registry.ts — in-memory registry of clinic white-label brands + the
 * built-in concrete themes.
 *
 * Governed by: Phase 5 THEME ENGINE BUILD SPEC (manager).
 *
 * WHY a registry: the manager resolves a brand id → ClinicBrand without coupling
 * to a backend. A host app seeds known brands at boot (or a ClinicBrandSource
 * loads them lazily — see theme-loader.ts). The registry is the synchronous,
 * already-known set.
 */

import type { ClinicBrand } from '../branding/clinic-brand.types';
import type { Theme } from '../theme';

/** The concrete, built-in themes ClinicOS always ships (no brand required). */
const BUILTIN_MODES: readonly Theme[] = ['light', 'dark', 'high-contrast'];

export interface ThemeRegistry {
  registerBrand(brand: ClinicBrand): void;
  getBrand(id: string): ClinicBrand | undefined;
  listBrands(): ClinicBrand[];
  hasBrand(id: string): boolean;
  readonly BUILTIN_MODES: readonly Theme[];
}

/** createThemeRegistry — a fresh, isolated in-memory brand registry. */
export function createThemeRegistry(): ThemeRegistry {
  const brands = new Map<string, ClinicBrand>();

  return {
    registerBrand(brand: ClinicBrand): void {
      brands.set(brand.id, brand);
    },
    getBrand(id: string): ClinicBrand | undefined {
      return brands.get(id);
    },
    listBrands(): ClinicBrand[] {
      return Array.from(brands.values());
    },
    hasBrand(id: string): boolean {
      return brands.has(id);
    },
    BUILTIN_MODES,
  };
}
