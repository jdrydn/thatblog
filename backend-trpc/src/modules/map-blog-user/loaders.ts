import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as mapModels from './models';

export function createLoaders(models: typeof mapModels) {
  const MapBlogUserItemByUserId = new DataLoader<string, Array<mapModels.MapBlogUserItem> | undefined>(
    async ([userId]) => {
      const { data } = await models.MapBlogUser.query.byUser({ userId }).go({ hydrate: true, pages: 'all' });
      return data.length ? [data] : [undefined];
    },
    {
      maxBatchSize: 1,
    },
  );

  return {
    MapBlogUserItemByUserId,
  };
}
