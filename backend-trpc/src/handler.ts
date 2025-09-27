import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { logger } from '@/backend-trpc/src/logger';
import { apiRouter as router } from '@/backend-trpc/src/trpc';
import { createContext } from '@/backend-trpc/src/trpc/context';

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
