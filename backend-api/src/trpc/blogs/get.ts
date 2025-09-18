import assert from 'http-assert-plus';
import { z } from 'zod';

import { procedure } from '@/backend-api/src/lib/trpc';
import { getBlogByDomainPath } from '@/backend-api/src/modules/blogs/helpers';

export default procedure
  .input(
    z.union([
      z.object({
        id: z.string(),
      }),
      z.object({
        hostname: z.string(),
        path: z.string(),
      }),
    ]),
  )
  .query(async ({ ctx, input }) => {
    let blogId: string | undefined;

    if ('hostname' in input) {
      const found = await getBlogByDomainPath(input.hostname, input.path);
      assert(found?.blogId, 404, 'Blog not found', {
        code: 'BLOG_NOT_FOUND',
        where: { hostname: input.hostname, path: input.path },
      });

      ({ blogId } = found);
    } else {
      ({ id: blogId } = input);
    }

    const { BlogBrandingById, BlogPreferencesById } = ctx.loaders;
    const [blogBranding, blogPreferences] = await Promise.all([
      BlogBrandingById.load(blogId),
      BlogPreferencesById.load(blogId),
    ]);
    assert(blogBranding && blogPreferences, 404, 'Blog not found', {
      code: 'BLOG_NOT_FOUND',
      where: { id: blogId },
    });

    return {
      data: {
        id: blogId,
        branding: {
          title: blogBranding.title,
          description: blogBranding.description,
        },
        preferences: {
          timezone: blogPreferences.timezone,
          dateFormat: blogPreferences.dateFormat,
          timeFormat: blogPreferences.timeFormat,
        },
      },
    };
  });
