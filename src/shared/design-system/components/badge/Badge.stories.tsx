/**
 * Badge stories — all tones + icon pairing.
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircle2 } from 'lucide-react';

import { Badge } from './Badge';

const TONES = ['neutral', 'primary', 'success', 'warning', 'danger', 'info', 'emergency'] as const;

const meta: Meta<typeof Badge> = {
  title: 'Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
  },
  args: { children: 'Badge' },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {TONES.map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Badge tone="success">
      <CheckCircle2 aria-hidden />
      Checked in
    </Badge>
  ),
};
