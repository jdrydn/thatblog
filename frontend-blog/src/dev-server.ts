import path from 'path';
import { config as loadEnvironment } from 'dotenv';

Object.assign(process.env, {
  NODE_ENV: 'development',
  THATBLOG_URL_ORIGIN: 'http://localhost:3000',
});

loadEnvironment({
  path: [
    // .env.user
    path.resolve(__dirname, '../.env.user'),
    // .env.default
    path.resolve(__dirname, '../.env.default'),
  ],
});

/**
 * Load the application
 */
(async () => {
  const { app } = await import('./app');

  app.listen(3000, 'localhost', () => {
    console.log('Server listening http://localhost:3000/');
  });
})();
