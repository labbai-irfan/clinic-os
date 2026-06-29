import type { Meta, StoryObj } from '@storybook/react';

import { Input } from '../input';
import { Textarea } from '../textarea';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: {
    label: 'Patient name',
  },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="e.g. Jane Doe" />
    </FormField>
  ),
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: 'As shown on the patient ID card.' },
};

export const Required: Story = {
  args: { required: true, requiredHint: 'required' },
};

export const WithError: Story = {
  args: { error: 'This field is required.', required: true, requiredHint: 'required' },
};

export const TextareaField: Story = {
  args: { label: 'Clinical notes' },
  render: (args) => (
    <FormField {...args}>
      <Textarea placeholder="Notes…" rows={4} />
    </FormField>
  ),
};
