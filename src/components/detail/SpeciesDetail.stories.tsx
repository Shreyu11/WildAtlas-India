/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './SpeciesDetail';

const SpeciesDetail = ComponentModule.default || (ComponentModule as any).SpeciesDetail || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof SpeciesDetail> = {
  title: 'Molecules/SpeciesDetail',
  component: SpeciesDetail,
  parameters: {
    description: "SpeciesDetail component.",
    tags: ["molecule"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof SpeciesDetail>;

export const Default: Story = {
  args: {},
};
