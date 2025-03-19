import { logger } from './logger';

export interface Context {
  log: typeof logger;
  blogId?: string | undefined;
  userId?: string | undefined;
}

export function createContext(create: Partial<Context>): Context {
  return {
    ...create,
    log: create.log ?? logger.child({}),
  };
}
