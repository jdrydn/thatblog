import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as userModels from './models';

export function createLoaders(models: typeof userModels) {
  const UserById = new DataLoader<string, userModels.UserItem | undefined>(async (userIds) => {
    const results: (userModels.UserItem | undefined)[] = userIds.map(() => undefined);

    const { data } = await models.User.get(userIds.map((userId) => ({ userId }))).go();

    for (const item of data) {
      const i = userIds.findIndex((userId) => item.userId === userId);
      results[i] = item;
    }

    return results;
  });

  const UserByEmail = new DataLoader<string, userModels.UserItem | undefined>(
    async ([email]) => {
      const { data } = await models.User.query.byEmail({ email }).go({
        hydrate: true,
        limit: 1,
      });

      if (data[0]?.userId) {
        const [user] = data;
        UserById.prime(user.userId, user);
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
      cacheKeyFn: ({ userId, sessionId }) => `USERS#${userId}#SESSIONS#${sessionId}`,
    },
  );

  return {
    UserById,
    UserByEmail,
    UserSessionById,
  };
}
