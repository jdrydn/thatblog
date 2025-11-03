import isISO8601 from 'validator/es/lib/isISO8601';
import { Entity, type EntityItem } from 'electrodb';

import { DYNAMODB_TABLE } from '@/src/config';
import { dcdb } from '@/src/services';

export const Post = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'post',
      version: '1',
    },
    attributes: {
      blogId: {
        type: 'string',
        required: true,
      },
      postId: {
        type: 'string',
        required: true,
      },
      title: {
        type: 'string',
        default: undefined,
      },
      slug: {
        type: 'string',
        default: undefined,
      },
      publishedAt: {
        type: 'string',
        default: undefined,
        validate: (value) => typeof value !== 'string' || isISO8601(value),
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
      archivedAt: {
        type: 'string',
        validate: (value) => typeof value !== 'string' || isISO8601(value),
      },
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
