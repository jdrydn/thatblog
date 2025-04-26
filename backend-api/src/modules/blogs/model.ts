import { Entity, type EntityItem } from 'electrodb';

import { dcdb, tableName } from '@/backend-api/src/lib/dynamodb';

export const blogBranding = new Entity(
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
      baseUrl: {
        type: 'string',
        required: false,
      },
      updatedAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
        watch: '*',
      },
    },
    indexes: {
      /**
       * pk: 'BLOG',
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
    table: tableName,
  },
);

export const blogDomains = new Entity(
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
    },
    indexes: {
      /**
       * pk: 'BLOGS:DOMAINS',
       * sk: '${domain}',
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
          template: '${domain}',
          composite: ['domain'],
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
    table: tableName,
  },
);

export const blogPreferences = new Entity(
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
        set: () => Date.now(),
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
    table: tableName,
  },
);

export type BlogBrandingItem = EntityItem<typeof blogBranding>;
export type BlogDomainItem = EntityItem<typeof blogDomains>;
export type BlogPreferencesItem = EntityItem<typeof blogPreferences>;
