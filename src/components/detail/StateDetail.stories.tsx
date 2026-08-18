/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './StateDetail';

const StateDetail = ComponentModule.default || (ComponentModule as any).StateDetail || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof StateDetail> = {
  title: 'Molecules/StateDetail',
  component: StateDetail,
  parameters: {
    description: "StateDetail component.",
    tags: ["molecule"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof StateDetail>;

export const Default: Story = {
  args: {},
};
