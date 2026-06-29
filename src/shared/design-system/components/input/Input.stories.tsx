import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'e.g. Jane Doe',
    'aria-label': 'Patient name',
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'not-an-email', 'aria-label': 'Email' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Read only', 'aria-label': 'Disabled field' },
};
