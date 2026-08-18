/* @compdocs-generated */
import type { Meta, StoryObj } from '@storylite/renderer-react';
import * as ComponentModule from './ProtectedAreaDetail';

const ProtectedAreaDetail = ComponentModule.default || (ComponentModule as any).ProtectedAreaDetail || (ComponentModule as any)[Object.keys(ComponentModule)[0]];

const meta: Meta<typeof ProtectedAreaDetail> = {
  title: 'Molecules/ProtectedAreaDetail',
  component: ProtectedAreaDetail,
  parameters: {
    description: "ProtectedAreaDetail component.",
    tags: ["molecule"],
    needsReview: true,
  },
};

export default meta;

type Story = StoryObj<typeof ProtectedAreaDetail>;

export const Default: Story = {
  args: {},
};
