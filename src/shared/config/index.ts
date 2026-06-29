/**
 * Public API barrel for `shared/config`.
 *
 * Purpose: the single import surface for runtime configuration — validated env,
 * derived app config, feature flags, and UI default settings. Consumers import
 * from `@shared/config`, never from the individual files.
 *
 * Governed by: docs/Coding-Standards.md §15 (import only from index.ts),
 * docs/architecture/FolderStructure.md (`shared/config`).
 */
export {
  type AppConfig,
  appConfig,
  type AppEnv,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from './app-config';
export { type AssetKey, ASSETS, assetUrl } from './assets';
export { type Env, env } from './env';
export {
  type FeatureFlag,
  type FeatureFlags,
  featureFlags,
  isFeatureEnabled,
} from './feature-flags';
export { DEFAULT_THEME, type DefaultTheme, type Settings, settings } from './settings';
