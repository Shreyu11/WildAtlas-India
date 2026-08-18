/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './FootprintLoader';

const FootprintLoader = ComponentModule.default || (ComponentModule as any).FootprintLoader || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof FootprintLoader> = {
  title: 'Atoms/FootprintLoader',
  component: FootprintLoader,
  parameters: {
    description: "FootprintLoader component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof FootprintLoader>;

export const Default: Story = {
  args: {},
};
