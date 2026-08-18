/* @compdocs-generated */
import React, { useState } from 'react';
import { Toggle } from './Toggle';

export default {
  title: 'Design System/Toggle',
  component: Toggle,
  args: {
    checked: true,
    'aria-label': 'Enable layer',
  },
};

export const Default = () => {
  const [checked, setChecked] = useState(true);
  return <Toggle checked={checked} onChange={setChecked} aria-label="Toggle layer" />;
};

export const WithLabel = () => {
  const [checked, setChecked] = useState(false);
  return <Toggle checked={checked} onChange={setChecked} label="National Parks" />;
};

export const Sizes = () => {
  const [checked, setChecked] = useState(true);
  return (
    <div className="flex items-center gap-6 p-4 bg-zinc-100 rounded-xl">
      <Toggle size="sm" checked={checked} onChange={setChecked} label="Small" />
      <Toggle size="md" checked={checked} onChange={setChecked} label="Medium" />
      <Toggle size="lg" checked={checked} onChange={setChecked} label="Large" />
    </div>
  );
};
