import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { makeSystem } from './system';
import { makeBlog } from './blog';
import { makeBlogDomain } from './blog-domain';
import { makeUser } from './user';
import { makeMapBlogUser } from './map-blog-user';
import { makeUserSession } from './user-session';

// The env-driven singletons (System, Blog, …) are the default import for Lambda code. makeModels
// rebuilds the same entities against an arbitrary client/table — used by unit tests to point every
// model at a Testcontainers DynamoDB without touching import-time env.
export const makeModels = (client: DynamoDBClient, table: string) => ({
  System: makeSystem(client, table),
  Blog: makeBlog(client, table),
  BlogDomain: makeBlogDomain(client, table),
  User: makeUser(client, table),
  MapBlogUser: makeMapBlogUser(client, table),
  UserSession: makeUserSession(client, table),
});

export type Models = ReturnType<typeof makeModels>;

export { client, TABLE_NAME } from './client';
export * from './ids';
export * from './system';
export * from './blog';
export * from './blog-domain';
export * from './user';
export * from './map-blog-user';
export * from './user-session';
