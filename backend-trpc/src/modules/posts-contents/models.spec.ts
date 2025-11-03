import { describe, test, expect } from 'vitest';
import { ulid } from 'ulid';

import { useModels, getModels } from '@/test/hooks/useModels';
import { createScenarios, createPost, createPostContents, SomeImportantPosts } from '@/test/fixtures';
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

function wrapErr(err: unknown, prefix: string): never {
  if (err instanceof Error) {
    err.message = `${prefix}: ${err.message}`;
    throw err;
  } else {
    throw new Error(`${prefix}: ${err}`);
  }
}

const createPostContentItemKey = (blogId: string, postId: string, contentId: string) => ({
  pk: `BLOGS#${blogId}#POSTS#${postId}`,
  sk: contentId,
});

async function setupTestPost(blogId: string) {
  const postId = ulid();

  const { Application } = await getModels();

  await Application.entities.Post.create(createPost({ blogId, postId }))
    .go()
    .catch((err) => wrapErr(err, 'Failed to create test post'));

  const fetchPostDetails = async () => {
    const post = await Application.entities.Post.get({ blogId, postId })
      .go({ attributes: ['contents'], consistent: true })
      .catch((err) => wrapErr(err, 'Failed to get test post contents'));

    return post.data;
  };

  return { postId, fetchPostDetails };
}

describe('#getContentItem', () => {
  const { getContentItem } = postContents;

  test('it should get one content item', async () => {
    const { blogId, postId } = SomeImportantPosts.Post1.Item;
    const { contentId } = SomeImportantPosts.Post1.Contents[0];

    const content = await getContentItem(blogId, postId, contentId);
    expect(content).toEqual(SomeImportantPosts.Post1.Contents[0]);
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
    const { blogId } = SomeImportantPosts.Post1.Item;
    const { postId, fetchPostDetails } = await setupTestPost(blogId);
    const contentId = ulid();

    await createContentItems(blogId, postId, [{ contentId, create }]);

    const post = await fetchPostDetails();
    expect(post).toEqual({ contents: { items: [contentId] } });

    const content = await getItemFromDynamoDB(createPostContentItemKey(blogId, postId, contentId));
    expect(content).toEqual({
      ...createPostContentItemKey(blogId, postId, contentId),
      ...create,
    });
  });
});
