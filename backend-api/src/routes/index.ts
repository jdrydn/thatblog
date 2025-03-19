import { router } from '@/backend-api/src/lib/trpc';

import { authRouter } from './auth';

export const apiRouter = router({
  auth: authRouter,
});

export type ApiRouter = typeof apiRouter;
