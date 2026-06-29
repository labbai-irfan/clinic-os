# ClinicOS — Asset Catalog (every image / SVG, now & future)

> **Scope.** The complete, named inventory of every brand mark, icon, illustration,
> avatar, background, pattern, animation, and document asset ClinicOS needs — for
> the current foundation **and** every future module. One row = one file.
> This is the **build-to naming contract**: produce artwork to these exact names so
> code can register/import them before the art exists.
>
> **Naming is governed, not invented here.** Every name below obeys
> [NamingStandards.md](./NamingStandards.md) (kebab-case; `<category>-<concept>[-variant][-theme]`;
> full domain words — never `rx`/`appt`/`org`; no redundant `icon-` prefix inside an
> icon folder). Folder rules + the two tiers: [AssetArchitecture.md](./AssetArchitecture.md).
> Served assets are consumed by **registry key** via `assetUrl(key)`
> ([`src/shared/config/assets.ts`](../../src/shared/config/assets.ts)) — key is camelCase,
> file is kebab-case. Shipped files are logged in
> [PROJECT_BRAIN.md §32](../brain/PROJECT_BRAIN.md).

## How to read this

- **Format:** `.svg` for all line/flat art & icons; `.json` (Lottie) for motion;
  `.png`/`.webp` only for raster textures, favicons & social/splash.
- **Theming:** icon sources use `currentColor`; illustrations use semantic token
  colours so dark / high-contrast re-theme automatically.
- **No baked text:** never embed localizable words in artwork — compose text in the UI.
- **A11y:** decorative art is `aria-hidden`; meaningful art gets a localized `alt`.
- **Before commit:** `pnpm optimize:svg` + `pnpm check:assets`.

**When legend** — `Now` = needed by the current foundation + UI kit + the imminent
Auth / App-Shell phase · `Next` = first feature modules (appointments, queue,
consultation, vitals) · `Future` = later modules (pharmacy, billing, records,
follow-up, reports, telemedicine, documents).

---

## 0. Folder structure

```
src/assets/
├── brand/
│   ├── logos/          # clinicos-logo / -mark / -wordmark / layout variants
│   ├── monochrome/     # clinicos-mono single-ink lockups
│   ├── themed/         # clinicos-logo-light / -dark surface variants
│   └── watermarks/     # clinicos-watermark[-context]
├── icons/              # custom SVG sources NOT in lucide-react (lucide is default)
│   ├── brand/          # clinicos-glyph + third-party marks (OAuth, payments)
│   ├── medical/        # clinical glyphs lucide lacks
│   ├── navigation/     # bespoke sidebar / chrome glyphs
│   ├── action/         # domain verbs (dispense, check-in, advance-queue…)
│   └── status/         # queue / vital / sync / payment status glyphs
├── illustrations/      # type-foldered, DOMAIN-IN-FILENAME (no per-domain folders)
│   ├── authentication/ # sign-in, account-locked…
│   ├── empty-states/   # empty-<domain>
│   ├── error-states/   # error-<context>
│   ├── loading/        # loading-<context>
│   ├── maintenance/    # maintenance, scheduled-downtime…
│   ├── medical/        # <scene> hero art (consultation-scene…)
│   ├── offline/        # offline, offline-syncing…
│   ├── onboarding/     # welcome, tour-<topic>…
│   └── success/        # payment-success, appointment-booked…
├── avatars/
│   ├── placeholders/   # avatar-<role>
│   └── patterns/       # pattern-avatar-<n> generated-avatar backgrounds (8-hue)
├── images/
│   ├── backgrounds/    # bg-<context>
│   └── patterns/       # pattern-<name>
├── animations/
│   └── lottie/         # <concept>.json (reduced-motion gated at consumer)
└── documents/
    ├── pdf/            # <document>-<part>  (prescription-header, invoice-footer…)
    └── print/          # token-slip, clinic-stamp, prescription-watermark…
```

