import { router } from '@/src/trpc/core';

import { getBlogQuery } from './get';
import { listBlogsQuery } from './list';

export const blogsRouter = router({
  list: listBlogsQuery,
  get: getBlogQuery,
});
