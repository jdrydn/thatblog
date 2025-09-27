import { MapBlogUser, type MapBlogUserItem } from './models';

export async function listAllUsersForBlog(blogId: string): Promise<MapBlogUserItem[]> {
  const { data } = await MapBlogUser.query.byBlog({ blogId }).go({ pages: 'all' });
  return data;
}

export async function listAllBlogsForUserId(userId: string): Promise<MapBlogUserItem[]> {
  const { data } = await MapBlogUser.query.byUser({ userId }).go({ pages: 'all' });
  return data;
}
