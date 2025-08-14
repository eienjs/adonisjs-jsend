import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['index.ts', 'providers/jsend_provider.ts'],
    shims: true,
    format: ['esm'],
    target: 'esnext',
  },
]);
