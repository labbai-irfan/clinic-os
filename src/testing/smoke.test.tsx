/**
 * Foundation smoke test — proves the React Testing Library + jsdom + jest-dom
 * harness (wired in src/testing/setup.ts) can mount a component and assert on it.
 * Real component tests arrive with the design system (Phase 4).
 *
 * Governed by: docs/Coding-Standards.md §16 (testing), Phase 3 BUILD SPEC.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('render harness (foundation smoke)', () => {
  it('mounts a DOM node and jest-dom matchers are available', () => {
    render(<div data-testid="cos-smoke" />);

    expect(screen.getByTestId('cos-smoke')).toBeInTheDocument();
  });
});
