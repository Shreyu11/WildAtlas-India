/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './ExploreRail';

const ExploreRail = ComponentModule.default || (ComponentModule as any).ExploreRail || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof ExploreRail> = {
  title: 'Molecules/ExploreRail',
  component: ExploreRail,
  parameters: {
    description: "ExploreRail component.",
    tags: ["molecule"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof ExploreRail>;

export const Default: Story = {
  args: {},
};
