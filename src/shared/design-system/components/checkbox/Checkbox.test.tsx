import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox with its accessible name', () => {
    render(<Checkbox aria-label="Consent to treatment" />);
    expect(screen.getByRole('checkbox', { name: 'Consent to treatment' })).toBeInTheDocument();
  });

  it('reflects the checked state', () => {
    render(<Checkbox aria-label="Consent" defaultChecked />);
    expect(screen.getByRole('checkbox', { name: 'Consent' })).toBeChecked();
  });

  it('sets aria-invalid when invalid', () => {
    render(<Checkbox aria-label="Consent" invalid />);
    expect(screen.getByRole('checkbox', { name: 'Consent' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('has no axe violations', async () => {
    const { container } = render(<Checkbox aria-label="Consent to treatment" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
