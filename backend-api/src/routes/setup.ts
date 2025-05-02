import assert from 'http-assert-plus';
import { z } from 'zod';

import { getAllByQuery } from '@/backend-api/src/lib/electrodb.helpers';
import { procedure } from '@/backend-api/src/lib/trpc';
import { comparePassword } from '@/backend-api/src/modules/authentication/passwords';
import { mapBlogsUsers, userProfiles, userSessions } from '@/backend-api/src/modules/models';

export const setupMutation = procedure
  .input(
    z.object({
      key: z.string(),
      blog: z.object({
        name: z.string(),
      }),
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

    const results = await userProfiles.query.byEmail({ email }).go({
      attributes: ['userId'],
    });

    assert(results.data?.[0]?.userId, 'User not found by email', errUserNotFound);

    const [{ userId }] = results.data;
    const { data: profile } = await userProfiles.get({ userId }).go();

    assert(profile, 'User not found by userId', errUserNotFound);
    assert(profile.password, 'User does not have a password attached', errUserNotFound);
    assert(await comparePassword(profile.password, password), 'User password does not match', errUserNotFound);

    ctx.log.info({ userId });

    const { data: session } = await userSessions.create({ userId }).go();

    const blogsMap = await getAllByQuery((cursor) => mapBlogsUsers.query.byUser({ userId }).go({ cursor }));

    // @TODO Create a token

    return {
      user: {
        id: userId,
        name: profile.name,
        email: profile.email,
        createdAt: profile.createdAt,
      },
      session: {
        id: session.sessionId,
        createdAt: session.createdAt,
      },
    };
  });
