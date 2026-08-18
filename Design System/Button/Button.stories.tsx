/* @compdocs-generated */
import React from 'react';
import { ArrowRight, Compass, Download } from 'lucide-react';
import { Button } from './Button';

export default {
  title: 'Design System/Button',
  component: Button,
  args: {
    children: 'Explore Wildlife',
    variant: 'primary',
    size: 'md',
  },
};

export const Default = {
  args: {
    children: 'Explore Wildlife',
  },
};

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-4 p-4 bg-zinc-100 rounded-xl">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="danger">Danger</Button>
  </div>
);

export const WithIcons = () => (
  <div className="flex items-center gap-4 p-4 bg-zinc-100 rounded-xl">
    <Button variant="primary" leadingIcon={<Compass className="h-4 w-4" />}>
      Explore States
    </Button>
    <Button variant="outline" trailingIcon={<ArrowRight className="h-4 w-4" />}>
      Next Species
    </Button>
    <Button variant="secondary" leadingIcon={<Download className="h-4 w-4" />}>
      Export GeoJSON
    </Button>
  </div>
);
