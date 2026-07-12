import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../context';

// Per-blog authorization, layered on top of requireAuth (PLAN.md 10.1): the authenticated user must
// hold a MapBlogUser membership for the :blogId in the path. The membership carries the role, which
// is attached to the request so handlers can gate on it — v0.0.4 lets any role (owner/admin/editor)
// author, so presence of a membership is enough. No membership → 403.
export const requireBlogMember: MiddlewareHandler<AppEnv> = async (c, next) => {
  const blogId = c.req.param('blogId');
  if (!blogId) return c.json({ error: 'not found' }, 404);

  const { data } = await c.var.models.MapBlogUser.get({ blogId, userId: c.var.user.userId }).go();
  if (!data) return c.json({ error: 'forbidden' }, 403);

  c.set('membership', data);
  await next();
};
