import { z } from 'zod';

import { procedure } from '@/backend-api/src/lib/trpc';
import { User } from '@/backend-api/src/models';

export const loginUserMutation = procedure
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { username, password } = input;

    const { data } = await User.query.byUsername({ username }).go({
      attributes: ['id'],
    });

    return; // something
  });
