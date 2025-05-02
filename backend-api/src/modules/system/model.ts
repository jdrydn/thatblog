import { Entity, type EntityItem } from 'electrodb';
import { v7 as uuid } from 'uuid';

import { dcdb, tableName } from '@/backend-api/src/lib/dynamodb';

export const system = new Entity(
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
      },
      updatedAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
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
    table: tableName,
  },
);

export type SystemItem = EntityItem<typeof system>;
