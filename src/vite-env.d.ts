/// <reference types="vite/client" />

/**
 * Ambient typings for ClinicOS client environment.
 *
 * Purpose: give `import.meta.env` a precise type that mirrors the Zod schema in
 * `src/shared/config/env.ts`, and declare the build-time `__APP_VERSION__`
 * constant injected by Vite's `define`. These are RAW string-ish values as Vite
 * exposes them; coercion/validation happens in `env.ts`.
 *
 * When adding a variable: update this interface, the Zod schema in env.ts, the
 * `.env.example`, and docs/architecture/EnvironmentGuide.md (see that guide).
 *
 * Governed by: Phase 3 BUILD SPEC (env schema), docs/Coding-Standards.md §2.9.
 */

/** Build-time application version, injected by Vite from package.json. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** Display name of the app. */
  readonly VITE_APP_NAME?: string;
  /** Deployment environment. */
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production' | 'test';
  /** App version (overridden at build via `define`). */
  readonly VITE_APP_VERSION?: string;
  /** Base URL of the backend API. */
  readonly VITE_API_BASE_URL?: string;
  /** API request timeout in milliseconds (string in raw env; coerced to number). */
  readonly VITE_API_TIMEOUT_MS?: string;
  /** Whether Mock Service Worker is enabled ("true" | "false"). */
  readonly VITE_ENABLE_MSW?: string;
  /** Default UI locale. */
  readonly VITE_DEFAULT_LOCALE?: 'en' | 'hi' | 'mr' | 'ur';
  /** Logger verbosity threshold. */
  readonly VITE_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  /** Whether analytics is enabled ("true" | "false"). */
  readonly VITE_ENABLE_ANALYTICS?: string;
  /** Optional Sentry DSN; absent disables error reporting. */
  readonly VITE_SENTRY_DSN?: string;
  /** Base URL for served static assets (empty = app base; set to a CDN origin to offload). */
  readonly VITE_ASSET_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
