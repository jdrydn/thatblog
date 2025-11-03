import { describe, test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { createScenarios, SomeImportantPosts } from '@/test/fixtures';

import { getPostContentsQuery, listPostContentsQuery, listManyPostsContentsQuery } from './contents.read';

useModels(({ Application }) =>
  createScenarios(Application, [
    'SOME_IMPORTANT_BLOG',
    'GEOFF_TESTINGTON_USER',
    'SOME_IMPORTANT_BLOG_GEOFF_TESTINGTON_USER_MAP',
    'SOME_IMPORTANT_BLOG_POSTS',
    'SOME_IMPORTANT_BLOG_POSTS_CONTENTS',
  ]),
);

describe('#getPostContentsQuery', () => {
  test('should get content by content ID', async () => {
    const ctx = createContext();

    const result = await runProcedure(ctx, getPostContentsQuery, {
      blogId: SomeImportantPosts.Post1.Item.blogId,
      postId: SomeImportantPosts.Post1.Item.postId,
      contentId: SomeImportantPosts.Post1.Contents[0].contentId,
    });

    expect(result).toEqual({
      data: {
        postId: SomeImportantPosts.Post1.Item.postId,
        contentId: SomeImportantPosts.Post1.Contents[0].contentId,
        content: SomeImportantPosts.Post1.Contents[0].content,
      },
    });
  });

  test('should get undefined if the content does not exist', async () => {
    const ctx = createContext();

    const result = await runProcedure(ctx, getPostContentsQuery, {
      blogId: SomeImportantPosts.Post1.Item.blogId,
      postId: SomeImportantPosts.Post1.Item.postId,
      contentId: SomeImportantPosts.Post1.Item.postId,
    });

    expect(result).toEqual({
      data: {
        postId: SomeImportantPosts.Post1.Item.postId,
        content: undefined,
      },
    });
  });
});

describe('#listPostContentsQuery', () => {
  test('should list content by post ID with excerpt', async () => {
    const ctx = createContext();

    const result = await runProcedure(ctx, listPostContentsQuery, {
      blogId: SomeImportantPosts.Post1.Item.blogId,
      postId: SomeImportantPosts.Post1.Item.postId,
      excerpts: true,
    });

    expect(result).toEqual({
      data: {
        postId: SomeImportantPosts.Post1.Item.postId,
        contents: SomeImportantPosts.Post1.Contents.slice(0, 1),
        length: 1,
      },
    });
  });

  test('should list content by post ID', async () => {
    const ctx = createContext();

    const result = await runProcedure(ctx, listPostContentsQuery, {
      blogId: SomeImportantPosts.Post1.Item.blogId,
      postId: SomeImportantPosts.Post1.Item.postId,
    });

    expect(result).toEqual({
      data: {
        postId: SomeImportantPosts.Post1.Item.postId,
        contents: SomeImportantPosts.Post1.Contents,
        length: SomeImportantPosts.Post1.Contents.length,
      },
    });
  });
});

describe('#listManyPostsContentsQuery', () => {
  test('should list content by post ID with excerpt', async () => {
    const ctx = createContext();

    const result = await runProcedure(ctx, listManyPostsContentsQuery, {
      blogId: SomeImportantPosts.Post1.Item.blogId,
      postIds: [SomeImportantPosts.Post1.Item.postId, SomeImportantPosts.Post2.Item.postId],
      excerpts: true,
    });

    expect(result).toEqual({
      data: [
        {
          postId: SomeImportantPosts.Post1.Item.postId,
          contents: SomeImportantPosts.Post1.Contents.slice(0, 1),
          length: 1,
        },
        {
          postId: SomeImportantPosts.Post2.Item.postId,
          contents: SomeImportantPosts.Post2.Contents,
          length: SomeImportantPosts.Post2.Contents.length,
        },
      ],
    });
  });

  test('should list content by post ID', async () => {
    const ctx = createContext();

    const result = await runProcedure(ctx, listManyPostsContentsQuery, {
      blogId: SomeImportantPosts.Post1.Item.blogId,
      postIds: [SomeImportantPosts.Post1.Item.postId, SomeImportantPosts.Post2.Item.postId],
    });

    expect(result).toEqual({
      data: [
        {
          postId: SomeImportantPosts.Post1.Item.postId,
          contents: SomeImportantPosts.Post1.Contents,
          length: SomeImportantPosts.Post1.Contents.length,
        },
        {
          postId: SomeImportantPosts.Post2.Item.postId,
          contents: SomeImportantPosts.Post2.Contents,
          length: SomeImportantPosts.Post2.Contents.length,
        },
      ],
    });
  });
});
