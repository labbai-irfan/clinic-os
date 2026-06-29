# ClinicOS — Asset Catalog (every image / SVG, now & future)

> **Scope.** The complete, named inventory of every brand mark, icon, illustration,
> avatar, background, pattern, animation, and document asset ClinicOS needs — for
> the current foundation **and** every future module. One row = one file.
> This is the **naming contract**: build artwork to these names so code can import
> them before the art exists.
>
> **Anchors:** [src/assets/README.md](../../src/assets/README.md) · Asset Registry =
> [PROJECT_BRAIN.md §32](../brain/PROJECT_BRAIN.md) · naming law =
> [NamingConvention.md](../architecture/NamingConvention.md) (kebab-case, singular,
> domain-named — e.g. `empty-queue.svg`, never `EmptyQueue.SVG`).

## Conventions

- **Format:** `.svg` for all line/flat art & icons; `.json` for Lottie; `.png`/`.webp`
  only for raster textures & PWA icons.
- **Theming:** icons use `currentColor` (no baked fills); illustrations use semantic
  token colors so dark / high-contrast themes recolor automatically.
- **No baked text:** never embed localizable words in artwork — caption in the UI layer.
- **A11y:** decorative art is `aria-hidden`; meaningful art gets a localized `alt`.
- **Optimize:** run `pnpm optimize:svg` before commit.

**When legend** — `Now` = needed by the current foundation + UI kit + the imminent
Auth / App-Shell phase · `Next` = first feature modules (appointments, queue,
consultation, vitals) · `Future` = later modules (pharmacy, billing, records,
follow-up, reports, telemedicine, documents).

---

## 0. Folder structure

```
src/assets/
├── brand/
│   ├── logos/          # primary lockups, symbol, wordmark, app icon, favicon
│   ├── monochrome/     # single-colour (black / white / currentColor)
│   ├── themed/         # light / dark / high-contrast tuned marks
│   └── watermarks/     # faint marks for docs & empty backgrounds
├── icons/              # custom SVG sources NOT in lucide-react (lucide is default)
│   ├── brand/          # third-party logos (OAuth, payments, integrations)
│   ├── medical/        # clinical glyphs lucide lacks
│   ├── navigation/     # module / sidebar glyphs
│   ├── action/         # domain verbs (prescribe, dispense, check-in…)
│   └── status/         # queue / vital / sync / payment status glyphs
├── illustrations/
│   ├── authentication/ # login, OTP, reset, session
│   ├── empty-states/   # one per list/module "nothing here yet"
│   ├── error-states/   # 404 / 403 / 500 / network / crash
│   ├── loading/        # context loaders
│   ├── maintenance/    # downtime / upgrade / coming-soon
│   ├── medical/        # domain hero art (consultation, vitals, pharmacy…)
│   ├── offline/        # disconnected / outbox-queued / synced
│   ├── onboarding/     # welcome / setup wizard / tour
│   └── success/        # confirmations & celebrations
├── avatars/
│   ├── placeholders/   # default person / role / clinic avatars
│   └── patterns/       # generated-avatar background tiles (8-hue)
├── images/
│   ├── backgrounds/    # screen & print backdrops, gradients
│   └── patterns/       # tileable decorative patterns
├── animations/
│   └── lottie/         # JSON motion (reduced-motion gated at consumer)
└── documents/
    ├── pdf/            # prescription / invoice / report letterheads
    └── print/          # token slips, stamps, cards
```

---

## 1. `brand/`

### 1.1 `brand/logos/`

| File                  | Description                                | When   |
| --------------------- | ------------------------------------------ | ------ |
| `logo-full.svg`       | Primary lockup — symbol + wordmark         | Now    |
| `logo-symbol.svg`     | Standalone "C" symbol mark                 | Now    |
| `logo-wordmark.svg`   | Text-only "ClinicOS" wordmark              | Now    |
| `logo-horizontal.svg` | Symbol left of wordmark                    | Now    |
| `logo-stacked.svg`    | Symbol above wordmark (vertical)           | Now    |
| `logo-app-icon.svg`   | Rounded-square launcher icon               | Now    |
| `favicon.svg`         | Scalable browser favicon                   | Now    |
| `logo-tagline.svg`    | Lockup + "Clinic Operating System" tagline | Future |
| `logo-emblem.svg`     | Circular badge / seal variant              | Future |

