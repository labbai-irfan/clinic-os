/**
 * SVGO configuration — the SVG optimization pipeline for ClinicOS SOURCE assets.
 *
 * Run via `pnpm optimize:svg` over `src/assets/**` before committing new SVGs.
 * Goals: strip editor cruft + metadata, keep the `viewBox` (so the `<Icon>`
 * wrapper and CSS control size), and DO NOT mangle multi-colour illustration art.
 *
 * IMPORTANT (icons): monochrome icon sources should use `currentColor` for fill/
 * stroke so they re-theme automatically — this config does NOT force-strip colours
 * (that would break illustrations); enforce `currentColor` at authoring time and in
 * review (docs/assets/SVGStandards.md §Color).
 *
 * Governed by: docs/assets/SVGStandards.md, docs/assets/OptimizationGuide.md.
 */
export default {
  multipass: true,
  js2svg: { indent: 2, pretty: false },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep viewBox: sizing is controlled by the Icon wrapper / CSS, not the SVG.
          removeViewBox: false,
          // Keep ids referenced by <use>, gradients, masks, a11y (<title>/<desc>).
          cleanupIds: false,
        },
      },
    },
    'removeDimensions', // drop width/height attrs; viewBox + CSS drive the size
    'sortAttrs',
  ],
};
