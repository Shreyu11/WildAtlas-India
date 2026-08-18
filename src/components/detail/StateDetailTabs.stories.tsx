/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './StateDetailTabs';

const StateDetailTabs = ComponentModule.default || (ComponentModule as any).StateDetailTabs || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof StateDetailTabs> = {
  title: 'Molecules/StateDetailTabs',
  component: StateDetailTabs,
  parameters: {
    description: "StateDetailTabs component.",
    tags: ["molecule"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof StateDetailTabs>;

export const Default: Story = {
  args: {},
};
