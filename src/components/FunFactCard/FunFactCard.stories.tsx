/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './FunFactCard';

const FunFactCard = ComponentModule.default || (ComponentModule as any).FunFactCard || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof FunFactCard> = {
  title: 'Atoms/FunFactCard',
  component: FunFactCard,
  parameters: {
    description: "FunFactCard component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof FunFactCard>;

export const Default: Story = {
  args: {},
};
