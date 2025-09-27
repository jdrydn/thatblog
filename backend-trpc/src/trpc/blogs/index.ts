import { router } from '@/backend-trpc/src/trpc/core';

import { getQuery } from './get';

export const blogRouter = router({
  get: getQuery,
});
