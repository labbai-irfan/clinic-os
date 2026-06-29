/**
 * StatusBadge stories — every queue status.
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { type QueueStatus, StatusBadge } from './StatusBadge';

const STATUSES: { status: QueueStatus; label: string }[] = [
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'waiting', label: 'Waiting' },
  { status: 'called', label: 'Called' },
  { status: 'in-progress', label: 'In progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'no-show', label: 'No show' },
  { status: 'cancelled', label: 'Cancelled' },
];

const meta: Meta<typeof StatusBadge> = {
  title: 'Display/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES.map((s) => s.status) },
  },
  args: { status: 'waiting', label: 'Waiting' },
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {STATUSES.map(({ status, label }) => (
        <StatusBadge key={status} status={status} label={label} />
      ))}
    </div>
  ),
};
