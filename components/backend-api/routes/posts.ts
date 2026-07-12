import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';
import type { EntityItem } from 'electrodb';
import type { AppEnv } from '../context';
import type { Models } from '../models';
import { listPosts, type PostEntity } from '../models/post';
import { newPostId } from '../models/ids';
import { blockSchema, newContentId, type StoredBlock } from '../content/blocks';
import { isWriteConflict, type TransactItem } from '../content/store';
import { requireAuth } from '../auth/middleware';
import { requireBlogMember } from '../auth/blog';

// Blocks per post are bounded so a whole-body replace (delete old + put new + the Post item) stays
// under DynamoDB's 100-item TransactWrite cap: 25 old + 25 new + 1 post = 51. Short posts use one.
const MAX_BLOCKS = 25;

const createSchema = z.object({
  type: z.enum(['short', 'article']).default('short'),
  slug: z.string().min(1).optional(),
  blocks: z.array(blockSchema).min(1).max(MAX_BLOCKS),
});

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  blocks: z.array(blockSchema).min(1).max(MAX_BLOCKS).optional(),
});

const publishSchema = z.object({ publishedAt: z.iso.datetime().optional() }).optional();

// The API view of a post: its metadata plus its blocks in content.values order (drop the raw
// content.values / key plumbing). A body is one query; blocks are ordered here, not in DynamoDB.
const postView = (post: EntityItem<PostEntity>, stored: StoredBlock[]) => {
  const byId = new Map(stored.map((b) => [b.contentId, b]));
  const blocks = post.content.values.map((id) => byId.get(id)).filter((b): b is StoredBlock => Boolean(b));
  return {
    blogId: post.blogId,
    postId: post.postId,
    type: post.type,
    slug: post.slug,
    status: post.status,
    publishedAt: post.publishedAt,
    pinned: post.pinned,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    blocks,
  };
};

// Read a post + hydrate its body. Returns undefined when the post is gone.
const readPost = async (c: Context<AppEnv>, blogId: string, postId: string) => {
  const { data: post } = await c.var.models.Post.get({ blogId, postId }).go();
  if (!post) return undefined;
  const stored = await c.var.models.content.listBlocks(blogId, postId);
  return postView(post, stored);
};

const parseBody = async (c: Context<AppEnv>) => c.req.json().catch(() => undefined);

// Per-blog slug uniqueness (PLAN.md 8): a PostSlug claim rides in the same transaction as the post.
// `.create()`'s attribute_not_exists cancels the transaction if the slug is taken (→ 409); the claim
// is released on slug change / delete. ElectroDB `.params()` is loosely typed, hence the casts.
const claimSlug = (models: Models, blogId: string, slug: string, postId: string): TransactItem =>
  ({ Put: models.PostSlug.create({ blogId, slug, postId }).params() }) as TransactItem;
const releaseSlug = (models: Models, blogId: string, slug: string): TransactItem =>
  ({ Delete: models.PostSlug.delete({ blogId, slug }).params() }) as TransactItem;

const posts = new Hono<AppEnv>();

// Every posts route requires a logged-in user who is a member of :blogId.
posts.use('*', requireAuth, requireBlogMember);

// Create a draft post: mint the blocks + the Post pointing at them, atomically (#20). A new post is
// always a draft — publishing is a separate step, so it never lands on the public timeline by accident.
posts.post('/', async (c) => {
  const blogId = c.req.param('blogId')!;
  const parsed = createSchema.safeParse(await parseBody(c));
  if (!parsed.success) return c.json({ error: 'invalid request', issues: parsed.error.issues }, 400);

  const models = c.var.models;
  const { content, Post } = models;
  const postId = newPostId();
  const blocks = parsed.data.blocks.map((block) => ({ contentId: newContentId(), block }));

  // ElectroDB `.params()` is loosely typed (Record<string, any>); it produces DocumentClient-shaped
  // Put/Update params, so wrap it as a transact item for the store's typed write().
  const postItem = Post.create({
    blogId,
    postId,
    type: parsed.data.type,
    slug: parsed.data.slug,
    status: 'draft',
    content: { values: blocks.map((b) => b.contentId) },
  }).params();

  const items: TransactItem[] = [
    { Put: postItem } as TransactItem,
    ...blocks.map((b) => content.putBlock(blogId, postId, b.contentId, b.block)),
  ];
  if (parsed.data.slug !== undefined) items.push(claimSlug(models, blogId, parsed.data.slug, postId));

  try {
    await content.write(items);
  } catch (err) {
    if (parsed.data.slug !== undefined && isWriteConflict(err)) return c.json({ error: 'slug already in use' }, 409);
    throw err;
  }

  return c.json({ post: await readPost(c, blogId, postId) }, 201);
});

// Admin listing, newest-first by created date (ls1). KEYS_ONLY LSI hydrated by ElectroDB (see
// listPosts). Metadata only — bodies aren't hydrated for a list.
posts.get('/', async (c) => {
  const blogId = c.req.param('blogId')!;
  const data = await listPosts(c.var.models.Post, 'byCreated', blogId, { order: 'desc' });
  return c.json({ posts: data.map((post) => postView(post, [])) });
});

