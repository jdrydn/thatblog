import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import type { AppEnv } from '../context';
import { SESSION_COOKIE, verifySession } from './cookies';
import { ensureSystem } from './system';
import { loadSession } from './sessions';

// Gate for protected routes (PLAN.md 10.1): verify the cookie signature against the System secrets,
// look up the live session, then attach the user + session to the request. Any failure is a flat 401
// — we don't distinguish missing / malformed / expired to a caller. Per-blog role checks
// (MapBlogUser) layer on top of this in later milestones once a target blog is resolved.
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const raw = getCookie(c, SESSION_COOKIE);
  if (!raw) return c.json({ error: 'unauthorized' }, 401);

  const system = await ensureSystem(c.var.models);
  const ref = verifySession(raw, system.sessionSecrets);
  if (!ref) return c.json({ error: 'unauthorized' }, 401);

  const loaded = await loadSession(c.var.models, ref);
  if (!loaded) return c.json({ error: 'unauthorized' }, 401);

  c.set('user', loaded.user);
  c.set('session', loaded.session);
  await next();
};
