/**
 * Storybook stories for Tooltip (CSF3 + autodocs).
 *
 * Demonstrates the tooltip on a button (hover AND focus to reveal; Escape to
 * dismiss). Literal demo strings are allowed here (i18n lint off for stories).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Accessible tooltip: reveals on hover AND keyboard focus, wired via role="tooltip" + ' +
          'aria-describedby, dismissable with Escape, reduced-motion aware. Supplementary only — ' +
          'never the sole carrier of information.',
      },
    },
    layout: 'centered',
  },
  argTypes: {
    content: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    content: 'Check the patient in',
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const OnButton: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Check in</Button>
    </Tooltip>
  ),
};

export const Default: Story = {
  ...OnButton,
};

export const Disabled: Story = {
  args: { disabled: true, content: 'You will not see me' },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">No tooltip</Button>
    </Tooltip>
  ),
};
