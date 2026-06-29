/**
 * main.tsx — the application entry point (browser bootstrap).
 *
 * Governed by: docs/architecture/Architecture.md §9 (bootstrap/render flow) and the Phase 3
 * spec (validate env early; start MSW only when enabled; render in StrictMode).
 *
 * Bootstrap order (deliberate):
 *   1. Validate env — importing `@shared/config` runs the Zod parse at module load, so a
 *      misconfiguration fails fast HERE with a clear message, before anything renders.
 *   2. Import global.css — tokens + themes + fonts + base reset.
 *   3. Initialize i18n — so the first paint already has the language/direction set.
 *   4. Conditionally start MSW — ONLY when env.VITE_ENABLE_MSW (dev/test), never prod.
 *   5. Render <StrictMode><AppProviders><App/></AppProviders></StrictMode>.
 *
 * StrictMode is on to surface side-effect bugs early (React 18 double-invoke); all our
 * providers/init are idempotent and StrictMode-safe.
 */

// (2) Fonts — self-hosted variable fonts (Fontsource). These register the @font-face
// for the 'Inter Variable' / 'Plus Jakarta Sans Variable' families the design tokens
// reference, so typography renders correctly with no runtime font CDN.
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// (1) Env validation runs as a side-effect of importing the config barrel.
import { env } from '@shared/config';
import { initI18n } from '@shared/localization';
import { createLogger } from '@shared/logger';

import { App } from './App';
import { AppProviders } from './providers';

// (3) Global styles: tokens, themes, base reset (+ Tailwind layers).
import './styles/global.css';

const log = createLogger('app');

/** (4) Start MSW only when explicitly enabled. Dynamically imported so it is tree-shaken
 *  out of production bundles when disabled. */
async function startMockingIfEnabled(): Promise<void> {
  if (!env.VITE_ENABLE_MSW) return;
  try {
    const { worker } = await import('@mock/browser');
    await worker.start({
      // Don't fail the app if a request is unhandled — pass it through to the network.
      onUnhandledRequest: 'bypass',
      quiet: env.VITE_LOG_LEVEL !== 'debug',
    });
    log.info('MSW mocking enabled');
  } catch (error) {
    // A missing Service Worker script (not yet generated) must not block the app.
    log.error('Failed to start MSW; continuing without mocks', error);
  }
}

function mount(): void {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element #root not found in index.html');
  }
  createRoot(container).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  );
}

// (3) Initialize i18n, then (4) optionally start MSW, then (5) render.
initI18n();
void startMockingIfEnabled().finally(mount);
