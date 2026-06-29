import type { Meta, StoryObj } from '@storybook/react';

import { Radio, RadioGroup } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: {
    name: 'visit-type',
    'aria-label': 'Visit type',
  },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

const options = [
  { value: 'new', label: 'New patient' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'emergency', label: 'Emergency' },
];

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      {options.map((opt) => (
        <label key={opt.value} className="inline-flex items-center gap-2 text-body-md text-text">
          <Radio value={opt.value} />
          {opt.label}
        </label>
      ))}
    </RadioGroup>
  ),
};

export const WithDefaultValue: Story = {
  ...Default,
  args: { defaultValue: 'follow-up' },
};
