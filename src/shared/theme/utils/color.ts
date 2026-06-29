/**
 * color.ts — pure color math for the Theme Engine (no DOM, no deps).
 *
 * Real conversions (hex ⇄ rgb ⇄ hsl), sRGB relative luminance (WCAG 2.x), and
 * perceptual-ish lighten/darken used by the shade generator. Everything is a
 * pure function so the generator, contrast checker, and tests stay deterministic.
 *
 * Governed by: Phase 5 BUILD SPEC §UTILS (color.ts). Logic only — never
 * hardcodes a visual token value.
 */

/** An 8-bit RGB triple (each channel 0..255). */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** An HSL triple (h 0..360, s/l 0..100). */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

const HEX_SHORT = /^#?([0-9a-fA-F]{3})$/;
const HEX_LONG = /^#?([0-9a-fA-F]{6})$/;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Round and clamp a raw channel to a valid 0..255 byte. */
function toByte(value: number): number {
  return clamp(Math.round(value), 0, 255);
}

/**
 * normalizeHex — accept `#abc`, `abc`, `#aabbcc`, `AABBCC` and return a
 * canonical lowercase 6-digit `#rrggbb`. Throws on anything that is not a hex
 * color so callers fail loudly instead of silently theming with garbage.
 */
export function normalizeHex(hex: string): string {
  const short = HEX_SHORT.exec(hex);
  if (short) {
    // The regex guarantees a 3-char capture group; expand each char to a pair.
    const group = short[1] ?? '';
    const r = group.charAt(0);
    const g = group.charAt(1);
    const b = group.charAt(2);
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const long = HEX_LONG.exec(hex);
  if (long) return `#${(long[1] ?? '').toLowerCase()}`;
  throw new Error(`Invalid hex color: "${hex}"`);
}

/** hexToRgb — parse any accepted hex form into an {@link Rgb}. */
export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

/** rgbToHex — serialize an {@link Rgb} back to canonical `#rrggbb`. */
export function rgbToHex(rgb: Rgb): string {
  const hex = (channel: number): string => toByte(channel).toString(16).padStart(2, '0');
  return `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`;
}

/** rgbToHsl — convert 0..255 RGB to HSL (h 0..360, s/l 0..100). */
export function rgbToHsl(rgb: Rgb): Hsl {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

/** hslToRgb — convert HSL (h 0..360, s/l 0..100) back to 0..255 RGB. */
export function hslToRgb(hsl: Hsl): Rgb {
  const h = (((hsl.h % 360) + 360) % 360) / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;

  if (s === 0) {
    const value = l * 255;
    return { r: value, g: value, b: value };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  };
}

/**
 * lighten — move a color toward white by `amount` (0..1) in HSL lightness space.
 * `lighten(hex, 0)` returns the input; `lighten(hex, 1)` returns white.
 */
export function lighten(hex: string, amount: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  const amt = clamp(amount, 0, 1);
  return rgbToHex(hslToRgb({ ...hsl, l: hsl.l + (100 - hsl.l) * amt }));
}

/**
 * darken — move a color toward black by `amount` (0..1) in HSL lightness space.
 * `darken(hex, 0)` returns the input; `darken(hex, 1)` returns black.
 */
export function darken(hex: string, amount: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  const amt = clamp(amount, 0, 1);
  return rgbToHex(hslToRgb({ ...hsl, l: hsl.l - hsl.l * amt }));
}

/** Linearize a single sRGB channel (0..255) per the WCAG 2.x formula. */
function linearizeChannel(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * relativeLuminance — WCAG 2.x relative luminance of an sRGB color (0..1, where
 * black = 0 and white = 1). Used by the contrast-ratio computation.
 */
export function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * linearizeChannel(rgb.r) +
    0.7152 * linearizeChannel(rgb.g) +
    0.0722 * linearizeChannel(rgb.b)
  );
}
