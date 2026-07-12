import { posix } from 'node:path';
import type { FS } from 'liquidjs';
import type { TemplateLoader } from './index';

// Adapt a TemplateLoader onto the LiquidJS `FS` interface. LiquidJS drives lookups through `resolve`
// (compose a lookup path from a dir + template name + extension) then `readFile`/`exists`; we route
// those to the loader. Everything is posix + async — the loaders (a directory, an S3 prefix) are flat
// key spaces, so there is no realpath containment to enforce (omitting `contains` = assumed contained).
// The sync methods are mandated by the type but only used by `renderSync`, which we never call, so
// they throw rather than pretend: this renderer is async-only (S3 has no sync read).
export function toLiquidFS(loader: TemplateLoader): FS {
  const notSync = () => {
    throw new Error('renderer: synchronous rendering is not supported');
  };

  return {
    resolve(dir, file, ext) {
      const rel = posix.join(dir === '.' ? '' : dir, file);
      return ext && !rel.endsWith(ext) ? rel + ext : rel;
    },
    dirname: (file) => posix.dirname(file),
    sep: '/',
    exists: (path) => loader.exists(path),
    readFile: (path) => loader.readFile(path),
    existsSync: notSync,
    readFileSync: notSync,
  };
}
