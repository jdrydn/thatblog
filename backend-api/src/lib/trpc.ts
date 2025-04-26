import assert from 'http-assert-plus';
import { initTRPC } from '@trpc/server';

import { errorFormatter } from './trpc.helpers';
import type { Context } from '../modules/types';

const t = initTRPC.context<Context>().create({
  errorFormatter,
});

export const createCallerFactory = t.createCallerFactory;

export const middleware = t.middleware;
export const router = t.router;

export const procedure = t.procedure.use(async ({ ctx, type, path, input, next }) => {
  const start = Date.now();

  ctx.log.debug({ trpc: { type, path, input } }, 'STARTED');

  const result = await next();

  ctx.log.debug(
    {
      trpc: { type, path, input },
      durationMs: Date.now() - start,
    },
    'FINISHED',
  );

  return result;
});

export const procedureRequiresBlog = procedure.use(async ({ ctx, next }) => {
  const { blogId } = ctx;
  assert(blogId, 500, 'Missing { blogId } from ctx', {
    title: 'Internal Server Error',
    description: 'Please check your request & try again',
  });

  return next({
    ctx: {
      blogId,
    },
  });
});

export const procedureRequiresBlogUser = procedure.use(async ({ ctx, next }) => {
  const { blogId, userId } = ctx;
  assert(blogId, 500, 'Missing { blogId } from ctx', {
    title: 'Internal Server Error',
    description: 'Please check your request & try again',
  });
  assert(userId, 401, 'Missing { userId } from ctx', {
    title: 'You must be authenticated to do that',
    description: 'Please sign-in or check your request & try again',
  });

  return next({
    ctx: {
      blogId,
      userId,
    },
  });
});

export const procedureRequiresUser = procedure.use(async ({ ctx, next }) => {
  const { userId } = ctx;
  assert(userId, 401, 'Missing { userId } from ctx', {
    title: 'You must be authenticated to do that',
    description: 'Please sign-in or check your request & try again',
  });

  return next({
    ctx: {
      userId,
    },
  });
});
