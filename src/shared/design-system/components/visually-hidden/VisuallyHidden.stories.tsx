/**
 * VisuallyHidden stories.
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { VisuallyHidden } from './VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Display/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  render: () => (
    <p className="text-body-md text-text">
      Saved
      <VisuallyHidden> — your changes were saved automatically</VisuallyHidden>
    </p>
  ),
};
