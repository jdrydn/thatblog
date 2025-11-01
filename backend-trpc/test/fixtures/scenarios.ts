import type { Application } from '@/src/modules/models';

import { LocalhostBlog, SomeImportantBlog } from './blogs';
import { GeoffTestingtonUser } from './users';

type WriteHandler = Parameters<typeof Application.transaction.write>[0];

const variations = {
  LOCALHOST_BLOG: ({ Blog, BlogBranding, BlogDomain, BlogPreferences }) => [
    Blog.upsert(LocalhostBlog.Item).commit(),
    BlogBranding.upsert(LocalhostBlog.Branding).commit(),
    BlogDomain.upsert(LocalhostBlog.Domain).commit(),
    BlogPreferences.upsert(LocalhostBlog.Preferences).commit(),
  ],

  SOME_IMPORTANT_BLOG: ({ Blog, BlogBranding, BlogDomain, BlogPreferences }) => [
    Blog.upsert(SomeImportantBlog.Item).commit(),
    BlogBranding.upsert(SomeImportantBlog.Branding).commit(),
    BlogDomain.upsert(SomeImportantBlog.Domain).commit(),
    BlogPreferences.upsert(SomeImportantBlog.Preferences).commit(),
  ],

  GEOFF_TESTINGTON_USER: ({ User, UserSession }) => [
    User.upsert(GeoffTestingtonUser.Item).commit(),
    UserSession.upsert(GeoffTestingtonUser.Session).commit(),
  ],

  LOCALHOST_BLOG_GEOFF_TESTINGTON_USER_MAP: ({ MapBlogUser }) => [
    MapBlogUser.upsert({
      blogId: LocalhostBlog.Item.blogId,
      userId: GeoffTestingtonUser.Item.userId,
    }).commit(),
  ],

  SOME_IMPORTANT_BLOG_GEOFF_TESTINGTON_USER_MAP: ({ MapBlogUser }) => [
    MapBlogUser.upsert({
      blogId: SomeImportantBlog.Item.blogId,
      userId: GeoffTestingtonUser.Item.userId,
    }).commit(),
  ],
} satisfies Record<string, WriteHandler>;

export async function createScenarios(
  app: typeof Application,
  variants: Array<keyof typeof variations>,
): Promise<void> {
  for (const variant of variants) {
    await app.transaction.write(variations[variant]).go();
  }
}
