/**
 * Persistent storage key registry for ClinicOS.
 *
 * Purpose: every localStorage / sessionStorage / IndexedDB key the app writes
 * is declared here once, namespaced, and `as const`. This prevents key
 * collisions and typos and makes a global storage audit a one-file read.
 *
 * Governed by: docs/architecture/FolderStructure.md (`shared/constants`),
 * docs/Naming-Convention.md, Phase 3 BUILD SPEC.
 */

/** Namespace prefix isolating ClinicOS keys from anything else on the origin. */
export const STORAGE_NAMESPACE = 'clinicos' as const;

const key = (name: string): string => `${STORAGE_NAMESPACE}:${name}`;

/** Keys for browser-persisted UI/app state (non-PHI, non-secret). */
export const STORAGE_KEYS = {
  /** Active theme mode (light | dark | high-contrast | system). */
  theme: key('theme'),
  /** Persisted UI locale selection. */
  locale: key('locale'),
  /** Large-text accessibility toggle. */
  largeText: key('large-text'),
  /** Reduced-motion accessibility override. */
  reducedMotion: key('reduced-motion'),
  /** UI density preference (comfortable | compact). */
  density: key('density'),
  /** Active clinic white-label brand id. */
  clinicBrand: key('clinic-brand'),
  /** TanStack Query offline cache persistence bucket. */
  queryCache: key('query-cache'),
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
