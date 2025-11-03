import { createLoaders as createSystemLoader } from './system/loader';
import { createLoaders as createUserLoaders } from './users/loaders';
import { createLoaders as createBlogLoaders } from './blogs/loaders';
import { createLoaders as createMapBlogUsersLoaders } from './map-blog-user/loaders';
import { createLoaders as createPostLoaders } from './posts/loaders';

import type * as allModels from './models';

export function createLoaders(models: typeof allModels) {
  return {
    ...createSystemLoader(models),
    ...createUserLoaders(models),
    ...createBlogLoaders(models),
    ...createMapBlogUsersLoaders(models),
    ...createPostLoaders(models),
  };
}
