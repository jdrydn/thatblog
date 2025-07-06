import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as blogModels from './model';
import type { application } from '../models';

export interface BlogItem {
  id: string;
  branding: Omit<blogModels.BlogBrandingItem, 'blogId'>;
  preferences: Omit<blogModels.BlogPreferencesItem, 'blogId'>;
}

export function createLoaders(models: typeof blogModels & { application: typeof application }) {
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

  const BlogDomainByDomain = new DataLoader<string, blogModels.BlogDomainItem | undefined>(async (domains) => {
    const results: (blogModels.BlogDomainItem | undefined)[] = domains.map(() => undefined);

    const { data } = await models.blogDomains.get(domains.map((domain) => ({ domain }))).go()

    for (const item of data) {
      const i = domains.findIndex((domain) => item.domain === domain);
      results[i] = item;
    }

    return results;
  });

  const BlogItemById = new DataLoader<string, BlogItem | undefined>(
    async ([blogId]) => {
      const { data } = await models.application.transaction
        .get(({ blogBranding, blogPreferences }) => [
          blogBranding.get({ blogId }).commit(),
          blogPreferences.get({ blogId }).commit(),
        ])
        .go();

      if (data?.[0]?.item && data?.[1]?.item) {
        BlogBrandingById.prime(blogId, data[0].item);
        BlogPreferencesById.prime(blogId, data[1].item);

        return [
          {
            id: blogId,
            branding: _omit(data[0].item, 'blogId'),
            preferences: _omit(data[1].item, 'blogId'),
          },
        ];
      } else {
        return [undefined];
      }
    },
    {
      maxBatchSize: 1,
    },
  );

  return {
    BlogItemById,
    BlogBrandingById,
    BlogDomainByDomain,
    BlogPreferencesById,
  };
}
