import { MapBlogUser, type MapBlogUserItem } from './models';
import type { Context } from '@/src/trpc/context';

export async function listAllUsersForBlog(blogId: string): Promise<MapBlogUserItem[]> {
  const { data } = await MapBlogUser.query.byBlog({ blogId }).go({ pages: 'all' });
  return data;
}

export async function listAllBlogsForUserId(userId: string): Promise<MapBlogUserItem[]> {
  const { data } = await MapBlogUser.query.byUser({ userId }).go({ pages: 'all' });
  return data;
}

export async function listBlogIdsForUserId(ctx: Context, userId: string): Promise<string[]> {
  const maps = await ctx.loaders.MapBlogUserItemByUserId.load(userId);
  return (maps ?? []).map(({ blogId }) => blogId);
}
