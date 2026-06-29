/**
 * Public API barrel for `shared/constants`.
 *
 * Purpose: the single import surface for global, domain-free constants —
 * app constants, storage keys, and the root query-key factory.
 *
 * Governed by: docs/Coding-Standards.md §15 (import only from index.ts),
 * docs/architecture/FolderStructure.md (`shared/constants`).
 */
export {
  DEFAULT_NAMESPACE,
  FALLBACK_LOCALE,
  HTTP_HEADERS,
  type Locale,
  LOCALES,
  RTL_LOCALES,
  type RtlLocale,
  TIME,
} from './app.constants';
export { ROOT_QUERY_KEY, scopedQueryKey } from './query-keys.constants';
export { STORAGE_KEYS, STORAGE_NAMESPACE, type StorageKey } from './storage-keys.constants';
