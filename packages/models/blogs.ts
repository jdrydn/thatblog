import isISO8601 from 'validator/es/lib/isISO8601';
import { Entity, type EntityItem } from 'electrodb';

import { dcdb, DYNAMODB_TABLE } from './setup';

export const Blog = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog',
      version: '1',
    },
    attributes: {
      blogId: {
        type: 'string',
        required: true,
      },
      siteUrl: {
        type: 'string',
        required: false,
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
