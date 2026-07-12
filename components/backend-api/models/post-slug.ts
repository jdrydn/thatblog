import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity } from 'electrodb';
import { client, TABLE_NAME } from './client';

// A per-blog uniqueness guard for post slugs: one item per claimed slug, pk=BLOGS#{blogId} /
// sk=SLUGS#{slug} (its own prefix in the shared blog partition). Written transactionally alongside
// the Post — ElectroDB's `.create()` carries `attribute_not_exists`, so a duplicate slug cancels the
// whole transaction (surfaced as a 409). Slugs are stored verbatim (casing:'none'); normalisation +
// generation are the caller's job (deferred). `postId` also makes this the slug→post resolver the
// public site (0.0.5) needs. Released on slug change / post delete.
export const postSlugSchema = {
  model: { service: 'thatblog', entity: 'postSlug', version: '1' },
  attributes: {
    blogId: { type: 'string', required: true, readOnly: true },
    slug: { type: 'string', required: true, readOnly: true },
    postId: { type: 'string', required: true },
  },
  indexes: {
    primary: {
      pk: { field: 'pk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
      sk: { field: 'sk', composite: ['slug'], template: 'SLUGS#${slug}', casing: 'none' },
    },
  },
} as const;

export const makePostSlug = (c: DynamoDBClient, table: string) => new Entity(postSlugSchema, { client: c, table });

export const PostSlug = makePostSlug(client, TABLE_NAME);
export type PostSlugEntity = ReturnType<typeof makePostSlug>;