### 1.2 `brand/monochrome/`

| File                         | Description                            | When |
| ---------------------------- | -------------------------------------- | ---- |
| `logo-mono-black.svg`        | Solid black single-colour lockup       | Now  |
| `logo-mono-white.svg`        | Solid white (dark / photo backgrounds) | Now  |
| `logo-symbol-mono-black.svg` | Black symbol only                      | Now  |
| `logo-symbol-mono-white.svg` | White symbol only                      | Now  |
| `logo-mono-currentcolor.svg` | Inherits `currentColor` for theming    | Now  |

### 1.3 `brand/themed/`

| File                     | Description                  | When |
| ------------------------ | ---------------------------- | ---- |
| `logo-light.svg`         | Lockup tuned for light theme | Now  |
| `logo-dark.svg`          | Lockup tuned for dark theme  | Now  |
| `logo-high-contrast.svg` | High-contrast theme lockup   | Now  |
| `logo-symbol-light.svg`  | Symbol, light theme          | Next |
| `logo-symbol-dark.svg`   | Symbol, dark theme           | Next |

### 1.4 `brand/watermarks/`

| File                         | Description                               | When   |
| ---------------------------- | ----------------------------------------- | ------ |
| `watermark-logo.svg`         | Faint full-logo watermark                 | Now    |
| `watermark-symbol.svg`       | Symbol-only tileable watermark            | Future |
| `watermark-rx.svg`           | Prescription paper watermark              | Future |
| `watermark-invoice.svg`      | Invoice / billing watermark               | Future |
| `watermark-confidential.svg` | Diagonal "Confidential" stamp for records | Future |

---

## 2. `icons/` (custom SVG sources only — lucide-react is the default set)

### 2.1 `icons/brand/` — third-party / integration marks

| File                     | Description                      | When   |
| ------------------------ | -------------------------------- | ------ |
| `icon-clinicos.svg`      | App glyph for menus / tabs       | Now    |
| `logo-google.svg`        | Google "G" — OAuth sign-in       | Now    |
| `logo-abha.svg`          | ABHA / Ayushman Bharat Health ID | Future |
| `logo-digilocker.svg`    | DigiLocker document import       | Future |
| `logo-whatsapp.svg`      | WhatsApp patient comms           | Future |
| `logo-microsoft.svg`     | Microsoft sign-in                | Future |
| `logo-apple.svg`         | Apple sign-in                    | Future |
| `logo-upi.svg`           | UPI payments mark                | Future |
| `logo-razorpay.svg`      | Razorpay gateway                 | Future |
| `logo-stripe.svg`        | Stripe gateway                   | Future |
| `payment-visa.svg`       | Visa card network                | Future |
| `payment-mastercard.svg` | Mastercard network               | Future |
| `payment-rupay.svg`      | RuPay network                    | Future |
| `payment-amex.svg`       | American Express network         | Future |

### 2.2 `icons/medical/` — clinical glyphs lucide lacks