> Favicons / social-preview / splash are **Tier-2 platform assets** under `public/`
> (not `src/assets/`) — see [§9](#9-favicons--social--splash-public).

---

## 1. `brand/`

> Served family · registry keys `brand.*` in [`assets.ts`](../../src/shared/config/assets.ts).
> Brand slug is always `clinicos-`; theme suffix (`-light`/`-dark`) is the **surface** polarity.

### 1.1 `brand/logos/`

| File                           | Description                                            | When   |
| ------------------------------ | ------------------------------------------------------ | ------ |
| `clinicos-logo.svg`            | Full lockup — mark + wordmark (`brand.logo`)           | Now    |
| `clinicos-mark.svg`            | Compact symbol/mark, favicon source (`brand.logoMark`) | Now    |
| `clinicos-wordmark.svg`        | Text-only "ClinicOS" wordmark                          | Now    |
| `clinicos-logo-horizontal.svg` | Mark left of wordmark                                  | Now    |
| `clinicos-logo-stacked.svg`    | Mark above wordmark (vertical)                         | Now    |
| `clinicos-app-icon.svg`        | Rounded-square launcher/app icon source                | Now    |
| `clinicos-logo-tagline.svg`    | Lockup + "Clinic Operating System" tagline             | Future |
| `clinicos-emblem.svg`          | Circular badge / seal variant                          | Future |

### 1.2 `brand/monochrome/`

| File                         | Description                                                | When |
| ---------------------------- | ---------------------------------------------------------- | ---- |
| `clinicos-mono.svg`          | Single-ink lockup, print/watermark base (`brand.logoMono`) | Now  |
| `clinicos-mark-mono.svg`     | Single-ink mark                                            | Now  |
| `clinicos-wordmark-mono.svg` | Single-ink wordmark                                        | Next |

### 1.3 `brand/themed/`

| File                              | Description                                       | When |
| --------------------------------- | ------------------------------------------------- | ---- |
| `clinicos-logo-light.svg`         | Lockup for **light** surfaces (`brand.logoLight`) | Now  |
| `clinicos-logo-dark.svg`          | Lockup for **dark** surfaces (`brand.logoDark`)   | Now  |
| `clinicos-mark-light.svg`         | Mark for light surfaces                           | Now  |
| `clinicos-mark-dark.svg`          | Mark for dark surfaces                            | Now  |
| `clinicos-logo-high-contrast.svg` | High-contrast-theme lockup                        | Next |

### 1.4 `brand/watermarks/`

| File                                  | Description                                  | When   |
| ------------------------------------- | -------------------------------------------- | ------ |
| `clinicos-watermark.svg`              | Faint logo watermark for docs/empty surfaces | Now    |
| `clinicos-watermark-prescription.svg` | Prescription paper watermark                 | Future |
| `clinicos-watermark-invoice.svg`      | Invoice / billing watermark                  | Future |
| `clinicos-watermark-confidential.svg` | Diagonal "Confidential" stamp (records)      | Future |

---

## 2. `icons/` (custom SVG sources only — lucide-react is the default set)

> Pattern `<concept>[-variant].svg`, **no `icon-` prefix** (folder = group). Sources
> use `currentColor`. The semantic icon **registry is code**
> ([`src/shared/design-system/icons/registry.ts`](../../src/shared/design-system/icons/registry.ts)).

### 2.1 `icons/brand/` — brand glyph + third-party marks

| File                 | Description                       | When   |
| -------------------- | --------------------------------- | ------ |
| `clinicos-glyph.svg` | Monochrome app glyph (menus/tabs) | Now    |
| `google.svg`         | Google "G" — OAuth sign-in        | Now    |
| `abha.svg`           | ABHA / Ayushman Bharat Health ID  | Future |
| `digilocker.svg`     | DigiLocker document import        | Future |
| `whatsapp.svg`       | WhatsApp patient comms            | Future |
| `microsoft.svg`      | Microsoft sign-in                 | Future |
| `apple.svg`          | Apple sign-in                     | Future |
| `upi.svg`            | UPI payments mark                 | Future |
| `razorpay.svg`       | Razorpay gateway                  | Future |
| `stripe.svg`         | Stripe gateway                    | Future |
| `visa.svg`           | Visa card network                 | Future |
| `mastercard.svg`     | Mastercard network                | Future |
| `rupay.svg`          | RuPay network                     | Future |
| `amex.svg`           | American Express network          | Future |

### 2.2 `icons/medical/` — clinical glyphs lucide lacks

| File                    | Description                | When   |
| ----------------------- | -------------------------- | ------ |
| `stethoscope.svg`       | Stethoscope — consultation | Now    |
| `cross.svg`             | Medical cross brand accent | Now    |
| `prescription.svg`      | Prescription / ℞           | Next   |
| `vitals.svg`            | Vitals summary             | Next   |
| `heartbeat.svg`         | Heart rate / pulse         | Next   |
| `blood-pressure.svg`    | BP cuff                    | Next   |
| `thermometer.svg`       | Temperature                | Next   |
| `weight-scale.svg`      | Weight                     | Next   |
| `height-gauge.svg`      | Height                     | Next   |
| `oxygen-saturation.svg` | SpO₂ / pulse-ox            | Next   |
| `respiratory-rate.svg`  | Breathing rate             | Next   |
| `bmi.svg`               | Body-mass index            | Next   |
| `pill.svg`              | Pill / tablet              | Next   |
| `capsule.svg`           | Capsule                    | Future |
| `syringe.svg`           | Injection                  | Future |
| `vaccine.svg`           | Vaccination                | Future |
| `iv-drip.svg`           | IV drip                    | Future |
| `blood-drop.svg`        | Blood sample               | Future |
| `test-tube.svg`         | Lab sample                 | Future |
| `microscope.svg`        | Lab / pathology            | Future |
| `ecg.svg`               | ECG / cardiac trace        | Future |
| `x-ray.svg`             | X-ray / radiology          | Future |
| `ultrasound.svg`        | Ultrasound / scan          | Future |
| `glucometer.svg`        | Blood-glucose meter        | Future |
| `tooth.svg`             | Dental                     | Future |
| `eye.svg`               | Ophthalmology              | Future |
| `ear.svg`               | ENT                        | Future |
| `lungs.svg`             | Pulmonology                | Future |
| `brain.svg`             | Neurology                  | Future |
| `bone.svg`              | Orthopaedics               | Future |
| `kidney.svg`            | Nephrology                 | Future |
| `stomach.svg`           | Gastroenterology           | Future |
| `skin.svg`              | Dermatology                | Future |
| `pregnancy.svg`         | Obstetrics / antenatal     | Future |
| `baby.svg`              | Paediatrics                | Future |
| `dna.svg`               | Genetics / diagnostics     | Future |
| `allergy.svg`           | Allergy flag               | Future |
| `mortar-pestle.svg`     | Pharmacy / compounding     | Future |
| `ambulance.svg`         | Emergency transport        | Future |
| `hospital-bed.svg`      | Admission / IPD            | Future |
| `wheelchair.svg`        | Mobility / accessibility   | Future |
| `first-aid.svg`         | First-aid kit              | Future |
| `mask.svg`              | PPE mask                   | Future |
| `gloves.svg`            | PPE gloves                 | Future |

### 2.3 `icons/navigation/` — bespoke sidebar / chrome glyphs

> Module nav icons come from lucide via the registry; only ClinicOS-specific chrome lives here.

| File                       | Description               | When |
| -------------------------- | ------------------------- | ---- |
| `sidebar-collapse.svg`     | Collapse sidebar          | Now  |
| `sidebar-expand.svg`       | Expand sidebar            | Now  |
| `breadcrumb-separator.svg` | Breadcrumb chevron        | Now  |
| `module-switcher.svg`      | Switch module / workspace | Next |
| `command-palette.svg`      | Command-palette trigger   | Next |
| `quick-actions.svg`        | Quick-actions launcher    | Next |

### 2.4 `icons/action/` — domain verbs

| File                     | Description               | When   |
| ------------------------ | ------------------------- | ------ |
| `check-in.svg`           | Check patient in          | Next   |
| `advance-queue.svg`      | Call next / advance queue | Next   |
| `record-vitals.svg`      | Record vitals             | Next   |
| `prescribe.svg`          | Write prescription        | Next   |
| `book-slot.svg`          | Book appointment slot     | Next   |
| `dispense.svg`           | Dispense medicine         | Future |
| `collect-payment.svg`    | Collect payment           | Future |
| `reschedule.svg`         | Reschedule visit          | Future |
| `cancel-visit.svg`       | Cancel visit              | Future |
| `refer.svg`              | Refer to specialist       | Future |
| `admit.svg`              | Admit patient             | Future |
| `discharge.svg`          | Discharge patient         | Future |
| `print-prescription.svg` | Print prescription        | Future |

### 2.5 `icons/status/` — queue / vital / sync / payment status

| File                  | Description            | When   |
| --------------------- | ---------------------- | ------ |
| `scheduled.svg`       | Appointment scheduled  | Now    |
| `waiting.svg`         | Waiting in queue       | Now    |
| `completed.svg`       | Visit completed        | Now    |
| `cancelled.svg`       | Cancelled              | Now    |
| `online.svg`          | Connected              | Now    |
| `offline.svg`         | Disconnected           | Now    |
| `syncing.svg`         | Outbox syncing         | Now    |
| `success.svg`         | Generic success tick   | Now    |
| `checked-in.svg`      | Checked in / arrived   | Next   |
| `in-consultation.svg` | In consultation        | Next   |
| `no-show.svg`         | Patient no-show        | Next   |
| `emergency.svg`       | Emergency / triage     | Next   |
| `critical.svg`        | Vital critical         | Next   |
| `stable.svg`          | Vital stable           | Next   |
| `sync-error.svg`      | Sync conflict / failed | Next   |
| `paid.svg`            | Invoice paid           | Future |
| `partial.svg`         | Partially paid         | Future |
| `unpaid.svg`          | Unpaid / due           | Future |

---

## 3. `illustrations/`

> Type-foldered, **domain in the filename** — no per-domain folders.
> Served family · registry keys `illustration.*`.

### 3.1 `illustrations/authentication/` — `<concept>.svg`

| File                  | Description              | When   |
| --------------------- | ------------------------ | ------ |
| `sign-in.svg`         | Friendly login hero      | Now    |
| `welcome.svg`         | Welcome side panel       | Now    |
| `verify-otp.svg`      | OTP / verification entry | Next   |
| `forgot-password.svg` | Reset-password prompt    | Next   |
| `reset-success.svg`   | Password changed         | Next   |
| `session-expired.svg` | Session timed out        | Next   |
| `signed-out.svg`      | Signed out               | Next   |
| `account-locked.svg`  | Account locked           | Future |
| `two-factor.svg`      | Two-factor security      | Future |
| `accept-invite.svg`   | Staff invitation accept  | Future |

### 3.2 `illustrations/empty-states/` — `empty-<domain>.svg`

| File                      | Description                     | When   |
| ------------------------- | ------------------------------- | ------ |
| `empty-generic.svg`       | Generic "nothing here" fallback | Now    |
| `empty-search.svg`        | No search results               | Now    |
| `empty-notifications.svg` | No notifications                | Now    |
| `empty-queue.svg`         | Queue is clear                  | Now    |
| `empty-patients.svg`      | No patients yet                 | Now    |
| `empty-appointments.svg`  | No appointments                 | Now    |
| `empty-messages.svg`      | No messages                     | Next   |
| `empty-tasks.svg`         | No tasks                        | Next   |
| `empty-vitals.svg`        | No vitals recorded              | Next   |
| `empty-prescriptions.svg` | No prescriptions                | Next   |
| `empty-consultation.svg`  | No consultation notes           | Next   |
| `empty-allergies.svg`     | No known allergies              | Future |
| `empty-lab-results.svg`   | No lab results                  | Future |
| `empty-pharmacy.svg`      | Pharmacy stock empty            | Future |
| `empty-cart.svg`          | Pharmacy cart empty             | Future |
| `empty-invoices.svg`      | No invoices                     | Future |
| `empty-records.svg`       | No medical records              | Future |
| `empty-follow-ups.svg`    | No follow-ups                   | Future |
| `empty-reports.svg`       | No reports                      | Future |
| `empty-documents.svg`     | No documents                    | Future |

### 3.3 `illustrations/error-states/` — `error-<context>.svg`

| File                    | Description                     | When   |
| ----------------------- | ------------------------------- | ------ |
| `error-generic.svg`     | Something went wrong            | Now    |
| `error-not-found.svg`   | 404 — page not found            | Now    |
| `error-permission.svg`  | 403 — access denied             | Now    |
| `error-server.svg`      | 500 — server error              | Now    |
| `error-network.svg`     | Connection failed               | Now    |
| `error-crash.svg`       | Crash / error-boundary fallback | Now    |
| `error-timeout.svg`     | Request timed out               | Next   |
| `error-unsupported.svg` | Browser / device unsupported    | Future |
| `error-upload.svg`      | Upload failed                   | Future |
| `error-payment.svg`     | Payment failed                  | Future |

### 3.4 `illustrations/loading/` — `loading-<context>.svg`

| File                  | Description            | When   |
| --------------------- | ---------------------- | ------ |
| `loading-generic.svg` | Generic loading art    | Now    |
| `loading-records.svg` | Loading records / data | Next   |
| `loading-search.svg`  | Searching              | Next   |
| `loading-sync.svg`    | Sync in progress       | Next   |
| `loading-payment.svg` | Processing payment     | Future |
| `loading-report.svg`  | Generating report      | Future |

### 3.5 `illustrations/maintenance/` — `<concept>.svg`

| File                     | Description         | When   |
| ------------------------ | ------------------- | ------ |
| `maintenance.svg`        | Under maintenance   | Next   |
| `scheduled-downtime.svg` | Planned downtime    | Future |
| `system-upgrade.svg`     | System upgrade      | Future |
| `coming-soon.svg`        | Feature coming soon | Next   |

### 3.6 `illustrations/medical/` — `<scene>.svg` (domain hero art)

| File                      | Description                 | When   |
| ------------------------- | --------------------------- | ------ |
| `consultation-scene.svg`  | Doctor–patient consultation | Next   |
| `prescription-scene.svg`  | Prescription issued         | Next   |
| `vitals-check.svg`        | Vitals captured             | Next   |
| `appointment-scene.svg`   | Appointment booked          | Next   |
| `checkup-scene.svg`       | General check-up            | Future |
| `lab-report-scene.svg`    | Lab report ready            | Future |
| `pharmacy-counter.svg`    | Pharmacy / dispensing       | Future |
| `vaccination-scene.svg`   | Vaccination                 | Future |
| `telemedicine-scene.svg`  | Video consultation          | Future |
| `health-record-scene.svg` | Health record / file        | Future |
| `reception-scene.svg`     | Front-desk / reception      | Future |
| `clinic-building.svg`     | Clinic premises             | Future |
| `doctor-portrait.svg`     | Doctor portrait scene       | Future |
| `patient-care.svg`        | Caring for patient          | Future |
| `wellness-scene.svg`      | Wellness / healthy living   | Future |

### 3.7 `illustrations/offline/` — `offline[-state].svg`

| File                   | Description                | When   |
| ---------------------- | -------------------------- | ------ |
| `offline.svg`          | You're offline             | Now    |
| `offline-queued.svg`   | Changes saved to Outbox    | Now    |
| `offline-syncing.svg`  | Reconnecting / syncing     | Next   |
| `offline-synced.svg`   | Back online, synced        | Next   |
| `offline-conflict.svg` | Sync conflict needs review | Future |

### 3.8 `illustrations/onboarding/` — `<step>.svg`

| File                     | Description                | When   |
| ------------------------ | -------------------------- | ------ |
| `welcome.svg`            | Welcome to ClinicOS        | Next   |
| `setup-clinic.svg`       | Set up your clinic         | Future |
| `add-staff.svg`          | Invite your team           | Future |
| `branding.svg`           | Customise branding / theme | Future |
| `first-patient.svg`      | Add first patient          | Future |
| `all-set.svg`            | Setup complete             | Future |
| `tour-queue.svg`         | Tour slide — live queue    | Future |
| `tour-vitals.svg`        | Tour slide — vitals        | Future |
| `tour-prescriptions.svg` | Tour slide — prescribing   | Future |

### 3.9 `illustrations/success/` — `<concept>.svg`

| File                       | Description           | When   |
| -------------------------- | --------------------- | ------ |
| `success-generic.svg`      | Done!                 | Now    |
| `saved.svg`                | Saved successfully    | Now    |
| `submitted.svg`            | Submitted             | Now    |
| `appointment-booked.svg`   | Appointment confirmed | Next   |
| `checked-in.svg`           | Patient checked in    | Next   |
| `prescription-sent.svg`    | Prescription issued   | Future |
| `payment-success.svg`      | Payment received      | Future |
| `vaccination-recorded.svg` | Vaccination recorded  | Future |
| `discharged.svg`           | Patient discharged    | Future |

---

## 4. `avatars/`

> Served family · registry keys `avatar.*`. Pattern `avatar-<role>.svg`; full role words.

### 4.1 `avatars/placeholders/` — `avatar-<role>.svg`

| File                        | Description                                       | When   |
| --------------------------- | ------------------------------------------------- | ------ |
| `avatar-patient.svg`        | Default patient avatar (`avatar.patient`)         | Now    |
| `avatar-doctor.svg`         | Default doctor avatar (`avatar.doctor`)           | Now    |
| `avatar-organization.svg`   | Default clinic/org avatar (`avatar.organization`) | Now    |
| `avatar-staff.svg`          | Generic staff member                              | Now    |
| `avatar-unknown.svg`        | Anonymous / unknown user                          | Now    |
| `avatar-patient-male.svg`   | Patient (male default)                            | Next   |
| `avatar-patient-female.svg` | Patient (female default)                          | Next   |
| `avatar-patient-other.svg`  | Patient (non-binary default)                      | Next   |
| `avatar-child.svg`          | Paediatric default                                | Future |
| `avatar-nurse.svg`          | Default nurse                                     | Future |
| `avatar-receptionist.svg`   | Default receptionist                              | Future |
| `avatar-pharmacist.svg`     | Default pharmacist                                | Future |

### 4.2 `avatars/patterns/` — `pattern-avatar-<name>.svg` (initials-avatar backgrounds)

| File                                              | Description                           | When                       |
| ------------------------------------------------- | ------------------------------------- | -------------------------- |
| `pattern-avatar-01.svg` … `pattern-avatar-08.svg` | 8 background tiles, one per chart hue | Now (01–04) / Next (05–08) |
| `pattern-avatar-coral.svg`                        | Brand coral gradient fill             | Next                       |
| `pattern-avatar-sage.svg`                         | Brand sage gradient fill              | Next                       |
| `pattern-avatar-clay.svg`                         | Brand clay gradient fill              | Future                     |
| `pattern-avatar-sand.svg`                         | Brand sand gradient fill              | Future                     |

---

## 5. `images/`

### 5.1 `images/backgrounds/` — `bg-<context>.<ext>`

| File                    | Description                  | When   |
| ----------------------- | ---------------------------- | ------ |
| `bg-login.svg`          | Auth-screen backdrop         | Now    |
| `bg-error.svg`          | Error-page backdrop          | Now    |
| `bg-gradient-light.svg` | Light-theme gradient mesh    | Now    |
| `bg-gradient-dark.svg`  | Dark-theme gradient mesh     | Now    |
| `bg-dashboard.svg`      | Dashboard header backdrop    | Next   |
| `bg-onboarding.svg`     | Onboarding backdrop          | Next   |
| `bg-app-shell.svg`      | App-shell subtle background  | Future |
| `bg-print-header.svg`   | Print / PDF header band      | Future |
| `bg-noise.png`          | Subtle noise texture overlay | Future |

### 5.2 `images/patterns/` — `pattern-<name>.<ext>`

| File                     | Description               | When   |
| ------------------------ | ------------------------- | ------ |
| `pattern-dots.svg`       | Dot-grid tile             | Now    |
| `pattern-grid.svg`       | Line-grid tile            | Now    |
| `pattern-plus.svg`       | Plus / health motif       | Next   |
| `pattern-cross.svg`      | Subtle medical-cross tile | Future |
| `pattern-waves.svg`      | Calm waves                | Future |
| `pattern-hexagon.svg`    | Hex mesh                  | Future |
| `pattern-topography.svg` | Topographic lines         | Future |

---

## 6. `animations/lottie/` — `<concept>.json`

| File                   | Description                   | When   |
| ---------------------- | ----------------------------- | ------ |
| `loading-spinner.json` | Brand loading spinner         | Now    |
| `loading-dots.json`    | Inline dots loader            | Now    |
| `success-check.json`   | Success checkmark             | Now    |
| `sync-success.json`    | Outbox sync complete          | Next   |
| `error-cross.json`     | Error animation               | Next   |
| `empty-box.json`       | Empty-state float             | Next   |
| `offline-cloud.json`   | Offline / cloud state         | Next   |
| `otp-sent.json`        | OTP sent                      | Future |
| `heartbeat.json`       | Pulse / vitals motion         | Future |
| `payment-success.json` | Payment success               | Future |
| `confetti.json`        | Celebration (onboarding done) | Future |

---

## 7. `documents/`

> `<document>-<part>.svg`; print-safe / monochrome; never bake localizable text.

### 7.1 `documents/pdf/` — letterheads & report frames

| File                            | Description                          | When   |
| ------------------------------- | ------------------------------------ | ------ |
| `prescription-header.svg`       | Prescription letterhead              | Future |
| `prescription-footer.svg`       | Prescription footer / signature band | Future |
| `invoice-header.svg`            | Invoice letterhead                   | Future |
| `invoice-footer.svg`            | Invoice footer                       | Future |
| `lab-report-header.svg`         | Lab-report header                    | Future |
| `referral-header.svg`           | Referral-letter header               | Future |
| `discharge-summary-header.svg`  | Discharge-summary header             | Future |
| `medical-certificate-frame.svg` | Medical / fitness certificate frame  | Future |
| `signature-line.svg`            | Doctor signature block               | Future |

### 7.2 `documents/print/` — counter / hand-out artifacts

| File                         | Description               | When   |
| ---------------------------- | ------------------------- | ------ |
| `prescription-watermark.svg` | Prescription watermark    | Future |
| `invoice-watermark.svg`      | Invoice watermark         | Future |
| `token-slip.svg`             | Queue token-slip layout   | Future |
| `appointment-card.svg`       | Appointment card          | Future |
| `clinic-stamp.svg`           | Clinic stamp / seal frame | Future |
| `qr-placeholder.svg`         | QR-code slot art          | Future |

---

## 8. Favicons / social / splash (`public/`)

> Tier-2 platform assets referenced by the HTML doc / web manifest — they follow
> **platform conventions**, live under `public/`, and are **not** in `src/assets/`
> (see [NamingStandards.md §6](./NamingStandards.md#6-favicon--social--splash-naming)).

| File                                        | Description                                       | When |
| ------------------------------------------- | ------------------------------------------------- | ---- |
| `public/favicons/favicon.ico`               | Classic multi-size favicon                        | Now  |
| `public/favicons/favicon.svg`               | Modern scalable favicon                           | Now  |
| `public/favicons/favicon-16x16.png`         | 16×16 PNG fallback                                | Now  |
| `public/favicons/favicon-32x32.png`         | 32×32 PNG fallback                                | Now  |
| `public/favicons/apple-touch-icon.png`      | iOS home-screen icon (180×180)                    | Now  |
| `public/favicons/icon-192-maskable.png`     | PWA maskable icon 192                             | Now  |
| `public/favicons/icon-512-maskable.png`     | PWA maskable icon 512                             | Now  |
| `public/social-preview/og-default.png`      | Open-Graph share card (1200×630)                  | Next |
| `public/social-preview/twitter-default.png` | Twitter/X share card                              | Next |
| `public/splash/splash-1170x2532.png`        | iOS splash (device-targeted; add sizes as needed) | Next |

---

## Counts & rollout

~ **190 named assets** across the 25 source folders + `public/` platform assets —
roughly **Now ≈ 55 · Next ≈ 55 · Future ≈ 80**. Ship the `Now` set first
(brand, core empty/error/loading/offline states, status icons, default avatars,
favicons), then fill `Next`/`Future` as each module lands. **Every shipped file
must be added as a row in [PROJECT_BRAIN.md §32 Asset Registry](../brain/PROJECT_BRAIN.md)**
with its license, and — if served — registered in
[`assets.ts`](../../src/shared/config/assets.ts) before use.
