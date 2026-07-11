import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newSessionId, newUserId } from './ids';

const { UserSession } = testModels();

describe('UserSession', () => {
  it('stores a session with a TTL and fetches it by id (10.1)', async () => {
    const userId = newUserId();
    const sessionId = newSessionId();
    const expiresAt = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60; // 3-day expiry

    await UserSession.put({ userId, sessionId, expiresAt }).go();

    const { data } = await UserSession.get({ userId, sessionId }).go();
    expect(data?.sessionId).toBe(sessionId);
    expect(data?.expiresAt).toBe(expiresAt);
  });
});
