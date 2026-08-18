/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './LinkPreviewCard';

const LinkPreviewCard = ComponentModule.default || (ComponentModule as any).LinkPreviewCard || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof LinkPreviewCard> = {
  title: 'Atoms/LinkPreviewCard',
  component: LinkPreviewCard,
  parameters: {
    description: "LinkPreviewCard component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof LinkPreviewCard>;

export const Default: Story = {
  args: {},
};
