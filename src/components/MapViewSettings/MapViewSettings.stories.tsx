/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './MapViewSettings';

const MapViewSettings = ComponentModule.default || (ComponentModule as any).MapViewSettings || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof MapViewSettings> = {
  title: 'Organisms/MapViewSettings',
  component: MapViewSettings,
  parameters: {
    description: "MapViewSettings component.",
    tags: ["organism"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof MapViewSettings>;

export const Default: Story = {
  args: {},
};
