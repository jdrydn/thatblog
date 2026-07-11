import { Hono } from 'hono';

export const app = new Hono();

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'backend-api',
    version: '0.0.2',
  }),
);

export default app;
