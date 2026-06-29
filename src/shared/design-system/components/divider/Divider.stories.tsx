/**
 * Divider stories — horizontal + vertical.
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Display/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
};
export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => (
    <div className="max-w-sm">
      <p className="text-body-md text-text">Section one</p>
      <Divider className="my-4" />
      <p className="text-body-md text-text">Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-4">
      <span className="text-body-md text-text">Queue</span>
      <Divider orientation="vertical" />
      <span className="text-body-md text-text">History</span>
      <Divider orientation="vertical" />
      <span className="text-body-md text-text">Notes</span>
    </div>
  ),
};
