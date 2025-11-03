import { router } from '@/src/trpc/core';

import { authRouter } from './auth';
import { blogsRouter } from './blogs';
import { postsRouter } from './posts';
import { quotesQuery } from './quotes';

export const apiRouter = router({
  hello: quotesQuery,
  auth: authRouter,
  blogs: blogsRouter,
  posts: postsRouter,
});

export type ApiRouter = typeof apiRouter;
