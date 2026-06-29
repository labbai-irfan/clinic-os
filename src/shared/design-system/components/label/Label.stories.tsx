import type { Meta, StoryObj } from '@storybook/react';

import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  args: {
    children: 'Patient name',
    htmlFor: 'patient-name',
  },
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const Required: Story = {
  args: { requiredMark: true, requiredHint: 'required', children: 'Date of birth' },
};
