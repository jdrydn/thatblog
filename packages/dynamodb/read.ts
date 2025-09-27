import {
  type DynamoDBDocumentClient,
  GetCommand,
  type GetCommandInput,
  BatchGetCommand,
  type BatchGetCommandInput,
  QueryCommand,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { formatProjectionExpression } from './utils';

/**
 * Get an item from DynamoDB
 */
export async function getItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  { pk, sk }: { pk: string; sk: string },
  opts?: { consistentRead?: boolean; projection?: string | undefined } | undefined,
): Promise<Record<string, unknown> | undefined> {
  const params: GetCommandInput = {
    TableName: tableName,
    Key: { pk, sk },
    ...(typeof opts?.consistentRead === 'boolean' && {
      ConsistentRead: opts?.consistentRead,
    }),
  };

  if (Array.isArray(opts?.projection) && opts.projection.length) {
    const [expression, names] = formatProjectionExpression(opts.projection);
    Object.assign(params, {
      ProjectionExpression: expression,
      ...(names && {
        ExpressionAttributeNames: {
          ...params.ExpressionAttributeNames,
          ...names,
        },
      }),
    });
  }

  const res = await client.send(new GetCommand(params));

  return res.Item;
}

/**
 * Get many items from DynamoDB
 */
export async function getManyItems(
  client: DynamoDBDocumentClient,
  tableName: string,
  keys: { pk: string; sk: string }[],
  opts?: { consistentRead?: boolean },
): Promise<Record<string, unknown>[]> {
  // eslint-disable-next-line wrap-iife
  return (async function step(i: number, params: BatchGetCommandInput): Promise<Record<string, any>[]> {
    const res = await client.send(new BatchGetCommand(params));

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
 * Query one item in DynamoDB.
 */
export async function queryItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  query: string,
  opts?: {
    attributeNames?: Record<string, string> | undefined;
    attributeValues?: Record<string, any> | undefined;
    filterExpression?: string | undefined;
    projection?: string[] | undefined;
    consistentRead?: true;
    scanIndexForward?: boolean | undefined;
    indexName?: string | undefined;
  },
): Promise<Record<string, unknown> | undefined> {
  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: query,
    ...(typeof opts?.attributeNames === 'object' && {
      ExpressionAttributeNames: { ...opts.attributeNames },
    }),
    ...(typeof opts?.attributeValues === 'object' && {
      ExpressionAttributeValues: { ...opts.attributeValues },
    }),
    ...(typeof opts?.filterExpression === 'string' && {
      FilterExpression: opts.filterExpression,
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
    Limit: 1,
  };

  if (Array.isArray(opts?.projection) && opts.projection.length) {
    const [expression, names] = formatProjectionExpression(opts.projection);
    Object.assign(params, {
      ProjectionExpression: expression,
      ...(names && {
        ExpressionAttributeNames: {
          ...params.ExpressionAttributeNames,
          ...names,
        },
      }),
    });
  }

  const res = await client.send(new QueryCommand(params));

  const [item] = Array.isArray(res.Items) ? res.Items : [];
  return item || undefined;
}

/**
 * Query items in DynamoDB.
 */
export async function queryManyItems(
  client: DynamoDBDocumentClient,
  tableName: string,
  query: string,
  opts?: {
    attributeNames?: Record<string, string> | undefined;
    attributeValues?: Record<string, any> | undefined;
    filterExpression?: string | undefined;
    projection?: string[] | undefined;
    consistentRead?: true;
    scanIndexForward?: boolean | undefined;
    indexName?: string | undefined;
    limit?: number | undefined;
  },
): Promise<Record<string, unknown>[]> {
  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: query,
    ...(typeof opts?.attributeNames === 'object' && {
      ExpressionAttributeNames: { ...opts.attributeValues },
    }),
    ...(typeof opts?.attributeValues === 'object' && {
      ExpressionAttributeValues: { ...opts.attributeValues },
    }),
    ...(typeof opts?.filterExpression === 'string' && {
      FilterExpression: opts.filterExpression,
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

  if (Array.isArray(opts?.projection) && opts.projection.length) {
    const [expression, names] = formatProjectionExpression(opts.projection);
    Object.assign(params, {
      ProjectionExpression: expression,
      ...(names && {
        ExpressionAttributeNames: {
          ...params.ExpressionAttributeNames,
          ...names,
        },
      }),
    });
  }

  const res = await client.send(new QueryCommand(params));
  return Array.isArray(res.Items) ? res.Items : [];
}
