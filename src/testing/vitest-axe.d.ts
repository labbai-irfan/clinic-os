/**
 * vitest-axe.d.ts — type augmentation for the `toHaveNoViolations` matcher.
 *
 * `vitest-axe@0.1.0` ships its augmentation against the legacy `Vi.Assertion`
 * namespace, which Vitest 2.x no longer surfaces on `expect(...)`. In Vitest 2
 * the interface that `expect(value)` returns is `Assertion<T>` declared in
 * `@vitest/expect` (and re-exported by `vitest`). This file re-applies the
 * matcher type onto THAT interface (plus `AsymmetricMatchersContaining`), so
 * component tests can assert `expect(await axe(container)).toHaveNoViolations()`
 * under strict TS.
 *
 * Runtime registration of the matcher lives in `src/testing/setup.ts`.
 *
 * Governed by: Phase 6 design-system spec (TESTS — axe smoke),
 * docs/Brain.md §4 (Vitest + RTL + axe).
 */
import 'vitest';

interface AxeMatchers<R = unknown> {
  /** Asserts the given axe results contain no accessibility violations. */
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
  interface Assertion<T = any> extends AxeMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
}
