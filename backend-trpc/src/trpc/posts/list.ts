import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedureRequiresUser } from '@/src/trpc/core';
import { listBlogIdsForUserId } from '@/src/modules/map-blog-user/helpers';
import { Post, type PostItem } from '@/src/modules/posts/models';
import { formatPost } from '@/src/modules/posts/helpers';

export const listPostsQuery = procedureRequiresUser
  .input(
    z.object({
      blogId: z.string().ulid(),
      cursor: z.string().optional(),
      sort: z
        .enum(['CREATED_ASC', 'CREATED_DESC', 'UPDATED_ASC', 'UPDATED_DESC', 'PUBLISHED_ASC', 'PUBLISHED_DESC'])
        .default('PUBLISHED_DESC'),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, cursor, sort } = input;

    const allowedBlogIds = await listBlogIdsForUserId(userId);
    assert(allowedBlogIds.includes(blogId), 404, 'Blog not found', {
      code: 'BLOG_NOT_FOUND',
      where: { id: blogId },
    });

    let results: {
      data: Array<PostItem>;
      cursor: string | null | undefined;
    };

    switch (sort) {
      case 'CREATED_ASC': {
        results = await Post.query.byCreatedAt({ blogId }).go({ hydrate: true, order: 'asc', cursor });
        break;
      }
      case 'CREATED_DESC': {
        results = await Post.query.byCreatedAt({ blogId }).go({ hydrate: true, order: 'desc', cursor });
        break;
      }

      case 'UPDATED_ASC': {
        results = await Post.query.byUpdatedAt({ blogId }).go({ hydrate: true, order: 'asc', cursor });
        break;
      }
      case 'UPDATED_DESC': {
        results = await Post.query.byUpdatedAt({ blogId }).go({ hydrate: true, order: 'desc', cursor });
        break;
      }

      case 'PUBLISHED_ASC': {
        results = await Post.query.byPublishedAt({ blogId }).go({ hydrate: true, order: 'asc', cursor });
        break;
      }
      case 'PUBLISHED_DESC': {
        results = await Post.query.byPublishedAt({ blogId }).go({ hydrate: true, order: 'desc', cursor });
        break;
      }
    }

    return {
      data: results.data.map(({ blogId, siteUrl, createdAt, updatedAt }) => ({
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
