import { Entity, type EntityItem } from 'electrodb';

import { createIdField } from './fields';
import { dcdb, DYNAMODB_TABLE } from '../setup';

export const BlogDomain = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'blog-domain',
      version: '1',
    },
    attributes: {
      blogId: createIdField({ required: true }),
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

export type BlogDomainItem = EntityItem<typeof BlogDomain>;
