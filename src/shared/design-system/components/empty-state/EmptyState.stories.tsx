/**
 * Storybook stories for EmptyState (CSF3 + autodocs).
 *
 * Literal demo strings are allowed here (the i18n lint rule is off for stories).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Inbox, Users } from 'lucide-react';

import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Calm "no data" surface: decorative icon + title + description + one primary action. ' +
          'All text is passed via props; the icon slot is aria-hidden.',
      },
    },
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    title: 'No patients in the queue',
    description: 'When patients check in, they will appear here.',
  },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Inbox className="size-12" />,
  },
};

export const WithAction: Story = {
  args: {
    icon: <Users className="size-12" />,
    title: 'No patients yet',
    description: 'Add your first patient to start building the queue.',
    action: { label: 'Add patient', onClick: () => undefined },
  },
};

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    title: 'Nothing to show',
    description: 'Your filters did not match any records.',
  },
};

export const TitleOnly: Story = {
  args: {
    icon: <Inbox className="size-12" />,
    title: 'All caught up',
    description: undefined,
  },
};
