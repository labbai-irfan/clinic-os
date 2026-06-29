/**
 * AppProviders.tsx — the composition root that assembles the ClinicOS provider hierarchy.
 *
 * Governed by: docs/architecture/Architecture.md §0/§9 (provider/render flows) and the
 * Phase 3 build spec Part 8 (the authoritative outer → inner order).
 *
 * THE HIERARCHY (outer → inner) — exactly as ratified:
 *
 *   HelmetProvider                  ← document <head> management; outermost so any layer can set title/meta
 *   └ RootErrorBoundary             ← catches render failures from EVERYTHING below; shows recoverable fallback
 *     └ ThemeProvider               ← sets data-theme / large-text / reduced-motion on <html> before below renders
 *       └ I18nProvider              ← react-i18next + <Suspense> for lazy locales; every string below is localized
 *         └ QueryClientProvider     ← the single server-state cache (+ Devtools in dev); used throughout below
 *           └ (AuthProvider)         ← PLACEHOLDER ONLY — built in Phase 4 (session store + token refresh)
 *             └ NotificationProvider ← hosts the single <Toaster/> so any screen can fire a toast
 *               └ ModalProvider      ← overlay registry (modals) — empty in this phase
 *                 └ DrawerProvider   ← overlay registry (drawers) — empty in this phase
 *                   └ {children}     ← <App/> (RouterProvider) mounts here
 *
 * WHY this order (rationale, top to bottom):
 *   - Helmet is outermost because head management must wrap the whole app and is render-safe.
 *   - The error boundary is high so a crash anywhere below still yields a recoverable screen.
 *   - Theme precedes i18n so the i18n Suspense fallback renders in the correct theme.
 *   - i18n precedes Query so query-driven UI (and its loading/error states) can localize.
 *   - Query precedes Auth/Notifications/Overlays/Router because data hooks are used across them.
 *   - Auth (Phase 4) sits between Query and Notifications: it needs the query cache, and the
 *     UI below it (toasts, overlays, routes) is what depends on the session.
 *   - Notifications/Overlays are innermost (just outside the Router) so every route can use them.
 */

import type { ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { RootErrorBoundary } from '@shared/errors';

import { I18nProvider } from './I18nProvider';
import { NotificationProvider } from './NotificationProvider';
import { DrawerProvider, ModalProvider } from './OverlayProviders';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders — wraps the application in the exact provider hierarchy above.
 * Composition only: it adds no UI of its own.
 */
export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  return (
    <HelmetProvider>
      <RootErrorBoundary>
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>
              {/*
                AUTH PROVIDER — PLACEHOLDER (Phase 4).
                The real <AuthProvider> wraps here: it will own the session store
                (tenantId, roles, permissions), hydrate the session, and drive token
                refresh / 401 handling. It is intentionally a comment in Phase 3 — no auth
                is built in the engineering-foundation phase.

                <AuthProvider>
              */}
              <NotificationProvider>
                <ModalProvider>
                  <DrawerProvider>{children}</DrawerProvider>
                </ModalProvider>
              </NotificationProvider>
              {/* </AuthProvider> */}
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </RootErrorBoundary>
    </HelmetProvider>
  );
}
