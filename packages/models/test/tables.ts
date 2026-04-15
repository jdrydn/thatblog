import {
  type DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  DeleteTableCommand,
} from '@aws-sdk/client-dynamodb';

export async function checkTableExists(dydb: DynamoDBClient, tableName: string): Promise<boolean> {
  let nextPage: string | undefined;

  do {
    const res = await dydb.send(new ListTablesCommand({ Limit: 100 }));
    nextPage = res.LastEvaluatedTableName;

    if (Array.isArray(res.TableNames)) {
      for (const table of res.TableNames) {
        if (table === tableName) {
          return true;
        }
      }
    }
  } while (nextPage !== undefined);

  return false;
}

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

export async function recycleTable(dydb: DynamoDBClient, tableName: string) {
  const endpoint = process.env.DYNAMODB_ENDPOINT ?? 'AWS';

  if (await checkTableExists(dydb, tableName)) {
    await deleteTable(dydb, tableName);
    console.log('[DynamoDB] Deleted table: %s (%s)', tableName, endpoint);
  }

  await createTable(dydb, tableName);
  console.log('[DynamoDB] Recreated table: %s (%s) (%s)\n', tableName, endpoint);
}
