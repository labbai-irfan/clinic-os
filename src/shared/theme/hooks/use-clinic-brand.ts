/**
 * use-clinic-brand.ts — the React surface for white-label brand control.
 *
 * Governed by: Phase 5 THEME ENGINE BUILD SPEC (hooks).
 *
 * Reads the active ClinicBrand off the context and exposes the brand actions
 * (apply now / load by id via the source port / reset to the built-in theme).
 */

import type { ClinicBrand } from '../branding/clinic-brand.types';
import { useThemeContext } from './use-theme';

export function useClinicBrand(): {
  brand: ClinicBrand | null;
  applyClinicBrand: (brand: ClinicBrand) => void;
  loadClinicBrand: (id: string) => Promise<void>;
  resetClinicBrand: () => void;
} {
  const { clinicBrand, applyClinicBrand, loadClinicBrand, resetClinicBrand } = useThemeContext();
  return { brand: clinicBrand, applyClinicBrand, loadClinicBrand, resetClinicBrand };
}
