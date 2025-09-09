import { createLoaders as createBlogLoaders } from './blogs/loaders';
import { createLoaders as createMapBlogUserLoaders } from './map-blog-user/loaders';
import { createLoaders as createSystemLoader } from './system/loader';
import { createLoaders as createUserLoaders } from './users/loaders';

import type * as allModels from './models';

export function createLoaders(models: typeof allModels) {
  return {
    ...createSystemLoader(models),
    ...createBlogLoaders(models),
    ...createUserLoaders(models),
    ...createMapBlogUserLoaders(models),
  };
}
