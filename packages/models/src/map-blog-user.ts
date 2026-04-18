import { Entity, type EntityItem } from 'electrodb';

import { createIdField, createDateField } from './fields';
import { DYNAMODB_TABLE, dcdb } from '../setup';

export const MapBlogUser = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'map-blog-user',
      version: '1',
    },
    attributes: {
      blogId: createIdField({ required: true }),
      userId: createIdField({ required: true }),
      displayName: {
        type: 'string',
      },
      createdAt: createDateField({ default: true, required: true }),
      updatedAt: createDateField({ default: true, required: true, watch: '*' }),
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
