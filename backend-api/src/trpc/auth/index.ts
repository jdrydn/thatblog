import { router } from '@/backend-api/src/lib/trpc';

import { loginUserMutation } from './loginUser';

export const authRouter = router({
  loginUser: loginUserMutation,
});
