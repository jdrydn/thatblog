import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { createScenarios, LocalhostBlog, SomeImportantBlog, GeoffTestingtonUser } from '@/test/fixtures';

import { listBlogsQuery } from './list';

useModels(async ({ Application }) =>
  createScenarios(Application, [
    'LOCALHOST_BLOG',
    'LOCALHOST_BLOG_GEOFF_TESTINGTON_USER_MAP',
    'SOME_IMPORTANT_BLOG',
    'SOME_IMPORTANT_BLOG_GEOFF_TESTINGTON_USER_MAP',
  ]),
);

test('query should return blogs', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });
  const result = await runProcedure(ctx, listBlogsQuery);

  expect(result).toEqual({
    data: [
      {
        id: LocalhostBlog.Item.blogId,
        siteUrl: LocalhostBlog.Item.siteUrl,
        createdAt: LocalhostBlog.Item.createdAt,
        updatedAt: LocalhostBlog.Item.updatedAt,
      },
      {
        id: SomeImportantBlog.Item.blogId,
        siteUrl: SomeImportantBlog.Item.siteUrl,
        createdAt: SomeImportantBlog.Item.createdAt,
        updatedAt: SomeImportantBlog.Item.updatedAt,
      },
    ],
    meta: {
      count: 2,
    },
  });
});

test('query should return blogs by ID', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });
  const result = await runProcedure(ctx, listBlogsQuery, {
    id: LocalhostBlog.Item.blogId,
  });

  expect(result).toEqual({
    data: [
      {
        id: LocalhostBlog.Item.blogId,
        siteUrl: LocalhostBlog.Item.siteUrl,
        createdAt: LocalhostBlog.Item.createdAt,
        updatedAt: LocalhostBlog.Item.updatedAt,
      },
    ],
    meta: {
      count: 1,
    },
  });
});

test('query should return blogs by IDs', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });
  const result = await runProcedure(ctx, listBlogsQuery, {
    id: [LocalhostBlog.Item.blogId, SomeImportantBlog.Item.blogId],
  });

  expect(result).toEqual({
    data: [
      {
        id: LocalhostBlog.Item.blogId,
        siteUrl: LocalhostBlog.Item.siteUrl,
        createdAt: LocalhostBlog.Item.createdAt,
        updatedAt: LocalhostBlog.Item.updatedAt,
      },
      {
        id: SomeImportantBlog.Item.blogId,
        siteUrl: SomeImportantBlog.Item.siteUrl,
        createdAt: SomeImportantBlog.Item.createdAt,
        updatedAt: SomeImportantBlog.Item.updatedAt,
      },
    ],
    meta: {
      count: 2,
    },
  });
});

test('query should return blogs where not found', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });
  const result = await runProcedure(ctx, listBlogsQuery, {
    id: 'BLOG-NOT-EXISTS',
  });

  expect(result).toEqual({
    data: [],
    meta: { count: 0 },
  });
});
