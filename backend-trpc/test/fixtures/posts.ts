import { ulid } from 'ulid';

import type { PostItem } from '@/src/modules/posts/models';

import type { PickRequiredPartial } from './index';

export function createPost(create: PickRequiredPartial<PostItem, 'blogId'>): PostItem {
  return {
    postId: ulid(),
    createdAt: new Date('2025-10-31T07:20:00').toISOString(),
    updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
    ...create,
  };
}

export const SomeImportantPosts = {
  Post1: createPost({
    blogId: '01K9090T2RH60Y08T7Z97PEBXM',
    postId: '01K8WJ31GXYCPGF8T55QETE1AM',
    publishedAt: new Date('2025-10-31T07:21:00').toISOString(),
    createdAt: new Date('2025-10-31T07:20:00').toISOString(),
    updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
  }),
  Post2: createPost({
    blogId: '01K9090T2RH60Y08T7Z97PEBXM',
    postId: '01K8WJ3KA1NT4GKXDG9DRSB0TK',
    publishedAt: new Date('2025-10-31T07:22:00').toISOString(),
    createdAt: new Date('2025-10-31T07:20:00').toISOString(),
    updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
  }),
  Post3: createPost({
    blogId: '01K9090T2RH60Y08T7Z97PEBXM',
    postId: '01K8WJ3VH59F8G203FMPGWVXVJ',
    publishedAt: new Date('2025-10-31T07:23:00').toISOString(),
    createdAt: new Date('2025-10-31T07:20:00').toISOString(),
    updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
  }),
  Post4: createPost({
    blogId: '01K9090T2RH60Y08T7Z97PEBXM',
    postId: '01K8WJ44B8VYA25NHWGBMZFDY2',
    publishedAt: new Date('2025-10-31T07:24:00').toISOString(),
    createdAt: new Date('2025-10-31T07:20:00').toISOString(),
    updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
  }),
  Post5: createPost({
    blogId: '01K9090T2RH60Y08T7Z97PEBXM',
    postId: '01K8WJ44B8VYA25NHWGBMZFDY2',
    publishedAt: new Date('2025-10-31T07:25:00').toISOString(),
    createdAt: new Date('2025-10-31T07:20:00').toISOString(),
    updatedAt: new Date('2025-10-31T07:20:00').toISOString(),
  }),
};
