import { awsLambdaRequestHandler, type CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

import * as models from '@/backend-api/src/modules/models';
import { logger } from '@/backend-api/src/lib/logger';
import { getHeader, parseAuthHeader } from '@/backend-api/src/helpers/api-gateway';
import { verifyUserToken } from '@/backend-api/src/modules/authentication/tokens';
import { apiRouter } from '@/backend-api/src/routes';
import { createLoaders } from '@/backend-api/src/modules/loaders';
// import { getDefaultBlogId } from '@/backend-api/src/modules/blogs/helpers';
import type { Context } from '@/backend-api/src/modules/types';

export const handler = awsLambdaRequestHandler({
  router: apiRouter,
  async createContext({ event, context }: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>): Promise<Context> {
    const loaders = createLoaders(models);

    const authHeader = getHeader(event.headers, 'Authorization');
    const authToken = authHeader
      ? verifyUserToken(await loaders.System.load(), parseAuthHeader(authHeader))
      : undefined;

    const log = logger.child({
      // _X_AMZN_TRACE_ID is set on each Lambda invocation, so bundle it into each log on each log call
      traceId: process.env._X_AMZN_TRACE_ID,
      reqId: context.awsRequestId,
      userId: authToken?.userId,
      sessionId: authToken?.sessionId,
    });

    if (getHeader(event.headers, 'X-Log-Debug')?.toLowerCase() === 'debug') {
      log.level = 'debug';
    }

    return {
      userId: authToken?.userId,
      sessionId: authToken?.sessionId,
      log,
      loaders,
    } satisfies Context;
  },
  onError({ error, type, path, input, ctx }) {
    (ctx?.log ?? logger).error({
      trpc: { type, path, input },
      err: error.hasOwnProperty('cause') ? error.cause : error,
    });
  },
});
