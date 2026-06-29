/**
 * WelcomeScreen — the ClinicOS landing / live design-system showcase.
 *
 * Replaces the Phase-3 inline-styled placeholder with a real, token + component
 * driven screen that (a) renders with the actual brand fonts, (b) showcases the
 * design system, and (c) lets you drive the theme engine live and watch every
 * token respond. One calm screen; token-only; i18n-only; WCAG 2.2 AA — a single
 * <main> landmark, one <h1>, document <title> via Helmet, and focus moved to the
 * heading on mount (route-change focus management, Brain §7).
 *
 * Governed by: docs/Brain.md §2 (One Screen · One Task), §7 (a11y), §8 (i18n);
 * docs/design-system/* (the components/tokens it consumes).
 */
import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import type { QueueStatus } from '@shared/design-system';
import {
  Alert,
  Badge,
  BentoGrid,
  BentoItem,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatusBadge,
} from '@shared/design-system';
import { useThemeMode } from '@shared/theme';

import { ThemeControls } from './ThemeControls';

/** A small, illustrative "today's queue" sample (data, not copy — labels are localized). */
const QUEUE: readonly { status: QueueStatus; key: string; count: number }[] = [
  { status: 'waiting', key: 'waiting', count: 8 },
  { status: 'in-progress', key: 'inProgress', count: 2 },
  { status: 'completed', key: 'completed', count: 14 },
];

export default function WelcomeScreen(): JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeMode();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the page title on mount (route-change focus management — Brain §7).
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <Helmet>
        <title>{`${t('welcome.title')} · ${t('app.name')}`}</title>
      </Helmet>

      {/* Hero */}
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="text-overline font-semibold uppercase text-accent">{t('welcome.eyebrow')}</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="max-w-2xl font-heading text-display text-text outline-none"
        >
          {t('welcome.title')}
        </h1>
        <p className="max-w-2xl text-body-lg text-text-muted">{t('welcome.subtitle')}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg">{t('welcome.primaryCta')}</Button>
          <Button size="lg" variant="secondary">
            {t('welcome.secondaryCta')}
          </Button>
        </div>
      </header>

      {/* Live theme controls — the interactive heart of the showcase */}
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle>{t('theme.title')}</CardTitle>
          <CardDescription>{t('theme.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <ThemeControls />
        </CardContent>
      </Card>

      {/* A non-urgent, calm message — demonstrates the Alert component */}
      <Alert tone="info" title={t('welcome.alertTitle')} description={t('welcome.alertDesc')} />

      {/* Design system at a glance — a small bento dashboard */}
      <section aria-label={t('welcome.showcase')} className="flex flex-col gap-4">
        <h2 className="font-heading text-h4 text-text">{t('welcome.showcase')}</h2>
        <BentoGrid>
          <BentoItem colSpan={2} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-h5 text-text">{t('welcome.queueTitle')}</h3>
              <p className="text-body-sm text-text-muted">{t('welcome.queueDesc')}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {QUEUE.map(({ status, key, count }) => (
                <li key={key} className="flex items-center justify-between gap-4">
                  <StatusBadge status={status} label={t(`queue.status.${key}`)} />
                  <span className="text-h5 font-semibold tabular-nums text-text">{count}</span>
                </li>
              ))}
            </ul>
          </BentoItem>

          <BentoItem colSpan={2} className="flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-h5 text-text">{t('welcome.componentsTitle')}</h3>
              <p className="text-body-sm text-text-muted">{t('welcome.componentsDesc')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{t(`theme.mode.${resolvedTheme}`)}</Badge>
              <Badge tone="success">{t('queue.status.completed')}</Badge>
              <Badge tone="info">{t('queue.status.waiting')}</Badge>
              <Badge tone="warning">{t('queue.status.called')}</Badge>
            </div>
          </BentoItem>
        </BentoGrid>
      </section>
    </main>
  );
}
