/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './WelcomeCard';

const WelcomeCard = ComponentModule.default || (ComponentModule as any).WelcomeCard || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof WelcomeCard> = {
  title: 'Atoms/WelcomeCard',
  component: WelcomeCard,
  parameters: {
    description: "WelcomeCard component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof WelcomeCard>;

export const Default: Story = {
  args: {},
};
