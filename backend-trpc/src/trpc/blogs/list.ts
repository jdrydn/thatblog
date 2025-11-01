import { z } from 'zod';

import { procedureRequiresUser } from '@/src/trpc/core';
import { listBlogIdsForUserId } from '@/src/modules/map-blog-user/helpers';
import { Blog } from '@/src/modules/blogs/models';

export const listBlogsQuery = procedureRequiresUser
  .input(
    z
      .object({
        id: z
          .union([
            // One ID
            z.string(),
            // Many IDs
            z.array(z.string()).min(1),
          ])
          .optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;

    // Start with the allowed blog IDs
    let blogIds = await listBlogIdsForUserId(ctx, userId);

    if (Array.isArray(input?.id)) {
      const { id } = input;
      blogIds = blogIds.filter((blogId) => id.includes(blogId));
    } else if (typeof input?.id === 'string') {
      blogIds = blogIds.includes(input.id) ? [input.id] : [];
    }

    const { data } = blogIds.length
      ? await Blog.get(blogIds.map((blogId) => ({ blogId }))).go({
          attributes: ['blogId', 'siteUrl', 'createdAt', 'updatedAt'],
        })
      : {};

    return {
      data: (data ?? []).map(({ blogId, siteUrl, createdAt, updatedAt }) => ({
        id: blogId,
        siteUrl,
        createdAt,
        updatedAt,
      })),
      meta: {
        count: blogIds.length,
      },
    };
  });
