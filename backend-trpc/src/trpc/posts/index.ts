import { router } from '@/src/trpc/core';

import { getPostQuery } from './get';
import { listPostsQuery } from './list';

export const postsRouter = router({
  list: listPostsQuery,
  get: getPostQuery,
});
