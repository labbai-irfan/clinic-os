/**
 * Storybook preview configuration for the ClinicOS UI Kit.
 *
 * - Imports the single global stylesheet so stories render with the SAME tokens,
 *   Tailwind utilities and base reset as the real app (tokens → themes → tailwind).
 * - `parameters`: control matchers (color/date pickers), centered layout, a11y.
 * - `globalTypes.theme`: a toolbar to switch between light | dark | high-contrast.
 * - `decorators`: applies the selected theme by setting `data-theme` on
 *   `<html>` (the same hook the Phase-5 theme engine uses), then renders the story.
 *
 * Governed by: Phase 6 design-system spec (STORYBOOK — preview).
 */
import { useEffect } from 'react';

import '../src/app/styles/global.css';

import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    a11y: {
      // Run axe automatically; surface (not block) violations in the a11y panel.
      element: '#storybook-root',
    },
  },

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Active ClinicOS theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'high-contrast', title: 'High contrast' },
        ],
      },
    },
  },

  decorators: [
    (Story, context) => {
      const theme = (context.globals['theme'] as string | undefined) ?? 'light';
      useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
      }, [theme]);
      return <Story />;
    },
  ],
};

export default preview;
