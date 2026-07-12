import type { Context } from 'hono';
import type { Models } from '@thatblog/backend-api/models';
import type { SiteEnv } from '../context';
import { blogView, postView } from '../view';

// A post is publicly visible only when published and its publishedAt has arrived — a draft (no
// publishedAt) or a scheduled post (future publishedAt, #21) 404s on the public site, matching the
// ls3sk <= now timeline filter. Returns the themed view model, or undefined when there's nothing live.
export async function loadLivePost(models: Models, blogId: string, postId: string, now: string) {
  const { data: post } = await models.Post.get({ blogId, postId }).go();
  if (!post || post.status !== 'published' || !post.publishedAt || post.publishedAt > now) return undefined;
  const stored = await models.content.listBlocks(blogId, postId);
  return postView(post, stored);
}

// Post detail. Resolves a postId directly (/posts/:postId) or a slug via the PostSlug guard entity,
// which doubles as the slug → post resolver (PLAN.md 8). Draft/scheduled/unknown all render as 404.
async function renderPost(c: Context<SiteEnv>, postId: string) {
  const { models, renderer, blog } = c.var;
  const post = await loadLivePost(models, blog.blogId, postId, new Date().toISOString());
  if (!post) return c.notFound();
  const html = await renderer.render('post', { blog: blogView(blog), post, pageTitle: blog.profile.name });
  return c.html(html);
}

export const postById = (c: Context<SiteEnv>) => renderPost(c, c.req.param('postId')!);

export async function postBySlug(c: Context<SiteEnv>) {
  const { data: claim } = await c.var.models.PostSlug.get({
    blogId: c.var.blog.blogId,
    slug: c.req.param('slug')!,
  }).go();
  if (!claim) return c.notFound();
  return renderPost(c, claim.postId);
}
