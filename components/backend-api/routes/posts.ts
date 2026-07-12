import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';
import type { EntityItem } from 'electrodb';
import type { AppEnv } from '../context';
import { listPosts, type PostEntity } from '../models/post';
import { newPostId } from '../models/ids';
import { blockSchema, newContentId, type StoredBlock } from '../content/blocks';
import type { TransactItem } from '../content/store';
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

const posts = new Hono<AppEnv>();

// Every posts route requires a logged-in user who is a member of :blogId.
posts.use('*', requireAuth, requireBlogMember);

// Create a draft post: mint the blocks + the Post pointing at them, atomically (#20). A new post is
// always a draft — publishing is a separate step, so it never lands on the public timeline by accident.
posts.post('/', async (c) => {
  const blogId = c.req.param('blogId')!;
  const parsed = createSchema.safeParse(await parseBody(c));
  if (!parsed.success) return c.json({ error: 'invalid request', issues: parsed.error.issues }, 400);

  const { content, Post } = c.var.models;
  const postId = newPostId();
  const blocks = parsed.data.blocks.map((block) => ({ contentId: newContentId(), block }));

  const postItem = Post.create({
    blogId,
    postId,
    type: parsed.data.type,
    slug: parsed.data.slug,
    status: 'draft',
    content: { values: blocks.map((b) => b.contentId) },
  }).params();

  // ElectroDB `.params()` is loosely typed (Record<string, any>); it produces DocumentClient-shaped
  // Put/Update params, so wrap it as a transact item for the store's typed write().
  await content.write([
    { Put: postItem } as TransactItem,
    ...blocks.map((b) => content.putBlock(blogId, postId, b.contentId, b.block)),
  ]);

  return c.json({ post: await readPost(c, blogId, postId) }, 201);
});

// Admin listing, newest-first by created date (ls1). KEYS_ONLY LSI → query keys + BatchGet (see
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

// Edit: replace the whole body and/or the slug. Whole-body replace keeps the mutation simple for
// short posts — delete the old blocks, put the new ones, and repoint content.values, all in one
// TransactWrite so the list can never reference a missing block. (Per-block add/remove/reorder is
// deferred to the long-form composer.)
posts.patch('/:postId', async (c) => {
  const blogId = c.req.param('blogId')!;
  const postId = c.req.param('postId')!;
  const { data: existing } = await c.var.models.Post.get({ blogId, postId }).go();
  if (!existing) return c.json({ error: 'not found' }, 404);

  const parsed = updateSchema.safeParse(await parseBody(c));
  if (!parsed.success) return c.json({ error: 'invalid request', issues: parsed.error.issues }, 400);

  const { content, Post } = c.var.models;

  if (parsed.data.blocks) {
    const blocks = parsed.data.blocks.map((block) => ({ contentId: newContentId(), block }));
    const patch = Post.patch({ blogId, postId })
      .set({
        content: { values: blocks.map((b) => b.contentId) },
        ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
      })
      .params();
    await content.write([
      { Update: patch } as TransactItem,
      ...existing.content.values.map((id) => content.deleteBlock(blogId, postId, id)),
      ...blocks.map((b) => content.putBlock(blogId, postId, b.contentId, b.block)),
    ]);
  } else if (parsed.data.slug !== undefined) {
    await Post.patch({ blogId, postId }).set({ slug: parsed.data.slug }).go();
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

export const postsRoutes = new Hono<AppEnv>();
postsRoutes.route('/admin/blogs/:blogId/posts', posts);
