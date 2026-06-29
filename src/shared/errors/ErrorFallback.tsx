/**
 * ErrorFallback.tsx — the accessible, tokenized, i18n-driven fallback UI shown when an
 * error boundary catches a render-time failure.
 *
 * Governed by: docs/Brain.md §11 (the Error async state) and docs/Frontend-Bible.md §9
 * (a11y) — token-only styling, i18n-only copy, WCAG 2.2 AA.
 *
 * A11y:
 *   - The container is `role="alert"` so screen readers announce the failure.
 *   - The retry button is a real <button>, keyboard-operable, with a visible
 *     :focus-visible ring (token-driven). Focus is moved to it on mount so a keyboard
 *     user lands on the recovery action.
 *
 * This component renders NO PHI and NO raw error text to the user — only a localized,
 * human, reassuring message. (The technical error is logged separately by the boundary.)
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { toAppError } from './map-error';

export interface ErrorFallbackProps {
  /** The caught error (unknown shape — normalized internally). */
  error: unknown;
  /** Resets the boundary and re-renders the subtree (react-error-boundary). */
  resetErrorBoundary: () => void;
}

/**
 * ErrorFallback — used as react-error-boundary's `FallbackComponent`. Styling is 100%
 * CSS-variable tokens (no hardcoded color/size); all copy comes from common.json.
 */
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps): JSX.Element {
  const { t } = useTranslation();
  const retryRef = useRef<HTMLButtonElement>(null);
  const appError = toAppError(error);

  // Move focus to the recovery action so keyboard/SR users land on the next step.
  useEffect(() => {
    retryRef.current?.focus();
  }, []);

  return (
    <div
      role="alert"
      aria-labelledby="app-error-title"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        minBlockSize: '60vh',
        paddingInline: 'var(--space-6)',
        paddingBlock: 'var(--space-10)',
        textAlign: 'center',
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-surface)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h1
        id="app-error-title"
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-h2)',
          lineHeight: 'var(--leading-h2)',
          fontWeight: 'var(--weight-h2)',
          color: 'var(--color-text)',
        }}
      >
        {t('errors.unexpected.title')}
      </h1>

      <p
        style={{
          margin: 0,
          maxInlineSize: '60ch',
          fontSize: 'var(--text-body-md)',
          lineHeight: 'var(--leading-body-md)',
          color: 'var(--color-text-muted)',
        }}
      >
        {/* Localized, human message keyed by the error's userMessageKey (falls back to
            the generic "unexpected" copy). Never the raw technical error. */}
        {t(appError.userMessageKey, { defaultValue: t('errors.unexpected.message') })}
      </p>

      <button
        ref={retryRef}
        type="button"
        onClick={resetErrorBoundary}
        style={{
          minBlockSize: 'var(--tap-target-min)',
          paddingInline: 'var(--button-padding-x)',
          paddingBlock: 'var(--space-2)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body-md)',
          fontWeight: 'var(--button-font-weight)',
          color: 'var(--button-fg)',
          backgroundColor: 'var(--button-bg)',
          border: 'none',
          borderRadius: 'var(--button-radius)',
          cursor: 'pointer',
          // Token-driven focus ring (WCAG 2.2 AA — visible focus).
          outlineColor: 'var(--color-focus)',
          outlineWidth: 'var(--focus-ring-width)',
          outlineOffset: 'var(--focus-ring-offset)',
        }}
      >
        {t('errors.unexpected.retry')}
      </button>
    </div>
  );
}
