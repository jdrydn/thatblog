import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const dydb = new DynamoDBClient({});
export const dcdb = DynamoDBDocumentClient.from(dydb);

export const THATBLOG_DYNAMODB_TABLE = process.env.THATBLOG_DYNAMODB_TABLE;
