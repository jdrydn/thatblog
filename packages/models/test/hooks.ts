import { beforeAll, afterAll } from 'vitest';
import { createTable, checkTableExists } from './tables';

import { DYNAMODB_TABLE, dydb } from '../setup';

import type * as allModels from '../src';

type Teardown = () => Promise<void>;
type Setup = (models: typeof allModels) => Promise<void | Teardown>;

/**
 * Use this function within tests to configure the DynamoDB database as you'd like it to be
 */
export function useModels(setup: Setup): void {
  let teardown: Teardown | undefined = undefined;

  beforeAll(async () => {
    if ((await checkTableExists(dydb, DYNAMODB_TABLE)) === false) {
      await createTable(dydb, DYNAMODB_TABLE);
      // console.log('Created table: %s', DYNAMODB_TABLE);
    }

    const models = await import('../');
    teardown = (await setup(models)) ?? undefined;
  });

  afterAll(async () => {
    await teardown?.();
  });
}

export async function getModels() {
  const models = await import('../');
  return models;
}
