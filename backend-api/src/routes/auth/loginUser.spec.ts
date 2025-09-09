import { test } from 'vitest';
import { runProcedure } from '@/backend-api/test/trpc';
import { useModels } from '@/backend-api/test/hooks/useModels';
import { GeoffTestingtonUserProfile } from '@/backend-api/test/fixtures';

import { loginUserMutation } from './loginUser';

useModels(async ({ application }) => {
  await application.transaction
    .write(({ userProfiles }) => [userProfiles.upsert(GeoffTestingtonUserProfile).commit()])
    .go();
});

test('it should login with email/password', async () => {
  const result = await runProcedure(undefined, loginUserMutation, {
    email: 'geoff.testington@example.com',
    password: Buffer.from('hello-world-1', 'utf8').toString('base64'),
  });

  console.log(result);
});
