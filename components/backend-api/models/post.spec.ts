import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newBlogId, newPostId } from './ids';
import { listPosts } from './post';

const { Post } = testModels();

const draft = (blogId: string, postId: string) => ({
  blogId,
  postId,
  content: { values: ['c1'] },
});

describe('Post', () => {
  it('defaults a new post to a draft short and does not leak key fields', async () => {
    const blogId = newBlogId();
    const postId = newPostId();
    await Post.create(draft(blogId, postId)).go();

    const { data } = await Post.get({ blogId, postId }).go();
    expect(data?.type).toBe('short');
    expect(data?.status).toBe('draft');
    expect(data?.pinned).toBe(false);
    expect(data?.publishedAt).toBeUndefined();
    expect(data?.content.values).toEqual(['c1']);
    expect(data).not.toHaveProperty('pk');
    expect(data).not.toHaveProperty('ls3sk');
  });

  it("lists a blog's posts newest-first via ls1, hydrating the KEYS_ONLY index", async () => {
    const blogId = newBlogId();
    const older = newPostId();
    const newer = newPostId();
    await Post.create(draft(blogId, older)).go();
    await new Promise((r) => setTimeout(r, 5)); // distinct createdAt so the order is deterministic
    await Post.create(draft(blogId, newer)).go();

    const data = await listPosts(Post, 'byCreated', blogId, { order: 'desc' });
    expect(data.map((p) => p.postId)).toEqual([newer, older]);
    // listPosts BatchGets the base table, so the KEYS_ONLY index still yields full posts.
    expect(data[0]?.content.values).toEqual(['c1']);
  });

  it('is absent from the published index until published (sparse ls3), then present', async () => {
    const blogId = newBlogId();
    const postId = newPostId();
    await Post.create(draft(blogId, postId)).go();

    expect(await listPosts(Post, 'byPublished', blogId)).toHaveLength(0); // draft has no ls3sk

    const publishedAt = new Date().toISOString();
    await Post.patch({ blogId, postId }).set({ status: 'published', publishedAt }).go();

    const after = await listPosts(Post, 'byPublished', blogId);
    expect(after.map((p) => p.postId)).toEqual([postId]);
    expect(after[0]?.publishedAt).toBe(publishedAt);
  });
});
