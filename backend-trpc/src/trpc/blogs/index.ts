import { router } from '@/src/trpc/core';

import { getQuery } from './get';

export const blogRouter = router({
  get: getQuery,
});
