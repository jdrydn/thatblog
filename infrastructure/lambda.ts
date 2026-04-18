import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';

import { handler as backendApiHandler } from '@thatblog/backend-api/handler';
import { handler as frontendAppHandler } from '@thatblog/frontend-app/handler';

/**
 * Handler for incoming HTTP requests
 */
export function http(event: APIGatewayProxyEventV2, context: Context) {
  if (event.rawPath.startsWith('/api')) {
    return backendApiHandler(event, context);
  } else {
    return frontendAppHandler(event, context);
  }
}

/**
 * Handler for incoming Eventbridge events
 */
// export function worker()
