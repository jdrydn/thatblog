import { Entity } from 'electrodb';

import { entityConfig } from '@/backend-api/src/lib/electrodb';

export const blogBranding = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-branding',
      version: '1',
    },
    attributes: {
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
          composite: [],
          template: 'BLOG',
          casing: 'none',
        },
        sk: {
          field: 'sk',
          composite: [],
          template: 'BRANDING',
          casing: 'none',
        },
      },
    },
  },
  entityConfig,
);

export const blogPreferences = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-preferences',
      version: '1',
    },
    attributes: {
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
          composite: [],
          template: 'BLOG',
          casing: 'none',
        },
        sk: {
          field: 'sk',
          composite: [],
          template: 'PREFERENCES',
          casing: 'none',
        },
      },
    },
  },
  entityConfig,
);
