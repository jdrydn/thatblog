import { GetCommand, GetCommandInput, PutCommand, PutCommandInput, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { DYNAMODB_TABLE } from '@/src/config';
import { dcdb } from '@/src/services';

export async function getItemFromDynamoDB(
  key: { pk: string; sk: string },
  opts?: Omit<GetCommandInput, 'TableName' | 'Key'>,
): Promise<Record<string, unknown> | undefined> {
  const res = await dcdb.send(
    new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: key,
      ...opts,
    }),
  );

  return res.Item;
}

export async function putItemInDynamoDB(
  key: { pk: string; sk: string },
  item: Record<string, unknown>,
  opts?: Omit<PutCommandInput, 'TableName' | 'Key'>,
): Promise<void> {
  await dcdb.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: { ...key, ...item },
      ...opts,
    }),
  );
}

export async function deleteItemInDynamoDB(key: { pk: string; sk: string }): Promise<boolean> {
  try {
    await dcdb.send(
      new DeleteCommand({
        TableName: DYNAMODB_TABLE,
        Key: key,
        ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk)',
        ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
        ReturnValues: 'NONE',
      }),
    );

    return true;
  } catch (err) {
    throw err;
  }
}
