/**
 * i18n.ts — i18next initialization for ClinicOS.
 *
 * Governed by: docs/Brain.md §8 (localization baseline) and docs/Frontend-Bible.md §11.
 *
 * WHY this configuration:
 *   - i18next + react-i18next is the canonical stack (Brain §4). Every user-facing string
 *     is a key (Brain §8) — there are NO literals in the UI.
 *   - LanguageDetector picks the user's language (querystring → localStorage → navigator),
 *     constrained to the supported set.
 *   - HttpBackend lazy-loads locale bundles from `/locales/{{lng}}/{{ns}}.json`, so adding
 *     a language or namespace ships JSON, not a rebuild, and bundles load on demand.
 *   - On every language change we set <html dir> via rtl.ts (ur = RTL), enabling runtime
 *     language switching without reload (Brain §8).
 *
 * Locale source files live at src/locales/{en,hi,mr,ur}/common.json and are copied to the
 * public `/locales` path at build time (Vite static handling) so HttpBackend can fetch them.
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { env } from '@shared/config';
import { STORAGE_KEYS } from '@shared/constants';
import { createLogger } from '@shared/logger';

import { applyDir } from './rtl';

const log = createLogger('app');

/** Launch languages (Brain §8). Keep in sync with src/locales/* and rtl.ts. */
export const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'ur'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Namespaces. Foundation ships only `common`; modules add their own later. */
export const DEFAULT_NAMESPACE = 'common';
export const NAMESPACES = [DEFAULT_NAMESPACE] as const;

export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

/**
 * initI18n — configure and start i18next. Idempotent: returns the existing instance if
 * already initialized (StrictMode/double-invoke safe). Returns the i18next instance
 * (also a promise consumers can await before first paint).
 */
export function initI18n(): typeof i18n {
  if (i18n.isInitialized) return i18n;

  void i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      supportedLngs: [...SUPPORTED_LANGUAGES],
      fallbackLng: FALLBACK_LANGUAGE,
      lng: env.VITE_DEFAULT_LOCALE,
      ns: [...NAMESPACES],
      defaultNS: DEFAULT_NAMESPACE,
      load: 'languageOnly', // collapse "en-US" → "en"
      backend: {
        // Served from public/locales at runtime (see src/locales source files).
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
        lookupQuerystring: 'lng',
        lookupLocalStorage: STORAGE_KEYS.locale,
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false, // React already escapes — prevents double-encoding.
      },
      returnNull: false,
      debug: env.VITE_LOG_LEVEL === 'debug',
    })
    .catch((error: unknown) => {
      log.error('i18next initialization failed', error);
    });

  // Set direction now and on every runtime language switch (RTL support).
  applyDir(i18n.language || FALLBACK_LANGUAGE);
  i18n.on('languageChanged', (lng) => applyDir(lng));

  return i18n;
}

export default i18n;
