# ClinicOS — Source Assets (`src/assets/`)

Build-time **source** assets: imported in code and hashed/bundled by Vite. For
runtime-served / CDN-swappable artwork (logos, illustrations, avatars), use the
**Asset Registry** (`import { assetUrl } from '@shared/config'`) and place files
under `public/assets/**` — so the physical location can move to a CDN with zero
code edits.

Nothing is placed here ad-hoc. Every folder has a defined purpose, allowed file
types, naming rules, and optimization rules — the full per-folder contract is in
**[docs/assets/AssetArchitecture.md](../../docs/assets/AssetArchitecture.md)**.

| Folder               | Holds                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `brand/`             | Logos, monochrome, themed (light/dark), watermarks — SVG sources                                                      |
| `icons/`             | Custom SVG icon **sources** not in lucide. The semantic icon **registry** is code: `@shared/design-system` → `icons`. |
| `illustrations/`     | empty / error / loading / onboarding / authentication / success / offline / maintenance / medical artwork             |
| `avatars/`           | Default avatar placeholders + generated-avatar background patterns                                                    |
| `images/`            | Backgrounds, patterns                                                                                                 |
| `animations/lottie/` | Lottie/JSON motion (reduced-motion gated at the consumer)                                                             |
| `documents/`         | PDF / print branding sources (prescription & invoice headers, watermarks)                                             |

**Rules:** optimize every SVG (`pnpm optimize:svg`); icons use `currentColor`
(theme-aware); never bake localizable text into artwork; run `pnpm check:assets`
before committing. Full standards: [docs/assets/](../../docs/assets/README.md).
