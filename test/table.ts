import {
  CreateTableCommand,
  UpdateTimeToLiveCommand,
  waitUntilTableExists,
  type DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

// Local mirror of the table in infra/template.yaml — keep the two in sync. Fixed topology
// (PLAN.md 8.1): pk/sk + 5 LSIs (ls1sk..ls5sk) + gs1, every index KEYS_ONLY, TTL on expiresAt.
const LSI_SORT_KEYS = ['ls1sk', 'ls2sk', 'ls3sk', 'ls4sk', 'ls5sk'] as const;

export async function createTable(client: DynamoDBClient, tableName: string): Promise<void> {
  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
        ...LSI_SORT_KEYS.map((name) => ({ AttributeName: name, AttributeType: 'S' as const })),
        { AttributeName: 'gs1pk', AttributeType: 'S' },
        { AttributeName: 'gs1sk', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      LocalSecondaryIndexes: LSI_SORT_KEYS.map((name, i) => ({
        IndexName: `ls${i + 1}`,
        KeySchema: [
          { AttributeName: 'pk', KeyType: 'HASH' as const },
          { AttributeName: name, KeyType: 'RANGE' as const },
        ],
        Projection: { ProjectionType: 'KEYS_ONLY' as const },
      })),
      GlobalSecondaryIndexes: [
        {
          IndexName: 'gs1',
          KeySchema: [
            { AttributeName: 'gs1pk', KeyType: 'HASH' },
            { AttributeName: 'gs1sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
      ],
    }),
  );

  await waitUntilTableExists({ client, maxWaitTime: 30 }, { TableName: tableName });

  await client.send(
    new UpdateTimeToLiveCommand({
      TableName: tableName,
      TimeToLiveSpecification: { AttributeName: 'expiresAt', Enabled: true },
    }),
  );
}
