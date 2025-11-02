import type { Application } from '@/src/modules/models';

import { LocalhostBlog, SomeImportantBlog } from './blogs';
import { GeoffTestingtonUser } from './users';
import { createPostContents, SomeImportantPosts } from './posts';

type WriteHandler = Parameters<typeof Application.transaction.write>[0];

const orms = {
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

  SOME_IMPORTANT_BLOG_POSTS: ({ Post }) => [
    Post.upsert(SomeImportantPosts.Post1.Item).commit(),
    Post.upsert(SomeImportantPosts.Post2.Item).commit(),
    Post.upsert(SomeImportantPosts.Post3.Item).commit(),
    Post.upsert(SomeImportantPosts.Post4.Item).commit(),
    Post.upsert(SomeImportantPosts.Post5.Item).commit(),
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

const manual = {
  SOME_IMPORTANT_BLOG_POSTS_CONTENTS: () =>
    createPostContents([
      // Only the first two have content
      SomeImportantPosts.Post1,
      SomeImportantPosts.Post2,
    ]),
} satisfies Record<string, () => Promise<void>>;

export async function createScenarios(
  app: typeof Application,
  variants: Array<keyof typeof orms | keyof typeof manual>,
): Promise<void> {
  for (const variant of variants) {
    if (process.env.LOG_LEVEL !== 'silent') {
      console.log('createScenarios', variant);
    }

    if (variant in orms) {
      await app.transaction.write(orms[variant]).go();
    }

    if (variant in manual) {
      await manual[variant]();
    }
  }
}
