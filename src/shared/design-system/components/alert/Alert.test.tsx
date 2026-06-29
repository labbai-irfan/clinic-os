/**
 * Alert — render + accessibility smoke tests (Vitest + RTL + vitest-axe).
 *
 * Governed by: Phase 6 design-system spec (TESTS — Alert render + axe smoke),
 * docs/Brain.md §7 (a11y is CI-gated).
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Alert } from './Alert';

describe('Alert', () => {
  it('renders the title and description from props', () => {
    render(<Alert tone="info" title="Sync complete" description="All records are up to date." />);

    expect(screen.getByText('Sync complete')).toBeInTheDocument();
    expect(screen.getByText('All records are up to date.')).toBeInTheDocument();
  });

  it('uses role="status" for non-urgent tones (info/success)', () => {
    render(<Alert tone="success" title="Vitals saved" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="alert" for urgent tones (warning/danger/emergency)', () => {
    render(<Alert tone="danger" title="Could not save" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the optional action slot', () => {
    render(
      <Alert tone="danger" title="Failed to load" action={<button type="button">Retry</button>} />,
    );

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Alert tone="warning" title="Connection unstable" description="You are offline." />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
