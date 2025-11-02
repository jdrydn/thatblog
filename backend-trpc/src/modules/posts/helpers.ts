import type { PostItem } from './models';

export function formatPost(post: PostItem) {
  return {
    id: post.postId,
    blogId: post.blogId,
    title: post.title,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    archivedAt: post.archivedAt,
  };
}
