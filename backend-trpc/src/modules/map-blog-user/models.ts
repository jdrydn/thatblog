import { Entity, type EntityItem } from 'electrodb';

import { DYNAMODB_TABLENAME } from '@/src/config';
import { dcdb } from '@/src/services';

export const MapBlogUser = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'map-blogs-users',
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
        required: true,
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
    table: DYNAMODB_TABLENAME,
  },
);

export type MapBlogUserItem = EntityItem<typeof MapBlogUser>;
