import type { Meta, StoryObj } from '@storybook/react';

import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
  },
  args: {
    'aria-label': 'Enable reminders',
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const WithLabel: Story = {
  render: (args) => (
    <label className="inline-flex items-center gap-3 text-body-md text-text">
      <Switch {...args} aria-label={undefined} />
      Enable SMS reminders
    </label>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};
