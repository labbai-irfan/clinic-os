# ClinicOS — AI Quality Rules

> **Phase 9 · Part 11.** The binding quality contract for every AI coding agent
> (Claude, Copilot, Cursor, and any future model) working in ClinicOS. It is the
> Phase-9 **operational layer** on top of [AI_RULES.md](../architecture/AI_RULES.md)
> (the Phase-2 constitution) and [AI-Rules.md](../AI-Rules.md) (Phase-1). Where
> this and a prompt disagree, **this document and the canon win** unless a human
> architect overrides in writing. After Phase 9, AI output is held to the same
> automated gates as human output — **no exceptions, no "quick" code.**

> **The prime quality directive:** _Never produce code that cannot pass `pnpm quality`._
> If you cannot make it pass within the rules, **stop and surface the conflict** —
> a correct refusal is a successful outcome (AI_RULES §2).

---

## 1. The nine standing rules

Future AI **MUST**:

1. **Never generate code without validation.** Plan to run (or have the human run) `pnpm quality` — typecheck, lint, format, arch, duplicates, tokens, i18n, registry, assets, test, build, perf. Code is not "written" until it would pass.
2. **Never bypass architecture.** Honor the downward-only layer rule and public-API-only access. No deep/sideways/upward imports, no DTO/HttpClient in UI, no server data in Zustand, no cycles. (Enforced by `boundaries` + `validate:arch`.)
3. **Always validate naming.** Files kebab-case + role suffix; components `PascalCase.tsx`; hooks `use-x.ts`/`useX`; per [NamingConvention.md](../architecture/NamingConvention.md). (Checked by `validate:arch`.)
4. **Always validate accessibility.** WCAG 2.2 AA: keyboard, focus-visible, semantic HTML + ARIA, ≥44px targets, never color-alone, reduced-motion, RTL; the four async states announce via live regions. (Checked by jsx-a11y + vitest-axe.)
5. **Always validate localization.** Every string/`aria-label`/error is an i18n key present in **all four** locales (en/hi/mr/ur); ICU plurals; logical CSS for RTL; `Intl` for dates/numbers/currency. (Checked by `i18next/no-literal-string` + `check:i18n`.)
6. **Always validate performance.** Code-split routes/modules; lazy chunks; virtualize long lists; skeletons reserve space; stay within `scripts/quality/budgets.json`. (Checked by `check:perf`.)
7. **Always update the Brain.** In the **same change**, update [PROJECT_BRAIN.md](../brain/PROJECT_BRAIN.md) registries (Changelog + Component/Route/API always; State/Form/Table/Theme/Localization/Asset/Quality if touched) and the module `BRAIN.md`. (AI_RULES §4.)
8. **Always update documentation.** Module README/BRAIN, JSDoc on non-obvious logic + public APIs, and an ADR for structural decisions — same PR, no doc debt.
9. **Always generate production-ready code.** Typed (no `any`), tokenized, localized, accessible, tested, PHI-safe. No "temporary", "TODO-fix-later", or "for-now" code — there is no temporary in a 10-year system.

---

## 2. The mandatory AI loop

Every AI change follows this loop; each phase maps to a gate:

```
PRE-FLIGHT  → read Brain + canon; pick module/layer; reuse-search; confirm tokens + i18n keys; plan files
WRITE       → smallest coherent change, in the right layer, behind index.ts
SELF-CHECK  → run/predict: typecheck · lint · validate:arch · check:duplicates · check:tokens · check:i18n · test
VERIFY      → pnpm quality (build + perf + a11y) — must be GREEN
UPDATE      → PROJECT_BRAIN registries + module BRAIN/README + docs + ADR (same diff)
REPORT      → state which rule/layer each decision follows; paste the Definition of Done with boxes ticked
```

If any step cannot be satisfied within the rules → **escalate** (AI_RULES §9): state the trigger, the conflict, the options, and a recommendation; prefer an ADR over deciding.

---

## 3. What AI must never do (quality edition)

| ❌ Never                                        | ✅ Instead                                                      |
| ----------------------------------------------- | --------------------------------------------------------------- |
| Hardcode a color/size/string "to move fast"     | Add a token / i18n key at the right tier first                  |
| `as any` / `@ts-ignore` to silence a type error | Model the type correctly or parse with Zod                      |
| Duplicate a component/hook/util it didn't find  | Search the registry + repo; reuse/compose/extend the shared one |
| Put a `console.log` in for debugging            | Use the logger port (PHI-redacting)                             |
| Skip a locale ("I'll add hi/mr/ur later")       | Add the key to all four locales in the same change              |
| Ship a data surface with only the success state | Implement loading/empty/error+retry/success                     |
| Invent dosage/triage/clinical logic             | Flag for clinician/SME review; never author medical rules       |
| Add a dependency to satisfy a prompt            | Propose an ADR; the tech stack is authoritative                 |
| Mark a phase "done" without Brain + report      | Run the §1.7–1.9 updates; regenerate the reports                |

---

## 4. The AI Definition of Done

AI pastes the full [Definition of Done](./DefinitionOfDone.md) §2 checklist into its response/PR and ticks every applicable box, **plus** confirms:

```text
[ ] I read PROJECT_BRAIN + the relevant canon before writing
[ ] I reuse-searched the registries (no duplication)
[ ] Every decision cites the rule/layer it follows
[ ] `pnpm quality` would pass (or I ran it) — all 12 gates green
[ ] Brain registries + module BRAIN/README + docs updated in this diff
[ ] Any clinical/PHI surface is flagged + permission-gated
[ ] Escalation triggers surfaced if hit (else: none hit)
```

---

## 5. Why this exists

AI will write a large fraction of ClinicOS. Ungoverned, that is the fastest possible path to architectural drift, accessibility gaps, untranslated screens, and PHI leaks — compounded across hundreds of changes. These rules make AI a **first-class, gated contributor**: the same standards, the same gates, the same memory discipline as the best human engineer on the team. The gates are not bureaucracy; they are how a healthcare system earns a 10-year, billion-dollar quality bar.

_Phase 9 · Engineering Quality Platform · Part 11 · Status: **Foundation v9** · 2026-06-30_
_Extends [AI_RULES.md](../architecture/AI_RULES.md) + [AI-Rules.md](../AI-Rules.md) · Companion: [DefinitionOfDone.md](./DefinitionOfDone.md) · [QualityGates.md](./QualityGates.md) · [EngineeringStandards.md](./EngineeringStandards.md)_
