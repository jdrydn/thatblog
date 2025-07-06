import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedure } from '@/backend-api/src/lib/trpc';
import type { BlogItem } from '@/backend-api/src/modules/types';

export default procedure
  .input(
    z.union([
      z.object({
        id: z.string(),
      }),
      z.object({
        hostname: z.string(),
      })
    ]),
  )
  .query(async ({ ctx, input }) => {
    const { BlogDomainByDomain, BlogItemById } = ctx.loaders;

    let blog: BlogItem | undefined
    if ('hostname' in input) {
      const found = await BlogDomainByDomain.load(input.hostname);
      assert(found?.blogId, 404, 'Blog not found', {
        code: 'BLOG_NOT_FOUND',
        where: { hostname: input.hostname },
      });

      blog = await BlogItemById.load(found.blogId);
      assert(blog?.id, 500, 'Failed to load blog data', {
        code: 'BLOG_NOT_FOUND',
        where: { id: found.blogId },
      });
    } else {
      blog = await BlogItemById.load(input.id);
      assert(blog?.id, 500, 'Failed to load blog data', {
        code: 'BLOG_NOT_FOUND',
        where: { id: input.id },
      });
    }

    return {
      blog: blog ? {
        id: blog.id,
      } : undefined,
    };
  });
