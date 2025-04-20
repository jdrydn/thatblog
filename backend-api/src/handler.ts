import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext } from '@/backend-api/src/context';
import { logger } from '@/backend-api/src/lib/logger';
import { getHeader, parseAuthHeader } from '@/backend-api/src/helpers/api-gateway';
import { verifyUserToken } from '@/backend-api/src/modules/authentication/tokens';
import { apiRouter } from '@/backend-api/src/routes';

export const handler = awsLambdaRequestHandler({
  router: apiRouter,
  async createContext({ event, context }) {
    const authHeader = getHeader(event.headers, 'Authorization');
    const authToken = authHeader ? verifyUserToken(parseAuthHeader(authHeader)) : undefined;

    return createContext({
      log: logger.child({
        function_name: context.functionName,
        function_version: context.functionVersion,
        reqId: context.awsRequestId,
        userId: authToken?.userId,
        sessionId: authToken?.sessionId,
      }),
      userId: authToken?.userId,
      sessionId: authToken?.sessionId,
    });
  },
  onError({ error, type, path, input, ctx }) {
    (ctx?.log ?? logger).error({
      trpc: { type, path, input },
      err: error.hasOwnProperty('cause') ? error.cause : error,
    });
  },
});
