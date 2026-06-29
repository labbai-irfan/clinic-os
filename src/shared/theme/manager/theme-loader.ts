/**
 * theme-loader.ts — async brand resolution through the ClinicBrandSource PORT,
 * with an in-memory cache so a brand is fetched at most once per session.
 *
 * Governed by: Phase 5 THEME ENGINE BUILD SPEC (manager).
 *
 * WHY a port + loader: the manager never talks to a backend. It depends on the
 * `ClinicBrandSource` interface; a host swaps the implementation (registry,
 * HTTP, file). `registryBrandSource` is the default, backend-free source.
 */

import type { ClinicBrand, ClinicBrandSource } from '../branding/clinic-brand.types';
import type { ThemeRegistry } from './theme-registry';

export interface ThemeLoader {
  load(id: string): Promise<ClinicBrand | null>;
}

/**
 * registryBrandSource — adapt an in-memory ThemeRegistry to the async
 * ClinicBrandSource port. The default source when no backend is wired.
 */
export function registryBrandSource(registry: ThemeRegistry): ClinicBrandSource {
  return {
    getBrand(id: string): Promise<ClinicBrand | null> {
      return Promise.resolve(registry.getBrand(id) ?? null);
    },
  };
}

/**
 * createThemeLoader — wrap a source with a per-id cache. A `null` result (brand
 * genuinely not found) is also cached so we do not re-hit the source on misses.
 */
export function createThemeLoader(source: ClinicBrandSource): ThemeLoader {
  const cache = new Map<string, ClinicBrand | null>();
  const inflight = new Map<string, Promise<ClinicBrand | null>>();

  return {
    async load(id: string): Promise<ClinicBrand | null> {
      const cached = cache.get(id);
      if (cached !== undefined) return cached;

      const pending = inflight.get(id);
      if (pending !== undefined) return pending;

      const promise = source
        .getBrand(id)
        .then((brand) => {
          cache.set(id, brand);
          inflight.delete(id);
          return brand;
        })
        .catch((error: unknown) => {
          inflight.delete(id);
          throw error;
        });

      inflight.set(id, promise);
      return promise;
    },
  };
}
