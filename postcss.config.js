/**
 * PostCSS configuration for ClinicOS.
 *
 * Purpose: run Tailwind (which reads our CSS-variable design tokens) followed
 * by Autoprefixer for cross-browser vendor prefixes. ESM module to match the
 * project's `"type": "module"`.
 *
 * Governed by: Phase 3 BUILD SPEC, docs/Frontend-Bible.md §3 (token system).
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
