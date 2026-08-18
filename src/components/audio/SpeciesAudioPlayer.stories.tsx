/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './SpeciesAudioPlayer';

const SpeciesAudioPlayer = ComponentModule.default || (ComponentModule as any).SpeciesAudioPlayer || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof SpeciesAudioPlayer> = {
  title: 'Atoms/SpeciesAudioPlayer',
  component: SpeciesAudioPlayer,
  parameters: {
    description: "SpeciesAudioPlayer component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof SpeciesAudioPlayer>;

export const Default: Story = {
  args: {},
};
