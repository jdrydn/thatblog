import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { createScenarios, GeoffTestingtonUser, SomeImportantPosts } from '@/test/fixtures';

import { getPostQuery } from './get';

useModels(({ Application }) =>
  createScenarios(Application, [
    'SOME_IMPORTANT_BLOG',
    'GEOFF_TESTINGTON_USER',
    'SOME_IMPORTANT_BLOG_GEOFF_TESTINGTON_USER_MAP',
    'SOME_IMPORTANT_BLOG_POSTS',
  ]),
);

test('query should return a post by ID', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });

  const result = await runProcedure(ctx, getPostQuery, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
    postId: SomeImportantPosts.Post1.Item.postId,
  });

  expect(result).toEqual({
    data: {
      id: SomeImportantPosts.Post1.Item.postId,
      blogId: SomeImportantPosts.Post1.Item.blogId,
      title: SomeImportantPosts.Post1.Item.title,
      createdAt: SomeImportantPosts.Post1.Item.createdAt,
      updatedAt: SomeImportantPosts.Post1.Item.updatedAt,
      publishedAt: SomeImportantPosts.Post1.Item.publishedAt,
      archivedAt: undefined,
    },
  });
});
