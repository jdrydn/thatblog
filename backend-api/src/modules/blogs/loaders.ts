import DataLoader from 'dataloader';

import { getAllByBatch } from '@/backend-api/src/lib/electrodb.helpers';

import * as blogModels from './model';

export function createLoaders(models: typeof blogModels) {
  const BlogBrandingById = new DataLoader<string, blogModels.BlogBrandingItem | undefined>(async (blogIds) => {
    const results: (blogModels.BlogBrandingItem | undefined)[] = blogIds.map(() => undefined);

    const items = await getAllByBatch(
      models.blogBranding,
      blogIds.map((blogId) => ({ blogId })),
    );
    for (const item of items) {
      const i = blogIds.findIndex((blogId) => item.blogId === blogId);
      results[i] = item;
    }

    return results;
  });

  const BlogDomainByDomain = new DataLoader<string, blogModels.BlogDomainItem | undefined>(async (domains) => {
    const results: (blogModels.BlogDomainItem | undefined)[] = domains.map(() => undefined);

    const items = await getAllByBatch(
      models.blogDomains,
      domains.map((domain) => ({ domain })),
    );
    for (const item of items) {
      const i = domains.findIndex((domain) => item.domain === domain);
      results[i] = item;
    }

    return results;
  });

  return {
    BlogBrandingById,
    BlogDomainByDomain,
  };
}
