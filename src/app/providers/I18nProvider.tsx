/**
 * I18nProvider.tsx — wires react-i18next into the tree and gates on locale readiness.
 *
 * Governed by: docs/architecture/Architecture.md (provider hierarchy) and docs/Brain.md §8.
 *
 * WHY it exists & its position:
 *   - It sits ABOVE QueryClientProvider and the app so EVERY component below can call
 *     `useTranslation()` and every user-facing string is a localized key (Brain §8).
 *   - Locale bundles are lazy-loaded over HTTP (i18n.ts), so this provider wraps children
 *     in <Suspense> with a minimal, token-driven, accessible fallback while the active
 *     namespace loads — preventing a flash of untranslated keys on first paint / language
 *     switch.
 *   - It is positioned UNDER ThemeProvider so the Suspense fallback already renders in the
 *     correct theme.
 */

import { type ReactNode, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n, initI18n } from '@shared/localization';

// Initialize i18next exactly once at module load (idempotent inside initI18n).
initI18n();

export interface I18nProviderProps {
  children: ReactNode;
}

/**
 * LocaleFallback — shown while a locale bundle loads. Token-only styling; `role="status"`
 * + aria-live so screen readers announce the brief loading state. Uses a non-localized
 * neutral glyph (no key) since translations may not be ready yet.
 */
function LocaleFallback(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minBlockSize: '100vh',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-body-md)',
      }}
    >
      <span aria-hidden="true">…</span>
    </div>
  );
}

/**
 * I18nProvider — provides the i18next instance and a Suspense boundary for lazy locales.
 */
export function I18nProvider({ children }: I18nProviderProps): JSX.Element {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<LocaleFallback />}>{children}</Suspense>
    </I18nextProvider>
  );
}
