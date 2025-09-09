import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as userModels from './models';

export function createLoaders(models: typeof userModels) {
  const UserProfileById = new DataLoader<string, userModels.UserProfileItem | undefined>(async (userIds) => {
    const results: (userModels.UserProfileItem | undefined)[] = userIds.map(() => undefined);

    const { data } = await models.UserProfile.get(userIds.map((userId) => ({ userId }))).go();

    for (const item of data) {
      const i = userIds.findIndex((userId) => item.userId === userId);
      results[i] = item;
    }

    return results;
  });

  const UserProfileByEmail = new DataLoader<string, userModels.UserProfileItem | undefined>(
    async ([email]) => {
      const { data } = await models.UserProfile.query.byEmail({ email }).go({
        hydrate: true,
        limit: 1,
      });

      if (data[0]?.userId) {
        const [user] = data;
        UserProfileById.prime(user.userId, user);
        return [user];
      } else {
        return [undefined];
      }
    },
    {
      maxBatchSize: 1,
    },
  );

  const UserSessionById = new DataLoader<{ userId: string; sessionId: string }, userModels.UserSessionItem | undefined>(
    async (keys) => {
      const results: (userModels.UserSessionItem | undefined)[] = keys.map(() => undefined);

      const { data } = await models.UserSession.get([...keys]).go();

      for (const item of data) {
        const i = keys.findIndex(({ userId, sessionId }) => item.userId === userId && item.sessionId === sessionId);
        results[i] = item;
      }

      return results;
    },
    {
      // @ts-expect-error Deliberately changing the return type
      cacheKeyFn({ userId, sessionId }) {
        return `USERS#${userId}#SESSIONS#${sessionId}`;
      },
    },
  );

  return {
    UserProfileById,
    UserProfileByEmail,
    UserSessionById,
  };
}
