import matchers from 'expect-asymmetric';
import { test, expect } from 'vitest';

import { runProcedure } from '@/test/trpc';
import { createContext } from '@/test/context';
import { useModels } from '@/test/hooks/useModels';
import { createScenarios, createPost, GeoffTestingtonUser, SomeImportantPosts } from '@/test/fixtures';

import { createPostContentsMutation, updatePostContentsMutation, deletePostContentsMutation } from './contents.write';

const postId = '01K92CF2Y5RAKWAP0C8Y4NQXDC';
let contentId: string = 'NOT SET';

useModels(async ({ Application }) => {
  await createScenarios(Application, [
    'SOME_IMPORTANT_BLOG',
    'GEOFF_TESTINGTON_USER',
    'SOME_IMPORTANT_BLOG_GEOFF_TESTINGTON_USER_MAP',
    'SOME_IMPORTANT_BLOG_POSTS',
    'SOME_IMPORTANT_BLOG_POSTS_CONTENTS',
  ]);

  await Application.entities.Post.create(
    createPost({
      blogId: SomeImportantPosts.Post1.Item.blogId,
      postId,
    }),
  ).go();
});

test('should create content', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });

  const result = await runProcedure(ctx, createPostContentsMutation, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
    postId,
    create: {
      type: 'MARKDOWN',
      value: 'Hello, world!',
    },
  });

  expect(result).toEqual({
    data: {
      created: true,
      contentId: matchers.stringULID(),
    },
  });

  ({ contentId } = result.data);
});

test('should update content', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });

  const result = await runProcedure(ctx, updatePostContentsMutation, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
    postId,
    contentId,
    update: {
      type: 'MARKDOWN',
      value: 'Hello, world!',
    },
  });

  expect(result).toEqual({
    data: {
      updated: true,
    },
  });
});

test('should delete content', async () => {
  const ctx = createContext({
    userId: GeoffTestingtonUser.Session.userId,
    sessionId: GeoffTestingtonUser.Session.sessionId,
  });

  const result = await runProcedure(ctx, deletePostContentsMutation, {
    blogId: SomeImportantPosts.Post1.Item.blogId,
    postId,
    contentId,
  });

  expect(result).toEqual({
    data: {
      deleted: true,
    },
  });
});
