import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { EntityConfiguration } from 'electrodb';

export { Entity } from 'electrodb';

export const dcdb = DynamoDBDocument.from(new DynamoDBClient({}));

export const THATBLOG_DYNAMODB_TABLE = 'thatblog-dev-table';

export const entityConfig: EntityConfiguration = {
  client: dcdb,
  table: THATBLOG_DYNAMODB_TABLE,
};
