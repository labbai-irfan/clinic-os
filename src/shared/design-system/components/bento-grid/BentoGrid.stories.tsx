/**
 * Bento stories — a sample dashboard grid.
 * Governed by: Phase 6 design-system spec (STORYBOOK).
 */
import type { Meta, StoryObj } from '@storybook/react';

import { BentoGrid, BentoItem } from './BentoGrid';

const meta: Meta<typeof BentoGrid> = {
  title: 'Display/BentoGrid',
  component: BentoGrid,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof BentoGrid>;

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <>
      <p className="text-overline uppercase text-text-muted">{label}</p>
      <p className="font-heading text-h2 text-text">{value}</p>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <div className="bg-surface p-6">
      <BentoGrid>
        <BentoItem>
          <Tile label="Patients today" value="48" />
        </BentoItem>
        <BentoItem>
          <Tile label="In queue" value="6" />
        </BentoItem>
        <BentoItem>
          <Tile label="Avg wait" value="12m" />
        </BentoItem>
        <BentoItem>
          <Tile label="No-shows" value="2" />
        </BentoItem>
        <BentoItem colSpan={2} rowSpan={2}>
          <Tile label="Patient flow" value="Chart" />
          <p className="mt-2 text-body-sm text-text-muted">A wide tile for the day’s flow chart.</p>
        </BentoItem>
        <BentoItem colSpan={2}>
          <Tile label="Follow-ups" value="9 due" />
        </BentoItem>
        <BentoItem colSpan={2}>
          <Tile label="Revenue" value="₹84,200" />
        </BentoItem>
      </BentoGrid>
    </div>
  ),
};
