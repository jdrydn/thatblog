import { Hono } from 'hono';
import type { AppEnv } from '../context';
import { requireAuth } from '../auth/middleware';

// The blogs the authenticated user belongs to — the admin SPA calls this on load to discover which
// blog(s) it can write to (today there's one; a multi-blog picker is a future add, PLAN.md section 9).
// MapBlogUser's gs1 (byUser: USERS#{userId} → BLOGS#{blogId}) is KEYS_ONLY, so hydrate the membership
// items to read each role ([[electrodb-keys-only-gsi]]), then BatchGet the Blog items for their names.
export const blogsRoutes = new Hono<AppEnv>();

blogsRoutes.get('/api/blogs', requireAuth, async (c) => {
  const { MapBlogUser, Blog } = c.var.models;

  const { data: memberships } = await MapBlogUser.query.byUser({ userId: c.var.user.userId }).go({ hydrate: true });
  if (!memberships.length) return c.json({ blogs: [] });

  const { data: blogs } = await Blog.get(memberships.map((m) => ({ blogId: m.blogId }))).go();
  const nameById = new Map(blogs.map((b) => [b.blogId, b.profile.name]));

  return c.json({
    blogs: memberships.map((m) => ({ blogId: m.blogId, name: nameById.get(m.blogId) ?? '', role: m.role })),
  });
});
