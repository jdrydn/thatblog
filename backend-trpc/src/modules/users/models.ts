import { Entity, type EntityItem } from 'electrodb';
import { ulid } from 'ulid';

import { DYNAMODB_TABLENAME } from '@/backend-trpc/src/config';
import { dcdb } from '@/backend-trpc/src/services';

export const UserProfile = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'users-profile',
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
        type: 'number',
        required: true,
        readOnly: true,
        default: () => Date.now(),
        set: (value) => value ?? Date.now(),
      },
      updatedAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: (value) => value ?? Date.now(),
        watch: '*',
      },
    },
    indexes: {
      /**
       * pk: 'USERS#${userId}',
       * sk: 'USER#PROFILE',
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
          template: 'PROFILE',
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
        set: (value) => value ?? Date.now(),
      },
      updatedAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: (value) => value ?? Date.now(),
        watch: '*',
      },
      archivedAt: {
        type: 'number',
        set: (value) => value ?? Date.now(),
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

export type UserProfileItem = EntityItem<typeof UserProfile>;
export type UserSessionItem = EntityItem<typeof UserSession>;
