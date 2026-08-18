/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './Map';

const Map = ComponentModule.default || (ComponentModule as any).Map || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof Map> = {
  title: 'Organisms/Map',
  component: Map,
  parameters: {
    description: "Map component.",
    tags: ["organism"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof Map>;

export const Default: Story = {
  args: {},
};
