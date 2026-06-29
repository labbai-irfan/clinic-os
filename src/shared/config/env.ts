/**
 * Runtime environment validation for ClinicOS (fail-fast).
 *
 * Purpose: parse `import.meta.env` through a Zod schema with coercion and
 * defaults, then export a single strongly-typed `env` object that the rest of
 * the app trusts. If the environment is invalid the module throws immediately
 * with a clear, actionable message listing every offending variable — we fail
 * at boot, never silently at runtime.
 *
 * SECURITY: only `VITE_`-prefixed variables reach the client and the bundle is
 * PUBLIC. NEVER place secrets here — secrets stay server-side. See
 * docs/architecture/EnvironmentGuide.md.
 *
 * Governed by: docs/Coding-Standards.md §2.9 (validate inputs at the edge),
 * docs/architecture/FolderStructure.md (`shared/config`), Phase 3 BUILD SPEC.
 */
import { z } from 'zod';

/** Coerce the common string booleans Vite hands us ("true"/"false"/"1"/"0"). */
const booleanFromString = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((value) => value === true || value === 'true' || value === '1');

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('ClinicOS'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  VITE_APP_VERSION: z.string().min(1).default('0.0.0'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:4000/api'),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  VITE_ENABLE_MSW: booleanFromString.default(import.meta.env.DEV ? 'true' : 'false'),
  VITE_DEFAULT_LOCALE: z.enum(['en', 'hi', 'mr', 'ur']).default('en'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  VITE_ENABLE_ANALYTICS: booleanFromString.default('false'),
  VITE_SENTRY_DSN: z.string().min(1).optional(),
  /** Base URL for served static assets. Empty = app base path; set to a CDN origin for offload. */
  VITE_ASSET_BASE_URL: z.string().default(''),
});

/** Fully validated, coerced environment shape consumed across the app. */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate the raw environment once, eagerly, at module load.
 * @throws {Error} a single error enumerating every invalid/missing variable.
 */
function parseEnv(rawEnv: ImportMetaEnv): Env {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `[ClinicOS] Invalid environment configuration. Fix the following variable(s):\n${issues}\n` +
        'See docs/architecture/EnvironmentGuide.md for the full schema.',
    );
  }

  return result.data;
}

/** The single, validated, typed environment object. Import this — never `import.meta.env`. */
export const env: Env = parseEnv(import.meta.env);
