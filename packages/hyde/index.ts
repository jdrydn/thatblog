import { Liquid } from 'liquidjs';
import { posix } from 'path';

import { createS3FS } from './fs';
import * as filters from './filters';

const engine = new Liquid({
  root: './themes',
  extname: '.liquid',
  fs: createS3FS({
    bucket: process.env.S3_BUCKET!,
  }),
  strictFilters: true,
  strictVariables: true,
  lenientIf: true,
});

for (const [key, filter] of Object.entries(filters)) {
  engine.registerFilter(key, filter as never);
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
