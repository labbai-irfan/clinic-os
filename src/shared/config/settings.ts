/**
 * Runtime UI default settings for ClinicOS.
 *
 * Purpose: one immutable place for non-secret, UI-shaped defaults — the initial
 * theme, pagination size, toast durations, and TanStack Query timing defaults.
 * These are foundation defaults; user/tenant overrides layer on top later via
 * the global UI store. No domain values live here.
 *
 * Governed by: docs/Coding-Standards.md §6 (state homes), Phase 3 BUILD SPEC,
 * docs/Frontend-Bible.md §3 (motion/duration tokens inform toast timings).
 */

/** Default theme applied before any user/system preference resolves. */
export const DEFAULT_THEME = 'light' as const;
export type DefaultTheme = typeof DEFAULT_THEME;

export const settings = {
  /** Initial theme mode (the theme engine may still honor `prefers-color-scheme`). */
  defaultTheme: DEFAULT_THEME,

  pagination: {
    /** Default page size for paginated lists. */
    defaultPageSize: 20,
    /** Selectable page-size options. */
    pageSizeOptions: [10, 20, 50, 100] as const,
  },

  toast: {
    /** Default toast lifetime (ms). */
    durationMs: 5_000,
    /** Error toasts linger longer so they are not missed. */
    errorDurationMs: 8_000,
  },

  query: {
    /** Data is considered fresh for 1 minute by default. */
    staleTimeMs: 60_000,
    /** Inactive cache entries are garbage-collected after 5 minutes. */
    gcTimeMs: 5 * 60_000,
    /** Default network-failure retry attempts (4xx are never retried — see query-client). */
    retry: 2,
  },
} as const;

export type Settings = typeof settings;
