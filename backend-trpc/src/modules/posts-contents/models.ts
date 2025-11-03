import _omit from 'lodash/omit';
import assert from 'http-assert-plus';
import {
  GetCommand,
  type GetCommandInput,
  BatchGetCommand,
  type BatchGetCommandInput,
  type BatchGetCommandOutput,
  TransactWriteCommand,
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

const createPostContentItemKey = (blogId: string, postId: string, contentId: string) => ({
  pk: `BLOGS#${blogId}#POSTS#${postId}`,
  sk: contentId,
});

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
): { blogId: string; postId: string; content: PostContentItemWithId } | undefined {
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
    return { blogId, postId, content: { contentId, ...contents } };
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
    Key: createPostContentItemKey(blogId, postId, contentId),
  };

  const res = await dcdb.send(new GetCommand(params));
  const result = res.Item ? formatReadItem(res.Item) : undefined;
  return result?.content;
}

export async function getContentItems(
  blogId: string,
  items: Array<{ postId: string; contentIds: string[] }>,
): Promise<Record<string, Array<PostContentItemWithId>>> {
  if (items.length === 0 || items.every(({ contentIds }) => contentIds.length === 0)) {
    return {};
  }

  let query: BatchGetCommandInput['RequestItems'] | undefined = {
    [DYNAMODB_TABLE]: {
      Keys: items.reduce((list, { postId, contentIds }) => {
        const { pk } = createPostContentItemKey(blogId, postId, 'null');
        for (const sk of contentIds) {
          list.push({ pk, sk });
        }
        return list;
      }, [] as Array<{ pk: string; sk: string }>),
    },
  };

  const results = new Map<string, NonNullable<ReturnType<typeof formatReadItem>>>();

  do {
    const res: BatchGetCommandOutput = await dcdb.send(
      new BatchGetCommand({
        RequestItems: query,
      }),
    );

    if (Array.isArray(res?.Responses?.[DYNAMODB_TABLE])) {
      for (const item of res.Responses[DYNAMODB_TABLE]) {
        const parsed = formatReadItem(item);
        if (parsed) {
          results.set(`${parsed.postId}-${parsed.content.contentId}`, parsed);
        }
      }
    }

    if (res.UnprocessedKeys && res.UnprocessedKeys[DYNAMODB_TABLE]) {
      query = res.UnprocessedKeys;
    } else {
      query = undefined;
    }
  } while (query !== undefined);

  return Object.fromEntries(
    items.map(({ postId, contentIds }) => [
      postId,
      contentIds
        // Loop through all the results
        .map((contentId) => results.get(`${postId}-${contentId}`)?.content)
        // And filter out any not-found
        .filter((v) => v !== undefined),
    ]),
  );
}

export async function createContentItems(
  blogId: string,
  postId: string,
  creates: Array<{ contentId: string; create: PostContentItem }>,
): Promise<void> {
  assert(creates.length < 100, 'Cannot create >= 100 items on a post in one operation');

  if (creates.length === 0) {
    return;
  }

  await dcdb.send(
    new TransactWriteCommand({
      TransactItems: creates.map(({ contentId, create }) => ({
        Put: {
          TableName: DYNAMODB_TABLE,
          Item: {
            ...createPostContentItemKey(blogId, postId, contentId),
            ...create,
          },
          ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
          ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
        },
      })),
    }),
  );
}

export async function updateContentItems(
  blogId: string,
  postId: string,
  updates: Array<{ contentId: string; update: PostContentItem }>,
) {
  assert(updates.length < 100, 'Cannot update >= 100 items on a post in one operation');

  if (updates.length === 0) {
    return;
  }

  await dcdb.send(
    new TransactWriteCommand({
      TransactItems: updates.map(({ contentId, update }) => ({
        Put: {
          TableName: DYNAMODB_TABLE,
          Item: {
            ...createPostContentItemKey(blogId, postId, contentId),
            ...update,
          },
          ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk) AND #type = :type',
          ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk', '#type': 'type' },
          ExpressionAttributeValues: { ':type': update.type },
        },
      })),
    }),
  );
}

export async function deleteContentItems(blogId: string, postId: string, contentIds: Array<string>): Promise<void> {
  assert(contentIds.length < 100, 'Cannot delete >= 100 items from a post in one operation');

  if (contentIds.length === 0) {
    return;
  }

  await dcdb.send(
    new TransactWriteCommand({
      TransactItems: contentIds.map((contentId) => ({
        Delete: {
          TableName: DYNAMODB_TABLE,
          Key: createPostContentItemKey(blogId, postId, contentId),
          ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk)',
          ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
        },
      })),
    }),
  );
}
