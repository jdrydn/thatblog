import { Hono } from 'hono';
import { client, makeModels, TABLE_NAME, type Models } from './models';
import { makeLoaders } from './loaders';
import type { AppEnv } from './context';
import { setupRoutes } from './routes/setup';
import { authRoutes } from './routes/auth';
import { blogsRoutes } from './routes/blogs';
import { postsRoutes } from './routes/posts';

// createApp takes the model set so tests can point the whole app at a Testcontainers table (mirrors
// makeModels); the default export binds the env-driven singletons for the Lambda.
export function createApp(models: Models) {
  const app = new Hono<AppEnv>();

  // Per-request context: shared models + fresh per-request loaders (request-scoped dedupe only).
  app.use('*', async (c, next) => {
    c.set('models', models);
    c.set('loaders', makeLoaders(models));
    await next();
  });

  app.get('/health', (c) =>
    c.json({
      status: 'ok',
      service: 'backend-api',
      version: '0.0.6',
    }),
  );

  app.route('/', setupRoutes);
  app.route('/', authRoutes);
  app.route('/', blogsRoutes);
  app.route('/', postsRoutes);

  return app;
}

export const app = createApp(makeModels(client, TABLE_NAME));

export default app;
