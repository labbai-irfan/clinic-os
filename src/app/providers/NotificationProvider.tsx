/**
 * NotificationProvider.tsx — mounts the react-hot-toast <Toaster/> for the whole app.
 *
 * Governed by: docs/architecture/Architecture.md (provider hierarchy), docs/Brain.md §11
 * (Success state feedback) and docs/Frontend-Bible.md §9 (a11y) / §9.7 (reduced motion).
 *
 * WHY it exists & its position:
 *   - It sits UNDER the Auth placeholder and ABOVE the Overlay providers + Router so any
 *     screen (and any post-auth flow) can fire a toast via the `notify` port.
 *   - It renders exactly ONE <Toaster/> (the single live region for transient feedback).
 *     The actual toast triggering lives in shared/notifications (i18n keys only); this
 *     provider just hosts the renderer.
 *
 * A11y / tokens:
 *   - Toasts are styled with semantic tokens (surface/text/border), never hardcoded values.
 *   - aria-live is "polite" (assertive is reserved for true errors raised explicitly).
 *   - Container offset/gap use spacing tokens; the renderer respects reduced motion via the
 *     notify port (which disables animation for reduced-motion users).
 */

import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

/** Default auto-dismiss for toasts (ms). Calm, readable; long enough for elderly users. */
const TOAST_DURATION_MS = 5000;

export interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * NotificationProvider — hosts the app's single Toaster. All copy comes from the notify
 * port (i18n keys); this component only configures appearance + a11y.
 */
export function NotificationProvider({ children }: NotificationProviderProps): JSX.Element {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        gutter={8}
        containerStyle={{ insetBlockStart: 'var(--space-4)' }}
        toastOptions={{
          duration: TOAST_DURATION_MS,
          // aria-live polite — non-urgent feedback announced without interrupting.
          ariaProps: { role: 'status', 'aria-live': 'polite' },
          style: {
            background: 'var(--color-surface-raised)',
            color: 'var(--color-text)',
            border: 'var(--border-width-1) solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--elevation-popover)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-md)',
            paddingInline: 'var(--space-4)',
            paddingBlock: 'var(--space-3)',
            maxInlineSize: '90vw',
          },
        }}
      />
    </>
  );
}
