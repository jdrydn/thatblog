import { router } from '@/src/trpc/core';

import { getQuery } from './get';
import { listBlogsQuery } from './list';

export const blogsRouter = router({
  list: listBlogsQuery,
  get: getQuery,
});
