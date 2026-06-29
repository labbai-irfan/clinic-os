/**
 * Avatar stories — image, initials fallback, sizes.
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: { alt: 'Aamir Khan', initials: 'AK' },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/96?img=12',
    alt: 'Sara Lewis',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm" alt="Aamir Khan" initials="AK" />
      <Avatar size="md" alt="Aamir Khan" initials="AK" />
      <Avatar size="lg" alt="Aamir Khan" initials="AK" />
    </div>
  ),
};
