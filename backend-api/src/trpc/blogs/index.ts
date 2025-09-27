import { router } from '@/backend-api/src/trpc/core';

import { getQuery } from './get';

export const blogRouter = router({
  get: getQuery,
});
