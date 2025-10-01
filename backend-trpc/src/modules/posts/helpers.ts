import type { PostItem } from './models';

export function formatPost(post: PostItem) {
  return {
    id: post.postId,
    blogId: post.blogId,
    title: post.title,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
    archivedAt: post.archivedAt ? new Date(post.archivedAt) : undefined,
  };
}
