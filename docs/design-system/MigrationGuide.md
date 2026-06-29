# ClinicOS Design System — Migration & Versioning Guide (Part 11)

> **Versioning and breaking-change policy for the ClinicOS design system: SemVer, the registry status
> lifecycle, how breaking changes are announced, deprecation windows, and how consumers migrate.**
> To make a change, follow **[ContributionGuide.md](./ContributionGuide.md)** (§8 routes breaking changes
> here). This guide governs the _contract_ between the kit and every consumer.

The design system is a long-lived internal package consumed by every module for a **10+ year horizon**.
Its public surface — the `@shared/design-system` barrel and each component's props — is a **contract**.
Breaking it carelessly breaks hundreds of call sites. This policy makes change safe, announced, and
mechanical to adopt.

---

## 1. Semantic Versioning (SemVer)

The kit version (mirrored by `since` in the
[Component Registry](../../src/shared/design-system/registry/component-registry.ts), today `V1 = 0.6.0`)
follows **SemVer** — `MAJOR.MINOR.PATCH`:

| Bump      | Means                                        | Examples                                                                                                                                                      |
| --------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MAJOR** | A **breaking** change to the public surface. | Removing/renaming a prop or component; changing a default that alters rendered output; changing a component's DOM/role/ARIA contract; removing a CVA variant. |
| **MINOR** | **Additive**, backward-compatible.           | New component; new variant/size; new optional prop with a non-breaking default; promoting status.                                                             |
| **PATCH** | **Fixes** with no surface change.            | Bug fix, a11y fix, token-value tweak, internal refactor, docs.                                                                                                |

Rules:

- **Pre-1.0 caveat.** While the kit is `0.x` (it is), minor bumps _may_ carry breaking changes — but we
  still treat breaks as breaks: deprecation window + CHANGELOG + codemod guidance, never a silent break.
- **Token changes are visual changes.** Re-mapping a semantic token (e.g. shifting `--color-primary`) is
  at least a MINOR and, if it changes contrast/meaning, must pass the a11y gate and be announced.
