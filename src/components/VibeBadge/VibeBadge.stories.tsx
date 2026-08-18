/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './VibeBadge';

const VibeBadge = ComponentModule.default || (ComponentModule as any).VibeBadge || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof VibeBadge> = {
  title: 'Molecules/VibeBadge',
  component: VibeBadge,
  parameters: {
    description: "Generalised vibe badge component displaying attribution",
    tags: ["molecule"],
    needsReview: false,
  },
};

export default meta;

type Story = StoryObj<typeof VibeBadge>;

export const Default: Story = {
  args: {},
};
