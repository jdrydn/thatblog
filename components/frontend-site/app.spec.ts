import { beforeAll, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { testModels } from '../../test/dynamo';
import { createRenderer, fsLoader } from '@thatblog/renderer';
import { newBlogId, newPostId } from '@thatblog/backend-api/models/ids';
import { newContentId, type Block } from '@thatblog/backend-api/content/blocks';
import { createApp } from './app';

// The site renders the real shipped theme off disk (fsLoader) against a blog seeded straight into the
// Testcontainers table — no setup flow (that's the backend-api spec's job; this file only ever touches
// its own randomly-keyed blog, so the shared table stays conflict-free).
const models = testModels();
const themeRoot = fileURLToPath(new URL('../../themes/microblog', import.meta.url));
const app = createApp({ models, renderer: createRenderer(fsLoader(themeRoot)) });

const host = 'sitetest.example.com';
const blogId = newBlogId();

// A request as if it arrived for this blog's host (Host drives blog resolution).
const visit = (path: string) => app.request(path, { headers: { host } });

// Seed a post with a single PLAIN_TEXT block, wiring the block into content.values so the body
// hydrates in order (PLAN.md 8.2). Optionally claim a slug so the /:slug route can resolve it.
async function seedPost(opts: { status: 'draft' | 'published'; publishedAt?: string; text: string; slug?: string }) {
  const postId = newPostId();
  const contentId = newContentId();
  const block: Block = { type: 'PLAIN_TEXT', value: opts.text };
  await models.Post.create({
    blogId,
    postId,
    status: opts.status,
    publishedAt: opts.publishedAt,
    slug: opts.slug,
    content: { values: [contentId] },
  }).go();
  await models.content.write([models.content.putBlock(blogId, postId, contentId, block)]);
  if (opts.slug) await models.PostSlug.create({ blogId, slug: opts.slug, postId }).go();
  return postId;
}

const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

let livePostId = '';
let draftPostId = '';
let scheduledPostId = '';

beforeAll(async () => {
  await models.Blog.create({ blogId, profile: { name: 'Site Test', bio: 'a test blog' } }).go();
  await models.BlogDomain.create({ blogId, host, type: 'primary' }).go();
  livePostId = await seedPost({
    status: 'published',
    publishedAt: iso(-1000),
    text: 'hello from the timeline',
    slug: 'hello-there',
  });
  draftPostId = await seedPost({ status: 'draft', text: 'still a draft' });
  scheduledPostId = await seedPost({ status: 'published', publishedAt: iso(60_000), text: 'from the future' });
});

describe('frontend-site public routing', () => {
  it('404s a request for an unknown host', async () => {
    const res = await app.request('/', { headers: { host: 'nobody.example.com' } });
    expect(res.status).toBe(404);
  });

  it('renders the timeline with the profile and published post body', async () => {
    const res = await visit('/');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Site Test');
    expect(html).toContain('a test blog');
    expect(html).toContain('hello from the timeline');
    expect(html).toContain('href="/hello-there"'); // permalink uses the slug
  });

  it('hides drafts and scheduled posts from the timeline', async () => {
    const html = await (await visit('/')).text();
    expect(html).not.toContain('still a draft');
    expect(html).not.toContain('from the future');
  });

  it('redirects a bare /admin to the SPA entrypoint without needing a resolved host', async () => {
    // No Host header → host resolution would 404, so this proves the redirect runs ahead of it.
    const res = await app.request('/admin');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/admin/index.html');
  });
});

describe('frontend-site post detail', () => {
  it('renders a published post by slug', async () => {
    const res = await visit('/hello-there');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('hello from the timeline');
  });

  it('renders a published post by id', async () => {
    const res = await visit(`/posts/${livePostId}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('hello from the timeline');
  });

  it('404s a draft post', async () => {
    expect((await visit(`/posts/${draftPostId}`)).status).toBe(404);
  });

  it('404s a scheduled (future) post', async () => {
    expect((await visit(`/posts/${scheduledPostId}`)).status).toBe(404);
  });

  it('404s an unknown slug', async () => {
    expect((await visit('/no-such-post')).status).toBe(404);
  });
});
