/**
 * Asset Registry — the CDN-ready manifest for runtime-served static assets.
 *
 * ClinicOS has two asset tiers:
 *   1. SOURCE assets (`src/assets/**`) — imported in code, hashed + bundled by Vite
 *      (icons, small inline SVGs). Referenced by `import logo from '@assets/...'`.
 *   2. SERVED assets (`public/assets/**` or a CDN) — large/white-labellable artwork
 *      (logos, illustrations, avatars) addressed by a STABLE logical key through
 *      this registry, so the physical location (local `public/` ↔ CDN ↔ per-tenant
 *      bucket) can change with ZERO code edits. That is the "CDN-ready" indirection.
 *
 * `assetUrl(key)` is the ONLY place a served-asset URL is constructed. The base
 * defaults to the app's base path and is overridable via `VITE_ASSET_BASE_URL`
 * (e.g. `https://cdn.clinicos.app`).
 *
 * Governed by: docs/assets/AssetArchitecture.md, docs/assets/OptimizationGuide.md,
 * docs/architecture/EnvironmentGuide.md (the env var).
 */
import { env } from './env';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

/** Base for served assets: a CDN origin when configured, else the app base path. */
const ASSET_BASE = trimTrailingSlash(env.VITE_ASSET_BASE_URL || import.meta.env.BASE_URL || '/');

/**
 * Logical key → path under the served-assets root (`<base>/assets/<path>`).
 * Seeded with the foundational slots; grows additively as artwork is produced.
 * Keys are `category.name` (camelCase name); paths are kebab-case files.
 */
export const ASSETS = {
  'brand.logo': 'brand/clinicos-logo.svg',
  'brand.logoMark': 'brand/clinicos-mark.svg',
  'brand.logoLight': 'brand/clinicos-logo-light.svg',
  'brand.logoDark': 'brand/clinicos-logo-dark.svg',
  'brand.logoMono': 'brand/clinicos-mono.svg',
  'illustration.emptyGeneric': 'illustrations/empty-generic.svg',
  'illustration.errorGeneric': 'illustrations/error-generic.svg',
  'illustration.offline': 'illustrations/offline.svg',
  'illustration.maintenance': 'illustrations/maintenance.svg',
  'illustration.welcome': 'illustrations/welcome.svg',
  'avatar.doctor': 'avatars/avatar-doctor.svg',
  'avatar.patient': 'avatars/avatar-patient.svg',
  'avatar.organization': 'avatars/avatar-organization.svg',
} as const;

/** Type-safe key of a registered served asset. */
export type AssetKey = keyof typeof ASSETS;

/**
 * Resolve a registry key to a full, CDN-aware URL — the single source of truth for
 * served-asset URLs. A missing key is a compile-time error (the param is `AssetKey`).
 */
export function assetUrl(key: AssetKey): string {
  return `${ASSET_BASE}/assets/${ASSETS[key]}`;
}
