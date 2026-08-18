/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './SearchBar';

const SearchBar = ComponentModule.default || (ComponentModule as any).SearchBar || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof SearchBar> = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    description: "SearchBar component.",
    tags: ["molecule"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: {},
};