| File                       | Description                  | When   |
| -------------------------- | ---------------------------- | ------ |
| `med-stethoscope.svg`      | Stethoscope — consultation   | Now    |
| `med-cross.svg`            | Medical cross brand accent   | Now    |
| `med-rx.svg`               | ℞ prescription symbol        | Next   |
| `med-heartbeat.svg`        | Pulse / heart rate           | Next   |
| `med-blood-pressure.svg`   | BP cuff / sphygmomanometer   | Next   |
| `med-thermometer.svg`      | Temperature                  | Next   |
| `med-weight-scale.svg`     | Weight                       | Next   |
| `med-height.svg`           | Height / stadiometer         | Next   |
| `med-spo2.svg`             | Oxygen saturation / pulse-ox | Next   |
| `med-respiratory-rate.svg` | Breathing rate               | Next   |
| `med-bmi.svg`              | Body-mass index              | Next   |
| `med-glucometer.svg`       | Blood glucose meter          | Future |
| `med-pill.svg`             | Pill / tablet                | Next   |
| `med-capsule.svg`          | Capsule                      | Future |
| `med-syringe.svg`          | Injection / vaccine          | Future |
| `med-vaccine.svg`          | Vaccination                  | Future |
| `med-iv-drip.svg`          | IV drip                      | Future |
| `med-blood-drop.svg`       | Blood sample                 | Future |
| `med-test-tube.svg`        | Lab sample                   | Future |
| `med-microscope.svg`       | Lab / pathology              | Future |
| `med-ecg.svg`              | ECG / cardiac trace          | Future |
| `med-xray.svg`             | X-ray / radiology            | Future |
| `med-ultrasound.svg`       | Ultrasound / scan            | Future |
| `med-tooth.svg`            | Dental                       | Future |
| `med-eye.svg`              | Ophthalmology                | Future |
| `med-ear.svg`              | ENT                          | Future |
| `med-lungs.svg`            | Pulmonology                  | Future |
| `med-brain.svg`            | Neurology                    | Future |
| `med-bone.svg`             | Orthopaedics                 | Future |
| `med-kidney.svg`           | Nephrology                   | Future |
| `med-stomach.svg`          | Gastroenterology             | Future |
| `med-skin.svg`             | Dermatology                  | Future |
| `med-pregnancy.svg`        | Obstetrics / antenatal       | Future |
| `med-baby.svg`             | Paediatrics                  | Future |
| `med-dna.svg`              | Genetics / diagnostics       | Future |
| `med-allergy.svg`          | Allergy flag                 | Future |
| `med-mortar-pestle.svg`    | Pharmacy / compounding       | Future |
| `med-ambulance.svg`        | Emergency transport          | Future |
| `med-hospital-bed.svg`     | Admission / IPD              | Future |
| `med-wheelchair.svg`       | Accessibility / mobility     | Future |
| `med-first-aid.svg`        | First-aid kit                | Future |
| `med-mask.svg`             | PPE mask                     | Future |
| `med-gloves.svg`           | PPE gloves                   | Future |

### 2.3 `icons/navigation/` — module / sidebar glyphs

| File                    | Description         | When   |
| ----------------------- | ------------------- | ------ |
| `nav-dashboard.svg`     | Dashboard / home    | Now    |
| `nav-patients.svg`      | Patients module     | Now    |
| `nav-appointments.svg`  | Appointments module | Now    |
| `nav-queue.svg`         | Live queue          | Now    |
| `nav-consultation.svg`  | Consultation / OPD  | Next   |
| `nav-prescriptions.svg` | Prescriptions       | Next   |
| `nav-pharmacy.svg`      | Pharmacy            | Future |
| `nav-billing.svg`       | Billing / invoices  | Future |
| `nav-follow-up.svg`     | Follow-ups          | Future |
| `nav-records.svg`       | Medical records     | Future |
| `nav-reports.svg`       | Reports / analytics | Future |
| `nav-settings.svg`      | Settings            | Now    |
| `nav-help.svg`          | Help / support      | Now    |

### 2.4 `icons/action/` — domain verbs

| File                         | Description           | When   |
| ---------------------------- | --------------------- | ------ |
| `action-check-in.svg`        | Check patient in      | Next   |
| `action-call-next.svg`       | Call next in queue    | Next   |
| `action-record-vitals.svg`   | Record vitals         | Next   |
| `action-prescribe.svg`       | Write prescription    | Next   |
| `action-dispense.svg`        | Dispense medicine     | Future |
| `action-collect-payment.svg` | Collect payment       | Future |
| `action-book-slot.svg`       | Book appointment slot | Next   |
| `action-reschedule.svg`      | Reschedule visit      | Future |
| `action-cancel-visit.svg`    | Cancel visit          | Future |
| `action-refer.svg`           | Refer to specialist   | Future |
| `action-admit.svg`           | Admit patient         | Future |
| `action-discharge.svg`       | Discharge patient     | Future |
| `action-print-rx.svg`        | Print prescription    | Future |

