import ms from 'ms';
import matchers from 'expect-asymmetric';
import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { GeoffTestingtonUserProfile, GeoffTestingtonUserSession } from '@/test/fixtures';

import { getQuery } from './get';

useModels(async ({ Application }) => {
  await Application.transaction
    .write(({ User, UserSession }) => [
      User.upsert(GeoffTestingtonUserProfile).commit(),
      UserSession.upsert(GeoffTestingtonUserSession).commit(),
    ])
    .go();
});

test('it should return the current user & session', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUserProfile.userId,
    sessionId: GeoffTestingtonUserSession.sessionId,
  });
  const result = await runProcedure(ctx, getQuery);

  expect(result).toEqual({
    user: {
      id: GeoffTestingtonUserProfile.userId,
      name: GeoffTestingtonUserProfile.name,
      email: GeoffTestingtonUserProfile.email,
      createdAt: matchers.dateWithin(new Date(), ms('1s')),
    },
    session: {
      id: expect.anything(),
      createdAt: matchers.dateWithin(new Date(), ms('1s')),
    },
  });
});
