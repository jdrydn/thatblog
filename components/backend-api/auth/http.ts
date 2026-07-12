import type { Context } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import type { AppEnv } from '../context';
import type { Models } from '../models';
import { SESSION_COOKIE, signSession } from './cookies';
import { createSession, SESSION_TTL_SECONDS } from './sessions';

// httpOnly + Secure + SameSite=Lax signed cookie (PLAN.md 10.1). maxAge matches the session TTL so the
// browser drops the cookie as the DynamoDB record expires. Shared by setup (auto-login) and login.
export async function issueSession(
  c: Context<AppEnv>,
  models: Models,
  secrets: string[],
  userId: string,
): Promise<void> {
  const session = await createSession(models, userId);
  const cookie = signSession(userId, session.sessionId, secrets);
  setCookie(c, SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(c: Context<AppEnv>): void {
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
}
