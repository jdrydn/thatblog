import {
  type DynamoDBDocumentClient,
  PutCommand,
  type PutCommandInput,
  UpdateCommand,
  type UpdateCommandInput,
  DeleteCommand,
  type DeleteCommandInput,
  BatchWriteCommand,
  type BatchWriteCommandInput,
  type BatchWriteCommandOutput,
} from '@aws-sdk/lib-dynamodb';

/**
 * Create an item in DynamoDB
 */
export async function createItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  key: { pk: string; sk: string },
  item: Record<string, unknown>,
  opts?: {
    attributeNames?: Record<string, string> | undefined;
    conditionExpression?: string | undefined;
  },
): Promise<Record<string, unknown>> {
  const params: PutCommandInput = {
    TableName: tableName,
    Item: { ...key, ...item },
    ConditionExpression: ((a) => a.join(' AND '))([
      'attribute_not_exists(#pk)',
      'attribute_not_exists(#sk)',
      ...(opts?.conditionExpression ? [opts?.conditionExpression] : []),
    ]),
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
      ...opts?.attributeNames,
    },
    ReturnValues: 'NONE',
  };

  await client.send(new PutCommand(params));

  return { ...key, ...item };
}

/**
 * Insert multiple items into DynamoDB
 */
export async function createManyItems(
  client: DynamoDBDocumentClient,
  tableName: string,
  items: { key: { pk: string; sk: string }; item: Record<string, unknown> }[],
): Promise<void> {
  const MAX_CHUNK_SIZE = 25;
  const chunk = items.slice(0, MAX_CHUNK_SIZE);

  let params: BatchWriteCommandInput | undefined = {
    RequestItems: {
      [tableName]: chunk.map(({ key, item }) => ({
        PutRequest: {
          Item: {
            ...key,
            ...item,
          },
        },
      })),
    },
  };

  while (params !== undefined) {
    const res: BatchWriteCommandOutput = await client.send(new BatchWriteCommand(params));

    if (res.UnprocessedItems && res.UnprocessedItems[tableName]) {
      params = { RequestItems: res.UnprocessedItems };
    } else {
      params = undefined;
    }
  }

  if (items.length > MAX_CHUNK_SIZE) {
    await createManyItems(client, tableName, items.slice(MAX_CHUNK_SIZE));
  }
}

/**
 * Update an item in DynamoDB
 */
export async function updateItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  { pk, sk }: { pk: string; sk: string },
  updates: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { changes, names, values } = Object.entries(updates).reduce(
    (update, [key, value], i) => {
      /* eslint-disable no-param-reassign */
      const j = i + 1;
      update.changes.push(`#u${j} = :u${j}`);
      update.names[`#u${j}`] = key;
      update.values[`:u${j}`] = value;
      return update;
    },
    {
      changes: [] as string[],
      names: {} as Record<string, string>,
      values: {} as Record<string, any>,
    },
  );

  const params: UpdateCommandInput = {
    TableName: tableName,
    Key: { pk, sk },
    ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk)',
    UpdateExpression: `SET ${changes.join(', ')}`,
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk', ...names },
    ExpressionAttributeValues: { ...values },
    ReturnValues: 'ALL_NEW',
  };

  const res = await client.send(new UpdateCommand(params));
  return res.Attributes!;
}

/**
 * Delete an item in DynamoDB
 */
export async function deleteItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  { pk, sk }: { pk: string; sk: string },
): Promise<void> {
  const params: DeleteCommandInput = {
    TableName: tableName,
    Key: { pk, sk },
    ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk)',
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
    ReturnValues: 'NONE',
  };

  await client.send(new DeleteCommand(params));
}

/**
 * Insert multiple items into DynamoDB
 */
export async function deleteManyItems(
  client: DynamoDBDocumentClient,
  tableName: string,
  keys: { pk: string; sk: string }[],
): Promise<void> {
  const MAX_CHUNK_SIZE = 25;
  const chunk = keys.slice(0, MAX_CHUNK_SIZE);

  let params: BatchWriteCommandInput | undefined = {
    RequestItems: {
      [tableName]: chunk.map((Key) => ({
        DeleteRequest: {
          Key,
        },
      })),
    },
  };

  while (params !== undefined) {
    // eslint-disable-next-line no-await-in-loop
    const res: BatchWriteCommandOutput = await client.send(new BatchWriteCommand(params));

    if (res.UnprocessedItems && res.UnprocessedItems[tableName]) {
      params = { RequestItems: res.UnprocessedItems };
    } else {
      params = undefined;
    }
  }

  if (keys.length > MAX_CHUNK_SIZE) {
    await deleteManyItems(client, tableName, keys.slice(MAX_CHUNK_SIZE));
  }
}

/**
 * Upsert an item in DynamoDB
 */
export async function upsertItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  { pk, sk }: { pk: string; sk: string },
  updates: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { changes, names, values } = Object.entries(updates).reduce(
    (update, [key, value], i) => {
      /* eslint-disable no-param-reassign */
      const j = i + 1;
      update.changes.push(`#u${j} = :u${j}`);
      update.names[`#u${j}`] = key;
      update.values[`:u${j}`] = value;
      return update;
    },
    {
      changes: [] as string[],
      names: {} as Record<string, string>,
      values: {} as Record<string, any>,
    },
  );

  const params: UpdateCommandInput = {
    TableName: tableName,
    Key: { pk, sk },
    UpdateExpression: `SET ${changes.join(', ')}`,
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk', ...names },
    ExpressionAttributeValues: { ...values },
    ReturnValues: 'ALL_NEW',
  };

  const res = await client.send(new UpdateCommand(params));
  return res.Attributes!;
}
