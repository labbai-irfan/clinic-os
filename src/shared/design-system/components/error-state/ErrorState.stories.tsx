/**
 * Storybook stories for ErrorState (CSF3 + autodocs).
 *
 * Literal demo strings are allowed here (the i18n lint rule is off for stories).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'Feedback/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Danger-toned variant of EmptyState for failed async surfaces. Shows a danger icon, ' +
          'a localized message, and a retry action (rendered only when both retryLabel and onRetry are set).',
      },
    },
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    retryLabel: { control: 'text' },
  },
  args: {
    title: 'Could not load the patient queue',
    description: 'A network error interrupted the request.',
  },
};
export default meta;

type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {};

export const WithRetry: Story = {
  args: {
    title: 'Could not load the patient queue',
    description: 'A network error interrupted the request. Check your connection and try again.',
    retryLabel: 'Try again',
    onRetry: () => undefined,
  },
};

export const NoDescription: Story = {
  args: {
    title: 'Something went wrong',
    description: undefined,
    retryLabel: 'Retry',
    onRetry: () => undefined,
  },
};
