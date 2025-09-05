import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as blogModels from './model';

export function createLoaders(models: typeof blogModels) {
  const BlogBrandingById = new DataLoader<string, blogModels.BlogBrandingItem | undefined>(async (blogIds) => {
    const results: (blogModels.BlogBrandingItem | undefined)[] = blogIds.map(() => undefined);

    const { data } = await models.blogBranding.get(blogIds.map((blogId) => ({ blogId }))).go()

    for (const item of data) {
      const i = blogIds.findIndex((blogId) => item.blogId === blogId);
      results[i] = item;
    }

    return results;
  });

  const BlogPreferencesById = new DataLoader<string, blogModels.BlogPreferencesItem | undefined>(async (blogIds) => {
    const results: (blogModels.BlogPreferencesItem | undefined)[] = blogIds.map(() => undefined);

    const { data } = await models.blogPreferences.get(blogIds.map((blogId) => ({ blogId }))).go()

    for (const item of data) {
      const i = blogIds.findIndex((blogId) => item.blogId === blogId);
      results[i] = item;
    }

    return results;
  });

  return {
    BlogBrandingById,
    BlogPreferencesById,
  };
}
