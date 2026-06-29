/**
 * Root TanStack Query key factory for ClinicOS.
 *
 * Purpose: provide the single ROOT scope every feature/entity key factory hangs
 * off of, so the whole cache can be invalidated/cleared consistently and there
 * are no scattered magic key arrays. Per docs/Coding-Standards.md §6.1 and
 * docs/Naming-Convention.md §8.2, each entity owns its own `xKeys` factory in
 * its slice (`thing.queries.ts`); those factories should derive from this root
 * scope so invalidation by the broadest key always works.
 *
 * NOTE: this is intentionally minimal — it is the root, not a per-entity
 * factory. Entity factories (e.g. `patientKeys`) are built in their slices.
 *
 * Governed by: docs/Coding-Standards.md §6.1, docs/Naming-Convention.md §8.2,
 * Phase 3 BUILD SPEC.
 */

/** Top-level cache namespace; entity factories should spread this as their root. */
export const ROOT_QUERY_KEY = ['clinicos'] as const;

/**
 * Builds a scoped root key for a feature/entity factory, e.g.
 * `scopedQueryKey('patient')` → `['clinicos', 'patient']`.
 */
export function scopedQueryKey<const TScope extends string>(
  scope: TScope,
): readonly [...typeof ROOT_QUERY_KEY, TScope] {
  return [...ROOT_QUERY_KEY, scope] as const;
}
