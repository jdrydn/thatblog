import { Hono } from 'hono';
import { z } from 'zod';
import type { EntityItem } from 'electrodb';
import type { AppEnv } from '../context';
import type { UserEntity } from '../models/user';
import { ensureSystem } from '../auth/system';
import { verifyPassword } from '../auth/passwords';
import { destroySession } from '../auth/sessions';
import { issueSession, clearSessionCookie } from '../auth/http';
import { requireAuth } from '../auth/middleware';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// The public view of a user — never leak passwordHash.
const publicUser = (user: EntityItem<UserEntity>) => ({
  userId: user.userId,
  email: user.email,
  displayName: user.displayName,
});

export const authRoutes = new Hono<AppEnv>();

// Email/password login (PLAN.md 10.1). Look the user up by email via the gs1 DataLoader, verify the
// bcrypt hash, then mint a session cookie. A missing user and a bad password return the same 401 so
// the endpoint doesn't reveal which emails exist.
authRoutes.post('/auth/login', async (c) => {
  const body = await c.req.json().catch(() => undefined);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid request' }, 400);

  const user = await c.var.loaders.userByEmail.load(parsed.data.email.toLowerCase());
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return c.json({ error: 'invalid credentials' }, 401);
  }

  const system = await ensureSystem(c.var.models);
  await issueSession(c, c.var.models, system.sessionSecrets, user.userId);

  return c.json({ user: publicUser(user) });
});

// Current session's user — the round-trip that proves the cookie works.
authRoutes.get('/auth/me', requireAuth, (c) => c.json({ user: publicUser(c.var.user) }));

// Revoke the session (delete the record) and clear the cookie.
authRoutes.post('/auth/logout', requireAuth, async (c) => {
  await destroySession(c.var.models, c.var.user.userId, c.var.session.sessionId);
  clearSessionCookie(c);
  return c.json({ ok: true });
});
