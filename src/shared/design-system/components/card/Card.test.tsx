/**
 * Card tests — render smoke + axe accessibility check.
 * Governed by: Phase 6 design-system spec (TESTS — Card and Badge).
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

describe('Card', () => {
  it('renders the composed header/content/footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Patient summary</CardTitle>
          <CardDescription>Room 4</CardDescription>
        </CardHeader>
        <CardContent>Vitals look within range.</CardContent>
        <CardFooter>
          <button type="button">Open chart</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByRole('heading', { name: 'Patient summary', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Vitals look within range.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open chart' })).toBeInTheDocument();
  });

  it('forwards arbitrary props and merges className', () => {
    render(
      <Card data-testid="card" className="custom-class">
        <CardContent>Body</CardContent>
      </Card>,
    );
    const el = screen.getByTestId('card');
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveClass('bg-surface-raised');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Patient summary</CardTitle>
          <CardDescription>Room 4</CardDescription>
        </CardHeader>
        <CardContent>Vitals look within range.</CardContent>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
