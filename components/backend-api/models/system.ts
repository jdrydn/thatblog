import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity } from 'electrodb';
import { client, TABLE_NAME } from './client';
import { timestamps } from './_shared';

// Stack-wide singleton (PLAN.md 8, 10.1): pk=SYSTEM / sk=ITEM, no blogId. Holds the session
// signing secrets (list, for rotation — sign with newest, verify against all) and the one-time
// first-run setupKey (#18), cleared once setup completes.
export const systemSchema = {
  model: { service: 'thatblog', entity: 'system', version: '1' },
  attributes: {
    sessionSecrets: { type: 'list', items: { type: 'string' }, required: true },
    setupKey: { type: 'string' },
    ...timestamps,
  },
  indexes: {
    primary: {
      pk: { field: 'pk', composite: [], template: 'SYSTEM', casing: 'none' },
      sk: { field: 'sk', composite: [], template: 'ITEM', casing: 'none' },
    },
  },
} as const;

export const makeSystem = (c: DynamoDBClient, table: string) => new Entity(systemSchema, { client: c, table });

export const System = makeSystem(client, TABLE_NAME);
export type SystemEntity = ReturnType<typeof makeSystem>;