### 2.5 `icons/status/` — queue / vital / sync / payment status

| File                         | Description            | When   |
| ---------------------------- | ---------------------- | ------ |
| `status-scheduled.svg`       | Appointment scheduled  | Now    |
| `status-checked-in.svg`      | Checked in / arrived   | Next   |
| `status-waiting.svg`         | Waiting in queue       | Now    |
| `status-in-consultation.svg` | In consultation        | Next   |
| `status-completed.svg`       | Visit completed        | Now    |
| `status-no-show.svg`         | Patient no-show        | Next   |
| `status-cancelled.svg`       | Cancelled              | Now    |
| `status-emergency.svg`       | Emergency / triage red | Next   |
| `status-critical.svg`        | Vital critical         | Next   |
| `status-stable.svg`          | Vital stable           | Next   |
| `status-online.svg`          | Connected              | Now    |
| `status-offline.svg`         | Disconnected           | Now    |
| `status-syncing.svg`         | Outbox syncing         | Now    |
| `status-sync-error.svg`      | Sync conflict / failed | Next   |
| `status-paid.svg`            | Invoice paid           | Future |
| `status-partial.svg`         | Partially paid         | Future |
| `status-unpaid.svg`          | Unpaid / due           | Future |

---

## 3. `illustrations/`

### 3.1 `illustrations/authentication/`

| File                       | Description                | When   |
| -------------------------- | -------------------------- | ------ |
| `auth-login.svg`           | Friendly login hero        | Now    |
| `auth-welcome.svg`         | Welcome side panel         | Now    |
| `auth-otp.svg`             | OTP / verification entry   | Next   |
| `auth-forgot-password.svg` | Reset-password prompt      | Next   |
| `auth-reset-success.svg`   | Password changed           | Next   |
| `auth-2fa.svg`             | Two-factor security shield | Future |
| `auth-locked.svg`          | Account locked             | Future |
| `auth-session-expired.svg` | Session timed out          | Next   |
| `auth-logout.svg`          | Signed out / see you soon  | Next   |
| `auth-invite.svg`          | Staff invitation accept    | Future |

### 3.2 `illustrations/empty-states/`

| File                       | Description           | When   |
| -------------------------- | --------------------- | ------ |
| `empty-search.svg`         | No search results     | Now    |
| `empty-notifications.svg`  | No notifications      | Now    |
| `empty-queue.svg`          | Queue is clear        | Now    |
| `empty-patients.svg`       | No patients yet       | Now    |
| `empty-appointments.svg`   | No appointments       | Now    |
| `empty-inbox.svg`          | No messages           | Next   |
| `empty-tasks.svg`          | No tasks              | Next   |
| `empty-calendar.svg`       | No events today       | Next   |
| `empty-vitals.svg`         | No vitals recorded    | Next   |
| `empty-prescriptions.svg`  | No prescriptions      | Next   |
| `empty-allergies.svg`      | No known allergies    | Future |
| `empty-lab-results.svg`    | No lab results        | Future |
| `empty-pharmacy-stock.svg` | Stock empty           | Future |
| `empty-cart.svg`           | Pharmacy cart empty   | Future |
| `empty-invoices.svg`       | No invoices           | Future |
| `empty-records.svg`        | No medical records    | Future |
| `empty-follow-ups.svg`     | No follow-ups         | Future |
| `empty-reports.svg`        | No reports            | Future |
| `empty-documents.svg`      | No documents          | Future |
| `empty-favorites.svg`      | No favourites / saved | Future |

### 3.3 `illustrations/error-states/`

