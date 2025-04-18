/**
 * For copy-paste use with ElectroDB's playground
 * @link https://electrodb.fun/
 */

import { Entity } from 'electrodb';

const table = 'your_table_name';

/* Tasks Entity */
const users = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'users',
      version: '1',
    },
    attributes: {
      userId: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      createdAt: {
        type: 'number',
        default: () => Date.now(),
        // cannot be modified after created
        readOnly: true,
      },
      updatedAt: {
        type: 'number',
        // watch for changes to any attribute
        watch: '*',
        // set current timestamp when updated
        set: () => Date.now(),
        readOnly: true,
      },
    },
    indexes: {
      /**
       * pk: 'USERS#${userId}',
       * sk: 'USER#PROFILE',
       * gs1pk: 'USERS#EMAIL',
       * gs1sk: '${email}'
       */
      byId: {
        pk: {
          field: 'pk',
          composite: ['userId'],
          template: 'USERS#${userId}',
          casing: 'none',
        },
        sk: {
          field: 'sk',
          composite: [],
          template: 'USER#PROFILE',
          casing: 'none',
        },
      },
      byEmail: {
        index: 'gs1',
        pk: {
          field: 'gs1pk',
          composite: [],
          template: 'USERS#EMAIL',
          casing: 'none',
        },
        sk: {
          field: 'gs1sk',
          composite: ['email'],
          template: '${email}',
          casing: 'none',
        },
      },
    },
  },
  { table },
);

users
  .create({
    userId: 'a95f191e-3e20-4d00-b907-9fbff8c292dd',
    email: 'james@jdrydn.com',
  })
  .go();
