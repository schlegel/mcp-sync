import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'bin/cli': 'src/bin/cli.ts',
  },
  format: ['esm'],
  dts: { entry: 'src/index.ts' },
  splitting: false,
  clean: true,
  target: 'node18',
  outDir: 'dist',
  shims: true,
});
