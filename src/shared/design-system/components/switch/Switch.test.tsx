import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Switch } from './Switch';

describe('Switch', () => {
  it('renders a switch with its accessible name', () => {
    render(<Switch aria-label="Enable reminders" />);
    expect(screen.getByRole('switch', { name: 'Enable reminders' })).toBeInTheDocument();
  });

  it('toggles aria-checked on click', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Enable reminders" />);
    const sw = screen.getByRole('switch', { name: 'Enable reminders' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles with the Space key', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Enable reminders" />);
    const sw = screen.getByRole('switch', { name: 'Enable reminders' });
    sw.focus();
    await user.keyboard(' ');
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Switch aria-label="Enable reminders" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
