import * as models from '@/src/modules/models';
import { createLoaders } from '@/src/modules/loaders';
import { logger } from '@/src/logger';
import type { Context } from '@/src/trpc/context';

export type { Context };

export function createContext(create?: Partial<Context>): Context {
  return {
    loaders: createLoaders(models),
    log: create?.log ?? logger.child({}),
    ipAddress: '127.0.0.1',
    userAgent: '@thatblog/backend-trpc test:unit',
    ...create,
  };
}
