import {
  GetCommand,
  type GetCommandInput,
  BatchGetCommand,
  type BatchGetCommandInput,
  BatchWriteCommand,
  type BatchWriteCommandInput,
  type BatchWriteCommandOutput,
  PutCommand,
  type PutCommandInput,
  UpdateCommand,
  type UpdateCommandInput,
  DeleteCommand,
  type DeleteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { DYNAMODB_TABLE } from '@/src/config';
import { dcdb } from '@/src/services';
import { calculateJsonSize } from '@/src/helpers/isomorphic';

import type { PostContentTypes } from './types';

export const postContentSchema = z
  .discriminatedUnion('type', [
    z.object({ type: z.literal('MARKDOWN'), value: z.string() }) satisfies z.ZodType<PostContentTypes.Markdown>,
    z.object({ type: z.literal('RICHTEXT'), value: z.string() }) satisfies z.ZodType<PostContentTypes.RichText>,
    z.object({ type: z.literal('HTML'), value: z.string() }) satisfies z.ZodType<PostContentTypes.HTML>,
    z.object({
      type: z.literal('MEDIA'),
      media: z
        .array(
          z.object({
            href: z.union([z.string().startsWith('/'), z.string().url()]),
            alt: z.string().optional(),
            caption: z.string().optional(),
            source: z.string().optional(),
          }),
        )
        .nonempty(),
    }) satisfies z.ZodType<PostContentTypes.Media>,
  ])
  // Ensure the entire content object will sit in DynamoDB
  .refine((value) => calculateJsonSize(value) <= 399 * 1024, {
    message: 'Post content exceeds maximum size',
  });

export type PostContentItem = z.infer<typeof postContentSchema>;
export type PostContentItemWithId = { contentId: string } & PostContentItem;
export type PostContentType = PostContentItem['type'];

const createItemPK = (blogId: string, postId: string) => `BLOGS#${blogId}#POSTS#${postId}`;

const formatReadItemSchema = z.object({
  // BLOGS#${blogId}#POSTS#${postId}
  pk: z.tuple([z.literal('BLOGS'), z.string().ulid(), z.literal('POSTS'), z.string().ulid()]),
  // ${contentId}
  contentId: z.string().ulid(),
  // type, value, etc.
  contents: postContentSchema,
});

function formatReadItem(
  item: Record<string, unknown>,
): ({ blogId: string; postId: string } & PostContentItemWithId) | undefined {
  // If the item doesn't have our DynamoDB properties, then reject
  if (typeof item.pk !== 'string' || typeof item.sk !== 'string' || typeof item.type !== 'string') {
    return undefined;
  }

  const { data } = formatReadItemSchema.safeParse({
    pk: item.pk.split('#'),
    contentId: item.sk,
    contents: item,
  });

  if (data && data.pk && data.contentId) {
    const { pk, contentId, contents } = data;
    const [, blogId, , postId] = pk;
    return { blogId, postId, contentId, ...contents };
  } else {
    return undefined;
  }
}

export async function getContentItem(
  blogId: string,
  postId: string,
  contentId: string,
): Promise<PostContentItemWithId | undefined> {
  const params: GetCommandInput = {
    TableName: DYNAMODB_TABLE,
    Key: {
      pk: createItemPK(blogId, postId),
      sk: contentId,
    },
  };

  const res = await dcdb.send(new GetCommand(params));
  if (res.Item) {
    return formatReadItem(res.Item);
  } else {
    return undefined;
  }
}

export async function getContentItems(
  blogId: string,
  items: Array<{ postId: string; contentIds: string[] }>,
): Promise<Record<string, Array<PostContentItemWithId>>> {
  let query: BatchGetCommandInput['RequestItems'] | undefined = {
    [DYNAMODB_TABLE]: {
      Keys: items.reduce((list, { postId, contentIds }) => {
        const pk = createItemPK(blogId, postId);
        for (const sk of contentIds) {
          list.push({ pk, sk });
        }
        return list;
      }, [] as Array<{ pk: string; sk: string }>),
    },
  };

  const results: Awaited<ReturnType<typeof getContentItems>> = {};

  do {
    const res = await dcdb.send(
      new BatchGetCommand({
        RequestItems: query,
      }),
    );

    if (Array.isArray(res?.Responses?.[DYNAMODB_TABLE])) {
      for (const item of res.Responses[DYNAMODB_TABLE] as Array<Record<string, unknown>>) {
        const parsed = formatReadItem(item);
        if (parsed) {
          if (!Array.isArray(results[parsed.postId])) {
            results[parsed.postId] = [];
          }

          results[parsed.postId].push(parsed);
        }
      }
    }

    if (res.UnprocessedKeys && res.UnprocessedKeys[DYNAMODB_TABLE]) {
      query = res.UnprocessedKeys;
    } else {
      query = undefined;
    }
  } while (query !== undefined);

  return results;
}

export async function createContentItem(
  blogId: string,
  postId: string,
  contentId: string,
  create: PostContentItem,
): Promise<void> {
  const params: PutCommandInput = {
    TableName: DYNAMODB_TABLE,
    Item: {
      pk: createItemPK(blogId, postId),
      sk: contentId,
      ...create,
    },
    ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
    ReturnValues: 'NONE',
  };

  await dcdb.send(new PutCommand(params));
}

export async function createContentItems(
  blogId: string,
  postId: string,
  creates: Array<{ contentId: string } & PostContentItem>,
): Promise<void> {
  let query: BatchWriteCommandInput['RequestItems'] | undefined = {
    [DYNAMODB_TABLE]: creates.map(({ contentId, ...create }) => ({
      PutRequest: {
        Item: {
          pk: createItemPK(blogId, postId),
          sk: contentId,
          ...create,
        },
        ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
        ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
        ReturnValues: 'NONE',
      },
    })),
  };

  do {
    const res: BatchWriteCommandOutput = await dcdb.send(
      new BatchWriteCommand({
        RequestItems: query,
      }),
    );

    if (res.UnprocessedItems && res.UnprocessedItems[DYNAMODB_TABLE]) {
      query = res.UnprocessedItems;
    } else {
      query = undefined;
    }
  } while (query !== undefined);
}

export async function updateContentItem(
  blogId: string,
  postId: string,
  contentId: string,
  { type, ...update }: PostContentItem,
) {
  const { changes, names, values } = Object.entries(update).reduce(
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
    TableName: DYNAMODB_TABLE,
    Key: {
      pk: createItemPK(blogId, postId),
      sk: contentId,
    },
    ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk) AND #type = :type',
    UpdateExpression: `SET ${changes.join(', ')}`,
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
      '#type': 'type',
      ...names,
    },
    ExpressionAttributeValues: {
      ':type': type,
      ...values,
    },
    ReturnValues: 'NONE',
  };

  await dcdb.send(new UpdateCommand(params));
}

export async function deleteContentItem(blogId: string, postId: string, contentId: string) {
  const params: DeleteCommandInput = {
    TableName: DYNAMODB_TABLE,
    Key: {
      pk: createItemPK(blogId, postId),
      sk: contentId,
    },
    ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk)',
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
    ReturnValues: 'NONE',
  };

  await dcdb.send(new DeleteCommand(params));
}
