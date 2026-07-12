import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  TransactWriteCommand,
  type TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { blockSchema, type Block, type StoredBlock } from './blocks';

type TransactItem = NonNullable<TransactWriteCommandInput['TransactItems']>[number];

// Strip the storage/key fields and re-validate the block body, so a corrupt or unknown-type item
// fails loudly rather than rendering as garbage.
const toStoredBlock = (item: Record<string, unknown>): StoredBlock => ({
  contentId: String(item.contentId),
  ...blockSchema.parse(item),
});

// The hand-rolled sibling to the ElectroDB entities (PLAN.md 8.2): raw pk/sk access to a post's
// content blocks. All blocks for a post share one partition, so a whole body hydrates in a single
// query. Block writes always travel with the parent Post's content.values[] in one TransactWrite
// (#20) — this store builds the block transact-items (pure) and runs the transaction; the caller
// pairs them with the Post's ElectroDB `.params()`, so the ordered list and its blocks never drift.
export function makeContentStore(client: DynamoDBClient, table: string) {
  const doc = DynamoDBDocumentClient.from(client);
  const partition = (blogId: string, postId: string) => `BLOGS#${blogId}#POSTS#${postId}#CONTENTS`;

  return {
    // Every block for a post. sk order is opaque (contentIds are random) — callers order the result
    // by the parent's content.values[].
    async listBlocks(blogId: string, postId: string): Promise<StoredBlock[]> {
      const out = await doc.send(
        new QueryCommand({
          TableName: table,
          KeyConditionExpression: '#pk = :pk',
          ExpressionAttributeNames: { '#pk': 'pk' },
          ExpressionAttributeValues: { ':pk': partition(blogId, postId) },
        }),
      );
      return (out.Items ?? []).map(toStoredBlock);
    },

    putBlock(blogId: string, postId: string, contentId: string, block: Block): TransactItem {
      const now = new Date().toISOString();
      return {
        Put: {
          TableName: table,
          Item: { pk: partition(blogId, postId), sk: contentId, contentId, ...block, createdAt: now, updatedAt: now },
        },
      };
    },

    deleteBlock(blogId: string, postId: string, contentId: string): TransactItem {
      return { Delete: { TableName: table, Key: { pk: partition(blogId, postId), sk: contentId } } };
    },

    // Atomic write of the Post item + its blocks. ElectroDB `.params()` returns DocumentClient-shaped
    // params, so the caller's `{ Put }`/`{ Update }` for the Post drops straight in beside the block
    // items. DynamoDB caps a transaction at 100 items — routes bound the block count to stay under it.
    async write(items: TransactItem[]): Promise<void> {
      await doc.send(new TransactWriteCommand({ TransactItems: items }));
    },
  };
}

export type ContentStore = ReturnType<typeof makeContentStore>;
export type { TransactItem };
