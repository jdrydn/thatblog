import ms from 'ms';
import matchers from 'expect-asymmetric';
import { test, expect } from 'vitest';

import { runProcedure, runProcedureErr } from '@/test/trpc';
import { useModels } from '@/test/hooks/useModels';
import { createScenarios, GeoffTestingtonUser } from '@/test/fixtures';

import { loginEmailMutation } from './loginEmail';

useModels(({ Application }) => createScenarios(Application, ['GEOFF_TESTINGTON_USER']));

test('it should login with email/password', async () => {
  const result = await runProcedure(undefined, loginEmailMutation, {
    email: 'geoff.testington@example.com',
    password: Buffer.from('hello-world-1', 'utf8').toString('base64'),
  });

  expect(result).toEqual({
    token: matchers.stringJWT(),
    user: {
      id: GeoffTestingtonUser.Item.userId,
      name: GeoffTestingtonUser.Item.name,
      email: GeoffTestingtonUser.Item.email,
      createdAt: GeoffTestingtonUser.Item.createdAt,
    },
    session: {
      id: matchers.stringULID(),
      createdAt: matchers.dateWithin(new Date(), ms('1s')),
    },
  });
});

test('it should fail to login if password is incorrect', async () => {
  const err = await runProcedureErr(undefined, loginEmailMutation, {
    email: 'geoff.testington@example.com',
    password: Buffer.from('hello-world-2', 'utf8').toString('base64'),
  });

  expect(err).toBeInstanceOf(Error);
  expect(err).toMatchObject({
    message: 'User password does not match',
    title: 'User not found',
    description: 'User not found, or password does not match - please try again',
    status: 404,
    statusCode: 404,
    statusText: 'Not Found',
    meta: { email: 'geoff.testington@example.com' },
  });
});
