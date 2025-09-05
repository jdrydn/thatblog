import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedure } from '@/backend-api/src/lib/trpc';
import { getBlogByDomain } from '@/backend-api/src/modules/blogs/helpers';
import type { BlogItem } from '@/backend-api/src/modules/types';

export default procedure
  .input(
    z.union([
      z.object({
        id: z.string(),
      }),
      z.object({
        hostname: z.string(),
        path: z.string(),
      })
    ]),
  )
  .query(async ({ ctx, input }) => {
    const { BlogItemById } = ctx.loaders;

    let blog: BlogItem | undefined
    if ('hostname' in input) {
      const found = await getBlogByDomain(input.hostname, input.path)
      assert(found?.blogId, 404, 'Blog not found', {
        code: 'BLOG_NOT_FOUND',
        where: { hostname: input.hostname, path: input.path },
      });

      blog = await BlogItemById.load(found.blogId);
      assert(blog?.id, 500, 'Blog not found by ID', {
        code: 'BLOG_NOT_FOUND',
        where: { id: found.blogId },
      });
    } else {
      blog = await BlogItemById.load(input.id);
      assert(blog?.id, 500, 'Blog not found by ID', {
        code: 'BLOG_NOT_FOUND',
        where: { id: input.id },
      });
    }

    return {
      data: {
        id: blog.id,
        branding: {
          title: blog.branding.title,
          description: blog.branding.description,
        },
        preferences: {
          timezone: blog.preferences.timezone,
          dateFormat: blog.preferences.dateFormat,
          timeFormat: blog.preferences.timeFormat,
        },
      },
    };
  });
