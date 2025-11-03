import { describe, test, expect } from 'vitest';
import { ulid } from 'ulid';

import { useModels } from '@/test/hooks/useModels';
import { createScenarios, SomeImportantPosts } from '@/test/fixtures';
import { getItemFromDynamoDB, putItemInDynamoDB } from '@/test/dynamodb';
import type { PostContentItem } from '@/src/modules/posts-contents/models';

import * as postContents from './models';

useModels(async ({ Application }) => {
  await createScenarios(Application, [
    'SOME_IMPORTANT_BLOG',
    'SOME_IMPORTANT_BLOG_POSTS',
    'SOME_IMPORTANT_BLOG_POSTS_CONTENTS',
  ]);
});

const createPostContentItemKey = (blogId: string, postId: string, contentId: string) => ({
  pk: `BLOGS#${blogId}#POSTS#${postId}`,
  sk: contentId,
});

describe('#getContentItem', () => {
  const { getContentItem } = postContents;

  test('it should get one content item', async () => {
    const { blogId, postId } = SomeImportantPosts.Post1.Item;
    const { contentId } = SomeImportantPosts.Post1.Contents[0];

    const content = await getContentItem(blogId, postId, contentId);
    expect(content).toEqual(SomeImportantPosts.Post1.Contents[0].content);
  });
});

describe('#getContentItems', () => {
  const { getContentItems } = postContents;

  test('it should get many content items', async () => {
    const { Item, Contents } = SomeImportantPosts.Post1;
    const { blogId, postId } = Item;
    const contentIds = [Contents[0].contentId, Contents[1].contentId];

    const content = await getContentItems(blogId, [{ postId, contentIds }]);
    expect(content).toEqual({ [postId]: [Contents[0], Contents[1]] });
  });
});

describe('#createContentItems', () => {
  const { createContentItems } = postContents;

  const create: PostContentItem = {
    type: 'MARKDOWN',
    value: 'Hello, world!',
  };

  test('it should create content', async () => {
    const { blogId, postId } = SomeImportantPosts.Post1.Item;
    const contentId = ulid();

    await createContentItems(blogId, postId, [{ contentId, create }]);

    const content = await getItemFromDynamoDB(createPostContentItemKey(blogId, postId, contentId));
    expect(content).toEqual({
      ...createPostContentItemKey(blogId, postId, contentId),
      ...create,
    });
  });
});

describe('#updateContentItems', () => {
  const { updateContentItems } = postContents;

  const create: PostContentItem = {
    type: 'MARKDOWN',
    value: 'Hello, world!',
  };
  const update: PostContentItem = {
    type: 'MARKDOWN',
    value: 'Updated copy!',
  };

  test('it should update content', async () => {
    const { blogId, postId } = SomeImportantPosts.Post1.Item;
    const contentId = ulid();

    await putItemInDynamoDB(createPostContentItemKey(blogId, postId, contentId), create);

    await updateContentItems(blogId, postId, [{ contentId, update }]);

    const content = await getItemFromDynamoDB(createPostContentItemKey(blogId, postId, contentId));
    expect(content).toEqual({
      ...createPostContentItemKey(blogId, postId, contentId),
      ...update,
    });
  });
});

describe('#deleteContentItems', () => {
  const { deleteContentItems } = postContents;

  const create: PostContentItem = {
    type: 'MARKDOWN',
    value: 'Hello, world!',
  };

  test('it should update content', async () => {
    const { blogId, postId } = SomeImportantPosts.Post1.Item;
    const contentId = ulid();

    await putItemInDynamoDB(createPostContentItemKey(blogId, postId, contentId), create);

    await deleteContentItems(blogId, postId, [contentId]);

    const content = await getItemFromDynamoDB(createPostContentItemKey(blogId, postId, contentId));
    expect(content).toEqual(undefined);
  });
});
