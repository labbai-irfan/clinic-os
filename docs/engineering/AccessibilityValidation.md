# ClinicOS — Accessibility Validation

> Operational guide for how **every** ClinicOS feature is validated against **WCAG 2.2 AA**, the accessibility floor mandated by Law 3. This document **extends** the canon — it operationalizes the criteria catalog in [Project-Checklist.md §5](../Project-Checklist.md#5-accessibility-audit-checklist-wcag-22-aa) into concrete automated + manual procedures. It never contradicts the canon; where this guide and the checklist disagree, the checklist wins.

---

## 1. How to use this document

ClinicOS is a healthcare frontend. A clinician using ClinicOS on a low-end device, with a screen reader, at 200% zoom, on a slow network is **the design target — not an edge case**. Accessibility is a feature (Law 3), not a setting.

Every section below maps to one or more WCAG 2.2 AA success criteria from [Project-Checklist.md §5](../Project-Checklist.md#5-accessibility-audit-checklist-wcag-22-aa) and gives you:

- **How to test** — the automated tool (the cheap, always-on gate) **and** the manual steps (the part a machine cannot judge).
- **Why** — the user impact and the rule it enforces.
- **✅ / ❌** — a concrete code contrast.

> **Rule of thumb.** Automation catches roughly a third of real accessibility defects. The automated gate (§12) is necessary but **never sufficient** — the manual audit (§13) is the release gate. Treat a green axe run as "no known regressions", not "accessible".

See also [DefinitionOfDone.md](./DefinitionOfDone.md), [QualityGates.md](./QualityGates.md), and [EngineeringStandards.md](./EngineeringStandards.md).

---

## 2. Keyboard Navigation

Maps to **WCAG 2.1.1 Keyboard**, **2.1.2 No Keyboard Trap**, **2.4.1 Bypass Blocks**.

**How to test**

- **Automated:** `jsx-a11y` lint flags missing handlers and non-interactive elements wired with click handlers; `vitest-axe` asserts no role/focusability violations on every component story.
- **Manual:** Unplug the mouse. Drive the entire feature with `Tab` / `Shift+Tab` / `Enter` / `Space` / `Esc` / arrow keys. Confirm every action is reachable, the tab order matches reading order, no element traps focus, and the **skip-to-content** link works as the first tab stop.

**Why** A clinician with a motor impairment, or any power user, operates ClinicOS by keyboard. If a control is mouse-only, the task is impossible — not merely harder.

```tsx
// ❌ Div pretending to be a button — not focusable, not operable by keyboard
<div className="btn" onClick={save}>{t('patient.actions.save')}</div>

// ✅ Real semantics: focusable, Enter/Space work for free, role is correct
<Button onClick={save}>{t('patient.actions.save')}</Button>
```

For composite widgets (menus, tabs, comboboxes), follow the **APG keyboard model** (arrow keys move within the widget, `Tab` moves between widgets). Never re-implement native controls when a native one exists (Law 8: simplicity beats cleverness).

---

## 3. ARIA & Semantics

Maps to **WCAG 1.3.1 Info & Relationships**, **4.1.2 Name, Role, Value**, **4.1.3 Status Messages**.

**How to test**

- **Automated:** `vitest-axe` + Storybook `addon-a11y` flag invalid ARIA, missing names, and orphaned `aria-*` attributes.
- **Manual:** Inspect the accessibility tree (browser DevTools → Accessibility). Confirm each control exposes a correct **name, role, value**, and that the four async states announce through a live region.

**Why** Semantic HTML gives assistive technology the right behavior for free. ARIA is a patch for the gaps native HTML cannot express — **semantic HTML first, ARIA only to fill gaps**. Incorrect ARIA is worse than none.

All four mandatory async states (loading / empty / error / success) announce through an `aria-live` region. Use `role="status"` (polite) for routine updates and `role="alert"` (assertive) for errors.

```tsx
// ❌ Re-inventing a checkbox with divs and hand-rolled ARIA that drifts out of sync
<div role="checkbox" aria-checked={on} onClick={toggle} />

// ✅ Native input: name from <label>, role + value are automatic and always correct
<label><input type="checkbox" checked={on} onChange={toggle} /> {t('intake.consent.share')}</label>

// ✅ Success state announced to screen readers, message from i18n
<p role="status" aria-live="polite">{t('patient.save.success')}</p>
```

---

## 4. Contrast

Maps to **WCAG 1.4.3 Contrast (Minimum)** and **1.4.11 Non-text Contrast**.

**How to test**

- **Automated:** `vitest-axe` and `addon-a11y` run color-contrast checks per story; axe-in-Playwright re-checks rendered screens with live theme tokens.
- **Manual:** Sample real foreground/background token pairs with a contrast picker on each theme (light, dark, high-contrast). Verify focus rings and component borders against their adjacent surface.

**Why** Text must clear **4.5:1** (normal) / **3:1** (large ≥ 18.66px bold or ≥ 24px). UI components, icons, and focus indicators must clear **3:1**. Low contrast fails users with low vision and anyone on a sunlit clinic tablet.

**Tokens are chosen to pass.** Because every color is a token (Law 5), contrast is solved once in the token layer and inherited everywhere — never hand-tuned per component.

```tsx
// ❌ Hardcoded muted gray on white — ~2.8:1, fails 1.4.3
<span style={{ color: '#9aa0a6' }}>{t('patient.field.updatedAt')}</span>

// ✅ Semantic token whose value is contrast-verified in every theme
<span className="text-text-muted">{t('patient.field.updatedAt')}</span>
```

> **Benefit:** token-level contrast survives theme switches automatically. **Tradeoff:** designers cannot pick "almost right" greys ad-hoc — every value goes through the token tier. We accept that constraint.

---

## 5. Focus Order & Focus Management

Maps to **WCAG 2.4.3 Focus Order**, **2.4.7 Focus Visible**, **2.4.11 Focus Not Obscured (Minimum)**.

**How to test**

- **Automated:** `jsx-a11y` forbids positive `tabIndex`; axe flags missing focus styles.
- **Manual:** Tab through the screen and watch the ring. Order must follow reading order. The focused element must never be hidden behind a sticky header, toast, or bottom bar (**2.4.11**). Open a dialog: focus must move **into** it, stay trapped while open, and **restore** to the trigger on close.

**Why** A keyboard user navigates by following the focus ring. A lost, invisible, or obscured ring means a lost user.

```tsx
// ❌ Suppressing the focus ring — invisible focus, fails 2.4.7
<button className="outline-none">{t('common.next')}</button>

// ✅ Token-driven, visible only for keyboard users (focus-visible)
<button className="focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
  {t('common.next')}
</button>
```

Dialogs use a focus-trap utility from `shared/lib` that captures focus on open, cycles within, and restores to the opener on close. Sticky elements reserve scroll-margin so focused fields scroll clear of overlays.

---

## 6. Screen Reader Walkthrough

Maps to **WCAG 1.3.1**, **2.4.6 Headings & Labels**, **4.1.2**, **4.1.3**.

**How to test**

- **Automated:** axe verifies accessible names exist and are non-empty.
- **Manual:** Walk a **full patient journey** with **NVDA** (Windows/Firefox) and **VoiceOver** (macOS/Safari): _search patient → open record → start intake form → submit → confirmation_. Verify each control announces a meaningful, **localized** name; headings form a logical outline; and the four states are announced as they occur.

**Why** Labels are the screen-reader UI. A button announced as "button" with no name, or "edit text" with no label, is unusable. Names come from **i18n keys**, never hardcoded (Law 4).

```tsx
// ❌ Icon-only button announces as "button", no name
<button onClick={openFilters}><FilterIcon /></button>

// ✅ Accessible name from i18n; icon is decorative and hidden from AT
<button onClick={openFilters} aria-label={t('patients.list.openFilters')}>
  <FilterIcon aria-hidden="true" />
</button>
```

Record SME/clinician review of any medical terminology surfaced during the walkthrough — the screen reader reads clinical content verbatim, so wrong terms are a patient-safety issue, not just a copy issue.

---

## 7. Reduced Motion

Maps to **WCAG 2.3.3 Animation from Interactions** and the calm-by-default law (Law 2).

**How to test**

- **Automated:** lint/test guard asserts motion utilities are wrapped in a reduced-motion query; transitions read from motion tokens.
- **Manual:** Enable OS "Reduce motion". Confirm transitions collapse to instant or a minimal fade, and nothing parallaxes, autoplays, or bounces.

**Why** Vestibular disorders make large motion physically nauseating. Calm-by-default means motion is the exception, gated behind explicit opt-in by the platform.

```css
/* ✅ Motion only for users who haven't asked to reduce it */
@media (prefers-reduced-motion: no-preference) {
  .panel-enter {
    transition: transform var(--duration-md) var(--ease-standard);
  }
}
```

---

## 8. Large Text

Maps to **WCAG 1.4.4 Resize Text**, **1.4.10 Reflow**, **2.5.8 Target Size (Minimum)**.

**How to test**

- **Automated:** Playwright runs key screens at 200% zoom and 320px width, asserting no horizontal scroll and no clipped controls.
- **Manual:** Enable **Large Text Mode** (theme engine scales the root type token). Verify the whole UI grows proportionally, nothing is truncated, and touch targets grow to **≥ 56px** (from the ≥ 44px default; ≥ 24px is the absolute WCAG 2.5.8 floor).

**Why** Presbyopia and low vision are common among both patients and older clinicians. Layout must reflow, not break, when type scales.

```tsx
// ❌ Fixed pixel height clips text at 200% and stays a 32px target
<button className="h-8 text-[14px]">{t('common.confirm')}</button>

// ✅ Token-driven sizing scales with Large Text Mode; min target enforced
<button className="min-h-[var(--target-min)] text-body-md">{t('common.confirm')}</button>
```

---

## 9. High Contrast

Maps to **WCAG 1.4.3 / 1.4.11** under the dedicated high-contrast theme.

**How to test**

- **Automated:** axe contrast checks run against the high-contrast theme tokens in CI, not just the default theme.
- **Manual:** Switch the theme engine to **high-contrast**. Confirm borders, focus rings, dividers, and disabled states remain visible and that no element relies on a subtle shadow alone to define its edge.

**Why** Users who enable high contrast need every boundary explicit. Soft-UI elevation that reads in light mode can vanish at high contrast — borders must carry the structure.

```tsx
// ❌ Boundary conveyed only by a soft shadow — invisible at high contrast
<Card className="shadow-soft" />

// ✅ Token border guarantees a visible edge in every theme
<Card className="border border-border shadow-soft" />
```

---

## 10. Color-Blind Safety

Maps to **WCAG 1.4.1 Use of Color**.

**How to test**

- **Automated:** lint guard flags status components that vary only a color token between states.
- **Manual:** View status indicators under a deuteranopia/protanopia simulator. Each state must be distinguishable **without hue** — pair color with an **icon, text label, or shape**.

**Why** ~8% of men have a color-vision deficiency. In a clinical context, "is this result normal or critical?" must never depend on red-vs-green alone.

```tsx
// ❌ Status by color only — indistinguishable to color-blind users
<Badge className="bg-danger" />

// ✅ Color + icon + localized text — three redundant signals
<Badge variant="danger"><AlertTriangle aria-hidden="true" /> {t('result.status.critical')}</Badge>
```

---

## 11. RTL (Urdu)

Maps to **WCAG 1.3.2 Meaningful Sequence**, **3.1.1/3.1.2 Language**, and Law 4.

**How to test**

- **Automated:** lint forbids physical-direction CSS (`margin-left`, `right-0`, `pl-*`) in favor of logical properties; tests assert `dir="rtl"` propagates when locale is `ur`.
- **Manual:** Switch language to **Urdu**. Verify `dir="rtl"` is set, layout mirrors correctly, directional icons (chevrons, arrows, back/next, progress) **flip**, and nothing clips or overflows.

**Why** Urdu reads right-to-left. CSS **logical properties** mirror automatically; physical properties do not, and silently break the mirror.

```css
/* ❌ Physical — does not mirror in RTL, label collides with content */
.field {
  margin-left: var(--space-3);
}

/* ✅ Logical — mirrors automatically for dir="rtl" */
.field {
  margin-inline-start: var(--space-3);
}
```

```tsx
// ✅ Directional icon flips with writing direction
<ChevronRight className="rtl:-scale-x-100" aria-hidden="true" />
```

---

## 12. Automated gate

The automated layer runs on every commit and in CI. It is the floor, not the ceiling.

| Layer            | Tool                                | Scope                                                        | When               |
| ---------------- | ----------------------------------- | ------------------------------------------------------------ | ------------------ |
| Unit / component | `vitest-axe` (`pnpm test`)          | Every component & story render — asserts zero axe violations | Pre-commit + CI    |
| Component review | Storybook `addon-a11y`              | Live per-story a11y panel for all variants & states          | Authoring + review |
| End-to-end       | axe-core in Playwright (`pnpm e2e`) | Rendered screens with real theme tokens across a journey     | CI                 |
| Aggregate        | `pnpm quality`                      | Runs the full suite as one gate                              | CI / pre-release   |

```ts
// vitest-axe — the per-component contract
import { axe } from 'vitest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<PatientCard patient={fixture} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

A **new axe violation is a 🔴 merge blocker** (see [Project-Checklist.md §9](../Project-Checklist.md#9-pr-reviewer-quick-gate-60-second-blockers) and [QualityGates.md](./QualityGates.md)).

---

## 13. Manual audit checklist

The release gate. Run before tagging; map each criterion to its method. This table operationalizes [Project-Checklist.md §5](../Project-Checklist.md#5-accessibility-audit-checklist-wcag-22-aa).

| WCAG 2.2 AA criterion                 | Validation method                                                     |
| ------------------------------------- | --------------------------------------------------------------------- |
| 1.1.1 Non-text Content                | Manual: AT reads meaningful images; decorative hidden (`aria-hidden`) |
| 1.3.1 Info & Relationships            | Manual: accessibility-tree inspection of headings/landmarks/labels    |
| 1.4.1 Use of Color                    | Manual: color-blind simulator — every status has icon/text/shape      |
| 1.4.3 Contrast (Minimum)              | Automated (axe) + manual token sampling per theme                     |
| 1.4.4 Resize Text                     | Manual: 200% zoom + Large Text Mode walkthrough                       |
| 1.4.10 Reflow                         | Automated (Playwright 320px) + manual                                 |
| 1.4.11 Non-text Contrast              | Automated (axe) on default + high-contrast themes                     |
| 2.1.1 Keyboard                        | Manual: mouse-unplugged journey                                       |
| 2.1.2 No Keyboard Trap                | Manual: confirm focus always escapes                                  |
| 2.4.1 Bypass Blocks                   | Manual: skip-to-content is first tab stop                             |
| 2.4.3 Focus Order                     | Manual: tab order follows reading order                               |
| 2.4.7 Focus Visible                   | Automated (axe) + manual ring check                                   |
| 2.4.11 Focus Not Obscured             | Manual: focus never hidden behind sticky UI                           |
| 2.5.8 Target Size (Minimum)           | Automated (Playwright) + manual ≥ 24px / ≥ 44px / ≥ 56px              |
| 2.3.3 Motion                          | Manual: OS reduce-motion honored                                      |
| 3.1.1 / 3.1.2 Language                | Automated: `lang`/`dir` set; manual RTL pass                          |
| 3.3.1 / 3.3.2 / 3.3.3 Errors & Labels | Manual: localized, announced, actionable errors                       |
| 4.1.2 Name, Role, Value               | Automated (axe) + manual AT inspection                                |
| 4.1.3 Status Messages                 | Manual: NVDA/VoiceOver hears all four async states                    |

> Sign-off requires: green automated gate, one NVDA **and** one VoiceOver journey, and verification of high-contrast, reduced-motion, Large Text, and RTL (ur).

---

_Phase 9 · Engineering Quality Platform · Part 6 · Status: **Foundation v9** · 2026-06-30_

Related: [README.md](./README.md) · [EngineeringStandards.md](./EngineeringStandards.md) · [QualityGates.md](./QualityGates.md) · [LintRules.md](./LintRules.md) · [DefinitionOfDone.md](./DefinitionOfDone.md) · [QualityRegistry.md](./QualityRegistry.md) · [LocalizationValidation.md](./LocalizationValidation.md) · [ReviewChecklists.md](./ReviewChecklists.md) · [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) · [Project-Checklist.md](../Project-Checklist.md) · [Frontend-Bible.md](../Frontend-Bible.md) · [AI_RULES.md](../architecture/AI_RULES.md)
