import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newBlogId } from './ids';

const { Blog } = testModels();

describe('Blog', () => {
  it('round-trips a blog without leaking key fields', async () => {
    const blogId = newBlogId();
    await Blog.put({ blogId, profile: { name: 'My Blog', bio: 'Hi there' } }).go();

    const { data } = await Blog.get({ blogId }).go();
    expect(data?.blogId).toBe(blogId);
    expect(data?.profile.name).toBe('My Blog');
    expect(data?.profile.bio).toBe('Hi there');
    expect(data?.createdAt).toBeTypeOf('string');
    expect(data).not.toHaveProperty('pk');
    expect(data).not.toHaveProperty('sk');
  });
});
