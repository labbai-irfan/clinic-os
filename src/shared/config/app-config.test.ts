/**
 * Foundation smoke test — proves the Vitest harness, the tsconfig path aliases,
 * and the env → config pipeline all work end-to-end. There is no business logic
 * to test in the engineering-foundation phase; this guards the wiring itself.
 *
 * Governed by: docs/Coding-Standards.md §16 (testing), Phase 3 BUILD SPEC.
 */
import { describe, expect, it } from 'vitest';

import { appConfig, SUPPORTED_LOCALES } from './app-config';

describe('appConfig (foundation smoke)', () => {
  it('derives a non-empty app identity from validated env', () => {
    expect(appConfig.name).toBeTruthy();
    expect(typeof appConfig.version).toBe('string');
    expect(appConfig.api.baseUrl).toMatch(/^https?:\/\//);
  });

  it('ships the four supported locales (en, hi, mr, ur)', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'hi', 'mr', 'ur']);
    expect(appConfig.supportedLocales).toContain(appConfig.defaultLocale);
  });
});
