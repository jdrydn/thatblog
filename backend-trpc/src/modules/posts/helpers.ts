import crypto from 'crypto';

import { Post, type PostItem } from './models';

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

export async function updatePostContentIndex(
  blogId: string,
  postId: string,
  update: (content: PostItem['contents']) => NonNullable<Omit<PostItem['contents'], 'etag'>>,
): Promise<NonNullable<PostItem['contents']>> {
  // Get the current contents index
  const post = await Post.get({ blogId, postId }).go({ attributes: ['contents'], consistent: true });
  // Transform the contents index
  const updated: PostItem['contents'] = update(post.data?.contents);
  // Attach a new etag
  updated.etag = crypto
    .createHash('md5')
    .update(JSON.stringify({ ...updated, etag: undefined }))
    .digest('hex');
  // Write back to the post
  await Post.update({ blogId, postId })
    .set({ contents: updated })
    .where(({ contents }, { eq }) => eq(contents.etag, post.data?.contents?.etag))
    .go();
  // Return the updated result
  return updated;
}
