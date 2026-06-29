/**
 * Feature flags for ClinicOS.
 *
 * Purpose: expose a single typed `featureFlags` object derived from validated
 * env booleans, plus an `isFeatureEnabled()` accessor. Centralizing flags here
 * keeps conditional behavior auditable and lets a future remote flag service
 * slot in behind the same accessor with no call-site changes.
 *
 * Governed by: docs/architecture/FolderStructure.md (`shared/config`),
 * Phase 3 BUILD SPEC.
 */
import { env } from './env';

export const featureFlags = {
  /** Enable Mock Service Worker (backend-independent dev/test). */
  msw: env.VITE_ENABLE_MSW,
  /** Enable the analytics port (no-op unless a vendor adapter is wired). */
  analytics: env.VITE_ENABLE_ANALYTICS,
  /** Error monitoring is enabled only when a Sentry DSN is present. */
  errorMonitoring: env.VITE_SENTRY_DSN !== undefined,
} as const;

export type FeatureFlags = typeof featureFlags;
export type FeatureFlag = keyof FeatureFlags;

/** Returns whether a named feature flag is currently enabled. */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
