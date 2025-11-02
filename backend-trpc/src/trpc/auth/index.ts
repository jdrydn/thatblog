import { router } from '@/src/trpc/core';

import { getQuery } from './get';
import { loginEmailMutation } from './loginEmail';

export const authRouter = router({
  get: getQuery,
  loginEmail: loginEmailMutation,
});
