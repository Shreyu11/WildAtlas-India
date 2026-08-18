/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './AmbientAudioProvider';

const AmbientAudioProvider = ComponentModule.default || (ComponentModule as any).AmbientAudioProvider || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof AmbientAudioProvider> = {
  title: 'Atoms/AmbientAudioProvider',
  component: AmbientAudioProvider,
  parameters: {
    description: "AmbientAudioProvider component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof AmbientAudioProvider>;

export const Default: Story = {
  args: {},
};
