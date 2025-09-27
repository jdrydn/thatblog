import { createCallerFactory } from '@thatblog/backend-trpc/src/lib/trpc';
import { apiRouter } from '@thatblog/backend-trpc/src/routes/index';

export type { Context } from '@thatblog/backend-trpc/src/modules/types';

export const createCaller = createCallerFactory(apiRouter);
