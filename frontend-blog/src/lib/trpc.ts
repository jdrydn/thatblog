import { createCallerFactory } from '@/backend-api/src/lib/trpc';
import { apiRouter } from '@/backend-api/src/routes/index';

export type { Context } from '@/backend-api/src/modules/types';

export const createCaller = createCallerFactory(apiRouter);
