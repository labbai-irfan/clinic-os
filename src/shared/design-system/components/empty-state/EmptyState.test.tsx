/**
 * EmptyState — render + accessibility smoke tests (Vitest + RTL + vitest-axe).
 *
 * Governed by: Phase 6 design-system spec (TESTS — EmptyState render + axe smoke).
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Inbox } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and description from props', () => {
    render(
      <EmptyState
        title="No patients in the queue"
        description="When patients check in, they will appear here."
      />,
    );

    expect(screen.getByRole('heading', { name: 'No patients in the queue' })).toBeInTheDocument();
    expect(screen.getByText('When patients check in, they will appear here.')).toBeInTheDocument();
  });

  it('renders a structured primary action as a Button and fires onClick', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <EmptyState
        icon={<Inbox aria-hidden className="size-12" />}
        title="No patients yet"
        action={{ label: 'Add patient', onClick }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Add patient' });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders no action region when action is omitted', () => {
    render(<EmptyState title="All caught up" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <EmptyState
        icon={<Inbox aria-hidden className="size-12" />}
        title="No patients in the queue"
        description="When patients check in, they will appear here."
        action={{ label: 'Add patient' }}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
