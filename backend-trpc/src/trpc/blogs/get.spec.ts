import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { createScenarios, SomeImportantBlog } from '@/test/fixtures';

import { getBlogQuery } from './get';

useModels(({ Application }) => createScenarios(Application, ['SOME_IMPORTANT_BLOG']));

test('query should return a blog by ID', async () => {
  const ctx = createContext();
  const result = await runProcedure(ctx, getBlogQuery, {
    id: SomeImportantBlog.Item.blogId,
  });

  expect(result).toEqual({
    data: {
      id: SomeImportantBlog.Item.blogId,
      siteUrl: SomeImportantBlog.Item.siteUrl,
      branding: {
        title: 'Some Important Blog',
        description: undefined,
      },
      preferences: {
        dateFormat: 'do MMM, yyyy',
        timeFormat: 'h:mm aaa',
        timezone: 'Europe/London',
      },
      createdAt: SomeImportantBlog.Item.createdAt,
      updatedAt: SomeImportantBlog.Item.updatedAt,
    },
  });
});

test('query should return a blog by hostname', async () => {
  const ctx = createContext();
  const result = await runProcedure(ctx, getBlogQuery, {
    hostname: SomeImportantBlog.Domain.domain,
  });

  expect(result).toEqual({
    data: {
      id: SomeImportantBlog.Item.blogId,
      siteUrl: SomeImportantBlog.Item.siteUrl,
      branding: {
        title: 'Some Important Blog',
        description: undefined,
      },
      preferences: {
        dateFormat: 'do MMM, yyyy',
        timeFormat: 'h:mm aaa',
        timezone: 'Europe/London',
      },
      createdAt: SomeImportantBlog.Item.createdAt,
      updatedAt: SomeImportantBlog.Item.updatedAt,
    },
  });
});
