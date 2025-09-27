import assert from 'http-assert-plus';
import { initTRPC } from '@trpc/server';

import { errorFormatter } from './errors';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter,
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;

export const procedure = t.procedure.use(async ({ ctx, type, path, input, next }) => {
  const start = Date.now();
  ctx.log.debug({ trpc: { type, path, input } }, 'STARTED');

  try {
    const result = await next();
    return result;
  } finally {
    ctx.log.debug(
      {
        trpc: { type, path, input },
        durationMs: Date.now() - start,
      },
      'FINISHED',
    );
  }
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
