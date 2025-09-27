import { router } from '@/src/trpc/core';

import { getQuery } from './get';
import { loginEmailMutation } from './loginEmail';

export const authRouter = router({
  email: loginEmailMutation,
  get: getQuery,
});
