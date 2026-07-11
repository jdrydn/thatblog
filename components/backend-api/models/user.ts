import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity } from 'electrodb';
import { client, TABLE_NAME } from './client';
import { timestamps } from './_shared';

// Global identity within the stack (PLAN.md 8, decision #13): spans blogs, so no blogId —
// pk=USERS#{userId} / sk=ITEM. Credentials only; the per-blog role lives on MapBlogUser.
// gs1 (gs1pk=EMAILS#{email}) is the email→user login lookup; gs1sk carries userId for KEYS_ONLY hits.
// Keys are stored verbatim (casing: 'none') so ids keep their case — callers normalise email to
// lowercase before writing/querying so login stays case-insensitive.
export const userSchema = {
  model: { service: 'thatblog', entity: 'user', version: '1' },
  attributes: {
    userId: { type: 'string', required: true, readOnly: true },
    email: { type: 'string', required: true },
    passwordHash: { type: 'string', required: true },
    displayName: { type: 'string', required: true },
    ...timestamps,
  },
  indexes: {
    primary: {
      pk: { field: 'pk', composite: ['userId'], template: 'USERS#${userId}', casing: 'none' },
      sk: { field: 'sk', composite: [], template: 'ITEM', casing: 'none' },
    },
    byEmail: {
      index: 'gs1',
      pk: { field: 'gs1pk', composite: ['email'], template: 'EMAILS#${email}', casing: 'none' },
      sk: { field: 'gs1sk', composite: ['userId'], template: 'USERS#${userId}', casing: 'none' },
    },
  },
} as const;

export const makeUser = (c: DynamoDBClient, table: string) => new Entity(userSchema, { client: c, table });

export const User = makeUser(client, TABLE_NAME);
export type UserEntity = ReturnType<typeof makeUser>;
