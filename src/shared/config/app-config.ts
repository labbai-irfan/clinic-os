/**
 * Typed runtime application config for ClinicOS.
 *
 * Purpose: derive a single immutable `appConfig` object from the validated
 * `env`. This is the canonical place to read app metadata (name, version,
 * environment, API base/timeout, locales) — components and services read this,
 * never `import.meta.env` or `process.env` directly.
 *
 * Governed by: docs/architecture/FolderStructure.md (`app/config` purpose,
 * sourced from `shared/config`), Phase 3 BUILD SPEC.
 */
import { env } from './env';

/** Locales ClinicOS ships translations for. Urdu (`ur`) is RTL. */
export const SUPPORTED_LOCALES = ['en', 'hi', 'mr', 'ur'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Deployment environments. */
export type AppEnv = (typeof env)['VITE_APP_ENV'];

/**
 * Build-time version injected by Vite (`define`), falling back to the env value
 * when running outside a Vite build (e.g. a bare Vitest run).
 */
const buildVersion: string =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : env.VITE_APP_VERSION;

export const appConfig = {
  name: env.VITE_APP_NAME,
  version: buildVersion,
  env: env.VITE_APP_ENV,
  isProduction: env.VITE_APP_ENV === 'production',
  isDevelopment: env.VITE_APP_ENV === 'development',
  isTest: env.VITE_APP_ENV === 'test',
  api: {
    baseUrl: env.VITE_API_BASE_URL,
    timeoutMs: env.VITE_API_TIMEOUT_MS,
  },
  defaultLocale: env.VITE_DEFAULT_LOCALE,
  supportedLocales: SUPPORTED_LOCALES,
  logLevel: env.VITE_LOG_LEVEL,
} as const;

export type AppConfig = typeof appConfig;
