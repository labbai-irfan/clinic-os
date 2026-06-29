/**
 * Storybook (Builder: Vite) configuration for the ClinicOS UI Kit.
 *
 * - Framework: `@storybook/react-vite` (reuses our Vite pipeline).
 * - Stories: every `*.stories.tsx|ts` under `src/`.
 * - Addons: essentials (controls/docs/actions/viewport/backgrounds/…) + a11y.
 * - Autodocs: opt-in per story via the `autodocs` tag.
 * - `viteFinal`: inject `vite-tsconfig-paths` so the canonical aliases
 *   (`@shared/*`, `@app/*`, …) resolve inside stories exactly as in the app —
 *   tsconfig.app.json stays the single source of truth for the alias map.
 * - Docgen: `react-docgen-typescript` so prop tables are derived from our TS types.
 *
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tsconfigPaths()],
    }),
};

export default config;
