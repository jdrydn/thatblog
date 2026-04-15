import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./handler.ts'],
  outDir: './dist',
  splitting: false,
  sourcemap: true,
  clean: true,
});
