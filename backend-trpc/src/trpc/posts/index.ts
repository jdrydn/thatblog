import { router } from '@/src/trpc/core';

import { getPostQuery } from './get';
// import { listPostsQuery } from './list';

import { getPostContentsQuery, listPostContentsQuery, listManyPostsContentsQuery } from './contents.read';
import { createPostContentsMutation, updatePostContentsMutation, deletePostContentsMutation } from './contents.write';

export const postsRouter = router({
  // list: listPostsQuery,
  get: getPostQuery,

  contents: router({
    list: listPostContentsQuery,
    listMany: listManyPostsContentsQuery,
    get: getPostContentsQuery,
    create: createPostContentsMutation,
    update: updatePostContentsMutation,
    delete: deletePostContentsMutation,
  }),
});
