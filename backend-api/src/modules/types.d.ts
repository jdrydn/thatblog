import type { EntityItem } from 'electrodb';

import type { createLoaders } from '@/backend-api/src/modules/loaders';
import type { logger } from '@/backend-api/src/lib/logger';

import type * as models from './models';

export interface Context {
  blogId?: string | undefined;
  userId?: string | undefined;
  sessionId?: string | undefined;

  loaders: ReturnType<typeof createLoaders>;
  log: typeof logger;
}

export type BlogBrandingItem = EntityItem<typeof models.blogBranding>;
export type BlogDomainItem = EntityItem<typeof models.blogDomains>;
