/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './SpeciesAudioButton';

const SpeciesAudioButton = ComponentModule.default || (ComponentModule as any).SpeciesAudioButton || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof SpeciesAudioButton> = {
  title: 'Atoms/SpeciesAudioButton',
  component: SpeciesAudioButton,
  parameters: {
    description: "SpeciesAudioButton component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof SpeciesAudioButton>;

export const Default: Story = {
  args: {},
};
