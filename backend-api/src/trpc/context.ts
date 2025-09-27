import assert from 'http-assert-plus';
import type { CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import * as models from '@/backend-api/src/modules/models';
import { logger } from '@/backend-api/src/logger';
import { getHeader, parseAuthHeader } from '@/backend-api/src/helpers/api-gateway';
import { verifyUserToken } from '@/backend-api/src/modules/authentication/tokens';
import { createLoaders } from '@/backend-api/src/modules/loaders';

export interface Context {
  userId?: string | undefined;
  sessionId?: string | undefined;

  loaders: ReturnType<typeof createLoaders>;
  log: typeof logger;

  ipAddress: string;
  userAgent: string;
}

export async function createContext({
  event,
  context,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>): Promise<Context> {
  const ipAddress = event.requestContext.http.sourceIp;
  const userAgentHeader = getHeader(event.headers, 'User-Agent');
  assert(ipAddress && userAgentHeader, 400, 'Missing User-Agent header', {
    title: 'Invalid request',
    description: 'Invalid request',
  });

  const loaders = createLoaders(models);

  const authHeader = getHeader(event.headers, 'Authorization');
  const authToken = authHeader ? verifyUserToken(await loaders.System.load(), parseAuthHeader(authHeader)) : undefined;

  const log = logger.child({
    // _X_AMZN_TRACE_ID is set on each Lambda invocation, so bundle it into each log on each log call
    traceId: process.env._X_AMZN_TRACE_ID,
    reqId: context.awsRequestId,
    ipAddress,
    userAgent: userAgentHeader,
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
    ipAddress,
    userAgent: userAgentHeader,
  } satisfies Context;
}
