import { createLoaders as createBlogLoaders } from './blogs/loaders';
import { createLoaders as createSystemLoader } from './system/loader';

import type * as allModels from './models';

export function createLoaders(models: typeof allModels) {
  return {
    ...createSystemLoader(models),
    ...createBlogLoaders(models),
  };
}