| File                       | Description                     | When   |
| -------------------------- | ------------------------------- | ------ |
| `error-404.svg`            | Page not found                  | Now    |
| `error-403.svg`            | Access denied / no permission   | Now    |
| `error-500.svg`            | Server error                    | Now    |
| `error-generic.svg`        | Something went wrong            | Now    |
| `error-network.svg`        | Connection failed               | Now    |
| `error-boundary.svg`       | Crash / error-boundary fallback | Now    |
| `error-timeout.svg`        | Request timed out               | Next   |
| `error-not-supported.svg`  | Browser / device unsupported    | Future |
| `error-upload-failed.svg`  | Upload failed                   | Future |
| `error-payment-failed.svg` | Payment failed                  | Future |

### 3.4 `illustrations/loading/`

| File                             | Description         | When   |
| -------------------------------- | ------------------- | ------ |
| `loading-default.svg`            | Generic loading art | Now    |
| `loading-data.svg`               | Fetching data       | Next   |
| `loading-search.svg`             | Searching           | Next   |
| `loading-syncing.svg`            | Sync in progress    | Next   |
| `loading-processing-payment.svg` | Payment processing  | Future |
| `loading-generating-report.svg`  | Generating report   | Future |

### 3.5 `illustrations/maintenance/`

| File                        | Description         | When   |
| --------------------------- | ------------------- | ------ |
| `maintenance-progress.svg`  | Under maintenance   | Next   |
| `maintenance-scheduled.svg` | Planned downtime    | Future |
| `maintenance-upgrade.svg`   | System upgrade      | Future |
| `coming-soon.svg`           | Feature coming soon | Next   |

### 3.6 `illustrations/medical/` — domain hero art

| File                             | Description                 | When   |
| -------------------------------- | --------------------------- | ------ |
| `medical-consultation.svg`       | Doctor–patient consultation | Next   |
| `medical-prescription.svg`       | Prescription issued         | Next   |
| `medical-vitals-recorded.svg`    | Vitals captured             | Next   |
| `medical-appointment-booked.svg` | Appointment booked          | Next   |
| `medical-checkup.svg`            | General check-up            | Future |
| `medical-lab-report.svg`         | Lab report ready            | Future |
| `medical-pharmacy.svg`           | Pharmacy / dispensing       | Future |
| `medical-vaccination.svg`        | Vaccination                 | Future |
| `medical-telemedicine.svg`       | Video consultation          | Future |
| `medical-health-record.svg`      | Health record / file        | Future |
| `medical-reception.svg`          | Front-desk / reception      | Future |
| `medical-clinic-building.svg`    | Clinic premises             | Future |
| `medical-doctor.svg`             | Doctor portrait scene       | Future |
| `medical-patient-care.svg`       | Caring for patient          | Future |
| `medical-wellness.svg`           | Wellness / healthy living   | Future |

### 3.7 `illustrations/offline/`

| File                        | Description                | When   |
| --------------------------- | -------------------------- | ------ |
| `offline-disconnected.svg`  | You're offline             | Now    |
| `offline-queued.svg`        | Changes saved to Outbox    | Now    |
| `offline-reconnecting.svg`  | Reconnecting…              | Next   |
| `offline-synced.svg`        | Back online, synced        | Next   |
| `offline-sync-conflict.svg` | Sync conflict needs review | Future |

### 3.8 `illustrations/onboarding/`

| File                           | Description                | When   |
| ------------------------------ | -------------------------- | ------ |
| `onboarding-welcome.svg`       | Welcome to ClinicOS        | Next   |
| `onboarding-setup-clinic.svg`  | Set up your clinic         | Future |
| `onboarding-add-staff.svg`     | Invite your team           | Future |
| `onboarding-branding.svg`      | Customise branding / theme | Future |
| `onboarding-first-patient.svg` | Add first patient          | Future |
| `onboarding-complete.svg`      | All set — celebrate        | Future |
| `onboarding-tour-1.svg`        | Feature tour slide 1       | Future |
| `onboarding-tour-2.svg`        | Feature tour slide 2       | Future |
| `onboarding-tour-3.svg`        | Feature tour slide 3       | Future |

