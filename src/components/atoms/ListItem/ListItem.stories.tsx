/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './ListItem';

const ListItem = ComponentModule.default || (ComponentModule as any).ListItem || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof ListItem> = {
  title: 'Atoms/ListItem',
  component: ListItem,
  parameters: {
    description: "ListItem component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  args: {},
};
