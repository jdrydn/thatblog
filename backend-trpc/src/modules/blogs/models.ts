import { Entity, type EntityItem } from 'electrodb';

import { DYNAMODB_TABLENAME } from '@/backend-trpc/src/config';
import { dcdb } from '@/backend-trpc/src/services';

export const BlogBranding = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-branding',
      version: '1',
    },
    attributes: {
      blogId: {
        type: 'string',
        required: true,
      },
      title: {
        type: 'string',
        required: true,
      },
      description: {
        type: 'string',
        required: true,
      },
      siteUrl: {
        type: 'string',
        required: false,
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
    table: DYNAMODB_TABLENAME,
  },
);

export const BlogDomain = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-domains',
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
    table: DYNAMODB_TABLENAME,
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
        type: 'string',
        required: false,
      },
      timeFormat: {
        type: 'string',
        required: false,
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
    table: DYNAMODB_TABLENAME,
  },
);

export type BlogBrandingItem = EntityItem<typeof BlogBranding>;
export type BlogDomainItem = EntityItem<typeof BlogDomain>;
export type BlogPreferencesItem = EntityItem<typeof BlogPreferences>;
