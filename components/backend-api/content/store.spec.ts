import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newBlogId, newPostId } from '../models/ids';
import { newContentId } from './blocks';

const { content } = testModels();

describe('content store', () => {
  it('round-trips blocks written in one transaction, reading them all in one query', async () => {
    const blogId = newBlogId();
    const postId = newPostId();
    const a = newContentId();
    const b = newContentId();

    await content.write([
      content.putBlock(blogId, postId, a, { type: 'PLAIN_TEXT', value: 'first' }),
      content.putBlock(blogId, postId, b, { type: 'PLAIN_TEXT', value: 'second' }),
    ]);

    const stored = await content.listBlocks(blogId, postId);
    expect(stored.map((s) => s.contentId).sort()).toEqual([a, b].sort());
    expect(new Map(stored.map((s) => [s.contentId, s.value])).get(a)).toBe('first');
    // Blocks are scoped to their post partition — a different post sees nothing.
    expect(await content.listBlocks(blogId, newPostId())).toHaveLength(0);
  });

  it('deletes blocks transactionally', async () => {
    const blogId = newBlogId();
    const postId = newPostId();
    const id = newContentId();

    await content.write([content.putBlock(blogId, postId, id, { type: 'PLAIN_TEXT', value: 'gone soon' })]);
    expect(await content.listBlocks(blogId, postId)).toHaveLength(1);

    await content.write([content.deleteBlock(blogId, postId, id)]);
    expect(await content.listBlocks(blogId, postId)).toHaveLength(0);
  });
});
