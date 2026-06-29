# ClinicOS — Asset Naming Standards

> **Design-Infrastructure canon · the asset-file naming rulebook.**
> This document defines **how every static asset file is named** in ClinicOS — brand logos, icons, illustrations, avatars, favicons, social previews, splash screens — and how those filenames relate to the **Asset Registry keys** in code.
>
> It is the **asset-specific expansion** of the global rulebook. It **does not duplicate** it — read both together:
> [Naming-Convention.md](../Naming-Convention.md) (the authoritative global rules: kebab-case files, forbidden names, approved abbreviations) · [Naming-Convention.md §3 File naming](../Naming-Convention.md#3-file-naming-standards) · [§4 Folder naming](../Naming-Convention.md#4-folder-naming-standards) · [§14 Forbidden names](../Naming-Convention.md#14-approved-abbreviations--forbidden-names).
>
> **Sibling:** [AssetArchitecture.md](./AssetArchitecture.md) (the folder structure + why). **Governs the code:** registry → [`src/shared/config/assets.ts`](../../src/shared/config/assets.ts); pipeline → [`svgo.config.js`](../../svgo.config.js); gate → [`scripts/check-assets.mjs`](../../scripts/check-assets.mjs).

---

## Table of contents

1. [The one rule + the master pattern](#1-the-one-rule--the-master-pattern)
2. [Brand logo naming](#2-brand-logo-naming)
3. [Icon naming](#3-icon-naming)
4. [Illustration naming (`empty-`/`error-` and friends)](#4-illustration-naming-empty-error-and-friends)
5. [Avatar naming](#5-avatar-naming)
6. [Favicon / social / splash naming](#6-favicon--social--splash-naming)
7. [Animation, image & document naming](#7-animation-image--document-naming)
8. [Registry KEY naming vs FILE naming](#8-registry-key-naming-vs-file-naming)
9. [Forbidden asset names](#9-forbidden-asset-names)
10. [Cross-references](#10-cross-references)

---

## 1. The one rule + the master pattern

**Every asset file is `kebab-case`. No exceptions** — no `PascalCase`, no `camelCase`, no `snake_case`, no spaces. This inherits directly from the global file-naming and folder-naming rules ([Naming-Convention.md §3–§4](../Naming-Convention.md#3-file-naming-standards)); assets are not exempt.

Beyond casing, asset filenames follow a **descriptive, type-first pattern**:

```text
<category>-<concept>[-<variant>][-<theme>][@<scale>].<ext>
```

| Segment      | Meaning                                     | Required? | Examples                                                                |
| ------------ | ------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `<category>` | the asset family / context                  | ✅        | `clinicos`, `empty`, `error`, `avatar`, `bg`, `pattern`, `og`, `splash` |
| `<concept>`  | the specific subject (often the **domain**) | ✅        | `logo`, `appointments`, `patients`, `billing`, `offline`, `doctor`      |
| `<variant>`  | a meaningful sub-form                       | optional  | `mark`, `mono`, `compact`, `outline`, `maskable`                        |
| `<theme>`    | surface polarity                            | optional  | `light`, `dark`                                                         |
| `@<scale>`   | raster density (raster only)                | optional  | `@2x`, `@3x`                                                            |
| `.<ext>`     | lowercase extension                         | ✅        | `.svg`, `.webp`, `.png`, `.ico`, `.json`, `.lottie`                     |

> **Why this shape** — it reads left-to-right from general to specific, sorts cleanly in a file listing (all `empty-*` together), and the **domain lives in the filename** — which is precisely why ClinicOS does **not** need per-domain folders ([AssetArchitecture.md §6](./AssetArchitecture.md#6-decision-domain-assets-use-prefixed-filenames-not-per-domain-folders)).

ClinicOS domains that appear as `<concept>` (use the **full** domain word — never `appt`/`rx`/`presc`, per [Naming-Convention.md §14](../Naming-Convention.md#14-approved-abbreviations--forbidden-names)): `patients`, `appointments`, `queue`, `consultation`, `prescriptions`, `pharmacy`, `billing`, `records`, `vitals`.

| ✅ Good                   | ❌ Bad                   | Why                                                                                                          |
| ------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `empty-appointments.svg`  | `emptyAppointments.svg`  | Assets are kebab-case, not camelCase.                                                                        |
| `clinicos-logo-dark.svg`  | `clinicos_logo_dark.svg` | No snake_case.                                                                                               |
| `error-billing.svg`       | `error-bill.svg`         | No unapproved abbreviations; full domain word.                                                               |
| `bg-login@2x.webp`        | `bg-login-2x.webp`       | Density uses `@2x`, not `-2x`.                                                                               |
| `empty-prescriptions.svg` | `empty-rx.svg`           | `rx` is forbidden ([§14](../Naming-Convention.md#14-approved-abbreviations--forbidden-names)); spell it out. |

---

## 2. Brand logo naming

The brand family is a **fixed, registered vocabulary** ([`assets.ts`](../../src/shared/config/assets.ts) `brand.*` keys). All start with the brand slug `clinicos-`.

| Concept               | Filename                  | Registry key      | When to use                                     |
| --------------------- | ------------------------- | ----------------- | ----------------------------------------------- |
| Full logo lockup      | `clinicos-logo.svg`       | `brand.logo`      | Default header/marketing lockup                 |
| Compact symbol/mark   | `clinicos-mark.svg`       | `brand.logoMark`  | Collapsed sidebar, favicon source, tight spaces |
| Light-surface variant | `clinicos-logo-light.svg` | `brand.logoLight` | On **light** backgrounds                        |
| Dark-surface variant  | `clinicos-logo-dark.svg`  | `brand.logoDark`  | On **dark** backgrounds                         |
| Monochrome            | `clinicos-mono.svg`       | `brand.logoMono`  | Print, single-ink, watermark base               |

**Rules:** brand slug is always `clinicos`; theme suffix is `-light` / `-dark` (polarity of the **surface** the logo sits on, not the logo's own colour); the mark is `-mark`, monochrome is `-mono`. Watermarks: `clinicos-watermark[-<context>].svg`.

| ✅ Good                  | ❌ Bad                          | Why                                          |
| ------------------------ | ------------------------------- | -------------------------------------------- |
| `clinicos-logo.svg`      | `logo.svg`, `ClinicOS-Logo.svg` | Brand-slug prefix; kebab-case.               |
| `clinicos-mark.svg`      | `clinicos-icon.svg`             | The compact symbol is the **mark**.          |
| `clinicos-logo-dark.svg` | `clinicos-dark-logo.svg`        | Theme is the **last** suffix: `…-logo-dark`. |
| `clinicos-mono.svg`      | `clinicos-black.svg`            | Single-colour is `-mono`, not a colour name. |

---

## 3. Icon naming

Custom SVG icon **sources** (not lucide), grouped by the folder = semantic group (`action/ brand/ medical/ navigation/ status/`). The icon **registry is code** (`@shared/design-system` → `icons`); filenames stay simple and concept-named.

**Pattern:** `<concept>[-<variant>].svg` — kebab-case, no `icon-` prefix (the folder already says "icon").

| Group         | ✅ Examples                                         |
| ------------- | --------------------------------------------------- |
| `action/`     | `dispense.svg`, `check-in.svg`, `advance-queue.svg` |
| `medical/`    | `vitals.svg`, `prescription.svg`, `stethoscope.svg` |
| `navigation/` | `sidebar-collapse.svg`, `breadcrumb-separator.svg`  |
| `status/`     | `success.svg`, `offline.svg`, `syncing.svg`         |
| `brand/`      | `clinicos-glyph.svg`                                |

**Color rule (critical):** monochrome icon sources **MUST use `currentColor`** for fill/stroke so they re-theme automatically — enforced at authoring/review time ([`svgo.config.js`](../../svgo.config.js) deliberately does **not** recolour, to protect illustrations). Keep `viewBox`; drop hardcoded `width`/`height`.

| ✅ Good                                  | ❌ Bad                                   | Why                                       |
| ---------------------------------------- | ---------------------------------------- | ----------------------------------------- |
| `check-in.svg`                           | `icon-check-in.svg`                      | Redundant `icon-` prefix; folder says it. |
| `dispense.svg`                           | `Dispense.svg`                           | kebab-case.                               |
| `advance-queue.svg`                      | `advanceQueue.svg`                       | kebab-case, not camelCase.                |
| `prescription.svg` (uses `currentColor`) | `prescription.svg` with `fill="#E87D7D"` | Hardcoded colour breaks theming.          |

---

## 4. Illustration naming (`empty-`/`error-` and friends)

Illustrations are **type-foldered, domain-in-filename** ([AssetArchitecture.md §6](./AssetArchitecture.md#6-decision-domain-assets-use-prefixed-filenames-not-per-domain-folders)). The filename carries the **context/domain**, so each type folder holds every domain's art together.

| Folder            | Pattern               | ✅ ClinicOS examples                                                                                                 |
| ----------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `empty-states/`   | `empty-<context>.svg` | `empty-appointments.svg`, `empty-patients.svg`, `empty-prescriptions.svg`, `empty-invoices.svg`, `empty-generic.svg` |
| `error-states/`   | `error-<context>.svg` | `error-generic.svg`, `error-billing.svg`, `error-network.svg`, `error-not-found.svg`                                 |
| `offline/`        | `<concept>.svg`       | `offline.svg`, `offline-syncing.svg`                                                                                 |
| `maintenance/`    | `<concept>.svg`       | `maintenance.svg`, `scheduled-downtime.svg`                                                                          |
| `onboarding/`     | `<step>.svg`          | `welcome.svg`, `tour-vitals.svg`                                                                                     |
| `authentication/` | `<concept>.svg`       | `sign-in.svg`, `account-locked.svg`                                                                                  |
| `success/`        | `<concept>.svg`       | `payment-success.svg`, `appointment-booked.svg`                                                                      |
| `loading/`        | `<concept>.svg`       | `loading-records.svg`                                                                                                |
| `medical/`        | `<scene>.svg`         | `consultation-scene.svg`, `pharmacy-counter.svg`                                                                     |

**The `<context>` is the domain** (full word). So a patients empty-state is `empty-patients.svg`, an appointments one is `empty-appointments.svg`, a pharmacy error is `error-pharmacy.svg` — same rule, different suffix, no new folder.

| ✅ Good                                | ❌ Bad                           | Why                                                                                                                                         |
| -------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `empty-states/empty-appointments.svg`  | `appointments/empty.svg`         | Type folders, not per-domain folders ([§6](./AssetArchitecture.md#6-decision-domain-assets-use-prefixed-filenames-not-per-domain-folders)). |
| `error-states/error-billing.svg`       | `error-states/billing-error.svg` | Type prefix first: `error-<context>`.                                                                                                       |
| `empty-states/empty-prescriptions.svg` | `empty-states/empty-rx.svg`      | No `rx` abbreviation.                                                                                                                       |
| `empty-states/empty-generic.svg`       | `empty-states/empty.svg`         | A fallback is `-generic`, not bare.                                                                                                         |

---

## 5. Avatar naming

Default avatars and generated-avatar backgrounds. Role defaults are registered (`avatar.*` keys).

| Concept                     | Filename                  | Registry key                                |
| --------------------------- | ------------------------- | ------------------------------------------- |
| Default doctor avatar       | `avatar-doctor.svg`       | `avatar.doctor`                             |
| Default patient avatar      | `avatar-patient.svg`      | `avatar.patient`                            |
| Default organization avatar | `avatar-organization.svg` | `avatar.organization`                       |
| Initials-avatar background  | `pattern-<name>.svg`      | (not served / not registered unless needed) |

**Pattern:** `avatar-<role>.svg`; backgrounds `pattern-<name>.svg`. Use full role words (`organization`, not `org`).

| ✅ Good                   | ❌ Bad               | Why                                     |
| ------------------------- | -------------------- | --------------------------------------- |
| `avatar-doctor.svg`       | `doctor-avatar.svg`  | Category prefix first: `avatar-<role>`. |
| `avatar-organization.svg` | `avatar-org.svg`     | No `org` abbreviation.                  |
| `avatar-patient.svg`      | `default-avatar.svg` | Name the role, not "default".           |

---

## 6. Favicon / social / splash naming

These Tier-2 assets are referenced by the HTML document / web manifest and follow **platform conventions** (so platforms recognise them).

**Favicons (`public/favicons/`):**

| ✅ Good                                          | Note                                             |
| ------------------------------------------------ | ------------------------------------------------ |
| `favicon.ico`                                    | classic multi-size ICO                           |
| `favicon.svg`                                    | modern scalable favicon                          |
| `favicon-16x16.png`, `favicon-32x32.png`         | exact-size PNG fallbacks (`favicon-<w>x<h>.png`) |
| `apple-touch-icon.png`                           | iOS home-screen (conventional fixed name)        |
| `icon-192-maskable.png`, `icon-512-maskable.png` | PWA maskable icons (`icon-<size>-maskable.png`)  |

**Social previews (`public/social-preview/`):** `og-<context>.png`, `twitter-<context>.png` — e.g. `og-default.png` (use exact platform dimensions, e.g. 1200×630).

**Splash (`public/splash/`):** `splash-<width>x<height>.png` — e.g. `splash-1170x2532.png` (device-targeted).

| ✅ Good                | ❌ Bad                 | Why                                             |
| ---------------------- | ---------------------- | ----------------------------------------------- |
| `favicon-32x32.png`    | `favicon32.png`        | Use `<w>x<h>`.                                  |
| `og-default.png`       | `social.png`           | Prefix the platform context (`og-`/`twitter-`). |
| `splash-1170x2532.png` | `splash-iphone.png`    | Encode dimensions, not a device nickname.       |
| `apple-touch-icon.png` | `apple-icon-touch.png` | Match the platform-expected name exactly.       |

---

## 7. Animation, image & document naming

| Folder                | Pattern                                    | ✅ Examples                                        |
| --------------------- | ------------------------------------------ | -------------------------------------------------- |
| `animations/lottie/`  | `<concept>.lottie.json` / `<concept>.json` | `sync-success.lottie.json`, `loading-spinner.json` |
| `images/backgrounds/` | `bg-<context>.<ext>`                       | `bg-login.webp`, `bg-dashboard.svg`                |
| `images/patterns/`    | `pattern-<name>.<ext>`                     | `pattern-dots.svg`, `pattern-grid.svg`             |
| `documents/pdf/`      | `<document>-<part>.svg`                    | `prescription-header.svg`, `invoice-footer.svg`    |
| `documents/print/`    | `<document>-<part>.svg`                    | `prescription-watermark.svg`                       |

Raster density variants use `@2x`/`@3x` (e.g. `bg-login@2x.webp`). Documents prefer monochrome/print-safe SVG; **never** bake localizable text into any of these — compose text at render time.

---

## 8. Registry KEY naming vs FILE naming

The two naming systems are **deliberately different** and must not be confused. This is the single most important asset-naming distinction in ClinicOS.

|                | **Registry KEY** (in code)                                                                                  | **FILE name** (on disk)                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Lives in       | [`src/shared/config/assets.ts`](../../src/shared/config/assets.ts) `ASSETS`                                 | `public/assets/**` (or `src/assets/**`)                                                                                      |
| Shape          | `category.name` — **camelCase `name`**                                                                      | `<category>-<concept>…` — **kebab-case**                                                                                     |
| Examples       | `brand.logoMark`, `illustration.emptyGeneric`, `avatar.organization`                                        | `brand/clinicos-mark.svg`, `illustrations/empty-generic.svg`, `avatars/avatar-organization.svg`                              |
| Why this shape | Keys are TS identifiers/object members — camelCase reads naturally in code and gives `AssetKey` type-safety | Files follow the universal kebab-case file rule ([Naming-Convention.md §3](../Naming-Convention.md#3-file-naming-standards)) |

```ts
// the registry maps a camelCase KEY → a kebab-case FILE path
export const ASSETS = {
  'brand.logoMark': 'brand/clinicos-mark.svg', // key camelCase · file kebab
  'illustration.emptyGeneric': 'illustrations/empty-generic.svg',
  'avatar.organization': 'avatars/avatar-organization.svg',
} as const;

// consumed by KEY — type-safe, location-agnostic
const url = assetUrl('illustration.emptyGeneric');
```

**Rules:**

- The **category** in the key matches the folder family (`brand`, `illustration`, `avatar`) — singular.
- The **name** in the key is camelCase (`logoMark`, `emptyGeneric`); the **file** the key points to is kebab-case (`clinicos-mark.svg`, `empty-generic.svg`).
- A served asset MUST be **registered before use**; consume via `assetUrl(key)`, never a raw path.

| ✅ Good                                                             | ❌ Bad                                             | Why                                                |
| ------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| key `illustration.emptyGeneric` → `illustrations/empty-generic.svg` | key `illustration.empty-generic`                   | Keys are camelCase, not kebab.                     |
| `assetUrl('brand.logoDark')`                                        | `<img src="/assets/brand/clinicos-logo-dark.svg">` | Use the registry/`assetUrl`, not a hardcoded path. |
| file `clinicos-mark.svg`                                            | file `clinicosMark.svg`                            | Files are kebab-case, not camelCase.               |

---

## 9. Forbidden asset names

These extend the global forbidden-names list ([Naming-Convention.md §14.2](../Naming-Convention.md#14-approved-abbreviations--forbidden-names)) — that list is authoritative; below are the asset-specific applications.

| ❌ Forbidden                                                     | Why                                                                                                                    | ✅ Use instead                                                                 |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `logo.svg`, `image.png`, `icon.svg`, `bg.png`                    | Says nothing; collides; not greppable                                                                                  | `clinicos-logo.svg`, `bg-login.webp`, `dispense.svg`                           |
| `empty.svg`, `error.png`, `avatar.svg`                           | Missing the context/domain                                                                                             | `empty-appointments.svg`, `error-billing.svg`, `avatar-doctor.svg`             |
| `empty-rx.svg`, `error-appt.svg`, `avatar-org.svg`               | Unapproved abbreviations (`rx`/`appt`/`org`)                                                                           | `empty-prescriptions.svg`, `error-appointments.svg`, `avatar-organization.svg` |
| `Logo.svg`, `emptyState.svg`, `BG_Login.png`                     | Wrong casing (must be kebab-case)                                                                                      | `clinicos-logo.svg`, `empty-generic.svg`, `bg-login.png`                       |
| `new-logo.svg`, `logo-final.svg`, `logo-v2.svg`, `logo-copy.svg` | Version/state words leak into names                                                                                    | replace the registered file; let git hold history                              |
| `temp.svg`, `test.png`, `asset1.svg`, `Untitled.svg`             | Placeholder leaked into the tree                                                                                       | the real `<category>-<concept>` name                                           |
| per-domain folders `illustrations/billing/empty.svg`             | Folder explosion ([§6](./AssetArchitecture.md#6-decision-domain-assets-use-prefixed-filenames-not-per-domain-folders)) | `illustrations/empty-states/empty-billing.svg`                                 |
| `appointment-empty.svg` (domain first)                           | Type/category must come first                                                                                          | `empty-appointments.svg`                                                       |
| any file with **baked-in translatable text**                     | Breaks i18n (en/hi/mr/ur, RTL)                                                                                         | text composed at render via i18n keys                                          |
| duplicate file with a new name                                   | Hard-fails `pnpm check:assets` (drift)                                                                                 | reference the single canonical file                                            |

> **Enforcement:** `pnpm check:assets` ([`scripts/check-assets.mjs`](../../scripts/check-assets.mjs)) fails the build on **duplicate** assets (identical content under different names) and warns on **unused** ones. `pnpm optimize:svg` ([`svgo.config.js`](../../svgo.config.js)) standardises SVG output. Run both before committing.

---

## 10. Cross-references

| Need                                                                                    | Document / code                                                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Global** naming rulebook (kebab-case, forbidden names, abbreviations) — authoritative | [../Naming-Convention.md](../Naming-Convention.md)                 |
| Asset folder structure + the two tiers + why                                            | [AssetArchitecture.md](./AssetArchitecture.md)                     |
| The Asset Registry (keys ↔ files)                                                       | [`src/shared/config/assets.ts`](../../src/shared/config/assets.ts) |
| SVG optimization config                                                                 | [`svgo.config.js`](../../svgo.config.js)                           |
| Duplicate/unused hygiene gate                                                           | [`scripts/check-assets.mjs`](../../scripts/check-assets.mjs)       |
| Source-asset overview                                                                   | [`src/assets/README.md`](../../src/assets/README.md)               |

---

_Design-Infrastructure canon · Asset Naming Standards · Owner: Frontend Architecture · Asset-specific expansion of [Naming-Convention.md](../Naming-Convention.md); extends [AssetArchitecture.md](./AssetArchitecture.md), never contradicts them._
