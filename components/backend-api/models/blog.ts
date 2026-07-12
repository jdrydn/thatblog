import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity, type EntityItem } from 'electrodb';
import { client, TABLE_NAME } from './client';
import { timestamps } from './_shared';

// The tenant root (PLAN.md 8, decision #12): one per blog, pk=BLOGS#{blogId}. Its sk is the static
// marker ITEM — distinct from the other items sharing this partition (BlogDomain DOMAINS#,
// MapBlogUser USERS#, Post POSTS#) and from the hand-rolled block prefix BLOGS#{blogId}#POSTS#…#CONTENTS.
// Profile is the v1 surface; publishing/integrations/plan fields fill in across 0.1.x.
export const blogSchema = {
  model: { service: 'thatblog', entity: 'blog', version: '1' },
  attributes: {
    blogId: { type: 'string', required: true, readOnly: true },
    profile: {
      type: 'map',
      required: true,
      properties: {
        name: { type: 'string', required: true },
        bio: { type: 'string' },
        avatar: { type: 'string' },
        cover: { type: 'string' },
        location: { type: 'string' },
        website: { type: 'string' },
      },
    },
    activeThemeId: { type: 'string' },
    navigation: { type: 'list', items: { type: 'string' } },
    ...timestamps,
  },
  indexes: {
    primary: {
      pk: { field: 'pk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
      sk: { field: 'sk', composite: [], template: 'ITEM', casing: 'none' },
    },
  },
} as const;

export const makeBlog = (c: DynamoDBClient, table: string) => new Entity(blogSchema, { client: c, table });

export const Blog = makeBlog(client, TABLE_NAME);
export type BlogEntity = ReturnType<typeof makeBlog>;
export type BlogItem = EntityItem<BlogEntity>;
