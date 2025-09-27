import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as blogModels from './models';

export function createLoaders(models: typeof blogModels) {
  const BlogById = new DataLoader<string, blogModels.BlogItem | undefined>(async (blogIds) => {
    const results: (blogModels.BlogItem | undefined)[] = blogIds.map(() => undefined);

    const { data } = await models.Blog.get(blogIds.map((blogId) => ({ blogId }))).go();

    for (const item of data) {
      const i = blogIds.findIndex((blogId) => item.blogId === blogId);
      results[i] = item;
    }

    return results;
  });

  const BlogBrandingById = new DataLoader<string, blogModels.BlogBrandingItem | undefined>(async (blogIds) => {
    const results: (blogModels.BlogBrandingItem | undefined)[] = blogIds.map(() => undefined);

    const { data } = await models.BlogBranding.get(blogIds.map((blogId) => ({ blogId }))).go();

    for (const item of data) {
      const i = blogIds.findIndex((blogId) => item.blogId === blogId);
      results[i] = item;
    }

    return results;
  });

  const BlogPreferencesById = new DataLoader<string, blogModels.BlogPreferencesItem | undefined>(async (blogIds) => {
    const results: (blogModels.BlogPreferencesItem | undefined)[] = blogIds.map(() => undefined);

    const { data } = await models.BlogPreferences.get(blogIds.map((blogId) => ({ blogId }))).go();

    for (const item of data) {
      const i = blogIds.findIndex((blogId) => item.blogId === blogId);
      results[i] = item;
    }

    return results;
  });

  return {
    BlogById,
    BlogBrandingById,
    BlogPreferencesById,
  };
}
