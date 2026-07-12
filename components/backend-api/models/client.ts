import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Table name is injected by SAM (infra/template.yaml → TABLE_NAME env). The fallback keeps
// imports safe outside Lambda (tests build their own client + table via makeModels()).
export const TABLE_NAME = process.env.TABLE_NAME ?? 'thatblog';

// In Lambda the region + credentials come from the execution environment. DYNAMO_ENDPOINT lets
// local dev point at a DynamoDB endpoint; unit tests don't use this singleton (see models/index.ts).
export const client = new DynamoDBClient(
  process.env.DYNAMO_ENDPOINT ? { endpoint: process.env.DYNAMO_ENDPOINT } : {},
);
