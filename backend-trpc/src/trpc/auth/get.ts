import assert from 'http-assert-plus';

import { procedure } from '@/src/trpc/core';

export const getQuery = procedure.query(async ({ ctx }) => {
  const { userId, sessionId } = ctx;
  assert(userId && sessionId, 401, 'Missing { userId } from ctx', {
    title: 'You are not authenticated',
    description: 'Please sign-in, or check your request & try again',
  });

  const { UserById, UserSessionById } = ctx.loaders;
  const [user, session] = await Promise.all([
    // Fetch the user by ID
    UserById.load(userId),
    // Fetch the user session by ID
    UserSessionById.load({ userId, sessionId }),
  ]);

  assert(user?.userId && session?.sessionId, 500, 'Failed to load user/session by ID', {
    title: 'Error checking authentication',
    description: 'Please re-authenticate, or check your request & try again',
  });

  ctx.log.info({ userId, sessionId }, 'User is authenticated');

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
    // blogs: blogsMap.map(({ blogId, displayName }) => ({ blogId, displayName })),
  };
});
