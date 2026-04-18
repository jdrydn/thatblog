import { Entity, type EntityItem } from 'electrodb';

import { createIdField, createDateField } from './fields';
import { dcdb, DYNAMODB_TABLE } from './setup';

export const Post = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'post',
      version: '1',
    },
    attributes: {
      blogId: createIdField({ required: true }),
      postId: createIdField({ default: true, required: true }),
      title: {
        type: 'string',
        default: undefined,
      },
      slug: {
        type: 'string',
        default: undefined,
      },
      contents: {
        type: 'map',
        default: {},
        properties: {
          etag: {
            type: 'string',
            default: 'NONE',
          },
          items: {
            type: 'list',
            default: [],
            items: {
              type: 'string',
              required: true,
            },
          },
          excerptUntil: {
            type: 'string',
            default: undefined,
          },
        },
      },
      createdAt: createDateField({ default: true, required: true }),
      updatedAt: createDateField({ default: true, required: true, watch: '*' }),
      publishedAt: createDateField(),
    },
    indexes: {
      /**
       * pk: 'BLOGS#${blogId}#POSTS',
       * sk: '${postId}',
       */
      byId: {
        pk: {
          field: 'pk',
          template: 'BLOGS#${blogId}#POSTS',
          composite: ['blogId'],
          casing: 'none',
        },
        sk: {
          field: 'sk',
          template: '${postId}',
          composite: ['postId'],
          casing: 'none',
        },
      },
      byCreatedAt: {
        index: 'ls1',
        pk: {
          field: 'pk',
          template: 'BLOGS#${blogId}#POSTS',
          composite: ['blogId'],
          casing: 'none',
        },
        sk: {
          field: 'ls1sk',
          template: 'CREATED#${createdAt}',
          composite: ['createdAt'],
          casing: 'none',
        },
      },
      byUpdatedAt: {
        index: 'ls2',
        pk: {
          field: 'pk',
          template: 'BLOGS#${blogId}#POSTS',
          composite: ['blogId'],
          casing: 'none',
        },
        sk: {
          field: 'ls2sk',
          template: 'UPDATED#${updatedAt}',
          composite: ['updatedAt'],
          casing: 'none',
        },
      },
      byPublishedAt: {
        index: 'ls3',
        pk: {
          field: 'pk',
          template: 'BLOGS#${blogId}#POSTS',
          composite: ['blogId'],
          casing: 'none',
        },
        sk: {
          field: 'ls3sk',
          template: 'PUBLISHED#${publishedAt}',
          composite: ['publishedAt'],
          casing: 'none',
        },
      },
      bySlug: {
        index: 'ls5',
        pk: {
          field: 'pk',
          template: 'BLOGS#${blogId}#POSTS',
          composite: ['blogId'],
          casing: 'none',
        },
        sk: {
          field: 'ls5sk',
          template: 'SLUG#${slug}',
          composite: ['slug'],
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

export type PostItem = EntityItem<typeof Post>;
