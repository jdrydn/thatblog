import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as mapModels from './models';

export function createLoaders(models: typeof mapModels) {
  const MapBlogUserByBlogId = new DataLoader<string, Array<mapModels.MapBlogUserItem>>(
    async ([blogId]) => {
      const { data } = await models.MapBlogUser.query.byBlog({ blogId }).go({ pages: 'all' });
      return Array.isArray(data) ? [data] : [[]];
    },
    {
      maxBatchSize: 1,
    },
  );

  const MapBlogUserByUserId = new DataLoader<string, Array<mapModels.MapBlogUserItem>>(
    async ([userId]) => {
      const { data } = await models.MapBlogUser.query.byUser({ userId }).go({ pages: 'all' });
      return Array.isArray(data) ? [data] : [[]];
    },
    {
      maxBatchSize: 1,
    },
  );

  return {
    MapBlogUserByBlogId,
    MapBlogUserByUserId,
  };
}
