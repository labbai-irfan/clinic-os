import type { Meta, StoryObj } from '@storybook/react';
import { Bell, Pencil, Trash2 } from 'lucide-react';

import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'ghost', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    'aria-label': 'Edit patient',
    icon: <Pencil aria-hidden />,
    variant: 'secondary',
    size: 'md',
  },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <IconButton
        {...args}
        variant="primary"
        aria-label="Notifications"
        icon={<Bell aria-hidden />}
      />
      <IconButton {...args} variant="secondary" aria-label="Edit" icon={<Pencil aria-hidden />} />
      <IconButton
        {...args}
        variant="ghost"
        aria-label="Notifications"
        icon={<Bell aria-hidden />}
      />
      <IconButton {...args} variant="danger" aria-label="Delete" icon={<Trash2 aria-hidden />} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <IconButton {...args} size="sm" aria-label="Edit small" />
      <IconButton {...args} size="md" aria-label="Edit medium" />
      <IconButton {...args} size="lg" aria-label="Edit large" />
    </div>
  ),
};
