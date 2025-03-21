import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  type GetCommandInput,
  BatchGetCommand,
  type BatchGetCommandInput,
  QueryCommand,
  type QueryCommandInput,
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

/* eslint-disable no-await-in-loop */

export const dydb = new DynamoDBClient({});
export const dcdb = DynamoDBDocumentClient.from(dydb);
export const tableName = process.env.THATBLOG_DYNAMODB_TABLENAME ?? '';

/**
 * Get an item from DynamoDB
 */
export async function getItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  { pk, sk }: { pk: string; sk: string },
  opts?: { consistentRead?: true; projection?: string | undefined } | undefined,
): Promise<Record<string, unknown> | undefined> {
  const params: GetCommandInput = {
    TableName: tableName,
    Key: { pk, sk },
    ...(typeof opts?.consistentRead === 'boolean' && {
      ConsistentRead: opts?.consistentRead,
    }),
    ...(typeof opts?.projection === 'string' && {
      ProjectionExpression: opts?.projection,
    }),
  };

  const res = await client.send(new GetCommand(params));

  return res.Item;
}

/**
 * Get many items from DynamoDB
 */
export async function getBatchItems(
  client: DynamoDBDocumentClient,
  tableName: string,
  keys: { pk: string; sk: string }[],
  opts?: { consistentRead?: true },
): Promise<Record<string, unknown>[]> {
  // eslint-disable-next-line wrap-iife
  return (async function step(i: number, params: BatchGetCommandInput): Promise<Record<string, any>[]> {
    // logger.debug({ params }, 'dynamodb.read.getBatchItems #%d', i);

    const res = await client.send(new BatchGetCommand(params));
    // logger.debug({ res }, 'dynamodb.read.getBatchItems #%d', i);

    const page = Array.isArray(res?.Responses?.[tableName]) ? res!.Responses![tableName] : [];

    if (res.UnprocessedKeys && res.UnprocessedKeys[tableName]) {
      return page.concat(await step(i + 1, { RequestItems: res.UnprocessedKeys }));
    } else {
      return page;
    }
  })(0, {
    RequestItems: {
      [tableName]: {
        Keys: keys,
        ...(typeof opts?.consistentRead === 'boolean' && {
          ConsistentRead: opts?.consistentRead,
        }),
      },
    },
  });
}

/**
 * Query items in DynamoDB.
 */
export async function queryItems(
  client: DynamoDBDocumentClient,
  tableName: string,
  query: string,
  opts?: {
    attributeNames?: Record<string, string> | undefined;
    attributeValues?: Record<string, any> | undefined;
    filterExpression?: string | undefined;
    projection?: string | undefined;
    consistentRead?: true;
    scanIndexForward?: boolean | undefined;
    indexName?: string | undefined;
    limit?: number | undefined;
  },
): Promise<Record<string, unknown>[]> {
  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: query,
    ...(typeof opts?.filterExpression === 'string' && {
      FilterExpression: opts.filterExpression,
    }),
    ...(typeof opts?.projection === 'string' && {
      ProjectionExpression: opts.projection,
    }),
    ...(typeof opts?.attributeNames === 'object' && {
      ExpressionAttributeNames: { ...opts.attributeNames },
    }),
    ...(typeof opts?.attributeValues === 'object' && {
      ExpressionAttributeValues: { ...opts.attributeValues },
    }),
    ...(typeof opts?.consistentRead === 'boolean' && {
      ConsistentRead: opts.consistentRead,
    }),
    ...(typeof opts?.scanIndexForward === 'boolean' && {
      ScanIndexForward: opts.scanIndexForward,
    }),
    ...(typeof opts?.indexName === 'string' && {
      IndexName: opts.indexName,
    }),
    ...(typeof opts?.limit === 'number' && {
      Limit: opts.limit,
    }),
  };

  // logger.debug({ params }, 'dynamodb.read.queryItems');

  const res = await client.send(new QueryCommand(params));
  // logger.debug({ res }, 'dynamodb.read.queryItems');

  return Array.isArray(res.Items) ? res.Items : [];
}

/**
 * Create an item in DynamoDB
 */
export async function createItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  key: { pk: string; sk: string },
  item: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const params: PutCommandInput = {
    TableName: tableName,
    Item: { ...key, ...item },
    ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
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

export function formatPrimaryKeyPair(key: object) {
  const { pk, sk } = typeof key === 'object' ? (key as Record<string, unknown>) : {};
  return typeof pk === 'string' && typeof sk === 'string' ? { pk, sk } : undefined;
}

export function formatPrimaryKeyPairs(keys: object[]): Array<NonNullable<ReturnType<typeof formatPrimaryKeyPair>>> {
  return keys.reduce((list: ReturnType<typeof formatPrimaryKeyPairs>, key) => {
    const parsed = formatPrimaryKeyPair(key);
    return list.concat(parsed ? [parsed] : []);
  }, []);
}
