import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Button } from './Button';

describe('Button', () => {
  it('renders a button with its accessible name from children', () => {
    render(<Button>Check in patient</Button>);
    expect(screen.getByRole('button', { name: 'Check in patient' })).toBeInTheDocument();
  });

  it('is disabled and marked busy while loading', () => {
    render(
      <Button isLoading loadingLabel="Saving">
        Save
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /save/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('renders as a child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="#queue">Go to queue</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Go to queue' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Button>Check in patient</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
