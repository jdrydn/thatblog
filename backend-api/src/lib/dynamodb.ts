import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';

export const dydb = new DynamoDBClient({});
export const dcdb = DynamoDBDocument.from(dydb);

export const tableName = 'thatblog-dev-table';

export async function getItem<T extends Record<string, unknown>>(key: Record<string, string>): Promise<T | undefined> {
  const res = await dcdb.send(
    new GetCommand({
      TableName: tableName,
      Key: key,
    }),
  );

  return res.Item as T;
}

export async function getItems<T extends Record<string, unknown>>(keys: Record<string, string>[]): Promise<T[]> {
  let items: T[] = [];
  let unprocessed: typeof keys = [];

  do {
    const res = await dcdb.send(
      new BatchGetCommand({
        RequestItems: {
          [tableName]: {
            Keys: keys,
          },
        },
      }),
    );

    items = items.concat((res.Responses ?? []) as T[]);
  } while (unprocessed.length > 0);

  return items;
}
