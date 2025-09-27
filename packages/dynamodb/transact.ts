import assert from 'http-assert-plus';
import {
  type DynamoDBDocumentClient,
  TransactGetCommand,
  type TransactGetCommandInput,
  TransactWriteCommand,
  type TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { formatProjectionExpression } from './utils';

export async function transactGetItems(
  client: DynamoDBDocumentClient,
  tableName: string,
  keys: { pk: string; sk: string }[],
  opts?: { consistentRead?: boolean; projection?: string[] },
): Promise<Record<string, unknown>[]> {
  assert(keys.length <= 100, 'Expected less than 100 items for a transaction');

  const params: TransactGetCommandInput = {
    TransactItems: keys.map(({ pk, sk }) => ({
      Get: {
        TableName: tableName,
        Key: { pk, sk },
        ...(typeof opts?.consistentRead === 'boolean' && {
          ConsistentRead: opts?.consistentRead,
        }),
      },
    })),
  };

  if (Array.isArray(opts?.projection) && opts.projection.length) {
    const [expression, names] = formatProjectionExpression(opts.projection);
    Object.assign(params, {
      ProjectionExpression: expression,
      ...(names && {
        ExpressionAttributeNames: {
          ...names,
        },
      }),
    });
  }

  const res = await client.send(new TransactGetCommand(params));
  return (res.Responses ?? []).reduce((list: Record<string, unknown>[], { Item }) => {
    if (Item) {
      list.push(Item);
    }
    return list;
  }, []);
}

type InferArrayType<T> = T extends (infer U)[] ? U : never;

export function transactCreateItem(
  tableName: string,
  key: { pk: string; sk: string },
  item: Record<string, unknown>,
): Pick<InferArrayType<TransactWriteCommandInput['TransactItems']>, 'Put'> {
  return {
    Put: {
      TableName: tableName,
      Item: { ...key, ...item },
      ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
      ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
    },
  };
}

export function transactUpdateItem(
  tableName: string,
  { pk, sk }: { pk: string; sk: string },
  updates: Record<string, unknown>,
): Pick<InferArrayType<TransactWriteCommandInput['TransactItems']>, 'Update'> {
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

  return {
    Update: {
      TableName: tableName,
      Key: { pk, sk },
      ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk)',
      UpdateExpression: `SET ${changes.join(', ')}`,
      ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk', ...names },
      ExpressionAttributeValues: { ...values },
    },
  };
}

export function transactDeleteItem(
  tableName: string,
  { pk, sk }: { pk: string; sk: string },
): Pick<InferArrayType<TransactWriteCommandInput['TransactItems']>, 'Delete'> {
  return {
    Delete: {
      TableName: tableName,
      Key: { pk, sk },
      ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk)',
      ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
    },
  };
}

export function transactUpsertItem(
  tableName: string,
  { pk, sk }: { pk: string; sk: string },
  updates: Record<string, unknown>,
): Pick<InferArrayType<TransactWriteCommandInput['TransactItems']>, 'Update'> {
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

  return {
    Update: {
      TableName: tableName,
      Key: { pk, sk },
      UpdateExpression: `SET ${changes.join(', ')}`,
      ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk', ...names },
      ExpressionAttributeValues: { ...values },
    },
  };
}

export async function transactWriteItems(
  client: DynamoDBDocumentClient,
  items: NonNullable<TransactWriteCommandInput['TransactItems']>,
): Promise<void> {
  assert(items.length <= 100, 'Expected less than 100 items for a transaction');

  const params: TransactWriteCommandInput = {
    TransactItems: items,
  };

  await client.send(new TransactWriteCommand(params));
}
