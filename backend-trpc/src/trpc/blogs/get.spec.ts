import ms from 'ms';
import matchers from 'expect-asymmetric';
import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { SomeImportantBlog } from '@/test/fixtures';

import { getQuery } from './get';

useModels(async ({ Application }) => {
  await Application.transaction
    .write(({ Blog, BlogBranding, BlogDomain, BlogPreferences }) => [
      Blog.upsert(SomeImportantBlog.Item).commit(),
      BlogBranding.upsert(SomeImportantBlog.Branding).commit(),
      BlogDomain.upsert(SomeImportantBlog.Domain).commit(),
      BlogPreferences.upsert(SomeImportantBlog.Preferences).commit(),
    ])
    .go();
});

test('query should return a blog by ID', async () => {
  const ctx = createContext();
  const result = await runProcedure(ctx, getQuery, {
    id: SomeImportantBlog.Item.blogId,
  });

  expect(result).toEqual({
    data: {
      id: SomeImportantBlog.Item.blogId,
      siteUrl: 'http://localhost:3000',
      branding: {
        title: 'Some Important Blog',
        description: undefined,
      },
      preferences: {
        dateFormat: 'do MMM, yyyy',
        timeFormat: 'h:mm aaa',
        timezone: 'Etc/UTC',
      },
      createdAt: matchers.stringDateISO8601(),
      updatedAt: matchers.stringDateISO8601(),
    },
  });
});

test('query should return a blog by hostname', async () => {
  const ctx = createContext();
  const result = await runProcedure(ctx, getQuery, {
    hostname: SomeImportantBlog.Domain.domain,
  });

  expect(result).toEqual({
    data: {
      id: SomeImportantBlog.Item.blogId,
      siteUrl: 'http://localhost:3000',
      branding: {
        title: 'Some Important Blog',
        description: undefined,
      },
      preferences: {
        dateFormat: 'do MMM, yyyy',
        timeFormat: 'h:mm aaa',
        timezone: 'Etc/UTC',
      },
      createdAt: matchers.stringDateISO8601(),
      updatedAt: matchers.stringDateISO8601(),
    },
  });
});
