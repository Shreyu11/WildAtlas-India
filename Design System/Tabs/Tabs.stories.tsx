/* @compdocs-generated */
import React, { useState } from 'react';
import { PawPrint, TreePine, Compass, Landmark } from 'lucide-react';
import { Tabs } from './Tabs';

export default {
  title: 'Design System/Tabs',
  component: Tabs,
};

export const Default = () => {
  const [activeTab, setActiveTab] = useState('species');

  return (
    <div className="p-4 bg-zinc-50 rounded-xl">
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'species', label: 'Species', count: 12, icon: <PawPrint className="h-3.5 w-3.5" /> },
          { id: 'parks', label: 'National Parks', count: 4, icon: <TreePine className="h-3.5 w-3.5" /> },
          { id: 'sanctuaries', label: 'Sanctuaries', count: 8, icon: <Compass className="h-3.5 w-3.5" /> },
          { id: 'zoos', label: 'Zoos', count: 2, icon: <Landmark className="h-3.5 w-3.5" /> },
        ]}
      />
    </div>
  );
};
