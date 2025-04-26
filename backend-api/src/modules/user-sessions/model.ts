import { Entity } from 'electrodb';
import { ulid } from 'ulid';

import { dcdb, tableName } from '@/backend-api/src/lib/dynamodb';

export const userSessions = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'users-sessions',
      version: '1',
    },
    attributes: {
      userId: {
        type: 'string',
        required: true,
      },
      sessionId: {
        type: 'string',
        required: true,
        default: () => ulid(),
      },
      createdAt: {
        type: 'number',
        required: true,
        readOnly: true,
        default: () => Date.now(),
      },
      updatedAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
        watch: '*',
      },
      archivedAt: {
        type: 'number',
        set: () => Date.now(),
      },
    },
    indexes: {
      /**
       * pk: 'USERS#${userId}',
       * sk: 'SESSION#${sessionId}',
       */
      byId: {
        pk: {
          field: 'pk',
          composite: ['userId'],
          template: 'USERS#${userId}',
          casing: 'none',
        },
        sk: {
          field: 'sk',
          composite: ['sessionId'],
          template: 'SESSION#${sessionId}',
          casing: 'none',
        },
      },
    },
  },
  {
    client: dcdb,
    table: tableName,
  },
);