### 3.9 `illustrations/success/`

| File                             | Description           | When   |
| -------------------------------- | --------------------- | ------ |
| `success-generic.svg`            | Done!                 | Now    |
| `success-saved.svg`              | Saved successfully    | Now    |
| `success-submitted.svg`          | Submitted             | Now    |
| `success-appointment-booked.svg` | Appointment confirmed | Next   |
| `success-checked-in.svg`         | Patient checked in    | Next   |
| `success-prescription-sent.svg`  | Prescription issued   | Future |
| `success-payment.svg`            | Payment received      | Future |
| `success-vaccine-done.svg`       | Vaccination recorded  | Future |
| `success-discharge.svg`          | Patient discharged    | Future |

---

## 4. `avatars/`

### 4.1 `avatars/placeholders/`

| File                        | Description                   | When   |
| --------------------------- | ----------------------------- | ------ |
| `avatar-patient.svg`        | Default patient avatar        | Now    |
| `avatar-unknown.svg`        | Anonymous / unknown user      | Now    |
| `avatar-staff.svg`          | Generic staff member          | Now    |
| `avatar-clinic.svg`         | Clinic / org logo placeholder | Now    |
| `avatar-doctor.svg`         | Default doctor                | Now    |
| `avatar-patient-male.svg`   | Patient (male default)        | Next   |
| `avatar-patient-female.svg` | Patient (female default)      | Next   |
| `avatar-patient-other.svg`  | Patient (non-binary default)  | Next   |
| `avatar-child.svg`          | Paediatric default            | Future |
| `avatar-nurse.svg`          | Default nurse                 | Future |
| `avatar-receptionist.svg`   | Default receptionist          | Future |
| `avatar-pharmacist.svg`     | Default pharmacist            | Future |

### 4.2 `avatars/patterns/` — initials-avatar backgrounds (8-hue chart palette)

| File                                              | Description                           | When                       |
| ------------------------------------------------- | ------------------------------------- | -------------------------- |
| `avatar-pattern-01.svg` … `avatar-pattern-08.svg` | 8 background tiles, one per chart hue | Now (01–04) / Next (05–08) |
| `avatar-gradient-coral.svg`                       | Brand coral gradient fill             | Next                       |
| `avatar-gradient-sage.svg`                        | Brand sage gradient fill              | Next                       |
| `avatar-gradient-clay.svg`                        | Brand clay gradient fill              | Future                     |
| `avatar-gradient-sand.svg`                        | Brand sand gradient fill              | Future                     |

---

## 5. `images/`

### 5.1 `images/backgrounds/`

| File                    | Description                  | When   |
| ----------------------- | ---------------------------- | ------ |
| `bg-gradient-brand.svg` | Brand gradient mesh          | Now    |
| `bg-gradient-light.svg` | Light-theme gradient         | Now    |
| `bg-gradient-dark.svg`  | Dark-theme gradient          | Now    |
| `bg-error.svg`          | Error-page backdrop          | Now    |
| `bg-auth.svg`           | Auth-screen backdrop         | Now    |
| `bg-auth-pattern.svg`   | Subtle auth pattern          | Next   |
| `bg-dashboard-hero.svg` | Dashboard header backdrop    | Next   |
| `bg-app-shell.svg`      | App-shell subtle background  | Future |
| `bg-print-header.svg`   | Print / PDF header band      | Future |
| `bg-noise.png`          | Subtle noise texture overlay | Future |

### 5.2 `images/patterns/`

