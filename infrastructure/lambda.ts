import middy from '@middy/core';
import httpRouterHandler from '@middy/http-router';
import httpHeaderNormalizer from '@middy/http-header-normalizer';

import { routes as backendApiRoutes } from '@thatblog/backend-api/handler';
import { routes as frontendAppRoutes } from '@thatblog/frontend-app/handler';
import { withPrefix } from '@thatblog/middy-helpers/routes';
import type { RequestEvent, ResponseResult } from '@thatblog/middy-helpers/types';

export const handler = middy<RequestEvent, ResponseResult>()
  .use(httpHeaderNormalizer())
  .handler(
    httpRouterHandler([
      // API routes prefixed accordingly
      ...withPrefix('/api', backendApiRoutes),
      // Regular frontend app routes
      ...frontendAppRoutes,
    ]),
  );
