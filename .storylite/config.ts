import { defineConfig } from '@storylite/storylite';
import reactRenderer from '@storylite/renderer-react';
import react from '@vitejs/plugin-react';
import * as path from 'node:path';

export default defineConfig({
  title: 'compdocs — Component Documentation',
  renderer: reactRenderer(),
  stories: ['./src/components/**/*.stories.tsx', 'src/components/**/*.stories.tsx'],
  storySort: {
    order: ['Atoms', 'Molecules', 'Organisms'],
  },
  vite: {
    plugins: [react()],
    resolve: {
      alias: [
        { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, '../src/$1') },
        { find: '@', replacement: path.resolve(__dirname, '../src') },
      ],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
  },
});
