import { Entity, type EntityItem } from 'electrodb';
import { DATE_FORMATS, TIME_FORMATS } from '@thatblog/formats';

import { createIdField, createDateField } from './fields';
import { dcdb, DYNAMODB_TABLE } from '../setup';

export const BlogPreferences = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-preferences',
      version: '1',
    },
    attributes: {
      blogId: createIdField({ required: true }),
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
      updatedAt: createDateField({ required: true, default: true, watch: '*' }),
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
