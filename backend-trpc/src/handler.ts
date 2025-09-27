import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { logger } from '@/src/logger';
import { apiRouter as router } from '@/src/trpc';
import { createContext } from '@/src/trpc/context';

export const handler = awsLambdaRequestHandler({
  router,
  createContext,
  onError({ error, type, path, input, ctx }) {
    (ctx?.log ?? logger).error({
      trpc: { type, path, input },
      err: error.cause ?? error,
    });
  },
});
