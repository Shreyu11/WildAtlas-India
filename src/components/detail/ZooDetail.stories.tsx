/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './ZooDetail';

const ZooDetail = ComponentModule.default || (ComponentModule as any).ZooDetail || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof ZooDetail> = {
  title: 'Molecules/ZooDetail',
  component: ZooDetail,
  parameters: {
    description: "ZooDetail component.",
    tags: ["molecule"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof ZooDetail>;

export const Default: Story = {
  args: {},
};
