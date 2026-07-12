import { Hono } from 'hono';
import type { Models } from '@thatblog/backend-api/models';
import { resolveHostToBlogId } from '@thatblog/backend-api/models/blog-domain';
import type { Renderer } from '@thatblog/renderer';
import type { SiteEnv } from './context';
import { timeline } from './pages/timeline';
import { postById, postBySlug } from './pages/post';

// createApp takes its dependencies so tests can point the whole app at a Testcontainers table and a
// local-disk theme (mirrors backend-api's createApp); lambda.ts binds the env-driven singletons + the
// S3 theme loader. The wiring lives there, not here, so importing this module never eagerly builds the
// S3 renderer (which needs CONTENT_BUCKET) — the tests import createApp with their own deps.
export function createApp(deps: { models: Models; renderer: Renderer }) {
  const app = new Hono<SiteEnv>();

  // The admin SPA is served from S3 under /admin/* (HTTP API S3 proxy, PLAN.md #17). A bare /admin has
  // no path segment for that route's {proxy+} to catch, so it falls through to this catch-all site app;
  // send it on to the SPA entrypoint. It's /admin/index.html, not /admin/ — HTTP API normalises a
  // trailing slash back to /admin, which would loop straight back here. This sits ahead of the
  // host-resolution middleware because the admin build is global, not blog-scoped.
  app.get('/admin', (c) => c.redirect('/admin/index.html', 302));

  app.use('*', async (c, next) => {
    c.set('models', deps.models);
    c.set('renderer', deps.renderer);
    await next();
  });

  // Resolve the blog from the incoming Host (PLAN.md section 10): host → blogId via the unique
  // DOMAINS# gs1, then load the Blog. Strip any port and lowercase — the domain keys are stored
  // verbatim (casing:'none'), so routing normalises here. An unknown host is a 404, before any page.
  app.use('*', async (c, next) => {
    const host = (c.req.header('host') ?? '').split(':')[0]!.toLowerCase();
    const blogId = host ? await resolveHostToBlogId(c.var.models.BlogDomain, host) : undefined;
    const { data: blog } = blogId ? await c.var.models.Blog.get({ blogId }).go() : { data: undefined };
    if (!blog) return c.notFound();
    c.set('blog', blog);
    await next();
  });

  app.get('/', timeline);
  // Static-prefixed route before the slug catch-all so /posts/:postId can't be swallowed as a slug.
  app.get('/posts/:postId', postById);
  app.get('/:slug', postBySlug);

  return app;
}
