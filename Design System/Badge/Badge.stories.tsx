/* @compdocs-generated */
import React from 'react';
import { Badge } from './Badge';

export default {
  title: 'Design System/Badge',
  component: Badge,
  args: {
    children: 'Critically Endangered (CR)',
    variant: 'red',
  },
};

export const Default = {
  args: {
    children: 'Endangered',
    variant: 'amber',
  },
};

export const StatusVariants = () => (
  <div className="flex flex-wrap items-center gap-3 p-4 bg-zinc-100 rounded-xl">
    <Badge variant="red">Critically Endangered (CR)</Badge>
    <Badge variant="amber">Endangered (EN)</Badge>
    <Badge variant="sky">Vulnerable (VU)</Badge>
    <Badge variant="teal">Near Threatened (NT)</Badge>
    <Badge variant="emerald">Least Concern (LC)</Badge>
    <Badge variant="neutral">Vibe Coded</Badge>
  </div>
);
