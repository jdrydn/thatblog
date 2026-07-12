import { createHmac, timingSafeEqual } from 'node:crypto';

// The signed session cookie (PLAN.md 10.1): value is `userId.sessionId.signature`, HMAC-SHA256 over
// the `userId.sessionId` payload. userId/sessionId are nanoids (alphabet has no '.'), so the parts
// split unambiguously. We sign with the newest secret (index 0) and verify against every secret in
// the System list, so rotation is add-new / retire-old with no forced logouts.
export const SESSION_COOKIE = 'thatblog_session';

const hmac = (payload: string, secret: string): Buffer => createHmac('sha256', secret).update(payload).digest();

export function signSession(userId: string, sessionId: string, secrets: string[]): string {
  const secret = secrets[0];
  if (!secret) throw new Error('cannot sign session: no session secrets configured');
  const payload = `${userId}.${sessionId}`;
  return `${payload}.${hmac(payload, secret).toString('base64url')}`;
}

export function verifySession(cookie: string, secrets: string[]): { userId: string; sessionId: string } | undefined {
  const parts = cookie.split('.');
  if (parts.length !== 3) return undefined;
  const [userId, sessionId, signature] = parts as [string, string, string];
  const payload = `${userId}.${sessionId}`;
  const given = Buffer.from(signature, 'base64url');

  const ok = secrets.some((secret) => {
    const expected = hmac(payload, secret);
    return expected.length === given.length && timingSafeEqual(expected, given);
  });

  return ok ? { userId, sessionId } : undefined;
}
