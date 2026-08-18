/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './Drawer';

const Drawer = ComponentModule.default || (ComponentModule as any).Drawer || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof Drawer> = {
  title: 'Atoms/Drawer',
  component: Drawer,
  parameters: {
    description: "Drawer component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {},
};
