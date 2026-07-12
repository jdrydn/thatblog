import type { EntityItem } from 'electrodb';
import type { Models } from '../models';
import type { UserEntity } from '../models/user';
import type { UserSessionEntity } from '../models/user-session';
import { newSessionId } from '../models/ids';

type UserItem = EntityItem<UserEntity>;
type SessionItem = EntityItem<UserSessionEntity>;

// 3-day expiry (PLAN.md 10.1), matched by the DynamoDB TTL on expiresAt so records self-clean.
export const SESSION_TTL_SECONDS = 3 * 24 * 60 * 60;

const nowSeconds = () => Math.floor(Date.now() / 1000);

export async function createSession(models: Models, userId: string): Promise<SessionItem> {
  const sessionId = newSessionId();
  const expiresAt = nowSeconds() + SESSION_TTL_SECONDS;
  const { data } = await models.UserSession.create({ userId, sessionId, expiresAt }).go();
  return data;
}

// Resolve a cookie reference to its live session + user. DynamoDB TTL is eventual (an expired item can
// linger), so we re-check expiresAt on read rather than trust the sweep.
export async function loadSession(
  models: Models,
  ref: { userId: string; sessionId: string },
): Promise<{ session: SessionItem; user: UserItem } | undefined> {
  const { data: session } = await models.UserSession.get(ref).go();
  if (!session || session.expiresAt <= nowSeconds()) return undefined;

  const { data: user } = await models.User.get({ userId: ref.userId }).go();
  if (!user) return undefined;

  return { session, user };
}

export async function destroySession(models: Models, userId: string, sessionId: string): Promise<void> {
  await models.UserSession.delete({ userId, sessionId }).go();
}
