import { Entity, type EntityItem } from 'electrodb';

import { createIdField, createDateField } from './fields';
import { dcdb, DYNAMODB_TABLE } from './setup';

export const BlogBranding = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-branding',
      version: '1',
    },
    attributes: {
      blogId: createIdField({ required: true }),
      title: {
        type: 'string',
        required: true,
      },
      description: {
        type: 'string',
      },
      siteUrl: {
        type: 'string',
        required: false,
      },
      updatedAt: createDateField({ required: true, default: true, watch: '*' }),
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
          template: 'BRANDING',
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

export type BlogBrandingItem = EntityItem<typeof BlogBranding>;
