/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './GridBackground';

const GridBackground = ComponentModule.default || (ComponentModule as any).GridBackground || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof GridBackground> = {
  title: 'Atoms/GridBackground',
  component: GridBackground,
  parameters: {
    description: "GridBackground component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof GridBackground>;

export const Default: Story = {
  args: {},
};
