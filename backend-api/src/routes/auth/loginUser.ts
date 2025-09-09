import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedure } from '@/backend-api/src/lib/trpc';
import { comparePassword } from '@/backend-api/src/modules/authentication/passwords';
import { mapBlogsUsers, userSessions } from '@/backend-api/src/modules/models';

export const loginUserMutation = procedure
  .input(
    z.object({
      email: z.string(),
      password: z.string().transform((value) => Buffer.from(value, 'base64').toString('utf8')),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { email, password } = input;

    const errUserNotFound = {
      title: 'User not found',
      description: 'Email or password does not match - please review',
      statusCode: 404,
      meta: { email },
    };

    const user = await ctx.loaders.UserProfileByEmail.load(email);
    assert(user?.userId, 'User not found by email', errUserNotFound);
    assert(user.password, 'User does not have a password attached', errUserNotFound);
    assert(await comparePassword(user.password, password), 'User password does not match', errUserNotFound);

    const { userId } = user;

    ctx.log.info({ userId });

    const { data: session } = await userSessions.create({ userId }).go();

    const { data: blogsMap } = await mapBlogsUsers.query.byUser({ userId }).go({ pages: 'all' });

    // @TODO Create a token

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        createdAt: new Date(user.createdAt),
      },
      session: {
        id: session.sessionId,
        createdAt: new Date(session.createdAt),
      },
      blogs: blogsMap.map(({ blogId, displayName }) => ({ blogId, displayName })),
    };
  });
