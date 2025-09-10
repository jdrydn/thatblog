import assert from 'http-assert-plus';
import { z } from 'zod';

import { createUserToken } from '@/backend-api/src/modules/authentication/tokens';
import { procedure } from '@/backend-api/src/lib/trpc';
import { comparePassword } from '@/backend-api/src/modules/authentication/passwords';
import { Application } from '@/backend-api/src/modules/models';

export const loginUserMutation = procedure
  .input(
    z.object({
      email: z.string(),
      password: z.string().transform((value) => Buffer.from(value, 'base64').toString('utf8')),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { System } = ctx.loaders;
    const system = await System.load();

    const { email, password } = input;

    const errUserNotFound = {
      title: 'User not found',
      description: 'Email or password does not match - please review',
      statusCode: 404,
      meta: { email },
    };

    const { UserProfileByEmail } = ctx.loaders;
    const user = await UserProfileByEmail.load(email);
    assert(user?.userId, 'User not found by email', errUserNotFound);
    const { userId } = user;
    assert(user.password, 'User does not have a password attached', errUserNotFound);
    assert(await comparePassword(user.password, password), 'User password does not match', errUserNotFound);

    const { UserSessionById } = ctx.loaders;
    const { UserSession } = Application.entities;
    // Create a new session for this user
    const { data: session } = await UserSession.create({ userId }).go();
    const { sessionId } = session;
    UserSessionById.prime({ userId, sessionId }, session);

    ctx.log.info({ userId, sessionId }, 'User successfully logged-in');

    // const { data: blogsMap } = await MapBlogUser.query.byUser({ userId }).go({ pages: 'all' });

    const token = createUserToken(system, { userId, sessionId });

    return {
      token,
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
      // blogs: blogsMap.map(({ blogId, displayName }) => ({ blogId, displayName })),
    };
  });
