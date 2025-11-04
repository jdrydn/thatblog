import path from 'path';
import { defineConfig, type Options } from 'tsup';

export default defineConfig([
  {
    entry: [path.resolve(__dirname, './src/handler.ts')],
    outDir: path.resolve(__dirname, './dist/'),
    bundle: true,
    clean: true,
    format: 'cjs',
    minify: true,
    noExternal: [/./],
    platform: 'node',
    splitting: false,
    target: 'node22',
    loader: {
      '.txt': 'base64',
    },
  } satisfies Options,
]);
