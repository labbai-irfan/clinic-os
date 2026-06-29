/**
 * preferences.ts — pure helpers for the serializable ThemePreferences object.
 *
 * Defaults, merge (patch over base), versioned export/import (so a settings
 * blob can round-trip across releases), and a shallow diff. All pure — no DOM,
 * no storage — so the manager and tests can reason about preferences cleanly.
 *
 * Governed by: Phase 5 BUILD SPEC §UTILS (preferences.ts).
 */

import { DEFAULT_PREFERENCES } from '../model/theme.constants';
import type { ThemePreferences } from '../model/theme.types';

/** Schema version stamped into exported preference blobs. */
const PREFERENCES_VERSION = 1 as const;

/** Shape of an exported preferences blob (versioned for forward-compat). */
interface PreferencesExport {
  v: typeof PREFERENCES_VERSION;
  preferences: ThemePreferences;
}

/** defaultPreferences — a fresh copy of the factory defaults (never shared). */
export function defaultPreferences(): ThemePreferences {
  return { ...DEFAULT_PREFERENCES };
}

/**
 * mergePreferences — apply a partial patch over a base, ignoring `undefined`
 * patch values (so a sparse patch never erases a set field). Returns a new
 * object; inputs are not mutated.
 */
export function mergePreferences(
  base: ThemePreferences,
  patch: Partial<ThemePreferences>,
): ThemePreferences {
  const merged: ThemePreferences = { ...base };
  (Object.keys(patch) as (keyof ThemePreferences)[]).forEach((rawKey) => {
    const value = patch[rawKey];
    if (value !== undefined) {
      // Each key is narrowed individually so the union stays type-safe (no `any`).
      switch (rawKey) {
        case 'mode':
          merged.mode = value as ThemePreferences['mode'];
          break;
        case 'textScale':
          merged.textScale = value as ThemePreferences['textScale'];
          break;
        case 'motion':
          merged.motion = value as ThemePreferences['motion'];
          break;
        case 'density':
          merged.density = value as ThemePreferences['density'];
          break;
        case 'clinicBrandId':
          merged.clinicBrandId = value;
          break;
      }
    }
  });
  return merged;
}

/**
 * exportPreferences — pretty, versioned JSON suitable for a "copy my settings"
 * feature. Shape: `{ "v": 1, "preferences": { ... } }`.
 */
export function exportPreferences(preferences: ThemePreferences): string {
  const payload: PreferencesExport = { v: PREFERENCES_VERSION, preferences };
  return JSON.stringify(payload, null, 2);
}

/**
 * importPreferences — parse a previously exported blob, validate the known keys,
 * and merge the recognized fields OVER the defaults (so unknown/missing keys are
 * safely defaulted). Throws on malformed JSON or a non-object — the caller
 * (manager/UI) is expected to catch and surface a friendly error.
 */
export function importPreferences(json: string): ThemePreferences {
  const parsed: unknown = JSON.parse(json);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid preferences: expected an object.');
  }

  // Accept either the versioned envelope `{ v, preferences }` or a bare object.
  const candidate: unknown = 'preferences' in parsed ? parsed.preferences : parsed;

  if (typeof candidate !== 'object' || candidate === null) {
    throw new Error('Invalid preferences: missing preferences payload.');
  }

  return mergePreferences(defaultPreferences(), toPartialPreferences(candidate));
}

/**
 * comparePreferences — the keys whose values differ between `a` and `b`,
 * returned as a partial of `b`'s values. Empty object means "no change".
 */
export function comparePreferences(
  a: ThemePreferences,
  b: ThemePreferences,
): Partial<ThemePreferences> {
  const diff: Partial<ThemePreferences> = {};
  (Object.keys(b) as (keyof ThemePreferences)[]).forEach((key) => {
    if (a[key] !== b[key]) {
      assignPreference(diff, key, b);
    }
  });
  return diff;
}

/* -------------------------------------------------------------------------- */
/* Internal — type-safe narrowing of untrusted input                          */
/* -------------------------------------------------------------------------- */

/** Copy a single key from `source` into `target`, preserving each field type. */
function assignPreference(
  target: Partial<ThemePreferences>,
  key: keyof ThemePreferences,
  source: ThemePreferences,
): void {
  switch (key) {
    case 'mode':
      target.mode = source.mode;
      break;
    case 'textScale':
      target.textScale = source.textScale;
      break;
    case 'motion':
      target.motion = source.motion;
      break;
    case 'density':
      target.density = source.density;
      break;
    case 'clinicBrandId':
      target.clinicBrandId = source.clinicBrandId;
      break;
  }
}

/**
 * Narrow an untrusted object into a `Partial<ThemePreferences>`, keeping only
 * the recognized keys with the right primitive types. Anything unexpected is
 * dropped here and later filled in by the defaults during the merge.
 */
function toPartialPreferences(input: object): Partial<ThemePreferences> {
  const record = input as Record<string, unknown>;
  const partial: Partial<ThemePreferences> = {};

  if (typeof record['mode'] === 'string') {
    partial.mode = record['mode'] as ThemePreferences['mode'];
  }
  if (typeof record['textScale'] === 'string') {
    partial.textScale = record['textScale'] as ThemePreferences['textScale'];
  }
  if (typeof record['motion'] === 'string') {
    partial.motion = record['motion'] as ThemePreferences['motion'];
  }
  if (typeof record['density'] === 'string') {
    partial.density = record['density'] as ThemePreferences['density'];
  }
  if (typeof record['clinicBrandId'] === 'string' || record['clinicBrandId'] === null) {
    partial.clinicBrandId = record['clinicBrandId'];
  }
  return partial;
}
