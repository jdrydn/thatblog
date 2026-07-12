import { describe, expect, it } from 'vitest';
import { testModels } from '../../test/dynamo';
import { createApp } from './app';
import { ensureSystem } from './auth/system';

// One app bound to the Testcontainers table. This spec is the only one that touches the System
// singleton / runs setup, so the shared table stays conflict-free across files.
const models = testModels();
const app = createApp(models);

const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

// The one cookie in Set-Cookie, as a `name=value` pair ready to send back as a Cookie header.
const cookieFrom = (res: Response): string => (res.headers.get('set-cookie') ?? '').split(';')[0] ?? '';

const login = (email: string, password: string) => app.request('/auth/login', json({ email, password }));

// Captured by setup and reused by the posts flow below (setup is one-shot, so these describes share
// the one owner + blog the run creates).
let setupCookie = '';
let blogId = '';

describe('backend-api auth flow', () => {
  const creds = {
    email: 'Owner@Example.com',
    password: 'correct horse battery',
    displayName: 'The Owner',
    blog: { name: 'My Blog', host: 'Blog.Example.com' },
  };

  it('completes first-run setup, normalising email/host and auto-logging in', async () => {
    const system = await ensureSystem(models);
    expect(system.setupKey).toBeTruthy();

    const res = await app.request(`/admin/setup/${system.setupKey}`, json(creds));
    expect(res.status).toBe(201);

    const body = (await res.json()) as { user: { email: string }; blog: { blogId: string } };
    expect(body.user.email).toBe('owner@example.com'); // normalised
    expect(body.blog.blogId).toMatch(/^b/);

    setupCookie = cookieFrom(res);
    blogId = body.blog.blogId;
    expect(setupCookie).toContain('thatblog_session=');
  });

  it('serves the authenticated user from the setup auto-login cookie', async () => {
    const res = await app.request('/auth/me', { headers: { cookie: setupCookie } });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { user: { email: string } }).user.email).toBe('owner@example.com');
  });

  it('rejects a wrong setup key with 404, then 410 once the key is cleared', async () => {
    // Key is already cleared by the successful setup above, so every call is now 410.
    const res = await app.request('/admin/setup/whatever', json({}));
    expect(res.status).toBe(410);
  });

  it('rejects login with a wrong password (generic 401)', async () => {
    const res = await login(creds.email, 'nope');
    expect(res.status).toBe(401);
  });

  it('logs in case-insensitively and round-trips /auth/me', async () => {
    const res = await login('OWNER@EXAMPLE.COM', creds.password);
    expect(res.status).toBe(200);

    const me = await app.request('/auth/me', { headers: { cookie: cookieFrom(res) } });
    expect(me.status).toBe(200);
  });

  it('rejects /auth/me without a cookie', async () => {
    const res = await app.request('/auth/me');
    expect(res.status).toBe(401);
  });

  it('revokes the session on logout', async () => {
    const cookie = cookieFrom(await login(creds.email, creds.password));

    const out = await app.request('/auth/logout', { method: 'POST', headers: { cookie } });
    expect(out.status).toBe(200);

    const me = await app.request('/auth/me', { headers: { cookie } });
    expect(me.status).toBe(401); // session record deleted
  });
});

type PostBody = {
  post: {
    postId: string;
    status: string;
    publishedAt?: string;
    blocks: { contentId: string; type: string; value: string }[];
  };
};

describe('backend-api posts flow', () => {
  // Reuses the owner cookie + blog from the setup above.
  const authedJson = (path: string, method: string, body: unknown) =>
    app.request(path, {
      method,
      headers: { 'content-type': 'application/json', cookie: setupCookie },
      body: JSON.stringify(body),
    });

  let postId = '';

  it('rejects authoring without a session', async () => {
    const res = await app.request(
      `/admin/blogs/${blogId}/posts`,
      json({ blocks: [{ type: 'PLAIN_TEXT', value: 'hi' }] }),
    );
    expect(res.status).toBe(401);
  });

  it('rejects authoring on a blog the user is not a member of', async () => {
    const res = await authedJson('/admin/blogs/bNOTMINE/posts', 'POST', {
      blocks: [{ type: 'PLAIN_TEXT', value: 'hi' }],
    });
    expect(res.status).toBe(403);
  });

  it('creates a draft short post with its block', async () => {
    const res = await authedJson(`/admin/blogs/${blogId}/posts`, 'POST', {
      blocks: [{ type: 'PLAIN_TEXT', value: 'my first post' }],
    });
    expect(res.status).toBe(201);

    const { post } = (await res.json()) as PostBody;
    postId = post.postId;
    expect(post.postId).toMatch(/^p/);
    expect(post.status).toBe('draft');
    expect(post.publishedAt).toBeUndefined();
    expect(post.blocks).toEqual([{ contentId: expect.any(String), type: 'PLAIN_TEXT', value: 'my first post' }]);
  });

  it('reads the post back with its body in order', async () => {
    const res = await app.request(`/admin/blogs/${blogId}/posts/${postId}`, { headers: { cookie: setupCookie } });
    expect(res.status).toBe(200);
    const { post } = (await res.json()) as PostBody;
    expect(post.blocks[0]?.value).toBe('my first post');
  });

  it("lists the blog's posts", async () => {
    const res = await app.request(`/admin/blogs/${blogId}/posts`, { headers: { cookie: setupCookie } });
    expect(res.status).toBe(200);
    const { posts } = (await res.json()) as { posts: { postId: string }[] };
    expect(posts.map((p) => p.postId)).toContain(postId);
  });

  it('replaces the whole body on edit, leaving no stale blocks', async () => {
    const res = await authedJson(`/admin/blogs/${blogId}/posts/${postId}`, 'PATCH', {
      blocks: [{ type: 'PLAIN_TEXT', value: 'edited' }],
    });
    expect(res.status).toBe(200);
    const { post } = (await res.json()) as PostBody;
    expect(post.blocks).toEqual([{ contentId: expect.any(String), type: 'PLAIN_TEXT', value: 'edited' }]);

    // The replace deletes the old block in the same transaction, so the partition holds exactly the
    // new block — no orphans drifting from content.values (#20).
    const stored = await models.content.listBlocks(blogId, postId);
    expect(stored).toHaveLength(1);
    expect(stored[0]?.value).toBe('edited');
  });

  it('publishes the post, stamping publishedAt', async () => {
    const res = await authedJson(`/admin/blogs/${blogId}/posts/${postId}/publish`, 'POST', {});
    expect(res.status).toBe(200);
    const { post } = (await res.json()) as PostBody;
    expect(post.status).toBe('published');
    expect(post.publishedAt).toBeTypeOf('string');
  });
});
