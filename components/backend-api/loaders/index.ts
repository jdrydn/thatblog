import type { EntityItem } from 'electrodb';
import DataLoader from 'dataloader';
import type { Models } from '../models';
import type { UserEntity } from '../models/user';

type UserItem = EntityItem<UserEntity>;

// Per-request DataLoaders (built fresh per request in the app middleware), so they dedupe within a
// request but never cache across users. Each loader follows the gs1 hydration pattern (PLAN.md 8.1,
// [[electrodb-keys-only-gsi]]): query the KEYS_ONLY gs1 → collect ids from the keys → one BatchGet.
export function makeLoaders(models: Models) {
  // Login lookup: EMAILS#{email} → User. Callers must pass a lowercased email (keys are casing:'none',
  // so the model does not normalise). Batches N emails into N index queries + a single BatchGet.
  const userByEmail = new DataLoader<string, UserItem | undefined>(async (emails) => {
    const userIds = await Promise.all(
      emails.map(async (email) => {
        const { data } = await models.User.query
          .byEmail({ email })
          // KEYS_ONLY: includeKeys surfaces the raw gs1sk (carries USERS#{userId}); ignoreOwnership
          // skips the ownership stamp that KEYS_ONLY doesn't project. ElectroDB doesn't type these.
          .go({ ignoreOwnership: true, data: 'includeKeys' });
        const key = data[0] as unknown as { gs1sk?: string } | undefined;
        return key?.gs1sk?.slice('USERS#'.length);
      }),
    );

    const ids = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
    const { data: users } = ids.length
      ? await models.User.get(ids.map((userId) => ({ userId }))).go()
      : { data: [] as UserItem[] };
    const byId = new Map(users.map((user) => [user.userId, user]));

    return userIds.map((id) => (id ? byId.get(id) : undefined));
  });

  return { userByEmail };
}

export type Loaders = ReturnType<typeof makeLoaders>;
