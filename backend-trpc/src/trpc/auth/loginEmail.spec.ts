import ms from 'ms';
import matchers from 'expect-asymmetric';
import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { useModels } from '@/test/hooks/useModels';
import { GeoffTestingtonUserProfile } from '@/test/fixtures';

import { loginEmailMutation } from './loginEmail';

useModels(async ({ Application }) => {
  await Application.transaction.write(({ User }) => [User.upsert(GeoffTestingtonUserProfile).commit()]).go();
});

test('it should login with email/password', async () => {
  const result = await runProcedure(undefined, loginEmailMutation, {
    email: 'geoff.testington@example.com',
    password: Buffer.from('hello-world-1', 'utf8').toString('base64'),
  });

  expect(result).toEqual({
    token: matchers.stringJWT(),
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
