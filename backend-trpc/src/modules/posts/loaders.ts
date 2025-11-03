import _omit from 'lodash/omit';
import DataLoader from 'dataloader';

import type * as postModels from './models';

export function createLoaders(models: typeof postModels) {
  const PostById = new DataLoader<{ blogId: string; postId: string }, postModels.PostItem | undefined>(
    async (keys) => {
      const results: (postModels.PostItem | undefined)[] = keys.map(() => undefined);

      const { data } = await models.Post.get([...keys]).go();

      for (const item of data) {
        const i = keys.findIndex(({ blogId, postId }) => item.blogId === blogId && item.postId === postId);
        results[i] = item;
      }

      return results;
    },
    {
      // @ts-expect-error Deliberately changing the return type
      cacheKeyFn: ({ blogId, postId }) => `BLOGS#${blogId}#POSTS#${postId}`,
    },
  );

  return {
    PostById,
  };
}
