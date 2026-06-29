import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for ClinicOS.
 *
 * Boots the Vite dev server and runs the smoke suite under `e2e/`. Kept lean
 * (chromium-only by default) — broaden `projects` for cross-browser coverage as
 * the app grows. Vitest excludes `e2e/**`, so unit and e2e never collide.
 *
 * Governed by: docs/design-system/TestingGuide.md, docs/Project-Checklist.md.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
