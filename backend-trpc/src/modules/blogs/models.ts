import isISO8601 from 'validator/es/lib/isISO8601';
import { Entity, type EntityItem } from 'electrodb';
import { DATE_FORMATS, TIME_FORMATS } from '@thatblog/formats';

import { DYNAMODB_TABLENAME } from '@/src/config';
import { dcdb } from '@/src/services';

export const Blog = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog',
      version: '1',
    },
    attributes: {
      blogId: {
        type: 'string',
        required: true,
      },
      siteUrl: {
        type: 'string',
        required: false,
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
          template: 'ITEM',
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
    table: DYNAMODB_TABLENAME,
  },
);

export type BlogItem = EntityItem<typeof Blog>;
export type BlogBrandingItem = EntityItem<typeof BlogBranding>;
export type BlogDomainItem = EntityItem<typeof BlogDomain>;
export type BlogPreferencesItem = EntityItem<typeof BlogPreferences>;
