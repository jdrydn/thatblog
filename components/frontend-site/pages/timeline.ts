import type { Context } from 'hono';
import { listPosts } from '@thatblog/backend-api/models/post';
import type { SiteEnv } from '../context';
import { blogView, postView } from '../view';

// The public timeline: a blog's published posts, newest-first. listPosts hydrates the KEYS_ONLY ls3
// index ([[electrodb-keys-only-gsi]]); ls3 is sparse (only published posts carry publishedAt), and we
// drop any with a future publishedAt so scheduled posts stay hidden until due (#21). Each post's body
// is hydrated for the card — v0.0.4 posts are short; the excerpt-boundary optimisation (hydrate only
// up to content.excerpt for long posts, PLAN.md 8.2) is deferred until article posts exist.
export async function timeline(c: Context<SiteEnv>) {
  const { models, renderer, blog } = c.var;
  const now = new Date().toISOString();

  const posts = await listPosts(models.Post, 'byPublished', blog.blogId, { order: 'desc' });
  const live = posts.filter((p) => p.publishedAt && p.publishedAt <= now);
  const cards = await Promise.all(
    live.map(async (post) => postView(post, await models.content.listBlocks(blog.blogId, post.postId))),
  );

  const html = await renderer.render('timeline', { blog: blogView(blog), posts: cards, pageTitle: blog.profile.name });
  return c.html(html);
}
