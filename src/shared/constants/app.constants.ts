/**
 * Global, domain-free application constants for ClinicOS.
 *
 * Purpose: truly app-wide magic values (locale metadata, request header names,
 * timing constants) live here once, immutable and `as const`. NO domain values
 * (those belong in a module/entity `constants/`).
 *
 * Governed by: docs/architecture/FolderStructure.md (`shared/constants`),
 * docs/Naming-Convention.md §14 (no dumping-ground names), Phase 3 BUILD SPEC.
 */

/** Locales ClinicOS supports, in display order. */
export const LOCALES = ['en', 'hi', 'mr', 'ur'] as const;
export type Locale = (typeof LOCALES)[number];

/** Locales rendered right-to-left. */
export const RTL_LOCALES = ['ur'] as const;
export type RtlLocale = (typeof RTL_LOCALES)[number];

/** Fallback locale when detection fails or a key is missing. */
export const FALLBACK_LOCALE: Locale = 'en';

/** Default i18next namespace loaded eagerly at boot. */
export const DEFAULT_NAMESPACE = 'common' as const;

/** Canonical HTTP header names attached by the http-client interceptors. */
export const HTTP_HEADERS = {
  requestId: 'X-Request-Id',
  tenantId: 'X-Tenant-Id',
  authorization: 'Authorization',
  acceptLanguage: 'Accept-Language',
} as const;

/** Common time spans in milliseconds, for readable timeouts/retries. */
export const TIME = {
  second: 1_000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
} as const;
