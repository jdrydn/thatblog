import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['packages/**'],
    },
    env: {
      APP_ENV: process.env.APP_ENV ?? 'local',
      AWS_PROFILE: '',
      AWS_ACCESS_KEY_ID: 'ExampleAccessKey',
      AWS_SECRET_ACCESS_KEY: 'ExampleSecretAccessKey',
      AWS_SESSION_TOKEN: '',
      AWS_REGION: 'local',
      AWS_LAMBDA_FUNCTION_NAME: 'thatblog-local-dev',
      LOG_LEVEL: process.env.LOG_LEVEL ?? 'silent',
      TZ: 'UTC',
    },
  },
});
