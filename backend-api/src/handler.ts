import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpRouterHandler from '@middy/http-router';

// import errorHandler from '@/src/middlewares/errors';
// import logMiddleware from '@/src/middlewares/log';
import type { LambdaEvent, LambdaResult, LambdaContext } from '@/src/types';

import { handler as helloWorld } from './routes/hello-world';

export const handler = middy<LambdaEvent, LambdaResult, Error, LambdaContext>()
  // .use(logMiddleware())
  .use(httpHeaderNormalizer())
  // .use(errorHandler())
  .handler(
    httpRouterHandler([
      {
        method: 'GET',
        path: '/',
        handler: helloWorld,
      },
    ]),
  );
