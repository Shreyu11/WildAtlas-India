/* @compdocs-generated */
import React from 'react';
import { X, Search, Settings, Heart } from 'lucide-react';
import { IconButton } from './IconButton';

export default {
  title: 'Design System/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Close panel',
    variant: 'secondary',
    size: 'md',
  },
};

export const Default = {
  args: {
    'aria-label': 'Close panel',
    icon: <X className="h-4 w-4" />,
  },
};

export const Variants = () => (
  <div className="flex items-center gap-4 p-4 bg-zinc-100 rounded-xl">
    <IconButton variant="ghost" aria-label="Settings" icon={<Settings className="h-4 w-4" />} />
    <IconButton variant="secondary" aria-label="Close" icon={<X className="h-4 w-4" />} />
    <IconButton variant="glass" aria-label="Search" icon={<Search className="h-4 w-4" />} />
    <IconButton variant="outline" aria-label="Favorite" icon={<Heart className="h-4 w-4" />} />
    <IconButton variant="solid" aria-label="Search" icon={<Search className="h-4 w-4" />} />
  </div>
);
