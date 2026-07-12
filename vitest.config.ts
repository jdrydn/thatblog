import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.spec.ts'],
    // The model singletons build from client.ts at import time, which asserts TABLE_NAME is set.
    // Tests don't use those singletons (they inject a Testcontainers table via makeModels), but the
    // import still evaluates, so a value must be present. The real table name comes from inject().
    env: { TABLE_NAME: 'thatblog-test' },
    globalSetup: ['./test/global-setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
