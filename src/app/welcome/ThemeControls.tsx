/**
 * ThemeControls — a live control panel for the Phase-5 Theme Engine.
 *
 * Drives the ThemeManager via `useTheme()`: appearance (system / light / dark /
 * high-contrast), large text, compact density, and reduced motion. Every change
 * is a CSS-variable / data-attribute swap (no re-render storm) and is persisted
 * across sessions by the engine. Token-only styling, i18n-only copy, WCAG 2.2 AA
 * (segmented control is a labelled radio-like button group; switches are labelled
 * via `aria-labelledby`).
 *
 * Governed by: docs/theme-engine/README.md (hooks), docs/Brain.md §6/§7.
 */
import { useTranslation } from 'react-i18next';

import { Button, Switch } from '@shared/design-system';
import type { ThemeMode } from '@shared/theme';
import { useTheme } from '@shared/theme';

const MODES: readonly ThemeMode[] = ['system', 'light', 'dark', 'high-contrast'];

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

/** A labelled switch row (text + Switch associated via aria-labelledby). */
function ToggleRow({ id, label, checked, onChange }: ToggleRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4">
      <span id={`${id}-label`} className="text-body-md text-text">
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-labelledby={`${id}-label`} />
    </div>
  );
}

export function ThemeControls(): JSX.Element {
  const { t } = useTranslation();
  const { preferences, setMode, setTextScale, setDensity, setMotion } = useTheme();

  return (
    <div className="flex flex-col gap-5">
      {/* Appearance — segmented mode control */}
      <div className="flex flex-col gap-2">
        <span id="appearance-label" className="text-label font-semibold text-text">
          {t('theme.mode.label')}
        </span>
        <div
          role="group"
          aria-labelledby="appearance-label"
          className="inline-flex flex-wrap gap-1 rounded-lg bg-surface-sunken p-1"
        >
          {MODES.map((m) => (
            <Button
              key={m}
              size="sm"
              variant={preferences.mode === m ? 'primary' : 'ghost'}
              aria-pressed={preferences.mode === m}
              onClick={() => setMode(m)}
            >
              {t(`theme.mode.${m}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Accessibility toggles */}
      <ToggleRow
        id="toggle-large-text"
        label={t('theme.largeText')}
        checked={preferences.textScale === 'large'}
        onChange={(next) => setTextScale(next ? 'large' : 'normal')}
      />
      <ToggleRow
        id="toggle-density"
        label={t('theme.compact')}
        checked={preferences.density === 'compact'}
        onChange={(next) => setDensity(next ? 'compact' : 'comfortable')}
      />
      <ToggleRow
        id="toggle-motion"
        label={t('theme.reduceMotion')}
        checked={preferences.motion === 'reduced'}
        onChange={(next) => setMotion(next ? 'reduced' : 'system')}
      />
    </div>
  );
}

ThemeControls.displayName = 'ThemeControls';
