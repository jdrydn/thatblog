import path from 'path';
import { defineConfig } from 'vitest/config';

const env = {
  AWS_PROFILE: '',
  AWS_ACCESS_KEY_ID: 'ExampleAccessKey',
  AWS_SECRET_ACCESS_KEY: 'ExampleSecretAccessKey',
  AWS_SESSION_TOKEN: '',
  AWS_REGION: 'local',
  AWS_LAMBDA_FUNCTION_NAME: 'thatblog-local-dev',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'silent',
  THATBLOG_DYNAMODB_ENDPOINT: process.env.THATBLOG_DYNAMODB_ENDPOINT ?? 'http://localhost:33660',
  THATBLOG_DYNAMODB_TABLENAME: 'thatblog-local-tests',
  THATBLOG_S3_BUCKET: 'LOCAL',
  TZ: 'UTC',
};

Object.assign(process.env, env);

export default defineConfig({
  test: {
    globals: true,
    globalSetup: path.join(__dirname, './vitest.setup.ts'),
    // We don't want to run integration-tests from here
    include: ['src/**/*.spec.ts'],
    exclude: ['integration-tests/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
    },
    alias: {
      '@/src': path.join(__dirname, './src'),
      '@/test': path.join(__dirname, './test'),
    },
    env: {
      APP_ENV: process.env.APP_ENV ?? 'local',
      ...env,
    },
  },
});
