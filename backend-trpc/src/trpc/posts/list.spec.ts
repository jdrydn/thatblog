import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { createScenarios, GeoffTestingtonUser, SomeImportantPosts } from '@/test/fixtures';

import { listPostsQuery } from './list';

useModels(({ Application }) =>
  createScenarios(Application, [
    'SOME_IMPORTANT_BLOG',
    'GEOFF_TESTINGTON_USER',
    'SOME_IMPORTANT_BLOG_GEOFF_TESTINGTON_USER_MAP',
    'SOME_IMPORTANT_BLOG_POSTS',
  ]),
);

test('query should lists posts by published', async () => {
  const ctx = createContext();

  const result = await runProcedure(ctx, listPostsQuery, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
  });

  expect(result).toEqual({
    data: [
      {
        id: SomeImportantPosts.Post4.Item.postId,
        blogId: SomeImportantPosts.Post4.Item.blogId,
        title: SomeImportantPosts.Post4.Item.title,
        createdAt: SomeImportantPosts.Post4.Item.createdAt,
        updatedAt: SomeImportantPosts.Post4.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post4.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post3.Item.postId,
        blogId: SomeImportantPosts.Post3.Item.blogId,
        title: SomeImportantPosts.Post3.Item.title,
        createdAt: SomeImportantPosts.Post3.Item.createdAt,
        updatedAt: SomeImportantPosts.Post3.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post3.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post2.Item.postId,
        blogId: SomeImportantPosts.Post2.Item.blogId,
        title: SomeImportantPosts.Post2.Item.title,
        createdAt: SomeImportantPosts.Post2.Item.createdAt,
        updatedAt: SomeImportantPosts.Post2.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post2.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post1.Item.postId,
        blogId: SomeImportantPosts.Post1.Item.blogId,
        title: SomeImportantPosts.Post1.Item.title,
        createdAt: SomeImportantPosts.Post1.Item.createdAt,
        updatedAt: SomeImportantPosts.Post1.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post1.Item.publishedAt,
        archivedAt: undefined,
      },
    ],
    meta: {
      count: 4,
      cursor: null,
    },
  });
});

test('query should paginate published posts', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });

  const result1 = await runProcedure(ctx, listPostsQuery, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
    limit: 2,
  });

  expect(result1).toEqual({
    data: [
      {
        id: SomeImportantPosts.Post4.Item.postId,
        blogId: SomeImportantPosts.Post4.Item.blogId,
        title: SomeImportantPosts.Post4.Item.title,
        createdAt: SomeImportantPosts.Post4.Item.createdAt,
        updatedAt: SomeImportantPosts.Post4.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post4.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post3.Item.postId,
        blogId: SomeImportantPosts.Post3.Item.blogId,
        title: SomeImportantPosts.Post3.Item.title,
        createdAt: SomeImportantPosts.Post3.Item.createdAt,
        updatedAt: SomeImportantPosts.Post3.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post3.Item.publishedAt,
        archivedAt: undefined,
      },
    ],
    meta: {
      count: 2,
      cursor: expect.any(String),
    },
  });

  const result2 = await runProcedure(ctx, listPostsQuery, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
    cursor: result1.meta.cursor,
    limit: 2,
  });

  expect(result2).toEqual({
    data: [
      {
        id: SomeImportantPosts.Post2.Item.postId,
        blogId: SomeImportantPosts.Post2.Item.blogId,
        title: SomeImportantPosts.Post2.Item.title,
        createdAt: SomeImportantPosts.Post2.Item.createdAt,
        updatedAt: SomeImportantPosts.Post2.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post2.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post1.Item.postId,
        blogId: SomeImportantPosts.Post1.Item.blogId,
        title: SomeImportantPosts.Post1.Item.title,
        createdAt: SomeImportantPosts.Post1.Item.createdAt,
        updatedAt: SomeImportantPosts.Post1.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post1.Item.publishedAt,
        archivedAt: undefined,
      },
    ],
    meta: {
      count: 2,
      cursor: expect.any(String),
    },
  });

  const result3 = await runProcedure(ctx, listPostsQuery, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
    cursor: result2.meta.cursor,
    limit: 2,
  });

  expect(result3).toEqual({
    data: [],
    meta: { count: 0, cursor: null },
  });
});

test('query should lists posts by created', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });

  const result = await runProcedure(ctx, listPostsQuery, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
    sort: 'CREATED_ASC',
  });

  expect(result).toEqual({
    data: [
      {
        id: SomeImportantPosts.Post1.Item.postId,
        blogId: SomeImportantPosts.Post1.Item.blogId,
        title: SomeImportantPosts.Post1.Item.title,
        createdAt: SomeImportantPosts.Post1.Item.createdAt,
        updatedAt: SomeImportantPosts.Post1.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post1.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post2.Item.postId,
        blogId: SomeImportantPosts.Post2.Item.blogId,
        title: SomeImportantPosts.Post2.Item.title,
        createdAt: SomeImportantPosts.Post2.Item.createdAt,
        updatedAt: SomeImportantPosts.Post2.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post2.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post3.Item.postId,
        blogId: SomeImportantPosts.Post3.Item.blogId,
        title: SomeImportantPosts.Post3.Item.title,
        createdAt: SomeImportantPosts.Post3.Item.createdAt,
        updatedAt: SomeImportantPosts.Post3.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post3.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post4.Item.postId,
        blogId: SomeImportantPosts.Post4.Item.blogId,
        title: SomeImportantPosts.Post4.Item.title,
        createdAt: SomeImportantPosts.Post4.Item.createdAt,
        updatedAt: SomeImportantPosts.Post4.Item.updatedAt,
        publishedAt: SomeImportantPosts.Post4.Item.publishedAt,
        archivedAt: undefined,
      },
      {
        id: SomeImportantPosts.Post5.Item.postId,
        blogId: SomeImportantPosts.Post5.Item.blogId,
        title: SomeImportantPosts.Post5.Item.title,
        createdAt: SomeImportantPosts.Post5.Item.createdAt,
        updatedAt: SomeImportantPosts.Post5.Item.updatedAt,
        publishedAt: undefined,
        archivedAt: undefined,
      },
    ],
    meta: {
      count: 5,
      cursor: null,
    },
  });
});
