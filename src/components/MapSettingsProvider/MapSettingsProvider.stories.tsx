/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './MapSettingsProvider';

const MapSettingsProvider = ComponentModule.default || (ComponentModule as any).MapSettingsProvider || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof MapSettingsProvider> = {
  title: 'Atoms/MapSettingsProvider',
  component: MapSettingsProvider,
  parameters: {
    description: "MapSettingsProvider component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof MapSettingsProvider>;

export const Default: Story = {
  args: {},
};
