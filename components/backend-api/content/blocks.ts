import { z } from 'zod';
import { nanoid } from 'nanoid';

// Content blocks are hand-rolled, not ElectroDB (PLAN.md 8.2): each block is its own item under the
// post's content partition, and its shape is validated here with a Zod discriminated union on `type`
// rather than a fixed table schema — so new block types (MEDIA, LINK, …) slot into the array below
// without any migration, and the Liquid renderer (0.0.5+) switches on the same `type`. v0.0.4 ships
// the single block a short post needs.
const plainText = z.object({
  type: z.literal('PLAIN_TEXT'),
  value: z.string().min(1),
});

export const blockSchema = z.discriminatedUnion('type', [plainText]);

export type Block = z.infer<typeof blockSchema>;

// A block as it comes back from the store: the validated block plus its opaque id (the item's sk,
// also referenced from Post.content.values). Timestamps live on the block item but aren't exposed.
export type StoredBlock = Block & { contentId: string };

export const newContentId = () => nanoid();
