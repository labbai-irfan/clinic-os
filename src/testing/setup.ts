/**
 * setup.ts — global Vitest setup (referenced by vitest.config.ts setupFiles).
 *
 * Governed by: docs/Brain.md §4 (Vitest + RTL + axe) and §7 (a11y is CI-gated).
 *
 * Registers:
 *   - @testing-library/jest-dom matchers (toBeInTheDocument, toHaveAttribute, …).
 *   - vitest-axe's toHaveNoViolations matcher (WCAG checks in unit/integration tests).
 *   - A jsdom matchMedia polyfill, because the theme engine queries prefers-color-scheme /
 *     prefers-reduced-motion and jsdom does not implement matchMedia.
 * Also ensures RTL cleanup runs after every test.
 */

import '@testing-library/jest-dom/vitest';
// Registers the `toHaveNoViolations` matcher TYPE on Vi.Assertion (the runtime
// matcher is wired below via expect.extend). Without this augmentation import,
// `expect(...).toHaveNoViolations()` type-errors in *.test.tsx (TS2339).
import 'vitest-axe/extend-expect';

import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Extend expect with axe's accessibility matcher.
expect.extend(axeMatchers);

// jsdom lacks matchMedia; provide a no-op matcher the theme engine can call safely.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

// Unmount React trees and clear the DOM between tests.
afterEach(() => {
  cleanup();
});
