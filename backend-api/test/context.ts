import * as models from '@/backend-api/src/modules/models';
import { createLoaders } from '@/backend-api/src/modules/loaders';
import { logger } from '@/backend-api/src/lib/logger';
import type { Context } from '@/backend-api/src/modules/types';

export function createContext(create?: Partial<Context>): Context {
  return {
    loaders: createLoaders(models),
    log: create?.log ?? logger.child({}),
    ...create,
  };
}
