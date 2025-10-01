import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedureRequiresUser } from '@/src/trpc/core';
import { listBlogIdsForUserId } from '@/src/modules/map-blog-user/helpers';
import { formatPost } from '@/src/modules/posts/helpers';

export const getPostQuery = procedureRequiresUser
  .input(
    z.object({
      blogId: z.string(),
      postId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, postId } = input;

    const allowedBlogIds = await listBlogIdsForUserId(ctx, userId);
    assert(allowedBlogIds.includes(blogId), 404, 'Blog not found', {
      code: 'BLOG_NOT_FOUND',
      where: { id: blogId },
    });

    const { PostById } = ctx.loaders;
    const post = await PostById.load({ blogId, postId });
    assert(post?.blogId, 404, 'Post not found', {
      code: 'POST_NOT_FOUND',
      where: { blogId, postId },
    });

    return {
      data: formatPost(post),
    };
  });
