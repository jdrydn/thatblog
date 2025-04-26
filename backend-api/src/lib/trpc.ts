import assert from 'http-assert-plus';
import { initTRPC, type TRPCError } from '@trpc/server';

import type { Context } from '../modules/types';

export function errorFormatter({
  path,
  shape,
  error,
}: {
  // ctx: Context | undefined
  // type: 'query' | 'mutation' | 'subscription' | 'unknown'
  path: string | undefined;
  shape: {
    code: number;
    message: string;
    data?: { code: string; httpStatus: number; path?: string | undefined };
  };
  error: TRPCError;
}): {
  code: number;
  message: string;
  data: {
    title?: string | undefined;
    description?: string | undefined;
    code?: string | undefined;
    path?: string | undefined;
    httpStatus?: number | undefined;
    httpStatusText?: string | undefined;
  };
  meta: Record<string, string | number | boolean | string[] | number[] | undefined> | undefined;
} {
  /**
   * If there is a cause for the error, it's likely been emitted from our stack
   * So this adds support to extract specific properties from the error
   * See https://www.npmjs.com/package/http-assert-plus for how to add more properties to the error
   */
  if (error.cause) {
    const err = error.cause as {
      // Pass a specific HTTP response code (done automatically in http-assert-plus)
      statusCode?: number;
      statusText?: string;

      // The original raw error message, used as a fallback
      message: string;

      // Optionally allow the message to be overridden with a title and/or description
      title?: string;
      description?: string;
      // Optionally pass an error code
      code?: string;
      // Optionally pass an object of metadata to the client
      meta?: object;
    };

    // Since these are coming from `error.cause`, which could be "anything", add some guards
    const title = typeof err.title === 'string' ? err.title : undefined;
    const description = typeof err.description === 'string' ? err.description : undefined;

    return {
      code: -32603,
      // If either title or description is present, use those instead of the raw error message
      message:
        title || description
          ? `${title}${title !== undefined && description !== undefined ? ' - ' : ''}${description}`
          : err.message,
      data: {
        title,
        description,
        code: typeof err.code === 'string' ? err.code : undefined,
        path,
        ...(typeof err.statusCode === 'number' &&
          typeof err.statusText === 'string' && {
            httpStatus: err.statusCode,
            httpStatusText: err.statusText,
          }),
      },
      meta: err.meta ? { ...err.meta } : undefined,
    };
  } else {
    return {
      code: shape.code,
      message: shape.message,
      data: {
        code: shape.data?.code,
        httpStatus: shape.data?.httpStatus,
        path,
      },
      meta: undefined,
    };
  }
}

const t = initTRPC.context<Context>().create({
  errorFormatter,
});

export const createCallerFactory = t.createCallerFactory;

export const middleware = t.middleware;
export const router = t.router;

export const publicProcedure = t.procedure.use(async ({ ctx, type, path, input, next }) => {
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

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
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
