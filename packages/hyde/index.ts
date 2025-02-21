import { Liquid } from 'liquidjs';
import { posix } from 'path';

import { createS3FS } from './fs';
import * as filters from './filters';

const fs = createS3FS({
  bucket: process.env.S3_BUCKET!,
});

const engine = new Liquid({
  root: './themes',
  extname: '.liquid',
  fs,
  strictFilters: true,
  strictVariables: true,
  lenientIf: true,
});

for (const [key, filter] of Object.entries(filters)) {
  engine.registerFilter(key, filter as never);
}

export function exists(theme: string, file: string) {
  return fs.exists(posix.join(theme, file));
}

export function render(
  theme: string,
  file: string,
  opts?: {
    globals: Record<string, unknown>;
    variables: Record<string, unknown>;
  },
): Promise<string> {
  return engine.renderFile(posix.join(theme, file), opts?.variables, {
    globals: {
      theme_prefix: '/themes/' + theme,
      ...opts?.globals,
    },
    sync: false,
  });
}
