import { router } from '@/backend-api/src/trpc/core';

import { loginUserMutation } from './loginUser';

export const authRouter = router({
  loginUser: loginUserMutation,
});
