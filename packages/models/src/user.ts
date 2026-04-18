import isEmail from 'validator/es/lib/isEmail';
import { Entity, type EntityItem } from 'electrodb';

import { createIdField, createDateField } from './fields';
import { DYNAMODB_TABLE, dcdb } from '../setup';

export const User = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'user',
      version: '1',
    },
    attributes: {
      userId: createIdField({ required: true, default: true }),
      name: {
        type: 'string',
        required: true,
      },
      email: {
        type: 'string',
        required: true,
        validate: (value) => isEmail(value),
      },
      password: {
        type: 'string',
        default: undefined,
      },
      createdAt: createDateField({ required: true, default: true }),
      updatedAt: createDateField({ required: true, default: true, watch: '*' }),
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
    table: DYNAMODB_TABLE,
  },
);

export type UserItem = EntityItem<typeof User>;
