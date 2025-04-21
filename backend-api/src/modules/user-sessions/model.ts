import { v7 as uuid } from 'uuid';
import { Entity, entityConfig } from '@/backend-api/src/lib/electrodb';

export const userSessions = new Entity(
  {
    model: {
      service: 'thatblog',
      entity: 'users-sessions',
      version: '1',
    },
    attributes: {
      userId: {
        type: 'string',
        required: true,
      },
      sessionId: {
        type: 'string',
        required: true,
        default: () => uuid(),
      },
      createdAt: {
        type: 'number',
        required: true,
        readOnly: true,
        default: () => Date.now(),
      },
      updatedAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
        watch: '*',
      },
      archivedAt: {
        type: 'number',
        set: () => Date.now(),
      },
    },
    indexes: {
      /**
       * pk: 'USERS#${userId}',
       * sk: 'SESSION#${sessionId}',
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
          composite: ['sessionId'],
          template: 'SESSION#${sessionId}',
          casing: 'none',
        },
      },
    },
  },
  entityConfig,
);
