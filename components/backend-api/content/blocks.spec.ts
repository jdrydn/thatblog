import { describe, expect, it } from 'vitest';
import { blockSchema, newContentId } from './blocks';

describe('block schema', () => {
  it('accepts a PLAIN_TEXT block', () => {
    const parsed = blockSchema.safeParse({ type: 'PLAIN_TEXT', value: 'Hello world' });
    expect(parsed.success).toBe(true);
  });

  it('rejects an unknown block type', () => {
    expect(blockSchema.safeParse({ type: 'MYSTERY', value: 'x' }).success).toBe(false);
  });

  it('rejects an empty value', () => {
    expect(blockSchema.safeParse({ type: 'PLAIN_TEXT', value: '' }).success).toBe(false);
  });

  it('strips fields that are not part of the block (e.g. storage keys)', () => {
    const parsed = blockSchema.parse({ type: 'PLAIN_TEXT', value: 'hi', pk: 'x', sk: 'y', contentId: 'z' });
    expect(parsed).toEqual({ type: 'PLAIN_TEXT', value: 'hi' });
  });

  it('mints opaque, unique content ids', () => {
    expect(newContentId()).not.toBe(newContentId());
  });
});
