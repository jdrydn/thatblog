import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedure } from '@/src/trpc/core';
import { listBlogIdsForUserId } from '@/src/modules/map-blog-user/helpers';
import { Post } from '@/src/modules/posts/models';
import { formatPost } from '@/src/modules/posts/helpers';

export const listPostsQuery = procedure
  .input(
    z.object({
      blogId: z.string().ulid(),
      where: z
        .object({
          published: z.boolean().default(true),
          archived: z.boolean().default(false),
        })
        .default({}),
      cursor: z.string().optional(),
      sort: z
        .enum(['CREATED_ASC', 'CREATED_DESC', 'UPDATED_ASC', 'UPDATED_DESC', 'PUBLISHED_ASC', 'PUBLISHED_DESC'])
        .default('PUBLISHED_DESC'),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, where, cursor, sort } = input;

    if (userId) {
      const allowedBlogIds = await listBlogIdsForUserId(ctx, userId);
      assert(allowedBlogIds.includes(blogId), 404, 'Blog not found', {
        code: 'BLOG_NOT_FOUND',
        where: { id: blogId },
      });
    } else {
      // Unauthenticated users cannot query unpublished posts
      assert(where.published === true, 401, 'Cannot filter unpublished when unauthenticated', {
        title: 'Please authenticate to filter unpublished posts',
        description: 'Check your filters & try again, or authenticate',
      });
      // Unauthenticated users cannot query archived posts
      assert(where.archived === false, 401, 'Cannot filter archived when unauthenticated', {
        title: 'Please authenticate to filter archived posts',
        description: 'Check your filters & try again, or authenticate',
      });
    }

    if (
      // If sorting where published, but filtering where not published, then return no results
      (sort.startsWith('PUBLISHED_') && where.published === false) ||
      // If sorting where published, but filtering where archived, then return no results
      (sort.startsWith('PUBLISHED_') && where.archived === true)
    ) {
      return {
        data: [],
        meta: {
          cursor: null,
          count: 0,
        },
      };
    }

    let query: ReturnType<ReturnType<typeof Post.query.byCreatedAt>['where']>;
    let order: 'asc' | 'desc';

    switch (sort) {
      case 'CREATED_ASC': {
        query = Post.query.byCreatedAt({ blogId });
        order = 'asc';
        break;
      }
      case 'CREATED_DESC': {
        query = Post.query.byCreatedAt({ blogId });
        order = 'desc';
        break;
      }

      case 'UPDATED_ASC': {
        query = Post.query.byUpdatedAt({ blogId });
        order = 'asc';
        break;
      }
      case 'UPDATED_DESC': {
        query = Post.query.byUpdatedAt({ blogId });
        order = 'desc';
        break;
      }

      case 'PUBLISHED_ASC': {
        query = Post.query.byPublishedAt({ blogId });
        order = 'asc';
        break;
      }
      case 'PUBLISHED_DESC': {
        query = Post.query.byPublishedAt({ blogId });
        order = 'desc';
        break;
      }
    }

    query = query.where((item, { notExists }) => notExists(item.archivedAt));

    if (sort.startsWith('PUBLISHED_') === false && where.published === true) {
      // If not sorting by published, but we want to ensure we only get published content
      query = query.where((item, { exists }) => exists(item.publishedAt));
    }

    query = query.where((item, { exists, notExists }) =>
      // Filter in/out archived items
      where.archived ? exists(item.archivedAt) : notExists(item.archivedAt),
    );

    const results = await query.go({ hydrate: true, cursor, order });

    return {
      data: results.data.map((post) => formatPost(post)),
      meta: {
        cursor: results.cursor,
        count: results.data.length,
      },
    };
  });
