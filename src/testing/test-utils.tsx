/**
 * test-utils.tsx — render-with-providers helpers for unit/integration tests.
 *
 * Governed by: docs/Brain.md §4 (test behavior, not implementation).
 *
 * WHY: components under test usually need the same runtime context the app provides —
 * a QueryClient, i18n, and Helmet. This wrapper supplies a minimal, isolated version of
 * that context (a fresh QueryClient per render to avoid cross-test cache bleed) so tests
 * mirror production without booting the full provider stack.
 *
 * Re-exports everything from @testing-library/react so tests import a single module.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';

import { createQueryClient } from '@shared/lib/query';
import { i18n, initI18n } from '@shared/localization';

// Ensure i18n is initialized once for the whole test run.
initI18n();

interface AllProvidersProps {
  children: ReactNode;
}

/** Minimal provider stack mirroring the app's runtime context (test-isolated). */
function AllProviders({ children }: AllProvidersProps): JSX.Element {
  // Fresh client per render keeps tests independent (no shared cache).
  const queryClient = createQueryClient();
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}

/**
 * renderWithProviders — drop-in for RTL's `render` that wraps the UI in the app providers.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export the testing-library surface so tests need only this module.
export * from '@testing-library/react';
export { renderWithProviders as render };
