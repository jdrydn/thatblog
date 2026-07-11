import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity } from 'electrodb';
import { client, TABLE_NAME } from './client';
import { timestamps } from './_shared';

// A session belongs to the global user and spans all their blogs (PLAN.md 8, 10.1): no blogId —
// pk=USERS#{userId} / sk=SESSIONS#{sessionId}. Referenced by the signed session cookie. expiresAt is
// an epoch-seconds number mapped to the table's DynamoDB TTL attribute, so records self-clean.
export const userSessionSchema = {
  model: { service: 'thatblog', entity: 'userSession', version: '1' },
  attributes: {
    userId: { type: 'string', required: true, readOnly: true },
    sessionId: { type: 'string', required: true, readOnly: true },
    expiresAt: { type: 'number', required: true },
    ...timestamps,
  },
  indexes: {
    primary: {
      pk: { field: 'pk', composite: ['userId'], template: 'USERS#${userId}', casing: 'none' },
      sk: { field: 'sk', composite: ['sessionId'], template: 'SESSIONS#${sessionId}', casing: 'none' },
    },
  },
} as const;

export const makeUserSession = (c: DynamoDBClient, table: string) =>
  new Entity(userSessionSchema, { client: c, table });

export const UserSession = makeUserSession(client, TABLE_NAME);
export type UserSessionEntity = ReturnType<typeof makeUserSession>;
