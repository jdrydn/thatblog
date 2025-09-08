import path from 'path';
import { defineConfig } from 'vitest/config';

const env = {
  AWS_ACCESS_KEY_ID: 'ExampleAccessKey',
  AWS_SECRET_ACCESS_KEY: 'ExampleSecretAccessKey',
  AWS_SESSION_TOKEN: '',
  AWS_REGION: 'local',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'silent',
  THATBLOG_DYNAMODB_ENDPOINT: 'http://localhost:42321',
  THATBLOG_DYNAMODB_TABLE: 'thatblog-local-tests',
  TZ: 'UTC',
};

Object.assign(process.env, env);

export default defineConfig({
  test: {
    globals: true,
    globalSetup: path.join(__dirname, './vitest.setup.ts'),
    // We don't want to run integration-tests from here
    include: ['src/**/*.spec.ts'],
    // coverage: {
    //   provider: 'v8',
    //   reporter: ['text', 'html'],
    //   include: ['src/**'],
    // },
    alias: {
      '@/backend-api/src': path.join(__dirname, './src'),
      '@/backend-api/test': path.join(__dirname, './test'),
    },
    env: {
      APP_ENV: process.env.APP_ENV ?? 'local',
      ...env,
    },
  },
});
