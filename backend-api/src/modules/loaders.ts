import { createLoaders as createBlogLoaders } from './blogs/loaders';

import type * as allModels from './models';

export function createLoaders(models: typeof allModels) {
  return {
    ...createBlogLoaders(models),
  };
}
