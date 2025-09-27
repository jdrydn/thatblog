import isISO8601 from 'validator/es/lib/isISO8601';
import { Entity, type EntityItem } from 'electrodb';
import { ulid } from 'ulid';

import { DYNAMODB_TABLENAME } from '@/src/config';
import { dcdb } from '@/src/services';

export const User = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'user',
      version: '1',
    },
    attributes: {
      userId: {
        type: 'string',
        required: true,
        default: () => ulid(),
      },
      name: {
        type: 'string',
        required: true,
      },
      email: {
        type: 'string',
        required: true,
      },
      password: {
        type: 'string',
        default: undefined,
      },
      createdAt: {
        type: 'string',
        readOnly: true,
        required: true,
        default: () => new Date().toISOString(),
        set: (value) => value ?? new Date().toISOString(),
        validate: (value) => isISO8601(value),
      },
      updatedAt: {
        type: 'string',
        watch: '*',
        required: true,
        default: () => new Date().toISOString(),
        set: (value) => value ?? new Date().toISOString(),
        validate: (value) => isISO8601(value),
      },
    },
    indexes: {
      /**
       * pk: 'USERS#${userId}',
       * sk: 'ITEM',
       * gs1pk: 'USERS#EMAIL',
       * gs1sk: '${email}'
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
          composite: [],
          template: 'ITEM',
          casing: 'none',
        },
      },
      byEmail: {
        index: 'gs1',
        pk: {
          field: 'gs1pk',
          composite: [],
          template: 'USERS#EMAIL',
          casing: 'none',
        },
        sk: {
          field: 'gs1sk',
          composite: ['email'],
          template: '${email}',
          casing: 'none',
        },
      },
    },
  },
  {
    client: dcdb,
    table: DYNAMODB_TABLENAME,
  },
);

export const UserSession = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'user-session',
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
        type: 'string',
        readOnly: true,
        required: true,
        default: () => new Date().toISOString(),
        set: (value) => value ?? new Date().toISOString(),
        validate: (value) => isISO8601(value),
      },
      updatedAt: {
        type: 'string',
        watch: '*',
        required: true,
        default: () => new Date().toISOString(),
        set: (value) => value ?? new Date().toISOString(),
        validate: (value) => isISO8601(value),
      },
      archivedAt: {
        type: 'string',
        validate: (value) => typeof value !== 'string' || isISO8601(value),
      },
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
    table: DYNAMODB_TABLENAME,
  },
);

export type UserItem = EntityItem<typeof User>;
export type UserSessionItem = EntityItem<typeof UserSession>;
