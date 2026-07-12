import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newBlogId, newPostId } from './ids';

const { PostSlug } = testModels();

describe('PostSlug', () => {
  it('claims a slug and rejects a duplicate within the same blog', async () => {
    const blogId = newBlogId();
    await PostSlug.create({ blogId, slug: 'hello-world', postId: newPostId() }).go();

    await expect(PostSlug.create({ blogId, slug: 'hello-world', postId: newPostId() }).go()).rejects.toThrow();
  });

  it('scopes uniqueness per blog — the same slug is free in another blog', async () => {
    const slug = 'shared-slug';
    await PostSlug.create({ blogId: newBlogId(), slug, postId: newPostId() }).go();
    await expect(PostSlug.create({ blogId: newBlogId(), slug, postId: newPostId() }).go()).resolves.toBeDefined();
  });

  it('frees the slug once released', async () => {
    const blogId = newBlogId();
    await PostSlug.create({ blogId, slug: 'reusable', postId: newPostId() }).go();
    await PostSlug.delete({ blogId, slug: 'reusable' }).go();
    await expect(PostSlug.create({ blogId, slug: 'reusable', postId: newPostId() }).go()).resolves.toBeDefined();
  });
});
