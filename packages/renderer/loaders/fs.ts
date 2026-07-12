import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import type { TemplateLoader } from '../index';

// The local-disk loader: templates live under a directory (a theme folder in the repo, or the
// theme-kit working dir). The prod counterpart is frontend-site's S3 loader — same interface, so the
// renderer can't tell them apart. `path` is a template-relative posix path composed by the renderer;
// join() maps it onto the root directory.
export function fsLoader(root: string): TemplateLoader {
  return {
    readFile: (path) => readFile(join(root, path), 'utf8'),
    async exists(path) {
      try {
        await access(join(root, path));
        return true;
      } catch {
        return false;
      }
    },
  };
}
