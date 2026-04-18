import assert from 'assert';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const DYNAMODB_ENDPOINT = process.env.THATBLOG_DYNAMODB_ENDPOINT;

assert(process.env.THATBLOG_DYNAMODB_TABLE, 'Missing { THATBLOG_DYNAMODB_TABLE } env');
export const DYNAMODB_TABLE = process.env.THATBLOG_DYNAMODB_TABLE;

export const dydb = new DynamoDB({
  endpoint: DYNAMODB_ENDPOINT,
});

export const dcdb = DynamoDBDocumentClient.from(dydb);
