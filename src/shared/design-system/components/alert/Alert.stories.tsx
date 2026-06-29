/**
 * Storybook stories for Alert (CSF3 + autodocs).
 *
 * Demonstrates every tone plus the description + action slots. Literal demo
 * strings are allowed here (the i18n lint rule is off for stories).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Inline status banner. Tone pairs a lucide icon with text (never color-only). ' +
          'info/success announce politely (role="status"); warning/danger/emergency assert (role="alert").',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['info', 'success', 'warning', 'danger', 'emergency'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    tone: 'info',
    title: 'Appointment reminder',
    description: 'The patient has a follow-up scheduled for tomorrow at 09:30.',
  },
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

export const Info: Story = {
  args: { tone: 'info', title: 'Sync complete', description: 'All records are up to date.' },
};

export const Success: Story = {
  args: { tone: 'success', title: 'Vitals saved', description: 'The reading was recorded.' },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Connection unstable',
    description: 'Changes will sync once you are back online.',
  },
};

export const Danger: Story = {
  args: {
    tone: 'danger',
    title: 'Could not save changes',
    description: 'The server rejected the request. Please review and try again.',
  },
};

export const Emergency: Story = {
  args: {
    tone: 'emergency',
    title: 'Critical vital detected',
    description: 'Patient oxygen saturation is below the safe threshold. Escalate immediately.',
  },
};

export const WithAction: Story = {
  args: {
    tone: 'danger',
    title: 'Could not load the patient queue',
    description: 'A network error interrupted the request.',
    action: (
      <Button variant="secondary" size="sm">
        Retry
      </Button>
    ),
  },
};

export const TitleOnly: Story = {
  args: { tone: 'success', title: 'Saved', description: undefined },
};

/** All tones stacked — a quick visual + a11y sweep. */
export const AllTones: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <Alert tone="info" title="Information" description="A neutral, non-urgent message." />
      <Alert tone="success" title="Success" description="The operation completed." />
      <Alert tone="warning" title="Warning" description="Something needs your attention." />
      <Alert tone="danger" title="Error" description="Something went wrong." />
      <Alert tone="emergency" title="Emergency" description="Immediate action is required." />
    </div>
  ),
};
