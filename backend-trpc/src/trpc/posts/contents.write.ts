import assert from 'http-assert-plus';
import { ulid } from 'ulid';
import { z } from 'zod';

import { procedureRequiresUser } from '@/src/trpc/core';
import { listBlogIdsForUserId } from '@/src/modules/map-blog-user/helpers';
import { updatePostContentIndex } from '@/src/modules/posts/helpers';
import {
  postContentSchema,
  createContentItems,
  updateContentItems,
  deleteContentItems,
} from '@/src/modules/posts-contents/models';
import type { Context } from '@/src/trpc/context';

const catchErrCleanup = (ctx: Context, prefix: object) => (err: unknown) =>
  ctx.log.error({ ...prefix, err }, 'Failed to delete content for cleanup');

export const createPostContentsMutation = procedureRequiresUser
  .input(
    z.object({
      blogId: z.string().ulid(),
      postId: z.string().ulid(),
      create: postContentSchema,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, postId, create } = input;

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

    const contentId = ulid();

    try {
      await createContentItems(blogId, postId, [{ contentId, create }]);
      await updatePostContentIndex(blogId, postId, (contents) => ({
        ...contents,
        items: Array.isArray(contents?.items) ? contents.items.push(contentId) : [contentId],
      }));
    } catch (err) {
      await deleteContentItems(blogId, postId, [contentId]).catch(catchErrCleanup(ctx, { blogId, postId, contentId }));
      throw err;
    }

    return {
      data: {
        created: true,
        contentId,
      },
    };
  });

export const updatePostContentsMutation = procedureRequiresUser
  .input(
    z.object({
      blogId: z.string().ulid(),
      postId: z.string().ulid(),
      contentId: z.string().ulid(),
      update: postContentSchema,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, postId, contentId, update } = input;

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

    await updateContentItems(blogId, postId, [{ contentId, update }]);

    return {
      data: {
        updated: true,
      },
    };
  });

export const deletePostContentsMutation = procedureRequiresUser
  .input(
    z.object({
      blogId: z.string().ulid(),
      postId: z.string().ulid(),
      contentId: z.string().ulid(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { blogId, postId, contentId } = input;

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

    await deleteContentItems(blogId, postId, [contentId]);
    await updatePostContentIndex(blogId, postId, (contents) => {
      if (Array.isArray(contents?.items)) {
        contents.items.slice(contents.items.indexOf(contentId));
        return { ...contents };
      } else {
        return { items: [] };
      }
    });

    return {
      data: {
        deleted: true,
      },
    };
  });
