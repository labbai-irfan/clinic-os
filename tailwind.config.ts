/**
 * Tailwind configuration for ClinicOS.
 *
 * Purpose: Tailwind's theme is a THIN alias layer over the CSS-variable design
 * tokens defined in `src/shared/styles/tokens.css` (3-tier: primitive →
 * semantic → component). No raw hex/px lives here — every value resolves to a
 * `var(--token)`, so dark / high-contrast / large-text / RTL are pure CSS-var
 * swaps with zero class churn. Dark mode is driven by the `data-theme` attribute
 * set by the theme engine.
 *
 * Governed by: docs/Frontend-Bible.md §3 (token system) & §3.7 (Tailwind sketch),
 * docs/Naming-Convention.md §10 (token naming), Phase 3 BUILD SPEC.
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  // Class- or attribute-driven dark theme: `.dark` OR `[data-theme="dark"]`.
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          subtle: 'var(--color-primary-subtle)',
          fg: 'var(--color-on-primary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          fg: 'var(--color-on-accent)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          sunken: 'var(--color-surface-sunken)',
          overlay: 'var(--color-surface-overlay)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        divider: 'var(--color-divider)',
        focus: 'var(--color-focus)',
        success: {
          DEFAULT: 'var(--color-success)',
          subtle: 'var(--color-success-subtle)',
          fg: 'var(--color-on-success)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          subtle: 'var(--color-warning-subtle)',
          fg: 'var(--color-on-warning)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          subtle: 'var(--color-danger-subtle)',
          fg: 'var(--color-on-danger)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          subtle: 'var(--color-info-subtle)',
          fg: 'var(--color-on-info)',
        },
        /* Emergency — the ONE intentionally vivid family (life-safety only). */
        emergency: {
          DEFAULT: 'var(--color-emergency)',
          hover: 'var(--color-emergency-hover)',
          subtle: 'var(--color-emergency-subtle)',
          fg: 'var(--color-on-emergency)',
        },
        /* Queue lifecycle status (always pair with a label/icon). */
        status: {
          scheduled: 'var(--color-status-scheduled)',
          waiting: 'var(--color-status-waiting)',
          called: 'var(--color-status-called)',
          'in-progress': 'var(--color-status-in-progress)',
          completed: 'var(--color-status-completed)',
          'no-show': 'var(--color-status-no-show)',
          cancelled: 'var(--color-status-cancelled)',
        },
        /* Vital / triage severity (always pair with text/icon). */
        vital: {
          normal: 'var(--color-vital-normal)',
          low: 'var(--color-vital-low)',
          elevated: 'var(--color-vital-elevated)',
          high: 'var(--color-vital-high)',
          critical: 'var(--color-vital-critical)',
        },
        /* Categorical chart palette (8 hues, color-blind-safe). */
        chart: {
          1: 'var(--color-chart-1)',
          2: 'var(--color-chart-2)',
          3: 'var(--color-chart-3)',
          4: 'var(--color-chart-4)',
          5: 'var(--color-chart-5)',
          6: 'var(--color-chart-6)',
          7: 'var(--color-chart-7)',
          8: 'var(--color-chart-8)',
          grid: 'var(--color-chart-grid)',
          axis: 'var(--color-chart-axis)',
        },
        sidebar: 'var(--color-surface-sidebar)',
        skeleton: {
          base: 'var(--color-skeleton-base)',
          highlight: 'var(--color-skeleton-highlight)',
        },
        selection: {
          DEFAULT: 'var(--color-selection-bg)',
          text: 'var(--color-selection-text)',
        },
        outline: 'var(--color-outline)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SF Mono', 'monospace'],
      },
      fontSize: {
        /* Full type scale → role tokens (size · leading · weight · tracking). */
        display: [
          'var(--text-display)',
          {
            lineHeight: 'var(--leading-display)',
            fontWeight: 'var(--weight-display)',
            letterSpacing: 'var(--tracking-display)',
          },
        ],
        h1: [
          'var(--text-h1)',
          {
            lineHeight: 'var(--leading-h1)',
            fontWeight: 'var(--weight-h1)',
            letterSpacing: 'var(--tracking-h1)',
          },
        ],
        h2: [
          'var(--text-h2)',
          {
            lineHeight: 'var(--leading-h2)',
            fontWeight: 'var(--weight-h2)',
            letterSpacing: 'var(--tracking-h2)',
          },
        ],
        h3: ['var(--text-h3)', { lineHeight: 'var(--leading-h3)', fontWeight: 'var(--weight-h3)' }],
        h4: ['var(--text-h4)', { lineHeight: 'var(--leading-h4)', fontWeight: 'var(--weight-h4)' }],
        h5: ['var(--text-h5)', { lineHeight: 'var(--leading-h5)', fontWeight: 'var(--weight-h5)' }],
        h6: ['var(--text-h6)', { lineHeight: 'var(--leading-h6)', fontWeight: 'var(--weight-h6)' }],
        'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--leading-body-lg)' }],
        'body-md': ['var(--text-body-md)', { lineHeight: 'var(--leading-body-md)' }],
        'body-sm': ['var(--text-body-sm)', { lineHeight: 'var(--leading-body-sm)' }],
        caption: ['var(--text-caption)', { lineHeight: 'var(--leading-caption)' }],
        overline: [
          'var(--text-overline)',
          {
            lineHeight: 'var(--leading-overline)',
            fontWeight: 'var(--weight-overline)',
            letterSpacing: 'var(--tracking-overline)',
          },
        ],
      },
      spacing: {
        0: 'var(--space-0)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
        24: 'var(--space-24)',
        32: 'var(--space-32)',
        40: 'var(--space-40)',
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        pill: 'var(--radius-full)',
        full: 'var(--radius-full)',
      },
      borderWidth: {
        0: 'var(--border-width-0)',
        DEFAULT: 'var(--border-width-1)',
        2: 'var(--border-width-2)',
        4: 'var(--border-width-4)',
      },
      boxShadow: {
        none: 'var(--shadow-none)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        inset: 'var(--shadow-inset)',
      },
      zIndex: {
        base: 'var(--z-base)',
        raised: 'var(--z-raised)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        toast: 'var(--z-toast)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        decelerate: 'var(--ease-decelerate)',
        accelerate: 'var(--ease-accelerate)',
        emphasized: 'var(--ease-emphasized)',
      },
      /* Breakpoints — mirror the --breakpoint-* primitives. */
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      /* Container max-width tokens. */
      maxWidth: {
        container: 'var(--container-max)',
        'container-sm': 'var(--container-sm)',
        'container-md': 'var(--container-md)',
        'container-lg': 'var(--container-lg)',
        'container-xl': 'var(--container-xl)',
        'container-2xl': 'var(--container-2xl)',
      },
    },
  },
  plugins: [],
};

export default config;
