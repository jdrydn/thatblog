import { router } from '@/backend-api/src/lib/trpc';

import { authRouter } from './auth';
import { quotesQuery } from './quotes';

export const apiRouter = router({
  hello: quotesQuery,
  auth: authRouter,
});

export type ApiRouter = typeof apiRouter;
