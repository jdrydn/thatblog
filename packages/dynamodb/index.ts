import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export * from './read';
export * from './write';

export const dydb = new DynamoDBClient({});
export const dcdb = DynamoDBDocumentClient.from(dydb);
export const tableName = process.env.THATBLOG_DYNAMODB_TABLENAME ?? '';
