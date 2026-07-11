import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity } from 'electrodb';
import { client, TABLE_NAME } from './client';
import { timestamps } from './_shared';

// One item per domain a blog answers to (PLAN.md 8, decision #15): pk=BLOGS#{blogId} /
// sk=DOMAINS#{host} lists a blog's domains. gs1 (gs1pk=DOMAINS#{host}, unique across the GSI) is the
// public-routing lookup host→blog; gs1sk carries the blogId so a KEYS_ONLY hit returns it directly.
// Keys are stored verbatim (casing: 'none'); callers normalise host to lowercase before writing/
// querying so routing stays case-insensitive.
export const blogDomainSchema = {
  model: { service: 'thatblog', entity: 'blogDomain', version: '1' },
  attributes: {
    blogId: { type: 'string', required: true, readOnly: true },
    host: { type: 'string', required: true, readOnly: true },
    type: { type: ['primary', 'alias'] as const, required: true },
    status: { type: ['pending', 'active'] as const, required: true, default: 'active' },
    acmCertArn: { type: 'string' },
    verifiedAt: { type: 'string' },
    ...timestamps,
  },
  indexes: {
    primary: {
      pk: { field: 'pk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
      sk: { field: 'sk', composite: ['host'], template: 'DOMAINS#${host}', casing: 'none' },
    },
    byHost: {
      index: 'gs1',
      pk: { field: 'gs1pk', composite: ['host'], template: 'DOMAINS#${host}', casing: 'none' },
      sk: { field: 'gs1sk', composite: ['blogId'], template: 'BLOGS#${blogId}', casing: 'none' },
    },
  },
} as const;

export const makeBlogDomain = (c: DynamoDBClient, table: string) =>
  new Entity(blogDomainSchema, { client: c, table });

export const BlogDomain = makeBlogDomain(client, TABLE_NAME);
export type BlogDomainEntity = ReturnType<typeof makeBlogDomain>;
