/**
 * Card stories — header/content/footer composition + variants.
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Display/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    elevation: { control: 'inline-radio', options: ['flat', 'raised', 'overlay'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="max-w-md">
      <CardHeader>
        <CardTitle>Patient summary</CardTitle>
        <CardDescription>Today’s visit · Room 4</CardDescription>
      </CardHeader>
      <CardContent>
        Blood pressure, weight and temperature were recorded at check-in and look within range.
      </CardContent>
      <CardFooter>
        <button
          type="button"
          className="h-12 rounded-md bg-primary px-5 text-body-md font-semibold text-primary-fg"
        >
          Open chart
        </button>
        <button type="button" className="h-12 px-2 text-body-md text-text-muted">
          Dismiss
        </button>
      </CardFooter>
    </Card>
  ),
};

export const Flat: Story = {
  ...Default,
  args: { elevation: 'flat' },
};

export const Interactive: Story = {
  args: { interactive: true },
  render: (args) => (
    <Card {...args} asChild className="max-w-md">
      <a href="#patient">
        <CardHeader>
          <CardTitle>Aamir Khan</CardTitle>
          <CardDescription>Follow-up · 10:30</CardDescription>
        </CardHeader>
        <CardContent>Tap anywhere on this card to open the patient record.</CardContent>
      </a>
    </Card>
  ),
};

export const Paddings: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
        <Card key={p} padding={p} className="w-56">
          <CardContent className="p-2">padding=&quot;{p}&quot;</CardContent>
        </Card>
      ))}
    </div>
  ),
};
