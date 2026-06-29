import { expect, test } from '@playwright/test';

/**
 * App smoke — proves the foundation boots end-to-end in a real browser:
 * the app renders the welcome screen, the brand fonts/theme apply, and the
 * theme engine reacts to the in-app control (a CSS-variable/attribute swap).
 *
 * This is intentionally minimal; per-feature journeys are added with their modules.
 */
test.describe('ClinicOS app shell', () => {
  test('renders the welcome screen', async ({ page }) => {
    await page.goto('/');

    // One <main> landmark + one <h1> (a11y contract).
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // The <html> carries a resolved theme from the no-flash bootstrap.
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      /^(light|dark|high-contrast)$/,
    );
  });

  test('theme control switches the appearance live', async ({ page }) => {
    await page.goto('/');

    // The ThemeControls "Dark" button drives the engine → <html data-theme="dark">.
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // And back to light.
    await page.getByRole('button', { name: 'Light', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
