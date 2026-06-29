# Motion

> Part 8 — the shipped duration/ease tokens, motion presets, framer-motion usage, and the
> reduced-motion contract. The "calm by default" rationale lives in
> **[Frontend-Bible.md §10](../Frontend-Bible.md#10-motion)**. Siblings: [README](./README.md) ·
> [DesignTokens](./DesignTokens.md) · [Theme](./Theme.md).

Motion communicates state change and spatial relationship — it **never decorates** clinical data.

---

## 8.1 Durations (primitives)

| Token                | Value | Tailwind class     | `tokens.ts` (ms / s)     | Use                    |
| -------------------- | ----- | ------------------ | ------------------------ | ---------------------- |
| `--duration-instant` | 75ms  | `duration-instant` | `durations.instant` = 75 | Micro state            |
| `--duration-fast`    | 150ms | `duration-fast`    | `durations.fast` = 150   | Hover, focus, press    |
| `--duration-base`    | 220ms | `duration-base`    | `durations.base` = 220   | Default UI transitions |
| `--duration-slow`    | 320ms | `duration-slow`    | `durations.slow` = 320   | Drawer / modal enter   |
| `--duration-slower`  | 480ms | `duration-slower`  | `durations.slower` = 480 | Large surface (rare)   |

Nothing animates longer than `--duration-slower`.

## 8.2 Easings (primitives)

| Token               | Value                      | Tailwind class    | `tokens.ts` array                   | Use                |
| ------------------- | -------------------------- | ----------------- | ----------------------------------- | ------------------ |
| `--ease-standard`   | `cubic-bezier(.2,0,0,1)`   | `ease-standard`   | `easings.standard` `[.2,0,0,1]`     | Enter/exit default |
| `--ease-decelerate` | `cubic-bezier(0,0,0,1)`    | `ease-decelerate` | `easings.decelerate` `[0,0,0,1]`    | Entering           |
| `--ease-accelerate` | `cubic-bezier(.3,0,1,1)`   | `ease-accelerate` | `easings.accelerate` `[.3,0,1,1]`   | Exiting            |
| `--ease-emphasized` | `cubic-bezier(.2,0,0,1.2)` | `ease-emphasized` | `easings.emphasized` `[.2,0,0,1.2]` | Gentle, rare       |

---

## 8.3 Motion presets

`motionPresets` in `src/shared/theme/tokens.ts` ship framer-motion variants: `fadeIn`, `slideUp`,
`drawerRight`, `dialogPop`. Each takes a `reduced` flag and degrades to an instant, non-animated state
when true (see §8.5). Keyframes for CSS-driven motion ship in `components.css`: `cos-skeleton-shimmer`
(skeleton shimmer) and `cos-spin` (spinner) — both disabled under reduced motion.

| Preset        | Used for          | Duration / ease                        |
| ------------- | ----------------- | -------------------------------------- |
| `fadeIn`      | Content reveal    | `base` / `standard`                    |
| `slideUp`     | Toast, inline     | `base` / `decelerate`                  |
| `drawerRight` | Drawer enter/exit | `slow` / decelerate in, accelerate out |
| `dialogPop`   | Dialog enter      | `slow` / `emphasized` (gentle)         |

---

## JS tokens

`src/shared/theme/tokens.ts` (re-exported from `src/shared/theme/index.ts`) is the JS-side mirror for
libraries that need numbers/arrays — **CSS tokens remain the source of truth for color/space**. It
exports, all `as const`:

- `durations` (ms numbers) and `durationsSec` (seconds, for framer-motion `transition.duration`).
- `easings` (cubic-bezier arrays) — pass directly to framer-motion `transition.ease`.
- `motionPresets` (the variants above).
- `breakpoints` `{ sm:640, md:768, lg:1024, xl:1280, '2xl':1536 }`.
- `chartColorVars` (`'var(--color-chart-N)'` strings — **prefer these** so charts re-theme) + raw hex.
- `zIndex`, `iconSizes` `{ xs:16…xl:40 }`, `iconStroke` (2).

```tsx
import { motion } from 'framer-motion';
import { durationsSec, easings } from '@shared/theme';

<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: durationsSec.base, ease: easings.standard }}
/>;
```

---

## 8.4 When motion is allowed

| Allowed                                             | Not allowed                                     |
| --------------------------------------------------- | ----------------------------------------------- |
| Hover/focus/press feedback (`fast`)                 | Looping / auto-playing animation on data        |
| Overlay enter/exit (`slow`, decelerate/accelerate)  | Parallax, confetti, bounce on clinical surfaces |
| Skeleton shimmer (subtle, off under reduced-motion) | Motion as the **only** signal of a state        |
| Toast slide-in (`base`)                             | Anything longer than `--duration-slower`        |

---

## 8.5 The reduced-motion contract

> **Essential feedback degrades — it is never removed.** A saved toast still appears under reduced
> motion; it simply doesn't slide.

Three layers enforce it:

1. **Global CSS** (`themes.css`): `@media (prefers-reduced-motion: reduce)` clamps all
   animation/transition durations to `0.01ms`.
2. **User override** (`shared/theme/theme.ts`): `data-motion="reduced"` on `<html>` forces the same
   path regardless of the OS setting; `data-motion="normal"` opts back in.
3. **Component utilities**: Tailwind `motion-reduce:transition-none` / `motion-reduce:animate-none`,
   and framer-motion presets read the `reduced` flag (from `isReducedMotion()`).

Keyframes `cos-skeleton-shimmer` and `cos-spin` are gated by all three — the placeholder/spinner still
renders, just statically.

---

## Accessibility & usage note

Never make motion the sole carrier of meaning (Bible §9.7). Respect the user/OS preference everywhere;
clinical surfaces stay calm — quiet 150–250ms feedback, no attention-grabbing animation.