posts.get('/:postId', async (c) => {
  const post = await readPost(c, c.req.param('blogId')!, c.req.param('postId')!);
  if (!post) return c.json({ error: 'not found' }, 404);
  return c.json({ post });
});

// Edit: replace the whole body and/or change the slug, in one TransactWrite. Whole-body replace keeps
// the mutation simple for short posts — delete the old blocks, put the new ones, repoint
// content.values — so the list can never reference a missing block. A slug change releases the old
// claim and acquires the new one atomically (→ 409 if taken). (Per-block add/remove/reorder is
// deferred to the long-form composer.)
posts.patch('/:postId', async (c) => {
  const blogId = c.req.param('blogId')!;
  const postId = c.req.param('postId')!;
  const models = c.var.models;
  const { content, Post } = models;
  const { data: existing } = await Post.get({ blogId, postId }).go();
  if (!existing) return c.json({ error: 'not found' }, 404);

  const parsed = updateSchema.safeParse(await parseBody(c));
  if (!parsed.success) return c.json({ error: 'invalid request', issues: parsed.error.issues }, 400);

  const slugChanged = parsed.data.slug !== undefined && parsed.data.slug !== existing.slug;
  const blocks = parsed.data.blocks?.map((block) => ({ contentId: newContentId(), block }));

  const set: { content?: { values: string[] }; slug?: string } = {};
  if (blocks) set.content = { values: blocks.map((b) => b.contentId) };
  if (slugChanged) set.slug = parsed.data.slug;

  const items: TransactItem[] = [];
  if (Object.keys(set).length) items.push({ Update: Post.patch({ blogId, postId }).set(set).params() } as TransactItem);
  if (blocks) {
    items.push(
      ...existing.content.values.map((id) => content.deleteBlock(blogId, postId, id)),
      ...blocks.map((b) => content.putBlock(blogId, postId, b.contentId, b.block)),
    );
  }
  if (slugChanged) {
    if (existing.slug) items.push(releaseSlug(models, blogId, existing.slug));
    items.push(claimSlug(models, blogId, parsed.data.slug!, postId));
  }

  if (items.length) {
    try {
      await content.write(items);
    } catch (err) {
      if (slugChanged && isWriteConflict(err)) return c.json({ error: 'slug already in use' }, 409);
      throw err;
    }
  }

  return c.json({ post: await readPost(c, blogId, postId) });
});

// Publish: set status + publishedAt, which populates ls3sk and puts the post on the public timeline.
// A future publishedAt schedules it — the `ls3sk <= now` timeline query hides it until due (#21).
posts.post('/:postId/publish', async (c) => {
  const blogId = c.req.param('blogId')!;
  const postId = c.req.param('postId')!;
  const { data: existing } = await c.var.models.Post.get({ blogId, postId }).go();
  if (!existing) return c.json({ error: 'not found' }, 404);

  const parsed = publishSchema.safeParse(await parseBody(c));
  if (!parsed.success) return c.json({ error: 'invalid request', issues: parsed.error.issues }, 400);

  const publishedAt = parsed.data?.publishedAt ?? new Date().toISOString();
  await c.var.models.Post.patch({ blogId, postId }).set({ status: 'published', publishedAt }).go();

  return c.json({ post: await readPost(c, blogId, postId) });
});

// Unpublish: back to draft. Dropping publishedAt also clears ls3sk, so the post leaves the public
// timeline (the inverse of publish). Re-publishing later stamps a fresh publishedAt.
posts.post('/:postId/unpublish', async (c) => {
  const blogId = c.req.param('blogId')!;
  const postId = c.req.param('postId')!;
  const { data: existing } = await c.var.models.Post.get({ blogId, postId }).go();
  if (!existing) return c.json({ error: 'not found' }, 404);

  await c.var.models.Post.patch({ blogId, postId }).set({ status: 'draft' }).remove(['publishedAt']).go();
  return c.json({ post: await readPost(c, blogId, postId) });
});

// Delete: remove the post, all its content blocks, and its slug claim in one TransactWrite, so
// nothing (blocks, or a slug claim blocking reuse) is left orphaned.
posts.delete('/:postId', async (c) => {
  const blogId = c.req.param('blogId')!;
  const postId = c.req.param('postId')!;
  const models = c.var.models;
  const { content, Post } = models;
  const { data: existing } = await Post.get({ blogId, postId }).go();
  if (!existing) return c.json({ error: 'not found' }, 404);

  const items: TransactItem[] = [
    { Delete: Post.delete({ blogId, postId }).params() } as TransactItem,
    ...existing.content.values.map((id) => content.deleteBlock(blogId, postId, id)),
  ];
  if (existing.slug) items.push(releaseSlug(models, blogId, existing.slug));

  await content.write(items);
  return c.body(null, 204);
});

export const postsRoutes = new Hono<AppEnv>();
postsRoutes.route('/admin/blogs/:blogId/posts', posts);
