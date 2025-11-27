import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    clean: true,
    noExternal: ['graphology-metrics'],
    target: 'es2020',
});
