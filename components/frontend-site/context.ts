import type { Models } from '@thatblog/backend-api/models';
import type { BlogItem } from '@thatblog/backend-api/models/blog';
import type { Renderer } from '@thatblog/renderer';

// Hono per-request variables. `models`/`renderer` are set for every request by the app middleware;
// `blog` is set only after resolveBlog (Host → Blog), so the page handlers behind it read it
// non-optionally. A miss in resolveBlog 404s before any handler runs.
export type SiteEnv = {
  Variables: {
    models: Models;
    renderer: Renderer;
    blog: BlogItem;
  };
};
