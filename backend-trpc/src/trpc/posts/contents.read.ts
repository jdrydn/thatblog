import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedure } from '@/src/trpc/core';
import { Post } from '@/src/modules/posts/models';
import { getContentItem, getContentItems } from '@/src/modules/posts-contents/models';

export const getPostContentsQuery = procedure
  .input(
    z.object({
      blogId: z.string().ulid(),
      postId: z.string().ulid(),
      contentId: z.string().ulid(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { blogId, postId, contentId } = input;

    const { data: postContentMap } = await Post.get({ blogId, postId }).go({
      attributes: ['postId', 'contents', 'publishedAt'],
    });

    assert(postContentMap?.postId, 404, 'Post not found');
    assert(ctx.userId !== undefined || postContentMap.publishedAt !== undefined, 404, 'Post not found');

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
        contentId,
        content,
      },
    };
  });

export const listPostContentsQuery = procedure
  .input(
    z.object({
      blogId: z.string().ulid(),
      postId: z.string().ulid(),
      excerpts: z.boolean().default(false),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { blogId, postId, excerpts } = input;

    const { data: postContentMap } = await Post.get({ blogId, postId }).go({
      attributes: ['postId', 'contents', 'publishedAt'],
    });

    assert(postContentMap?.postId, 404, 'Post not found');
    assert(ctx.userId !== undefined || postContentMap.publishedAt !== undefined, 404, 'Post not found');

    const contentIds =
      excerpts === true && postContentMap?.contents?.items && postContentMap.contents?.excerptUntil
        ? postContentMap.contents.items.slice(
            0,
            postContentMap.contents.items.indexOf(postContentMap.contents.excerptUntil) + 1,
          )
        : postContentMap?.contents?.items ?? [];

    const contentsValues = contentIds.length ? await getContentItems(blogId, [{ postId, contentIds }]) : {};

    return {
      data: {
        postId,
        contents: contentsValues[postId] ? contentsValues[postId] : undefined,
        length: contentIds.length,
      },
    };
  });

export const listManyPostsContentsQuery = procedure
  .input(
    z.object({
      blogId: z.string().ulid(),
      postIds: z.array(z.string().ulid()).min(1),
      excerpts: z.boolean().default(false),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { blogId, postIds, excerpts } = input;

    const { data: postsContentMap } = await Post.get(postIds.map((postId) => ({ blogId, postId }))).go({
      attributes: ['postId', 'contents', 'publishedAt'],
    });

    const contentIdsMap = Object.fromEntries(
      postsContentMap
        .filter(
          ({ contents, publishedAt }) =>
            (ctx.userId !== undefined || publishedAt !== undefined) &&
            Array.isArray(contents?.items) &&
            contents.items.length,
        )
        .map(({ postId, contents }) => [
          postId,
          excerpts === true && contents?.items && contents?.excerptUntil
            ? contents.items.slice(0, contents.items.indexOf(contents.excerptUntil) + 1)
            : contents?.items ?? [],
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
          contents: contentsValues[postId],
          length: contentIdsMap[postId] ? contentIdsMap[postId].length : 0,
        };
      }),
    };
  });
