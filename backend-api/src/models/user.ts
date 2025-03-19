import { Entity } from 'electrodb';

import { dcdb, THATBLOG_DYNAMODB_TABLE } from '@/backend-api/src/lib/dynamodb';

export const User = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'user',
      version: '1',
    },
    attributes: {
      id: {
        type: 'string',
        required: true,
      },
      username: {
        type: 'string',
        required: true,
      },
      displayName: {
        type: 'string',
      },
      emailAddress: {
        type: 'string',
        required: true,
      },
      password: {
        type: 'string',
      },
      // role: {
      //   type: ['dev', 'senior', 'staff', 'principal'] as const,
      // },
      createdAt: {
        type: 'number',
        default: () => Date.now(),
        readOnly: true,
      },
      updatedAt: {
        type: 'number',
        watch: '*',
        set: () => Date.now(),
        readOnly: true,
      },
    },
    indexes: {
      id: {
        pk: {
          composite: ['id'],
          field: 'pk',
        },
        sk: {
          composite: [],
          field: 'sk',
        },
      },
      byUsername: {
        index: 'gs1',
        pk: {
          field: 'gs1pk',
          composite: ['username'],
        },
        sk: {
          field: 'gs1sk',
          composite: [],
        },
      },
    },
  },
  { client: dcdb, table: THATBLOG_DYNAMODB_TABLE },
);
