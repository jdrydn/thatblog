import { describe, expect, it } from 'vitest';
import { signSession, verifySession } from './cookies';

describe('session cookie', () => {
  const secrets = ['newest-secret', 'older-secret'];

  it('round-trips a signed session with the newest secret', () => {
    const cookie = signSession('user-1', 'session-1', secrets);
    expect(verifySession(cookie, secrets)).toEqual({ userId: 'user-1', sessionId: 'session-1' });
  });

  it('verifies against any secret in the list (rotation)', () => {
    // Signed while 'older-secret' was newest; still valid once a new secret is prepended.
    const cookie = signSession('user-1', 'session-1', ['older-secret']);
    expect(verifySession(cookie, secrets)).toEqual({ userId: 'user-1', sessionId: 'session-1' });
  });

  it('rejects a cookie signed with an unknown/retired secret', () => {
    const cookie = signSession('user-1', 'session-1', ['retired-secret']);
    expect(verifySession(cookie, secrets)).toBeUndefined();
  });

  it('rejects a tampered payload', () => {
    const cookie = signSession('user-1', 'session-1', secrets);
    const [, sessionId, sig] = cookie.split('.');
    expect(verifySession(`attacker.${sessionId}.${sig}`, secrets)).toBeUndefined();
  });

  it('rejects a malformed cookie', () => {
    expect(verifySession('nope', secrets)).toBeUndefined();
    expect(verifySession('a.b.c.d', secrets)).toBeUndefined();
  });
});
