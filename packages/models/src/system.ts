import { Entity, type EntityItem } from 'electrodb';
import { v7 as uuid } from 'uuid';

import { createDateField } from './fields';
import { DYNAMODB_TABLE, dcdb } from '../setup';

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
      createdAt: createDateField({ default: true, required: true }),
      updatedAt: createDateField({ default: true, required: true, watch: '*' }),
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
