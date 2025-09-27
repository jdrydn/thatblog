import { type DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';

export async function createTable(dydb: DynamoDBClient, tableName: string) {
  await dydb.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        // Key attributes
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
        // LSI attributes
        { AttributeName: 'ls1sk', AttributeType: 'S' },
        { AttributeName: 'ls2sk', AttributeType: 'S' },
        { AttributeName: 'ls3sk', AttributeType: 'S' },
        { AttributeName: 'ls4sk', AttributeType: 'S' },
        { AttributeName: 'ls5sk', AttributeType: 'S' },
        // GSI attributes
        { AttributeName: 'gs1pk', AttributeType: 'S' },
        { AttributeName: 'gs1sk', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      LocalSecondaryIndexes: [
        {
          IndexName: 'ls1',
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' },
            { AttributeName: 'ls1sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
        {
          IndexName: 'ls2',
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' },
            { AttributeName: 'ls2sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
        {
          IndexName: 'ls3',
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' },
            { AttributeName: 'ls3sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
        {
          IndexName: 'ls4',
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' },
            { AttributeName: 'ls4sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
        {
          IndexName: 'ls5',
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' },
            { AttributeName: 'ls5sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
      ],
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
      BillingMode: 'PAY_PER_REQUEST',
    }),
  );
}

export async function deleteTable(dydb: DynamoDBClient, tableName: string) {
  await dydb.send(
    new DeleteTableCommand({
      TableName: tableName,
    }),
  );
}
