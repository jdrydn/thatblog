import { beforeAll, afterAll } from 'vitest';

import type * as allModels from '@/backend-api/src/modules/models';

type Teardown = () => Promise<void>;
type Setup = (models: typeof allModels) => Promise<void | Teardown>;

/**
 * Use this function within tests to configure the DynamoDB database as you'd like it to be
 */
export function useModels(setup: Setup): void {
  let teardown: Teardown | undefined = undefined;

  beforeAll(async () => {
    const models = await import('@/backend-api/src/modules/models');
    teardown = (await setup(models)) ?? undefined;
  });
  afterAll(async () => {
    await teardown?.();
  });
}

export async function getModels() {
  const models = await import('@/backend-api/src/modules/models');
  return models;
}
