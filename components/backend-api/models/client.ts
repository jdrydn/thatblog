import assert from 'node:assert';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Table name is injected by SAM (infra/template.yaml → TABLE_NAME env) — required, no default, so a
// misconfigured Lambda fails fast at cold start rather than silently reading the wrong table. Tests
// set TABLE_NAME via vitest.config (they build their own client + table via makeModels()).
const tableName = process.env.TABLE_NAME;
assert(tableName, 'TABLE_NAME env var is required');
export const TABLE_NAME = tableName;

// In Lambda the region + credentials come from the execution environment. DYNAMO_ENDPOINT lets
// local dev point at a DynamoDB endpoint; unit tests don't use this singleton (see models/index.ts).
export const client = new DynamoDBClient(
  process.env.DYNAMO_ENDPOINT ? { endpoint: process.env.DYNAMO_ENDPOINT } : {},
);
