import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../context';
import { newBlogId, newUserId } from '../models/ids';
import { ensureSystem } from '../auth/system';
import { hashPassword } from '../auth/passwords';
import { issueSession } from '../auth/http';

// First-run setup (PLAN.md 10.1, #18): the setupKey in the path gates a one-shot that creates the
// first owner User, the first Blog, its primary BlogDomain, and the owner MapBlogUser — then clears
// the key, permanently disabling the route. The owner is auto-logged-in on success. (Default-theme
// seeding is deferred until the theme system lands in a later milestone.)
const setupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
  blog: z.object({
    name: z.string().min(1),
    host: z.string().min(1),
  }),
});

export const setupRoutes = new Hono<AppEnv>();

setupRoutes.post('/api/setup/:key', async (c) => {
  const models = c.var.models;
  const system = await ensureSystem(models);

  // Key already cleared → setup is done. A wrong key is a 404 so the route reveals nothing.
  if (!system.setupKey) return c.json({ error: 'setup already completed' }, 410);
  if (c.req.param('key') !== system.setupKey) return c.json({ error: 'not found' }, 404);

  const body = await c.req.json().catch(() => undefined);
  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid request', issues: parsed.error.issues }, 400);

  const userId = newUserId();
  const blogId = newBlogId();
  // Normalise in the caller — keys are casing:'none', so the models store email/host verbatim
  // ([[electrodb-keys-only-gsi]]); lowercasing here keeps login + routing case-insensitive.
  const email = parsed.data.email.toLowerCase();
  const host = parsed.data.blog.host.toLowerCase();

  await models.User.create({
    userId,
    email,
    passwordHash: await hashPassword(parsed.data.password),
    displayName: parsed.data.displayName,
  }).go();
  await models.Blog.create({ blogId, profile: { name: parsed.data.blog.name } }).go();
  await models.BlogDomain.create({ blogId, host, type: 'primary', status: 'active' }).go();
  await models.MapBlogUser.create({ blogId, userId, role: 'owner' }).go();

  // Clear the key last, so a partial failure leaves setup retryable.
  await models.System.patch({}).remove(['setupKey']).go();

  await issueSession(c, models, system.sessionSecrets, userId);

  return c.json(
    { user: { userId, email, displayName: parsed.data.displayName }, blog: { blogId, name: parsed.data.blog.name } },
    201,
  );
});
