import type { BlogItem } from '@thatblog/backend-api/models/blog';
import type { PostItem } from '@thatblog/backend-api/models/post';
import type { StoredBlock } from '@thatblog/backend-api/content/blocks';

// The view models the theme renders. Kept deliberately flat and free of key/plumbing fields so a
// theme author sees a clean, stable shape (PLAN.md section 9) — the same fixtures back the theme-kit.

export const blogView = (blog: BlogItem) => ({
  blogId: blog.blogId,
  name: blog.profile.name,
  bio: blog.profile.bio,
  avatar: blog.profile.avatar,
  cover: blog.profile.cover,
  location: blog.profile.location,
  website: blog.profile.website,
});

// A post's public URL: the pretty slug when it has one, else the always-addressable postId path (slug
// generation is deferred, so a slugless post is still viewable). Both routes render the post page.
export const postUrl = (post: Pick<PostItem, 'slug' | 'postId'>): string =>
  post.slug ? `/${post.slug}` : `/posts/${post.postId}`;

// A post plus its body, blocks ordered by the parent's content.values[] (order is the array order,
// not DynamoDB sk order — PLAN.md 8.2). Drops the raw content.values / key fields.
export const postView = (post: PostItem, stored: StoredBlock[]) => {
  const byId = new Map(stored.map((b) => [b.contentId, b]));
  const blocks = post.content.values.map((id) => byId.get(id)).filter((b): b is StoredBlock => Boolean(b));
  return {
    postId: post.postId,
    type: post.type,
    slug: post.slug,
    url: postUrl(post),
    publishedAt: post.publishedAt,
    pinned: post.pinned,
    blocks,
  };
};
