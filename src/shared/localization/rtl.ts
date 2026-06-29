/**
 * rtl.ts — right-to-left language handling.
 *
 * Governed by: docs/Brain.md §8 (RTL via `dir` + CSS logical properties) and
 * docs/Frontend-Bible.md §4.4.
 *
 * WHY a tiny dedicated module:
 *   - The set of RTL languages is a single source of truth used by both i18n (to set
 *     <html dir> on language change) and any future layout logic.
 *   - We set ONLY the `dir` attribute; all spacing/alignment uses CSS logical properties
 *     (margin-inline-start, etc.), so the same components work in LTR and RTL with no
 *     per-direction code (Frontend-Bible §4.4).
 *
 * ClinicOS launch languages: en, hi, mr (LTR) and ur (RTL).
 */

/** Languages that render right-to-left. Urdu (ur) is the launch RTL language. */
export const RTL_LANGUAGES: ReadonlySet<string> = new Set(['ur', 'ar', 'he', 'fa']);

export type Direction = 'ltr' | 'rtl';

/** Base language code without region (e.g. "ur-PK" → "ur"). */
function baseLang(language: string): string {
  return language.toLowerCase().split('-')[0] ?? language.toLowerCase();
}

/** True if the given language code is right-to-left. */
export function isRtl(language: string): boolean {
  return RTL_LANGUAGES.has(baseLang(language));
}

/** Resolve the writing direction for a language. */
export function directionFor(language: string): Direction {
  return isRtl(language) ? 'rtl' : 'ltr';
}

/**
 * applyDir — set <html dir> (and keep <html lang> in sync) for the active language.
 * Called from i18n.ts on init and on every languageChanged event so runtime language
 * switching flips direction without a reload (Brain §8).
 */
export function applyDir(language: string): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('dir', directionFor(language));
  root.setAttribute('lang', baseLang(language));
}
