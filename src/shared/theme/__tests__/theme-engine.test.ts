/**
 * theme-engine.test.ts — pure smoke test for the Phase 5 foundation layer.
 *
 * Proves the load-bearing math + merge logic without any DOM:
 *  - generateShades returns a full 50..900 ramp with 500 ≈ the seed
 *  - contrastRatio matches the WCAG maximum (white-on-black ≈ 21)
 *  - mergePreferences patches over a base and ignores undefined values
 *
 * Governed by: Phase 5 BUILD SPEC §VALIDATION CONTRACT (smoke test).
 */

import { describe, expect, it } from 'vitest';

import { DEFAULT_PREFERENCES } from '../model/theme.constants';
import type { ThemePreferences } from '../model/theme.types';
import { normalizeHex } from '../utils/color';
import { contrastRatio, meetsWcagAA } from '../utils/contrast';
import { generateShades, type ShadeStop } from '../utils/generate-shades';
import { mergePreferences } from '../utils/preferences';

describe('generateShades', () => {
  const SEED = '#2f73c2';
  const STOPS: readonly ShadeStop[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  it('returns a hex value for every 50..900 stop', () => {
    const ramp = generateShades(SEED);
    for (const stop of STOPS) {
      expect(ramp[stop]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('anchors 500 at (≈) the input color', () => {
    const ramp = generateShades(SEED);
    expect(ramp[500]).toBe(normalizeHex(SEED));
  });

  it('lightens toward 50 and darkens toward 900', () => {
    const ramp = generateShades(SEED);
    // 50 is the lightest, 900 the darkest → contrast against black decreases
    // monotonically as the stop number rises (lighter color = higher ratio).
    expect(contrastRatio(ramp[50], '#000000')).toBeGreaterThan(contrastRatio(ramp[500], '#000000'));
    expect(contrastRatio(ramp[900], '#000000')).toBeLessThan(contrastRatio(ramp[500], '#000000'));
  });
});

describe('contrastRatio', () => {
  it('computes the WCAG maximum (~21) for white on black', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });

  it('is symmetric and equals 1 for identical colors', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#3a3a3a', '#3a3a3a')).toBeCloseTo(1, 5);
  });

  it('agrees with the AA threshold (white on black passes)', () => {
    expect(meetsWcagAA('#ffffff', '#000000')).toBe(true);
    expect(meetsWcagAA('#777777', '#808080')).toBe(false);
  });
});

describe('mergePreferences', () => {
  it('applies a patch over the base without mutating inputs', () => {
    const base: ThemePreferences = { ...DEFAULT_PREFERENCES };
    const merged = mergePreferences(base, { mode: 'dark', density: 'compact' });

    expect(merged.mode).toBe('dark');
    expect(merged.density).toBe('compact');
    // Untouched fields fall through from the base.
    expect(merged.textScale).toBe(DEFAULT_PREFERENCES.textScale);
    // Inputs are not mutated.
    expect(base.mode).toBe(DEFAULT_PREFERENCES.mode);
  });

  it('ignores undefined patch values (sparse patch never erases a field)', () => {
    const base: ThemePreferences = { ...DEFAULT_PREFERENCES, mode: 'dark' };
    // A runtime-undefined value (e.g. from a hand-built object where a key is
    // explicitly undefined) must not erase the base field. `exactOptionalProperty
    // Types` forbids typing this directly, so we cast to exercise the guard.
    const patch = { mode: undefined } as unknown as Partial<ThemePreferences>;
    const merged = mergePreferences(base, patch);
    expect(merged.mode).toBe('dark');
  });
});
