/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './SearchProvider';

const SearchProvider = ComponentModule.default || (ComponentModule as any).SearchProvider || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof SearchProvider> = {
  title: 'Atoms/SearchProvider',
  component: SearchProvider,
  parameters: {
    description: "SearchProvider component.",
    tags: ["atom"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof SearchProvider>;

export const Default: Story = {
  args: {},
};
