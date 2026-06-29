/**
 * shared/localization — public API barrel.
 * Governed by docs/Brain.md §8. Initialize and consume i18n from here.
 */
export type { SupportedLanguage } from './i18n';
export {
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  default as i18n,
  initI18n,
  NAMESPACES,
  SUPPORTED_LANGUAGES,
} from './i18n';
export type { Direction } from './rtl';
export { applyDir, directionFor, isRtl, RTL_LANGUAGES } from './rtl';
