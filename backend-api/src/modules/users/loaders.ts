import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as userModels from './model';

export function createLoaders(models: typeof userModels) {
  const UserProfileById = new DataLoader<string, userModels.UserProfileItem | undefined>(async (userIds) => {
    const results: (userModels.UserProfileItem | undefined)[] = userIds.map(() => undefined);

    const { data } = await models.userProfiles.get(userIds.map((userId) => ({ userId }))).go()

    for (const item of data) {
      const i = userIds.findIndex((userId) => item.userId === userId);
      results[i] = item;
    }

    return results;
  });

  const UserSessionById = new DataLoader<{ userId: string, sessionId: string }, userModels.UserSessionItem | undefined>(async (keys) => {
    const results: (userModels.UserSessionItem | undefined)[] = keys.map(() => undefined);

    const { data } = await models.userSessions.get([ ...keys ]).go()

    for (const item of data) {
      const i = keys.findIndex(({ userId, sessionId }) => item.userId === userId && item.sessionId === sessionId);
      results[i] = item;
    }

    return results;
  }, {
    // @ts-expect-error Deliberately changing the return type
    cacheKeyFn({ userId, sessionId }) {
      return `USERS#${userId}#SESSIONS#${sessionId}`
    },
  });

  return {
    UserProfileById,
    UserSessionById,
  };
}
