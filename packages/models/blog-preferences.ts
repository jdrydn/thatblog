import isISO8601 from 'validator/es/lib/isISO8601';
import { Entity, type EntityItem } from 'electrodb';
import { DATE_FORMATS, TIME_FORMATS } from '@thatblog/formats';

import { dcdb, DYNAMODB_TABLE } from './setup';

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

export type BlogPreferencesItem = EntityItem<typeof BlogPreferences>;
