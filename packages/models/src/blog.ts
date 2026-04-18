import { Entity, type EntityItem } from 'electrodb';

import { createIdField, createDateField } from './fields';
import { dcdb, DYNAMODB_TABLE } from '../setup';

export const Blog = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog',
      version: '1',
    },
    attributes: {
      blogId: createIdField({ default: true, required: true }),
      siteUrl: {
        type: 'string',
        required: false,
      },
      createdAt: createDateField({ default: true, required: true }),
      updatedAt: createDateField({ default: true, required: true, watch: '*' }),
    },
    indexes: {
      /**
       * pk: 'BLOGS:${blogId}',
       * sk: 'BRANDING',
       */
      byId: {
        pk: {
          field: 'pk',
          template: 'BLOGS:${blogId}',
          composite: ['blogId'],
          casing: 'none',
        },
        sk: {
          field: 'sk',
          template: 'ITEM',
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

export type BlogItem = EntityItem<typeof Blog>;
