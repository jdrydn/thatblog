import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedureRequiresUser } from '@/src/trpc/core';
import { listBlogIdsForUserId } from '@/src/modules/map-blog-user/helpers';
import { Post } from '@/src/modules/posts/models';
import { getContentItem, getContentItems } from '@/src/modules/posts-contents/models';
import { sortPostContentItems } from '@/src/modules/posts-contents/helpers';

export const getPostContentsQuery = procedureRequiresUser
  .input(
    z.object({
      blogId: z.string().ulid(),
      postId: z.string().ulid(),
      contentId: z.string().ulid(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, postId, contentId } = input;

    const allowedBlogIds = await listBlogIdsForUserId(ctx, userId);
    assert(allowedBlogIds.includes(blogId), 404, 'Blog not found', {
      code: 'BLOG_NOT_FOUND',
      where: { id: blogId },
    });

    const { data: postContentMap } = await Post.get({ blogId, postId }).go({
      attributes: ['postId', 'contents'],
    });

    if (
      // Post content map is missing/malformed
      !postContentMap?.contents?.items ||
      // Or post content map has no items
      postContentMap.contents.items.length === 0 ||
      // Or post content items do not contain this item
      !postContentMap.contents.items.includes(contentId)
    ) {
      return {
        data: {
          postId,
          content: undefined,
        },
      };
    }

    const content = await getContentItem(blogId, postId, contentId);

    return {
      data: {
        postId,
        content,
      },
    };
  });

export const listPostContentsQuery = procedureRequiresUser
  .input(
    z.object({
      blogId: z.string().ulid(),
      postId: z.string().ulid(),
      excerpts: z.boolean().default(false),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, postId, excerpts } = input;

    const allowedBlogIds = await listBlogIdsForUserId(ctx, userId);
    assert(allowedBlogIds.includes(blogId), 404, 'Blog not found', {
      code: 'BLOG_NOT_FOUND',
      where: { id: blogId },
    });

    const { data: postContentMap } = await Post.get({ blogId, postId }).go({
      attributes: ['postId', 'contents'],
    });

    if (!postContentMap?.contents?.items || postContentMap.contents.items.length === 0) {
      return {
        data: {
          postId,
          contents: [],
          length: 0,
        },
      };
    }

    const contentIds =
      excerpts === true && postContentMap.contents?.excerptUntil
        ? postContentMap.contents.items.slice(
            0,
            postContentMap.contents.items.indexOf(postContentMap.contents.excerptUntil),
          )
        : postContentMap.contents.items;

    const contentsValues = await getContentItems(blogId, [{ postId, contentIds }]);

    return {
      data: {
        postId,
        contents: contentsValues[postId] ? sortPostContentItems(contentIds, contentsValues[postId]) : undefined,
        length: contentIds.length,
      },
    };
  });

export const listManyPostsContentsQuery = procedureRequiresUser
  .input(
    z.object({
      blogId: z.string().ulid(),
      postIds: z.array(z.string().ulid()).min(1),
      excerpts: z.boolean().default(false),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, postIds, excerpts } = input;

    const allowedBlogIds = await listBlogIdsForUserId(ctx, userId);
    assert(allowedBlogIds.includes(blogId), 404, 'Blog not found', {
      code: 'BLOG_NOT_FOUND',
      where: { id: blogId },
    });

    const { data: postsContentMap } = await Post.get(postIds.map((postId) => ({ blogId, postId }))).go({
      attributes: ['postId', 'contents'],
    });

    const contentIdsMap: Record<string, Array<string>> = Object.fromEntries(
      postsContentMap
        .filter(({ contents }) => Array.isArray(contents?.items) && contents.items.length)
        .map(({ postId, contents }) => [
          postId,
          excerpts === true && contents?.excerptUntil
            ? contents.items.slice(0, contents!.items.indexOf(contents.excerptUntil))
            : contents!.items,
        ]),
    );

    const contentsValues = await getContentItems(
      blogId,
      Object.entries(contentIdsMap).map(([postId, contentIds]) => ({ postId, contentIds })),
    );

    return {
      data: postIds.map((postId) => {
        return {
          postId,
          contents:
            contentIdsMap[postId] && contentsValues[postId]
              ? sortPostContentItems(contentIdsMap[postId], contentsValues[postId])
              : undefined,
          length: contentIdsMap[postId] ? contentIdsMap[postId].length : contentsValues[postId].length,
        };
      }),
    };
  });
