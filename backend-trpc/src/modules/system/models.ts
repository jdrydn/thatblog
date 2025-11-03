import { Entity, type EntityItem } from 'electrodb';
import { v7 as uuid } from 'uuid';

import { DYNAMODB_TABLE } from '@/src/config';
import { dcdb } from '@/src/services';

export const System = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'system',
      version: '1',
    },
    attributes: {
      jwtUserAuthSecret: {
        type: 'string',
        required: true,
        default: () => uuid(),
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
       * pk: 'SYSTEM',
       * sk: 'SYSTEM',
       */
      bySystem: {
        pk: {
          field: 'pk',
          template: 'SYSTEM',
          composite: [],
          casing: 'none',
        },
        sk: {
          field: 'sk',
          template: 'SYSTEM',
          composite: [],
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

export type SystemItem = EntityItem<typeof System>;
