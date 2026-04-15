import isISO8601 from 'validator/es/lib/isISO8601';
import { Entity, type EntityItem } from 'electrodb';
import { DATE_FORMATS, TIME_FORMATS } from '@thatblog/formats';

import { dcdb, DYNAMODB_TABLE } from './setup';

export const BlogDomain = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-domain',
      version: '1',
    },
    attributes: {
      blogId: {
        type: 'string',
        required: true,
      },
      domain: {
        type: 'string',
        required: true,
      },
      path: {
        type: 'string',
        required: false,
        default: '',
      },
    },
    indexes: {
      /**
       * pk: 'BLOGS:DOMAINS',
       * sk: '${domain}${path}',
       * ls1sk: '${blogId}',
       */
      byDomain: {
        pk: {
          field: 'pk',
          template: 'BLOGS:DOMAINS',
          composite: [],
          casing: 'none',
        },
        sk: {
          field: 'sk',
          template: '${domain}${path}',
          composite: ['domain', 'path'],
          casing: 'none',
        },
      },
      byBlog: {
        index: 'ls1',
        pk: {
          field: 'pk',
          composite: [],
          template: 'BLOGS:DOMAINS',
          casing: 'none',
        },
        sk: {
          field: 'ls1sk',
          template: '${blogId}',
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

export const BlogPreferences = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-preferences',
      version: '1',
    },
    attributes: {
      blogId: {
        type: 'string',
        required: true,
      },
      timezone: {
        type: 'string',
        default: 'Etc/UTC',
      },
      dateFormat: {
        type: Object.keys(DATE_FORMATS),
        default: '1',
      },
      timeFormat: {
        type: Object.keys(TIME_FORMATS),
        default: '1',
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
       * pk: 'BLOG',
       * sk: 'PREFERENCES',
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
          template: 'PREFERENCES',
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

export type BlogDomainItem = EntityItem<typeof BlogDomain>;
