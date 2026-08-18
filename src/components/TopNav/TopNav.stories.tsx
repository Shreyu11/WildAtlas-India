/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './TopNav';

const TopNav = ComponentModule.default || (ComponentModule as any).TopNav || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof TopNav> = {
  title: 'Organisms/TopNav',
  component: TopNav,
  parameters: {
    description: "TopNav component.",
    tags: ["organism"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof TopNav>;

export const Default: Story = {
  args: {},
};
