import isISO8601 from 'validator/es/lib/isISO8601';
import { Entity, type EntityItem } from 'electrodb';

import { DYNAMODB_TABLE } from '@/src/config';
import { dcdb } from '@/src/services';

export const MapBlogUser = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'map-blog-user',
      version: '1',
    },
    attributes: {
      blogId: {
        type: 'string',
        required: true,
      },
      userId: {
        type: 'string',
        required: true,
      },
      displayName: {
        type: 'string',
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
       * sk: 'USERS:${userId}',
       */
      byBlog: {
        pk: {
          field: 'pk',
          template: 'BLOGS:${blogId}',
          composite: ['blogId'],
          casing: 'none',
        },
        sk: {
          field: 'sk',
          template: 'USERS:${userId}',
          composite: ['userId'],
          casing: 'none',
        },
      },
      /**
       * gs1pk: 'USERS:${userId}',
       * gs1sk: 'BLOGS:${blogId}',
       */
      byUser: {
        index: 'gs1',
        pk: {
          field: 'gs1pk',
          template: 'USERS:${userId}',
          composite: ['userId'],
          casing: 'none',
        },
        sk: {
          field: 'gs1sk',
          template: 'BLOGS:${blogId}',
          composite: ['blogId'],
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

export type MapBlogUserItem = EntityItem<typeof MapBlogUser>;
