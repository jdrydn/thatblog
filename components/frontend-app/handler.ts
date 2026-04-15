import middy from '@middy/core';
import type { Route } from '@middy/http-router';
import type { RequestEvent, ResponseResult } from '@thatblog/middy-helpers/types';

const helloWorld = middy<RequestEvent, ResponseResult>().handler(async () => ({
  statusCode: 200,
  body: JSON.stringify('Hello, world!'),
}));

export const routes: Array<Route<RequestEvent, ResponseResult>> = [
  // Hello world entry point
  { method: 'GET', path: '/', handler: helloWorld },
];
