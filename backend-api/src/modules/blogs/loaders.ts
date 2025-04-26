import DataLoader from 'dataloader';

import type * as blogModels from './model';
import type { BlogBrandingItem, BlogDomainItem } from '../types';

export function createLoaders(models: typeof blogModels) {
  const BlogBrandingById = new DataLoader<string, BlogBrandingItem | undefined>(async (blogIds) => {
    const results: (BlogBrandingItem | undefined)[] = blogIds.map(() => undefined);

    let keys = blogIds.map((blogId) => ({ blogId }));
    do {
      const { data, unprocessed } = await models.blogBranding.get(keys).go();
      for (const item of data) {
        const i = blogIds.findIndex((blogId) => item.blogId === blogId);
        results[i] = item;
      }

      keys = unprocessed;
    } while (keys.length > 0);

    return results;
  });

  const BlogDomainByDomain = new DataLoader<string, BlogDomainItem | undefined>(async (domains) => {
    const results: (BlogDomainItem | undefined)[] = domains.map(() => undefined);

    let keys = domains.map((domain) => ({ domain }));
    do {
      const { data, unprocessed } = await models.blogDomains.get(keys).go();
      for (const item of data) {
        const i = domains.findIndex((domain) => item.domain === domain);
        results[i] = item;
      }

      keys = unprocessed;
    } while (keys.length > 0);

    return results;
  });

  return {
    BlogBrandingById,
    BlogDomainByDomain,
  };
}
