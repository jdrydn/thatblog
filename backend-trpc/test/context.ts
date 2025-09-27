import * as models from '@/backend-trpc/src/modules/models';
import { createLoaders } from '@/backend-trpc/src/modules/loaders';
import { logger } from '@/backend-trpc/src/logger';
import type { Context } from '@/backend-trpc/src/trpc/context';

export type { Context };

export function createContext(create?: Partial<Context>): Context {
  return {
    loaders: createLoaders(models),
    log: create?.log ?? logger.child({}),
    ipAddress: '127.0.0.1',
    userAgent: '@thatblog/backend-api test:unit',
    ...create,
  };
}
