/**
 * Icon stories — sizes + decorative vs. labelled.
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Stethoscope } from 'lucide-react';

import { Icon } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Display/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    icon: { table: { disable: true } },
  },
  args: { icon: Stethoscope, size: 'md' },
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Decorative: Story = {};

export const Labelled: Story = {
  args: { 'aria-label': 'Consultation' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-accent">
      <Icon icon={Stethoscope} size="xs" />
      <Icon icon={Stethoscope} size="sm" />
      <Icon icon={Stethoscope} size="md" />
      <Icon icon={Stethoscope} size="lg" />
      <Icon icon={Stethoscope} size="xl" />
    </div>
  ),
};
