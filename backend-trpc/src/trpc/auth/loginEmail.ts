import assert from 'http-assert-plus';
import { z } from 'zod';

import { createUserToken } from '@/src/modules/authentication/tokens';
import { procedure } from '@/src/trpc/core';
import { comparePassword } from '@/src/modules/authentication/passwords';
import { Application } from '@/src/modules/models';

export const loginEmailMutation = procedure
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
      description: 'User not found, or password does not match - please try again',
      statusCode: 404,
      meta: { email },
    };

    const { UserByEmail } = ctx.loaders;
    const user = await UserByEmail.load(email);
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
