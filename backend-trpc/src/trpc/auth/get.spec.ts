import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { createScenarios, GeoffTestingtonUser } from '@/test/fixtures';

import { getQuery } from './get';

useModels(({ Application }) => createScenarios(Application, ['GEOFF_TESTINGTON_USER']));

test('it should return the current user & session', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Item.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });
  const result = await runProcedure(ctx, getQuery);

  expect(result).toEqual({
    user: {
      id: GeoffTestingtonUser.Item.userId,
      name: GeoffTestingtonUser.Item.name,
      email: GeoffTestingtonUser.Item.email,
      createdAt: GeoffTestingtonUser.Item.createdAt,
    },
    session: {
      id: GeoffTestingtonUser.Session.sessionId,
      createdAt: GeoffTestingtonUser.Session.createdAt,
    },
  });
});
