import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity, type EntityItem } from 'electrodb';
import { client, TABLE_NAME } from './client';
import { timestamps } from './_shared';

// A post shares the blog partition (PLAN.md 8, #12): pk=BLOGS#{blogId} / sk=POSTS#{postId}, so it
// sits alongside the Blog ITEM, its BlogDomain/MapBlogUser items, and the hand-rolled content blocks
// (BLOGS#{blogId}#POSTS#…#CONTENTS — a distinct prefix). `content` carries the ordered list of block
// ids (the blocks themselves are hand-rolled, PLAN.md 8.2). LSIs sort a blog's posts three ways:
//   ls1 = createdAt (admin, newest first), ls2 = updatedAt (admin, recently edited),
//   ls3 = publishedAt (public timeline). publishedAt is only set once published, so ls3sk is written
// only for published posts — the index is sparse and drafts never appear on the public timeline, and
// a future publishedAt falls outside a `<= now` query (scheduled posts hide themselves, #21).
export const postSchema = {
  model: { service: 'thatblog', entity: 'post', version: '1' },
  attributes: {
    blogId: { type: 'string', required: true, readOnly: true },
    postId: { type: 'string', required: true, readOnly: true },
    type: { type: ['short', 'article'] as const, required: true, default: 'short' },
    slug: { type: 'string' },
    status: { type: ['draft', 'published'] as const, required: true, default: 'draft' },
    publishedAt: { type: 'string' },
    pinned: { type: 'boolean', required: true, default: false },
    content: {
      type: 'map',
      required: true,
      properties: {
        // Ordered contentIds — order is the array order, so reordering is one write to this parent
        // (no per-block position keys). excerpt marks the contentId where the timeline preview ends.
        values: { type: 'list', required: true, items: { type: 'string' } },
        excerpt: { type: 'string' },
      },
    },
    ...timestamps,
  },
  indexes: {
    primary: {
      pk: { field: 'pk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
      sk: { field: 'sk', composite: ['postId'], template: 'POSTS#${postId}', casing: 'none' },
    },
    // LSIs share the blog pk; the sort key is a raw ISO timestamp (casing:'none' keeps it verbatim so
    // it sorts and compares against `new Date().toISOString()`). publishedAt is optional → ls3 sparse.
    byCreated: {
      index: 'ls1',
      pk: { field: 'pk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
      sk: { field: 'ls1sk', composite: ['createdAt'], template: '${createdAt}', casing: 'none' },
    },
    byUpdated: {
      index: 'ls2',
      pk: { field: 'pk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
      sk: { field: 'ls2sk', composite: ['updatedAt'], template: '${updatedAt}', casing: 'none' },
    },
    byPublished: {
      index: 'ls3',
      pk: { field: 'pk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
      sk: { field: 'ls3sk', composite: ['publishedAt'], template: '${publishedAt}', casing: 'none' },
    },
  },
} as const;

export const makePost = (c: DynamoDBClient, table: string) => new Entity(postSchema, { client: c, table });

export const Post = makePost(client, TABLE_NAME);
export type PostEntity = ReturnType<typeof makePost>;
export type PostItem = EntityItem<PostEntity>;

// List a blog's posts via one of the timestamp LSIs. The table projects every index KEYS_ONLY
// ([[electrodb-keys-only-gsi]]), so a plain read returns keys only — but ElectroDB's `hydrate: true`
// does the follow-on fetch to the base table for us, returning full items in index order. byPublished
// is sparse (drafts have no publishedAt → no ls3sk), so it naturally returns only published posts.
export async function listPosts(
  entity: PostEntity,
  index: 'byCreated' | 'byUpdated' | 'byPublished',
  blogId: string,
  opts: { order?: 'asc' | 'desc' } = {},
): Promise<PostItem[]> {
  // The three timestamp LSIs share the { blogId } composite; index into them dynamically. ElectroDB
  // types each query method distinctly, so narrow to the shape this helper uses.
  type IndexQuery = (composite: { blogId: string }) => {
    go: (opts: { hydrate: true; order?: 'asc' | 'desc' }) => Promise<{ data: PostItem[] }>;
  };
  const run = entity.query[index] as unknown as IndexQuery;
  const { data } = await run({ blogId }).go({ hydrate: true, order: opts.order });
  return data;
}
