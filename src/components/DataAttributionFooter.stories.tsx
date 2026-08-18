/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './DataAttributionFooter';

const DataAttributionFooter = ComponentModule.default || (ComponentModule as any).DataAttributionFooter || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof DataAttributionFooter> = {
  title: 'Atoms/DataAttributionFooter',
  component: DataAttributionFooter,
  parameters: {
    description: "DataAttributionFooter component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof DataAttributionFooter>;

export const Default: Story = {
  args: {},
};
