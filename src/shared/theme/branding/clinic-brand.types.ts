/**
 * clinic-brand.types.ts — the clinic white-label contract (Phase 5).
 *
 * A clinic customizes the whole product (colors, logos, login, documents)
 * WITHOUT any source changes: a `ClinicBrand` flows in through the injectable
 * {@link ClinicBrandSource} PORT, the generator derives the CSS-var ramps + AA
 * on-colors, and the applier writes them as inline custom properties on <html>.
 *
 * Governed by: docs/Brain.md §6 (branding) / §7 (persistence), Phase 5 BUILD
 * SPEC §BRANDING. No backend coupling — the port hides the data source.
 */

/** How a branded surface (sidebar/header) renders against the brand color. */
export type SurfaceStyle = 'solid' | 'subtle' | 'branded';

/**
 * A clinic's full brand definition. Only `colors.primary`/`colors.accent` are
 * required to theme; everything else progressively enhances logos, login, and
 * generated documents (PDF/prescription/invoice).
 */
export interface ClinicBrand {
  id: string;
  name: string;
  /** Hex seed colors — the generator derives ramps + on-colors from these. */
  colors: { primary: string; accent: string };
  logo?: { full?: string; mark?: string };
  faviconUrl?: string;
  loaderUrl?: string;
  illustrations?: Record<string, string>;
  sidebarStyle?: SurfaceStyle;
  headerStyle?: SurfaceStyle;
  login?: { backgroundUrl?: string; tagline?: string };
  /** Branding for generated documents (PDF / prescription / invoice). */
  document?: { headerLogoUrl?: string; footerText?: string; accentColor?: string };
}

/**
 * The branding PORT. A backend (or a mock, or the in-memory registry) provides
 * an implementation; the engine never imports a concrete data source.
 */
export interface ClinicBrandSource {
  getBrand(id: string): Promise<ClinicBrand | null>;
}