- **One change, one version story.** A PR that breaks the surface bumps MAJOR and ships the deprecation +
  CHANGELOG + codemod notes _in the same diff_ (per [AI_RULES §4](../architecture/AI_RULES.md#4-the-post-work-update-workflow-the-heart-of-part-8)).
- We use **Changesets** ([Project-Checklist §2.1](../Project-Checklist.md)) to record the bump and
  generate the changelog entry.

---

## 2. The status lifecycle

Every component carries a [`ComponentStatus`](../../src/shared/design-system/registry/component-registry.ts):
`planned → experimental → beta → stable → deprecated`. The status sets the **stability promise** a
consumer can rely on.

```
planned ──▶ experimental ──▶ beta ──▶ stable ──▶ deprecated ──▶ (removed at next MAJOR)
 🗓️           ⚗️              🧪         ✅            ⚠️
```

| Status         | Promise                                                                                       | May I depend on it?                     |
| -------------- | --------------------------------------------------------------------------------------------- | --------------------------------------- |
| `planned`      | Registered so it is **not re-invented**; no folder yet (`slug: null`).                        | No — build it (it is the spec).         |
| `experimental` | Exists; API **will** change without a major bump. Has stories + tests.                        | Prototypes only; expect churn.          |
| `beta`         | API mostly settled; **minor** changes possible; gathering real usage.                         | Yes, with awareness of possible tweaks. |
| `stable`       | API frozen; changes follow **SemVer** (breaks ⇒ MAJOR + deprecation window).                  | **Yes** — the safe default.             |
| `deprecated`   | Scheduled for removal; a replacement + migration path exists. Emits a console warning in dev. | No new usage; migrate off (see §4).     |

**Promotion criteria** (a component only reaches `stable` when _all_ hold):

- Full a11y contract met + `vitest-axe` clean ([TestingGuide.md](./TestingGuide.md)).
- Stories cover Default + all variants + all states ([StorybookGuide.md](./StorybookGuide.md)).
- `hasStories` and `hasTests` are truthfully `true` in the registry.
- Reviewed and used in at least one real surface.

Changing status is a registry edit (`status:` field) — run `pnpm ds:registry` and add a CHANGELOG line.

---

## 3. What counts as a breaking change

Breaking (⇒ MAJOR + deprecation window + codemod guidance):

- Removing or renaming a **component**, a **prop**, or a **CVA variant/size**.
- Changing a **default** value that changes rendered output or behaviour.
- Changing the rendered **DOM element, role, or ARIA** contract (e.g. `<div>`→`<button>`).
- Tightening a **type** (narrowing a prop union, making an optional prop required).
- Removing a barrel export or moving a component's `slug`.

**Not** breaking (MINOR/PATCH, no window):

- Adding a new component, variant, size, or **optional** prop with a safe default.
- Internal refactors, performance fixes, bug fixes that restore the documented contract.
- Adding tests/stories/docs.

---

## 4. Deprecation windows

We **never** delete a public surface in the same release we stop recommending it.

1. **Mark `deprecated`** in the registry; add `@deprecated <reason — use X instead>` JSDoc on the
   symbol/prop so it strikes through in editors and shows in the autodocs props table.
2. **Emit a dev-only warning** (guarded by `import.meta.env.DEV`, never in production, **never** logging
   PHI) pointing at the replacement.
3. **Keep it working** for the window below.
4. **Remove at the next MAJOR**, only after the window has elapsed and the CHANGELOG announced removal.

**Window length:**

| Surface                      | Minimum window before removal           |
| ---------------------------- | --------------------------------------- |
| A prop or a variant          | **1 minor release** (and ≥ 2 weeks).    |
| A whole component            | **2 minor releases** (and ≥ 1 month).   |
| A token (semantic/component) | **2 minor releases**; provide an alias. |

Tokens get an **alias** for the window (old var resolves to the new) so consuming CSS does not break
mid-flight; the alias is removed at the MAJOR.

---

## 5. Announcing changes (CHANGELOG + registry + codemods)

Every consumer-affecting change is announced through **three** synchronized surfaces, all in the same PR:

1. **CHANGELOG** (via Changesets) and the **PROJECT_BRAIN Changelog registry** — a dated entry:
   _what_ changed, _why_, the **bump**, and a one-line migration note for breaks.
2. **The Component Registry** — the `status`, `since`, `composes`, `a11y`, `description` reflect reality;
   `pnpm ds:registry` regenerates [`ComponentRegistry.md`](./ComponentRegistry.md) so the catalog is
   current.
3. **Migration / codemod guidance** — for any break, a **before → after** snippet, and where the change
   is mechanical (a prop rename, an import move) a **codemod** (jscodeshift/ts-morph) or at minimum an
   exact find-and-replace recipe, so consumers migrate in minutes, not by hand-auditing.

### CHANGELOG entry shape

```md
## 0.7.0 — 2026-07-15

### Breaking

- **Button**: renamed `isLoading` → `loading` for consistency. `isLoading` is **deprecated**
  (warns in dev) and removed in 0.9.0. Codemod: `pnpm dlx ds-codemod button-loading-prop`.
  Before: `<Button isLoading />` → After: `<Button loading />`.

### Added

- **Tabs** (status: beta) — tablist/tab/tabpanel with roving focus.

### Fixed

- **Input**: focus ring no longer clipped at `sm` size (a11y).
```

### Codemod / migration recipe shape

```md
#### Migrating off `Button.isLoading` (removed in 0.9.0)

- Automated: `pnpm dlx ds-codemod button-loading-prop src/`
- Manual: replace the `isLoading` prop with `loading` on every `<Button>`; behaviour is identical.
- Verify: `pnpm verify` (typecheck will flag any missed site once `isLoading` is removed).
```

---

## 6. How consumers migrate

1. **Read the CHANGELOG** for the target version; note every entry under **Breaking**.
2. **Run the codemod** where provided, or apply the documented find-and-replace.
3. **Let the compiler help.** Because the kit is strict-typed and consumed via the typed barrel, removing
   a prop/component surfaces every call site as a `tsc` error — run `pnpm typecheck`.
4. **Re-run the gate** — `pnpm verify` (typecheck + lint + format + test) and, if you touched DS wiring,
   `pnpm ds:registry`. Stories and a11y tests catch behavioural regressions.
5. **Bump and ship** in one focused PR; record the upgrade in the consuming module's `BRAIN.md`.

Because deprecations live for a full window with dev warnings and aliases, a consumer can migrate
**incrementally** — adopt the new surface, clear the warnings, then upgrade past the MAJOR that removes
the old one.

---

## 7. Checklist (paste into the PR for any consumer-affecting change)

```text
[ ] Bump classified correctly (MAJOR breaking / MINOR additive / PATCH fix); Changeset added
[ ] Registry status/since/description updated; pnpm ds:registry regenerated the catalog
[ ] Breaking? deprecation in place (JSDoc @deprecated + dev-only warning, no PHI), window honored
[ ] CHANGELOG + PROJECT_BRAIN Changelog entry with why + migration note
[ ] Codemod or exact before→after find-replace recipe provided for mechanical breaks
[ ] Token break? alias provided for the window
[ ] pnpm verify green; consumers can migrate via tsc errors + the codemod
```

See also: **[ContributionGuide.md](./ContributionGuide.md)** (§8 breaking changes) ·
**[StorybookGuide.md](./StorybookGuide.md)** · **[TestingGuide.md](./TestingGuide.md)** ·
**[ComponentRegistry.md](./ComponentRegistry.md)** · the registry source
[`component-registry.ts`](../../src/shared/design-system/registry/component-registry.ts) + validator
[`ds-registry.mjs`](../../scripts/ds-registry.mjs) · [AI_RULES.md](../architecture/AI_RULES.md).

---

_Part 11 · Governed by [AI_RULES.md](../architecture/AI_RULES.md) +
[Project-Checklist.md](../Project-Checklist.md) · Status: **Foundation v1**_
