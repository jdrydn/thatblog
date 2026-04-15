import middy from '@middy/core';
import type { Route } from '@middy/http-router';
import type { RequestEvent, ResponseResult } from '@thatblog/middy-helpers/types';

const getUser = middy<RequestEvent, ResponseResult>().handler(async (event) => ({
  statusCode: 200,
  body: JSON.stringify({ id: event.pathParameters?.id }),
}));

export const routes: Array<Route<RequestEvent, ResponseResult>> = [
  { method: 'GET', path: '/users/{id}', handler: getUser },
  // paths here are local — no /api
];
