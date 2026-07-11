import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { inject } from 'vitest';
import { makeModels } from '../components/backend-api/models';

// Build the entity set against the Testcontainers DynamoDB provided by global-setup. Each spec calls
// this to get models pointed at the local table — never the env-driven singletons.
export function testModels() {
  const client = new DynamoDBClient({
    endpoint: inject('dynamoEndpoint'),
    region: 'local',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  });
  return makeModels(client, inject('tableName'));
}
