import { handle } from 'hono/aws-lambda';
import { client, makeModels, TABLE_NAME } from '@thatblog/backend-api/models';
import { createApp } from './app';
import { defaultRenderer } from './theme';
import { adminIndexHtml } from './assets';

// Bind the env-driven singletons + the S3-backed theme renderer + admin-index reader for Lambda. Kept
// out of app.ts so the unit tests can import createApp without CONTENT_BUCKET / an S3 client (they
// inject a local renderer and a fake admin index).
const app = createApp({
  models: makeModels(client, TABLE_NAME),
  renderer: defaultRenderer(),
  adminIndex: adminIndexHtml(),
});

export const handler = handle(app);
