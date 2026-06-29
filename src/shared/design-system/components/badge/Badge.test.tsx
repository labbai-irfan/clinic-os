/**
 * Badge tests — render smoke + axe accessibility check.
 * Governed by: Phase 6 design-system spec (TESTS — Card and Badge).
 */
import { render, screen } from '@testing-library/react';
import { CheckCircle2 } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its label from children', () => {
    render(<Badge tone="success">Checked in</Badge>);
    expect(screen.getByText('Checked in')).toBeInTheDocument();
  });

  it('applies the tone variant classes', () => {
    render(
      <Badge tone="danger" data-testid="badge">
        Overdue
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toHaveClass('bg-danger-subtle');
  });

  it('has no axe violations (color paired with icon + text)', async () => {
    const { container } = render(
      <Badge tone="success">
        <CheckCircle2 aria-hidden />
        Checked in
      </Badge>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
