# ClinicOS — Localization Validation

> Operational guide for how ClinicOS localization is validated across **en, hi, mr, ur**. Law 4 is absolute: **every human-readable string is localized — no hardcoded text, ever.** This document **extends** the canon, operationalizing [Project-Checklist.md §6](../Project-Checklist.md#6-localization-audit-checklist) into concrete checks, commands, and examples. It never contradicts the canon; where this guide and the checklist disagree, the checklist wins.

---

## 1. How to use this document

ClinicOS ships in four languages today (English, Hindi, Marathi, Urdu) and is architected for unlimited more. **English (`en`) is the single source of truth.** Every key authored in `en` must exist in `hi`, `mr`, and `ur` before release — this is the **parity rule**, enforced by `pnpm check:i18n` and a 🔴 release blocker.

Each section gives **Why**, **How to test**, and a **✅ / ❌** contrast. The two enforced gates are:

- **Missing-key parity** — `pnpm check:i18n` (`scripts/quality/check-i18n.mjs`).
- **No hardcoded strings** — ESLint `i18next/no-literal-string`.

See also [DefinitionOfDone.md](./DefinitionOfDone.md), [LintRules.md](./LintRules.md), and [AccessibilityValidation.md](./AccessibilityValidation.md) (labels are localized **and** an a11y concern).

---

## 2. Catalog structure & parity rule

Translations live per-language, per-namespace: `src/locales/<lang>/<namespace>.json`.

```
src/locales/
  en/   ← SOURCE OF TRUTH
    common.json
    patients.json
    intake.json
  hi/   { common, patients, intake }.json
  mr/   { common, patients, intake }.json
  ur/   { common, patients, intake }.json   ← RTL
```

**Key format:** `namespace.area.element`; leaf segment is `camelCase`; namespace owned by the slice that owns the UI.

```jsonc
// src/locales/en/patients.json  (source of truth)
{
  "list": {
    "title": "Patients",
    "openFilters": "Open filters",
    "empty": "No patients match your search.",
    "resultCount": "{count, plural, one {# patient} other {# patients}}",
  },
  "save": { "success": "Patient saved", "error": "Couldn't save patient. Try again." },
}
```

**Parity rule.** The set of keys in `en/<ns>.json` is the contract. Every other language file for that namespace must contain **exactly** the same key set — no missing keys (blocker), and extra keys flagged as unused (§4).

---

## 3. Missing Keys

**Why** A missing key renders the raw key string (e.g. `patients.list.title`) or an English fallback in a Hindi UI — broken, unprofessional, and in a medical context, confusing. Parity is the floor for "localized".

**How to test**

- **Automated:** `pnpm check:i18n` walks every `en` key and asserts it exists in `hi`, `mr`, `ur`. Any gap fails the gate. 🔴 release blocker.
- **Manual:** Switch each language at runtime and scan the screen for raw keys or English leakage.

```jsonc
// ❌ en defines a key that ur omits → check:i18n fails
// en/patients.json → "save": { "success": "Patient saved" }
// ur/patients.json → "save": { }            // missing "success"
// ✅ Every language carries the full key set
// ur/patients.json → "save": { "success": "مریض محفوظ ہو گیا" }
```

> If a translation is genuinely pending, you must add the key with an explicit, documented fallback noted in the PR — never leave it absent.

---

## 4. Unused Keys

**Why** Dead keys rot the catalog: translators waste effort, bundles bloat, and stale strings mislead. Unlike missing keys, this is a **warning**, not a blocker.

**How to test**

- **Automated:** `pnpm check:i18n` reports keys present in locale files but referenced nowhere in source (and keys present in `en` but absent downstream). Review the report each PR that touches i18n.
- **Cleanup:** Delete the key from **all four** language files in the same PR; if it was removed by mistake, restore the usage. Never delete from `en` alone — that re-creates a parity mismatch in reverse.

```jsonc
// ❌ Key lingers in all locales but no component calls t('patients.list.legacyBanner')
// ✅ Removed from en/hi/mr/ur together, in the PR that removed its last usage
```

---

## 5. Hardcoded Text

**Why** Any literal in JSX is invisible to translators and ships untranslated. Law 4 forbids it — **including non-visible strings**: `aria-label`, `title`, `placeholder`, and `alt`, which screen readers and tooltips surface to users.

**How to test**

- **Automated:** ESLint `i18next/no-literal-string` fails the lint gate on any literal in JSX text, `aria-label`, `title`, `placeholder`, or `alt`. 🔴 merge blocker (see [Project-Checklist.md §9](../Project-Checklist.md#9-pr-reviewer-quick-gate-60-second-blockers)).
- **Manual:** Grep review for string literals in `.tsx`; confirm each user-facing prop reads from `t(...)`.

```tsx
// ❌ Hardcoded text AND hardcoded aria-label/placeholder — three Law 4 violations
<button aria-label="Search">
  <SearchIcon />
</button>
<input placeholder="Patient name" />
<span>No results</span>

// ✅ Every user-facing string from an i18n key
<button aria-label={t('patients.search.label')}>
  <SearchIcon aria-hidden="true" />
</button>
<input placeholder={t('patients.search.placeholder')} />
<span>{t('patients.list.empty')}</span>
```

> **Fix pattern:** extract the literal to the owning namespace, reference via `t('ns.area.element')`, add the key to all four languages, run `pnpm check:i18n`.

---

## 6. RTL Compatibility (Urdu)

**Why** Urdu is right-to-left. The layout must mirror — navigation, alignment, directional icons — or the UI reads backwards and controls land in the wrong place.

**How to test**

- **Automated:** lint forbids physical-direction CSS (`margin-left`, `pl-*`, `left-0`, `right-*`); tests assert `dir="rtl"` is applied when locale is `ur`.
- **Manual:** Switch to Urdu. Verify `dir="rtl"` on `<html>`, layout mirrors, chevrons/arrows/back-next/progress **flip**, and no text clips or overflows its container.

```css
/* ❌ Physical properties do not mirror — label collides with field in RTL */
.label {
  margin-right: var(--space-2);
  padding-left: var(--space-3);
}

/* ✅ Logical properties mirror automatically for dir="rtl" */
.label {
  margin-inline-end: var(--space-2);
  padding-inline-start: var(--space-3);
}
```

```tsx
// ✅ Directional icon flips with writing direction
<ChevronRight className="rtl:-scale-x-100" aria-hidden="true" />
```

Use **only** logical properties: `margin-inline-*`, `padding-inline-*`, `inset-inline-*`, `text-align: start/end`. See the RTL section of [AccessibilityValidation.md](./AccessibilityValidation.md#11-rtl-urdu).

---

## 7. Pluralization

**Why** Plural rules differ per language. English has 2 forms (one/other); Hindi and Urdu have their own CLDR categories. **String concatenation cannot express this** and produces grammatically wrong text. Use **ICU** `plural` / `select` / gender.

**How to test**

- **Automated:** lint/review flags manual count concatenation; tests render counts of 0/1/2/many per locale.
- **Manual:** Toggle counts and languages; verify the noun form is grammatically correct in each.

```jsonc
// ✅ en — ICU plural, never "count + ' patients'"
"resultCount": "{count, plural, one {# patient} other {# patients}}"
// ✅ hi
"resultCount": "{count, plural, one {# मरीज़} other {# मरीज़}}"
// ✅ ur (RTL)
"resultCount": "{count, plural, one {# مریض} other {# مریض}}"
```

```tsx
// ❌ Concatenation — wrong grammar, untranslatable, breaks plurals
<span>{count + ' patients'}</span>

// ✅ ICU resolves the correct form per locale
<span>{t('patients.list.resultCount', { count })}</span>
```

---

## 8. Date Formatting

**Why** `01/02/2026` is ambiguous and locale-dependent. Manual formatting hardcodes one locale's conventions and ignores calendars. Use **`Intl.DateTimeFormat`** via the shared helper in `shared/lib`.

**How to test**

- **Automated:** lint/review forbids manual date string building; tests assert helper output per locale.
- **Manual:** Render a date in all four languages; verify locale-correct order, month names, and calendar.

```tsx
// ❌ Manual formatting — one locale only, ambiguous, no calendar awareness
const label = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

// ✅ Intl via shared helper — locale + calendar correct everywhere
import { formatDate } from '@shared/lib/intl';
const label = formatDate(d, { dateStyle: 'medium' }); // honors active locale
```

---

## 9. Currency

**Why** Currency symbol placement, grouping, and decimals are locale rules. Hardcoding `₹` + a number breaks for other locales and mis-groups large amounts. Use **`Intl.NumberFormat`** with `style: 'currency'`.

**How to test**

- **Automated:** lint/review flags `₹`/`$` literal concatenation; tests assert formatted INR per locale.
- **Manual:** Render an amount across locales; verify symbol position and digit grouping.

```tsx
// ❌ Hardcoded symbol + naive grouping
const fee = '₹' + amount; // "₹120000" — wrong grouping, locale-blind

// ✅ Intl currency formatting (INR), locale-aware
import { formatCurrency } from '@shared/lib/intl';
const fee = formatCurrency(amount, 'INR'); // "₹1,20,000.00" in en-IN
```

---

## 10. Time

**Why** 12h vs 24h, AM/PM markers, and relative phrasing ("2 hours ago") are locale-dependent. Use **`Intl`** (`DateTimeFormat` for clock time, `RelativeTimeFormat` for relative).

**How to test**

- **Automated:** tests assert time/relative-time output per locale via the shared helper.
- **Manual:** Verify clock format and relative phrasing in each language.

```tsx
// ❌ Hardcoded 24h, no localization
const t1 = `${h}:${m}`;

// ✅ Intl time + relative time, locale-correct
import { formatTime, formatRelativeTime } from '@shared/lib/intl';
formatTime(date); // "2:30 PM" or "14:30" per locale
formatRelativeTime(-2, 'hour'); // "2 hours ago" / locale equivalent
```

---

## 11. Medical Terminology

**Why** ClinicOS is a healthcare frontend. A mistranslated clinical term is a **patient-safety risk**, not a copy nit. Machine translation routinely garbles dosages, diagnoses, and anatomy. Clinical strings must be translated by **qualified medical translators and reviewed by a clinician/SME** — never machine-translated, never invented (we faithfully display the system of record).

**How to test**

- **Process gate:** any key containing clinical terminology is **flagged for SME review** before merge; the PR records clinician sign-off.
- **Consistency:** maintain a **glossary per namespace** so the same term is rendered identically everywhere across all four languages.
- **Manual:** Clinician confirms each translated clinical term in context during the screen-reader/RTL walkthrough.

```jsonc
// ❌ Machine-translated, unreviewed clinical term — unsafe
"vitals.bp": "<auto-translated>"

// ✅ SME-reviewed term, consistent with the namespace glossary
"vitals.bp": "Blood pressure",      // en (source of truth)
"vitals.bp": "रक्तचाप"               // hi — clinician-reviewed
```

> Never invent clinical logic or terminology. If the correct localized term is unknown, block the key on SME review rather than guessing.

---

## 12. Command reference

| Command                                          | What it validates                                                                                           | Gate               |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| `pnpm check:i18n`                                | Key parity across en/hi/mr/ur; reports missing (🔴) and unused (🟡) keys (`scripts/quality/check-i18n.mjs`) | CI / pre-release   |
| `pnpm lint` (ESLint `i18next/no-literal-string`) | No hardcoded strings — text, `aria-label`, `title`, `placeholder`, `alt`                                    | 🔴 Pre-commit + CI |
| `pnpm test`                                      | Plural/format/RTL behavior per locale (Vitest + RTL)                                                        | CI                 |
| `pnpm e2e`                                       | Runtime language switch (no reload), RTL layout, no truncation (Playwright)                                 | CI                 |
| `pnpm quality`                                   | Runs the localization gates together with the rest of the suite                                             | CI / pre-release   |

**Release localization gate:** all four locales complete with **zero missing keys**, lint clean (no hardcoded strings), RTL (ur) verified across primary screens with no clipping, and clinician sign-off on medical terminology. See [Project-Checklist.md §6](../Project-Checklist.md#6-localization-audit-checklist) and [QualityGates.md](./QualityGates.md).

---

_Phase 9 · Engineering Quality Platform · Part 7 · Status: **Foundation v9** · 2026-06-30_

Related: [README.md](./README.md) · [EngineeringStandards.md](./EngineeringStandards.md) · [QualityGates.md](./QualityGates.md) · [LintRules.md](./LintRules.md) · [DefinitionOfDone.md](./DefinitionOfDone.md) · [QualityRegistry.md](./QualityRegistry.md) · [AccessibilityValidation.md](./AccessibilityValidation.md) · [ReviewChecklists.md](./ReviewChecklists.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) · [Project-Checklist.md](../Project-Checklist.md) · [Frontend-Bible.md](../Frontend-Bible.md) · [AI_RULES.md](../architecture/AI_RULES.md)
