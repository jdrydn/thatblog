import { awsLambdaRequestHandler, type CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { createContext } from '@/backend-api/src/context';
import { logger } from '@/backend-api/src/lib/logger';
import { getHeader, parseAuthHeader } from '@/backend-api/src/helpers/api-gateway';
import { verifyUserToken } from '@/backend-api/src/modules/authentication/tokens';
import { apiRouter } from '@/backend-api/src/routes';

export const handler = awsLambdaRequestHandler({
  router: apiRouter,
  async createContext({ event, context }: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) {
    const authHeader = getHeader(event.headers, 'Authorization');
    const authToken = authHeader ? verifyUserToken(parseAuthHeader(authHeader)) : undefined;

    const blogId = '01JSD698Y7S8419SHTM9R0Q70S';

    return createContext({
      log: logger.child({
        // _X_AMZN_TRACE_ID is set on each Lambda invocation, so bundle it into each log on each log call
        traceId: process.env._X_AMZN_TRACE_ID,
        reqId: context.awsRequestId,
        blogId,
        userId: authToken?.userId,
        sessionId: authToken?.sessionId,
      }),
      blogId,
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
