import { ulid } from 'ulid';

import type { PostItem } from '@/src/modules/posts/models';
import type { PostContentItemWithId } from '@/src/modules/posts-contents/models';

import type { PickRequiredPartial } from './index';

export function createPost(create: PickRequiredPartial<PostItem, 'blogId'>): PostItem {
  return {
    postId: ulid(),
    createdAt: new Date('2025-10-31T07:20:00').toISOString(),
    updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
    ...create,
  };
}

export async function createPostContents(
  items: Array<{ Item: { blogId: string; postId: string }; Contents: Array<PostContentItemWithId> }>,
): Promise<void> {
  const { createContentItems } = await import('@/src/modules/posts-contents/models');

  for (const {
    Item: { blogId, postId },
    Contents: creates,
  } of items) {
    await createContentItems(blogId, postId, creates);
  }
}

export const SomeImportantPosts = {
  Post1: {
    Item: createPost({
      blogId: '01K9090T2RH60Y08T7Z97PEBXM',
      postId: '01K8WJ31GXYCPGF8T55QETE1AM',
      contents: { items: ['01K91EK54A4EG5MEF8D8D7JQ4Z'] },
      publishedAt: new Date('2025-10-31T07:21:00').toISOString(),
      createdAt: new Date('2025-10-31T07:20:00').toISOString(),
      updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
    }),
    Contents: [
      {
        contentId: '01K91EK54A4EG5MEF8D8D7JQ4Z',
        type: 'MARKDOWN',
        value: 'Hello, world!',
      },
    ],
  },
  Post2: {
    Item: createPost({
      blogId: '01K9090T2RH60Y08T7Z97PEBXM',
      postId: '01K8WJ3KA1NT4GKXDG9DRSB0TK',
      contents: { items: ['01K91EKAH1DFFXXJS4QP6Q661M'] },
      publishedAt: new Date('2025-10-31T07:22:00').toISOString(),
      createdAt: new Date('2025-10-31T07:20:00').toISOString(),
      updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
    }),
    Contents: [
      {
        contentId: '01K91EKAH1DFFXXJS4QP6Q661M',
        type: 'MARKDOWN',
        value: 'Hello, world!',
      },
    ],
  },
  Post3: {
    Item: createPost({
      blogId: '01K9090T2RH60Y08T7Z97PEBXM',
      postId: '01K8WJ3VH59F8G203FMPGWVXVJ',
      publishedAt: new Date('2025-10-31T07:23:00').toISOString(),
      createdAt: new Date('2025-10-31T07:20:00').toISOString(),
      updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
    }),
  },
  Post4: {
    Item: createPost({
      blogId: '01K9090T2RH60Y08T7Z97PEBXM',
      postId: '01K8WJ44B8VYA25NHWGBMZFDY2',
      publishedAt: new Date('2025-10-31T07:24:00').toISOString(),
      createdAt: new Date('2025-10-31T07:20:00').toISOString(),
      updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
    }),
  },
  Post5: {
    Item: createPost({
      blogId: '01K9090T2RH60Y08T7Z97PEBXM',
      postId: '01K8WJ44B8VYA25NHWGBMZFEZ3',
      createdAt: new Date('2025-10-31T07:20:00').toISOString(),
      updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
    }),
  },
} satisfies Record<string, { Item: PostItem; Contents?: Array<PostContentItemWithId> }>;
