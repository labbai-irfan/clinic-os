import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Input } from './Input';

describe('Input', () => {
  it('renders a textbox with its accessible name', () => {
    render(<Input aria-label="Patient name" />);
    expect(screen.getByRole('textbox', { name: 'Patient name' })).toBeInTheDocument();
  });

  it('sets aria-invalid when invalid', () => {
    render(<Input aria-label="Email" invalid />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Input aria-label="Patient name" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
