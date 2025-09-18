import { router } from '@/backend-api/src/lib/trpc';

import getQuery from './get';

export const blogRouter = router({
  get: getQuery,
});
