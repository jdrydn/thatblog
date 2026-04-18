import { Entity, type EntityItem } from 'electrodb';

import { createIdField, createDateField } from './fields';
import { DYNAMODB_TABLE, dcdb } from '../setup';

export const UserSession = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'user-session',
      version: '1',
    },
    attributes: {
      userId: createIdField({ required: true }),
      sessionId: createIdField({ required: true, default: true }),
      createdAt: createDateField({ required: true, default: true }),
      updatedAt: createDateField({ required: true, default: true, watch: '*' }),
      archivedAt: createDateField(),
    },
    indexes: {
      /**
       * pk: 'USERS#${userId}',
       * sk: 'SESSIONS#${sessionId}',
       */
      byId: {
        pk: {
          field: 'pk',
          composite: ['userId'],
          template: 'USERS#${userId',
          casing: 'none',
        },
        sk: {
          field: 'sk',
          composite: ['sessionId'],
          template: 'SESSIONS#${sessionId}',
          casing: 'none',
        },
      },
    },
  },
  {
    client: dcdb,
    table: DYNAMODB_TABLE,
  },
);

export type UserSessionItem = EntityItem<typeof UserSession>;