| File                        | Description               | When   |
| --------------------------- | ------------------------- | ------ |
| `pattern-dots.svg`          | Dot-grid tile             | Now    |
| `pattern-grid.svg`          | Line-grid tile            | Now    |
| `pattern-plus.svg`          | Plus / health motif       | Next   |
| `pattern-cross-medical.svg` | Subtle medical-cross tile | Future |
| `pattern-waves.svg`         | Calm waves                | Future |
| `pattern-hexagon.svg`       | Hex mesh                  | Future |
| `pattern-topography.svg`    | Topographic lines         | Future |

---

## 6. `animations/lottie/`

| File                   | Description                   | When   |
| ---------------------- | ----------------------------- | ------ |
| `loading-spinner.json` | Brand loading spinner         | Now    |
| `loading-dots.json`    | Inline dots loader            | Now    |
| `success-check.json`   | Success checkmark             | Now    |
| `syncing.json`         | Outbox sync spinner           | Next   |
| `error-cross.json`     | Error animation               | Next   |
| `empty-box.json`       | Empty-state float             | Next   |
| `offline-cloud.json`   | Offline / cloud state         | Next   |
| `otp-sent.json`        | OTP sent                      | Future |
| `heartbeat.json`       | Pulse / vitals motion         | Future |
| `payment-success.json` | Payment success               | Future |
| `confetti.json`        | Celebration (onboarding done) | Future |
| `pulse-loader.json`    | Skeleton pulse                | Future |

---

## 7. `documents/`

### 7.1 `documents/pdf/` — letterheads & report frames

| File                           | Description                          | When   |
| ------------------------------ | ------------------------------------ | ------ |
| `rx-header.svg`                | Prescription letterhead              | Future |
| `rx-footer.svg`                | Prescription footer / signature band | Future |
| `rx-watermark.svg`             | Prescription watermark               | Future |
| `invoice-header.svg`           | Invoice letterhead                   | Future |
| `invoice-footer.svg`           | Invoice footer                       | Future |
| `lab-report-header.svg`        | Lab-report header                    | Future |
| `referral-header.svg`          | Referral-letter header               | Future |
| `discharge-summary-header.svg` | Discharge-summary header             | Future |
| `certificate-medical.svg`      | Medical / fitness certificate frame  | Future |
| `signature-line.svg`           | Doctor signature block               | Future |

### 7.2 `documents/print/` — counter / hand-out artifacts

| File                         | Description                  | When   |
| ---------------------------- | ---------------------------- | ------ |
| `print-logo.svg`             | High-res mono logo for print | Future |
| `print-token-slip.svg`       | Queue token-slip layout      | Future |
| `print-appointment-card.svg` | Appointment card             | Future |
| `print-clinic-stamp.svg`     | Clinic stamp / seal frame    | Future |
| `print-qr-placeholder.svg`   | QR-code slot art             | Future |

---

## 8. Appendix — PWA & favicons (`public/`, runtime-served)

> Per [src/assets/README.md](../../src/assets/README.md), CDN-swappable / runtime
> artwork lives under `public/assets/**`, addressed via `assetUrl()`. Browser /
> install icons live at the public root.

| File                    | Description                    | When |
| ----------------------- | ------------------------------ | ---- |
| `favicon.ico`           | Legacy multi-size favicon      | Now  |
| `favicon.svg`           | Modern scalable favicon        | Now  |
| `apple-touch-icon.png`  | iOS home-screen icon (180×180) | Now  |
| `pwa-192.png`           | PWA icon 192×192               | Now  |
| `pwa-512.png`           | PWA icon 512×512               | Now  |
| `pwa-maskable-512.png`  | Maskable PWA icon (safe-zone)  | Now  |
| `og-image.png`          | Open-Graph / social share card | Next |
| `safari-pinned-tab.svg` | Safari pinned-tab mono mask    | Next |

---

### Counts

~ **180 named assets** across 25 folders — **Now ≈ 55**, **Next ≈ 50**, **Future ≈ 75**.
Every row is a build-to name; ship the `Now` set first, then fill `Next` / `Future`
per module. Add each shipped file as a row in
[PROJECT_BRAIN.md §32 Asset Registry](../brain/PROJECT_BRAIN.md) with its license.
