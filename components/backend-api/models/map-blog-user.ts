import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity } from 'electrodb';
import { client, TABLE_NAME } from './client';
import { timestamps } from './_shared';

// User ⇄ Blog join carrying the per-blog role (PLAN.md 8, decision #13). Bidirectional:
// primary pk=BLOGS#{blogId} / sk=USERS#{userId} lists a blog's team; gs1 (gs1pk=USERS#{userId} →
// gs1sk=BLOGS#{blogId}) lists "my blogs". Decouples authN (User) from authZ (this membership).
export const mapBlogUserSchema = {
  model: { service: 'thatblog', entity: 'mapBlogUser', version: '1' },
  attributes: {
    blogId: { type: 'string', required: true, readOnly: true },
    userId: { type: 'string', required: true, readOnly: true },
    role: { type: ['owner', 'admin', 'editor'] as const, required: true },
    displayName: { type: 'string' },
    bio: { type: 'string' },
    ...timestamps,
  },
  indexes: {
    primary: {
      pk: { field: 'pk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
      sk: { field: 'sk', composite: ['userId'], template: 'USERS#${userId}', casing: 'none' },
    },
    byUser: {
      index: 'gs1',
      pk: { field: 'gs1pk', composite: ['userId'], template: 'USERS#${userId}', casing: 'none' },
      sk: { field: 'gs1sk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
    },
  },
} as const;

export const makeMapBlogUser = (c: DynamoDBClient, table: string) =>
  new Entity(mapBlogUserSchema, { client: c, table });

export const MapBlogUser = makeMapBlogUser(client, TABLE_NAME);
export type MapBlogUserEntity = ReturnType<typeof makeMapBlogUser>;
