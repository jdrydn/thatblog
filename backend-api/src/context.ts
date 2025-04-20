import { logger } from '@/backend-api/src/lib/logger';

export interface Context {
  log: typeof logger;
  blogId?: string | undefined;
  userId?: string | undefined;
  sessionId?: string | undefined;
}

export function createContext(create: Partial<Context>): Context {
  return {
    ...create,
    log: create.log ?? logger.child({}),
  };
}
