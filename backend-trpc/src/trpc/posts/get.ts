import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedureRequiresUser } from '@/src/trpc/core';
import { listBlogIdsForUserId } from '@/src/modules/map-blog-user/helpers';
import { getBlogByDomainPath, formatBlog } from '@/src/modules/blogs/helpers';

export const getPostQuery = procedureRequiresUser
  .input(
    z.union([
      z.object({
        blogId: z.string(),
        postId: z.string(),
      }),
      z.object({
        blogId: z.string(),
        postSlug: z.string(),
      }),
    ]),
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;

    const allowedBlogIds = await listBlogIdsForUserId(userId);
    let blogId: string | undefined;

    if ('hostname' in input) {
      const found = await getBlogByDomainPath(input.hostname, input.path);
      assert(found?.blogId, 404, 'Blog not found', {
        code: 'BLOG_NOT_FOUND',
        where: { hostname: input.hostname, path: input.path },
      });

      ({ blogId } = found);
      assert(allowedBlogIds.includes(blogId), 404, 'Blog not found', {
        code: 'BLOG_NOT_FOUND',
        where: { hostname: input.hostname, path: input.path },
      });
    } else {
      ({ id: blogId } = input);
      assert(allowedBlogIds.includes(blogId), 404, 'Blog not found', {
        code: 'BLOG_NOT_FOUND',
        where: { id: blogId },
      });
    }

    const { BlogById } = ctx.loaders;
    const blog = await BlogById.load(blogId);
    assert(blog?.blogId, 404, 'Blog not found', {
      code: 'BLOG_NOT_FOUND',
      where: { id: blogId },
    });

    const { BlogBrandingById, BlogPreferencesById } = ctx.loaders;
    const [blogBranding, blogPreferences] = await Promise.all([
      BlogBrandingById.load(blogId),
      BlogPreferencesById.load(blogId),
    ]);

    return {
      data: formatBlog({
        blog,
        branding: blogBranding,
        preferences: blogPreferences,
      }),
    };
  });
