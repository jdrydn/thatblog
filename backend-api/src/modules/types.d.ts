import type { EntityItem } from 'electrodb';

import type { createLoaders } from '@/backend-api/src/modules/loaders';
import type { logger } from '@/backend-api/src/lib/logger';

export type {
  BlogBrandingItem,
  BlogDomainItem,
  BlogPreferencesItem,
  MapBlogUserItem,
  SystemItem,
  UserProfileItem,
  UserSessionItem,
} from './models';

export interface Context {
  userId?: string | undefined;
  sessionId?: string | undefined;

  loaders: ReturnType<typeof createLoaders>;
  log: typeof logger;
}
