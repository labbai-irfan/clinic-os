import type { Meta, StoryObj } from '@storybook/react';

import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Clinical notes…',
    'aria-label': 'Notes',
    rows: 4,
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { invalid: true, 'aria-label': 'Notes' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Read only', 'aria-label': 'Notes' },
};
